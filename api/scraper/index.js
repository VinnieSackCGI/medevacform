const https = require('https');

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

    return new Promise((resolve, reject) => {
        const dataRequest = https.request(dataOptions, (res) => {
            let html = '';
            res.on('data', chunk => html += chunk);
            res.on('end', () => {
                const result = extractPerDiemFromHTML(html, locationCode);
                const responseTime = Date.now() - startTime;
                
                if (result) {
                    resolve({
                        success: true,
                        pcode: locationCode,
                        country: result.country,
                        post: result.post,
                        lodging: result.lodging,
                        mie: result.mie,
                        total: result.total,
                        responseTime: responseTime
                    });
                } else {
                    reject(new Error(`No data found for PCode: ${locationCode}`));
                }
            });
        });
        
        dataRequest.on('error', reject);
        dataRequest.setTimeout(15000, () => {
            dataRequest.destroy();
            reject(new Error('Request timeout'));
        });
        
        dataRequest.write(postData);
        dataRequest.end();
    });
}

function extractPerDiemFromHTML(html, locationCode) {
    // Check if this is a valid per diem page
    if (!html.includes('Per Diem') && !html.includes('Lodging') && !html.includes('M & IE')) {
        return null;
    }
    
    // Primary pattern: HTML table structure
    const htmlTablePattern = /([A-Z\s]+)<\/td><td[^>]*>([A-Za-z\s]+)<\/td><td[^>]*>(\d{2}\/\d{2})<\/td><td[^>]*>(\d{2}\/\d{2})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})/i;
    
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

    // Fallback patterns
    const fallbackPatterns = [
        /title='Maximum Lodging Rate'>(\d{1,4})<\/td><td[^>]*title='M & IE Rate'>(\d{1,4})<\/td><td[^>]*title='Maximum Per Diem Rate'>(\d{1,4})/i,
        /([A-Z\s]+)<\/td><td[^>]*>([^<]+)<\/td>[\s\S]*?>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td><td[^>]*>(\d{1,4})<\/td>/i,
    ];

    for (const pattern of fallbackPatterns) {
        match = html.match(pattern);
        if (match) {
            return {
                locationCode: locationCode,
                country: extractCountryFromHTML(html),
                post: extractPostFromHTML(html),
                lodging: parseInt(match[match.length - 3]),
                mie: parseInt(match[match.length - 2]),
                total: parseInt(match[match.length - 1])
            };
        }
    }

    return null;
}

function extractCountryFromHTML(html) {
    const match = html.match(/Country:<\/td><td[^>]*>([^<]+)</i);
    return match ? match[1].trim() : 'Unknown';
}

function extractPostFromHTML(html) {
    const match = html.match(/Post:<\/td><td[^>]*>([^<]+)</i);
    return match ? match[1].trim() : 'Unknown';
}

module.exports = async function (context, req) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        };
        return;
    }

    try {
        const pcode = req.params.pcode || req.query.pcode;

        if (!pcode) {
            context.res = {
                status: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"
                },
                body: { success: false, error: "PCode parameter is required" }
            };
            return;
        }

        context.log(`Looking up PCode: ${pcode}`);
        
        const result = await lookupPCode(pcode);

        context.res = {
            status: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: result
        };

    } catch (error) {
        context.log.error('Scraper error:', error);
        context.res = {
            status: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: { 
                success: false, 
                error: error.message || "Failed to fetch per diem data" 
            }
        };
    }
};
