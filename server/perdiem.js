#!/usr/bin/env node
/**
 * Per Diem Lookup - Working Command Line Tool
 * 
 * Usage: node perdiem.js [PCode] [--json]
 * Example: node perdiem.js 11410
 * 
 * Final working version using proven pattern extraction
 */

const https = require('https');

// Colors for console output
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

// Make HTTPS request
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
        
        // Extract form data (simplified - just get the basic pattern)
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
                const result = extractPerDiemFromHTML(html, locationCode);
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

function extractPerDiemFromHTML(html, locationCode) {
    // Check if this is a valid per diem page (should contain rate data)
    if (!html.includes('Per Diem') && !html.includes('Lodging') && !html.includes('M & IE')) {
        console.log('❌ Page does not contain per diem data');
        return null;
    }
    
    // Primary pattern: HTML table structure (works for most locations including $0 rates)
    // Matches: Country</td><td>Post</td><td>Season1</td><td>Season2</td><td>Lodging</td><td>M&IE</td><td>Total
    const htmlTablePattern = /([A-Z\s]+)<\/td><td[^>]*>([A-Za-z\s]+)<\/td><td[^>]*>(\d{2}\/\d{2})<\/td><td[^>]*>(\d{2}\/\d{2})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})/i;
    
    let match = html.match(htmlTablePattern);
    
    if (match) {
        console.log('✅ HTML table pattern matched');
        return {
            locationCode: locationCode,
            country: match[1].trim(),
            post: match[2].trim(),
            lodging: parseInt(match[5]),
            mie: parseInt(match[6]),
            total: parseInt(match[7])
        };
    }

    // Enhanced fallback patterns for edge cases
    const fallbackPatterns = [
        // Title attribute pattern (very reliable) - now allows single digits
        /title='Maximum Lodging Rate'>(\d{1,4})<\/td><td[^>]*title='M & IE Rate'>(\d{1,4})<\/td><td[^>]*title='Maximum Per Diem Rate'>(\d{1,4})/i,
        
        // Afghanistan/low-cost specific pattern: AFGHANISTAN</td><td>Other</td>...0</td><td>15</td><td>15
        /AFGHANISTAN<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td>/i,
        
        // Generic country pattern
        /([A-Z\s]+)<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td>/i,
        
        // Original concatenated format - now allows 1-4 digits
        /([A-Z\s]+?)([A-Za-z\s]+)(\d{2}\/\d{2})(\d{2}\/\d{2})(\d{1,4})(\d{1,4})(\d{1,4})/,
        
        // Last resort: any numbers that could be per diem rates
        /(\d{1,4})\s+(\d{1,4})\s+(\d{1,4})/
    ];

    for (let i = 0; i < fallbackPatterns.length; i++) {
        match = html.match(fallbackPatterns[i]);
        if (match) {
            console.log(`✅ Fallback pattern ${i + 1} matched`);
            
            if (i === 0) {
                // Title attribute pattern (most reliable)
                return {
                    locationCode: locationCode,
                    country: 'Unknown',
                    post: 'Unknown', 
                    lodging: parseInt(match[1]),
                    mie: parseInt(match[2]),
                    total: parseInt(match[3])
                };
            } else if (match.length >= 7) {
                // Full pattern match
                const lodging = parseInt(match[5]);
                const mie = parseInt(match[6]);
                const total = parseInt(match[7]);
                
                // Sanity check: per diem rates should be in reasonable range (including low-cost posts like Afghanistan)
                if (lodging >= 0 && lodging <= 2000 && mie >= 0 && mie <= 1000 && total >= 0 && total <= 3000) {
                    return {
                        locationCode: locationCode,
                        country: match[1].trim(),
                        post: match[2].trim(),
                        lodging: lodging,
                        mie: mie,
                        total: total
                    };
                }
            } else if (match.length >= 3) {
                // Numbers-only pattern with validation
                const val1 = parseInt(match[1]);
                const val2 = parseInt(match[2]);
                const val3 = parseInt(match[3]);
                
                // Make sure these look like per diem rates, not dates (including low-cost posts)
                if (val1 >= 0 && val1 <= 2000 && val2 >= 0 && val2 <= 1000 && val3 >= 0 && val3 <= 3000) {
                    return {
                        locationCode: locationCode,
                        country: 'Unknown',
                        post: 'Unknown',
                        lodging: val1,
                        mie: val2,
                        total: val3
                    };
                }
            }
        }
    }

    // Last resort: look for specific table cell patterns
    const cellPatterns = [
        /Maximum Lodging Rate[^>]*>(\d{2,3})<\/td>/i,
        /M & IE Rate[^>]*>(\d{2,3})<\/td>/i,
        /Maximum Per Diem Rate[^>]*>(\d{3})<\/td>/i
    ];

    const lodgingMatch = html.match(cellPatterns[0]);
    const mieMatch = html.match(cellPatterns[1]);
    const totalMatch = html.match(cellPatterns[2]);

    if (lodgingMatch && mieMatch && totalMatch) {
        console.log('✅ Individual cell pattern matched');
        return {
            locationCode: locationCode,
            country: 'Unknown',
            post: 'Unknown',
            lodging: parseInt(lodgingMatch[1]),
            mie: parseInt(mieMatch[1]),
            total: parseInt(totalMatch[1])
        };
    }

    console.log('❌ No valid per diem patterns matched');
    return null;
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        log('🏥 Per Diem Lookup Tool', 'bright');
        log('Usage: node perdiem.js [PCode] [--json]', 'yellow');
        log('Examples:', 'yellow');
        log('  node perdiem.js 11410          # Austria, Linz', 'cyan');
        log('  node perdiem.js 11400          # Austria, Vienna', 'cyan');
        log('  node perdiem.js 43310 --json   # Germany, Frankfurt (JSON)', 'cyan');
        log('  node perdiem.js 41900          # United Kingdom, London', 'cyan');
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