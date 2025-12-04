#!/usr/bin/env node

/**
 * Quick deployment diagnostic script for medevac-form-app
 * Tests if API endpoints are working in current SWA
 */

const https = require('https');
const http = require('http');

// Your SWA URL - update this with your actual deployed URL
const SWA_URL = process.env.SWA_URL || 'https://medevac-form-app.azurestaticapps.net';

const endpoints = [
    '/api/health',
    '/api/locations',
    '/api/perdiem',
    '/api/medevac'
];

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const url = `${SWA_URL}${endpoint}`;
        const protocol = url.startsWith('https') ? https : http;
        
        const options = {
            method: 'GET',
            headers: {
                'User-Agent': 'MEDEVAC-Diagnostic/1.0'
            }
        };

        const request = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    endpoint,
                    status: res.statusCode,
                    headers: res.headers,
                    body: data,
                    success: res.statusCode >= 200 && res.statusCode < 300
                });
            });
        });

        request.on('error', (err) => {
            resolve({
                endpoint,
                status: 'ERROR',
                error: err.message,
                success: false
            });
        });

        request.end();
    });
}

async function runDiagnostics() {
    console.log('='.repeat(60));
    console.log('MEDEVAC Form App - Deployment Diagnostic');
    console.log('='.repeat(60));
    console.log(`\nTesting SWA: ${SWA_URL}\n`);

    const results = [];
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint);
        results.push(result);
        
        const status = result.success ? '✅' : '❌';
        console.log(`${status} ${endpoint}: ${result.status}`);
        if (result.error) console.log(`   Error: ${result.error}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Diagnostic Summary:');
    console.log('='.repeat(60));
    
    const working = results.filter(r => r.success).length;
    const total = results.length;
    
    console.log(`\nEndpoints Working: ${working}/${total}`);
    
    if (working === total) {
        console.log('\n✅ All endpoints are working! Your deployment is healthy.');
    } else if (working > 0) {
        console.log('\n⚠️  Some endpoints are working, but others are failing.');
        console.log('   This might indicate incomplete deployment or configuration issues.');
    } else {
        console.log('\n❌ No endpoints are responding. Check deployment status in Azure Portal.');
    }

    console.log('\nNext Steps:');
    console.log('1. If endpoints are failing, check Azure Portal for deployment status');
    console.log('2. Verify the API functions have deployed correctly');
    console.log('3. Check Azure Static Web App logs for build/deployment errors');
    console.log('4. Ensure all function.json files are properly configured');
}

runDiagnostics().catch(console.error);
