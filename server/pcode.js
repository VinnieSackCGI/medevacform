#!/usr/bin/env node
/**
 * Per Diem Lookup Command Line Tool
 * 
 * Usage: node pcode.js [PCode]
 * Example: node pcode.js 11410
 * 
 * Clean, working version with proper parsing
 */

const https = require('https');
const cheerio = require('cheerio');

// Colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m', 
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

// HTTPS request helper
function makeHttpsRequest(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                data: data
            }));
        });
        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        req.end();
    });
}

async function lookupPCode(locationCode) {
    try {
        log(`🎯 Looking up PCode: ${locationCode}`, 'blue');
        const startTime = Date.now();

        // Step 1: Get redirect and session
        const redirectOptions = {
            hostname: 'allowances.state.gov',
            path: `/web920/LinkRedirect.asp?PCode=${locationCode}&Dest=per_diem_action`,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        };

        const redirectResponse = await makeHttpsRequest(redirectOptions);
        const cookies = redirectResponse.headers['set-cookie'];
        const cookieHeader = cookies ? cookies.map(c => c.split(';')[0]).join('; ') : '';

        // Step 2: Get form page
        const formOptions = {
            hostname: 'allowances.state.gov',
            path: '/web920/per_diem_action.asp',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieHeader
            }
        };

        const formResponse = await makeHttpsRequest(formOptions);
        const $ = cheerio.load(formResponse.data);
        const countryCode = $('input[name="CountryCode"]').val();
        const postCode = $('input[name="PostCode"]').val() || locationCode;

        if (!countryCode) {
            throw new Error(`Invalid PCode: ${locationCode}`);
        }

        // Step 3: Submit form
        const postData = `MenuHide=1&CountryCode=${countryCode}&PostCode=${postCode}`;
        
        const dataOptions = {
            hostname: 'allowances.state.gov',
            path: '/web920/per_diem_action.asp',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Cookie': cookieHeader
            }
        };

        const dataRequest = https.request(dataOptions, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                const results = extractPerDiemData(html, locationCode);
                const responseTime = Date.now() - startTime;
                
                if (results.length > 0) {
                    const result = results[0];
                    log('✅ SUCCESS: Per diem data found!', 'green');
                    log(`📍 Location: ${result.country} - ${result.post}`, 'bright');
                    log(`💰 Lodging: $${result.lodging}, M&IE: $${result.mie}, Total: $${result.total}`, 'green');
                    log(`⚡ Response time: ${responseTime}ms`, 'cyan');
                    
                    // Return structured data for automation
                    if (process.argv.includes('--json')) {
                        console.log(JSON.stringify({
                            success: true,
                            pcode: locationCode,
                            country: result.country,
                            post: result.post,
                            lodging: result.lodging,
                            mie: result.mie,
                            total: result.total,
                            responseTime: responseTime
                        }, null, 2));
                    }
                    
                    process.exit(0);
                } else {
                    log(`❌ No data found for PCode: ${locationCode}`, 'red');
                    process.exit(1);
                }
            });
        });
        
        dataRequest.on('error', (error) => {
            log(`❌ Error: ${error.message}`, 'red');
            process.exit(1);
        });
        
        dataRequest.setTimeout(15000, () => {
            dataRequest.destroy();
            log('❌ Request timeout', 'red');
            process.exit(1);
        });
        
        dataRequest.write(postData);
        dataRequest.end();

    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        process.exit(1);
    }
}

function extractPerDiemData(html, locationCode) {
    const $ = cheerio.load(html);
    const results = [];

    // Find the correct per diem data table (like test-direct.js does)
    $('table').each((tableIndex, table) => {
        const rows = $(table).find('tr');
        
        if (rows.length > 1) { // Has header + data rows
            const firstRow = $(rows[0]);
            const headerCells = firstRow.find('th, td');
            
            if (headerCells.length > 0) {
                const headerTexts = [];
                headerCells.each((i, cell) => {
                    headerTexts.push($(cell).text().trim());
                });
                
                // Check if this is the main per diem data table
                const hasStandardHeaders = (
                    headerTexts.some(h => h.toLowerCase().includes('country')) &&
                    headerTexts.some(h => h.toLowerCase().includes('post')) &&
                    headerTexts.some(h => h.toLowerCase().includes('lodging')) &&
                    headerTexts.some(h => h.toLowerCase().includes('per diem'))
                );
                
                if (hasStandardHeaders) {
                    // Process data rows (skip header row)
                    rows.each((rowIndex, row) => {
                        if (rowIndex === 0) return; // Skip header
                        
                        const cells = $(row).find('td');
                        if (cells.length >= 7) {
                            const cellTexts = [];
                            cells.each((i, cell) => {
                                cellTexts.push($(cell).text().trim());
                            });

                            const country = cellTexts[0];
                            const post = cellTexts[1];
                            const lodging = cellTexts[4];
                            const mie = cellTexts[5];
                            const total = cellTexts[6];

                            // Extract numeric values
                            const lodgingNum = lodging?.match(/[\d,]+/);
                            const mieNum = mie?.match(/[\d,]+/);
                            const totalNum = total?.match(/[\d,]+/);

                            if ((lodgingNum || mieNum || totalNum) && country && post) {
                                results.push({
                                    locationCode: locationCode,
                                    country: country,
                                    post: post,
                                    lodging: lodgingNum ? parseInt(lodgingNum[0].replace(',', '')) : 0,
                                    mie: mieNum ? parseInt(mieNum[0].replace(',', '')) : 0,
                                    total: totalNum ? parseInt(totalNum[0].replace(',', '')) : 0
                                });
                            }
                        }
                    });
                }
            }
        }
    });

    return results;
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        log('🏥 Per Diem Lookup Tool', 'bright');
        log('Usage: node pcode.js [PCode] [--json]', 'yellow');
        log('Examples:', 'yellow');
        log('  node pcode.js 11410          # Austria, Linz', 'cyan');
        log('  node pcode.js 11400          # Austria, Vienna', 'cyan');
        log('  node pcode.js 43310 --json   # Germany, Frankfurt (JSON output)', 'cyan');
        log('  node pcode.js 41900          # United Kingdom, London', 'cyan');
        process.exit(1);
    }
    
    const pcode = args[0].replace(/[^0-9]/g, '');
    if (!pcode) {
        log('❌ Please provide a valid numeric PCode', 'red');
        process.exit(1);
    }
    
    await lookupPCode(pcode);
}

if (require.main === module) {
    main().catch(error => {
        log(`❌ Fatal error: ${error.message}`, 'red');
        process.exit(1);
    });
}