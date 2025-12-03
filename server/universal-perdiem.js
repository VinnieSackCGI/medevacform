#!/usr/bin/env node
/**
 * Universal Per Diem Lookup - Final Version
 * 
 * Usage: node universal-perdiem.js [PCode] [--json]
 * 
 * Supports all tested working PCodes with multiple pattern matching strategies
 */

const https = require('https');

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
        req.setTimeout(20000, () => { // Increased timeout
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

        // Step 1: Initial redirect to establish session
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

        // Step 2: Get form page to extract hidden fields
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
        
        // Extract form data
        const countryCodeMatch = formResponse.data.match(/name="CountryCode"[^>]*value="([^"]+)"/);
        const postCodeMatch = formResponse.data.match(/name="PostCode"[^>]*value="([^"]+)"/);
        
        if (!countryCodeMatch) {
            throw new Error(`Invalid PCode: ${locationCode} - no country code found`);
        }

        const countryCode = countryCodeMatch[1];
        const postCode = postCodeMatch ? postCodeMatch[1] : locationCode;

        // Step 3: Submit form to get per diem data
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
                const result = extractUniversalPerDiem(html, locationCode);
                const responseTime = Date.now() - startTime;
                
                if (result) {
                    log('✅ SUCCESS: Per diem data found!', 'green');
                    log(`📍 Location: ${result.country} - ${result.post}`, 'bright');
                    log(`💰 Lodging: $${result.lodging}, M&IE: $${result.mie}, Total: $${result.total}`, 'green');
                    log(`⚡ Response time: ${responseTime}ms`, 'cyan');
                    
                    // JSON output for automation
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
                    log(`   This PCode may be inactive or invalid`, 'yellow');
                    process.exit(1);
                }
            });
        });
        
        dataRequest.on('error', (error) => {
            log(`❌ Error: ${error.message}`, 'red');
            process.exit(1);
        });
        
        dataRequest.setTimeout(20000, () => {
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

function extractUniversalPerDiem(html, locationCode) {
    // Strategy 1: HTML table pattern (most reliable)
    const htmlTablePattern = /([A-Z\s]+)<\/td><td[^>]*>([A-Za-z\s]+)<\/td><td[^>]*>(\d{2}\/\d{2})<\/td><td[^>]*>(\d{2}\/\d{2})<\/td><td[^>]*>(\d{2,3})<\/td><td[^>]*>(\d{2,3})<\/td><td[^>]*>(\d{3})/i;
    
    let match = html.match(htmlTablePattern);
    if (match) {
        return {
            locationCode: locationCode,
            country: match[1].trim(),
            post: match[2].trim(),
            lodging: parseInt(match[5]),
            mie: parseInt(match[6]),
            total: parseInt(match[7])
        };
    }

    // Strategy 2: Title attribute pattern
    const titlePattern = /title='Maximum Lodging Rate'>(\d{2,3})<\/td><td[^>]*title='M & IE Rate'>(\d{2,3})<\/td><td[^>]*title='Maximum Per Diem Rate'>(\d{3})/i;
    match = html.match(titlePattern);
    if (match) {
        return {
            locationCode: locationCode,
            country: 'Unknown',
            post: 'Unknown',
            lodging: parseInt(match[1]),
            mie: parseInt(match[2]),
            total: parseInt(match[3])
        };
    }

    // Strategy 3: Look for country/post names with numbers
    const countryPatterns = [
        /ALBANIA<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?(\d{2,3})<\/td><td[^>]*>(\d{2,3})<\/td><td[^>]*>(\d{3})/i,
        /AUSTRIA<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?(\d{2,3})<\/td><td[^>]*>(\d{2,3})<\/td><td[^>]*>(\d{3})/i,
        /AUSTRALIA<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?(\d{2,3})<\/td><td[^>]*>(\d{2,3})<\/td><td[^>]*>(\d{3})/i,
        /AFGHANISTAN<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?(\d{2,3})<\/td><td[^>]*>(\d{2,3})<\/td><td[^>]*>(\d{3})/i
    ];

    for (let i = 0; i < countryPatterns.length; i++) {
        match = html.match(countryPatterns[i]);
        if (match) {
            const countries = ['ALBANIA', 'AUSTRIA', 'AUSTRALIA', 'AFGHANISTAN'];
            return {
                locationCode: locationCode,
                country: countries[i],
                post: match[1].trim(),
                lodging: parseInt(match[2]),
                mie: parseInt(match[3]),
                total: parseInt(match[4])
            };
        }
    }

    return null;
}

// Main CLI
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        log('🏥 Universal Per Diem Lookup Tool', 'bright');
        log('Usage: node universal-perdiem.js [PCode] [--json]', 'yellow');
        log('\n✅ Tested Working PCodes:', 'green');
        log('  11908 - Albania, Other        ($182 + $81 = $263)', 'cyan');
        log('  10104 - Albania, Tirana       ($223 + $122 = $345)', 'cyan');
        log('  11410 - Austria, Linz         ($193 + $152 = $345)', 'cyan');
        log('  10106 - Austria, Vienna       ($361 + $146 = $507)', 'cyan');
        log('  10244 - Australia, Adelaide   ($210 + $105 = $315)', 'cyan');
        log('\n❌ Known Invalid/Inactive PCodes:', 'red');
        log('  11804, 10323 (may be inactive)', 'yellow');
        
        log('\n💡 Examples:', 'yellow');
        log('  node universal-perdiem.js 11410          # Austria, Linz', 'cyan');
        log('  node universal-perdiem.js 10104 --json   # Albania, Tirana (JSON)', 'cyan');
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