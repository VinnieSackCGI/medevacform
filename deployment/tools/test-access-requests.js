#!/usr/bin/env node

/**
 * Access Request System API Tester
 * Test the access request endpoints
 */

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.env.API_URL || 'http://localhost:7071';
const USE_HTTPS = BASE_URL.startsWith('https');
const client = USE_HTTPS ? https : http;

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const request = client.request(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: parsed
          });
        } catch (e) {
          resolve({
            status: response.statusCode,
            headers: response.headers,
            body: data
          });
        }
      });
    });

    request.on('error', reject);

    if (body) {
      request.write(JSON.stringify(body));
    }
    request.end();
  });
}

async function runTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║      Access Request System - API Tester                   ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Testing against: ${BASE_URL}\n`, 'blue');

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // Test 1: Submit Access Request
    log('Test 1: Submit Access Request', 'yellow');
    log('─────────────────────────────────────────────');
    
    const submitData = {
      email: 'test@example.com',
      fullName: 'Test User',
      organization: 'Test Organization',
      requestedAccess: 'viewer',
      reason: 'Testing the access request system'
    };

    const submitResponse = await makeRequest('POST', '/api/access-requests', submitData);
    
    if (submitResponse.status === 201 && submitResponse.body.success) {
      log('✅ PASSED: Request submitted successfully', 'green');
      log(`   Request ID: ${submitResponse.body.data.request_id}\n`, 'green');
      testsPassed++;
      
      const requestId = submitResponse.body.data.request_id;

      // Test 2: Get All Requests
      log('Test 2: Get All Requests', 'yellow');
      log('─────────────────────────────────────────────');
      
      const getAllResponse = await makeRequest('GET', '/api/access-requests');
      
      if (getAllResponse.status === 200 && getAllResponse.body.requests) {
        log(`✅ PASSED: Retrieved ${getAllResponse.body.requests.length} requests`, 'green');
        log(`   Total count: ${getAllResponse.body.total}\n`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAILED: Expected 200 OK, got ${getAllResponse.status}`, 'red');
        log(`   Response: ${JSON.stringify(getAllResponse.body)}\n`, 'red');
        testsFailed++;
      }

      // Test 3: Get Pending Requests Only
      log('Test 3: Get Pending Requests Only', 'yellow');
      log('─────────────────────────────────────────────');
      
      const getPendingResponse = await makeRequest('GET', '/api/access-requests?status=pending');
      
      if (getPendingResponse.status === 200 && Array.isArray(getPendingResponse.body.requests)) {
        log(`✅ PASSED: Retrieved ${getPendingResponse.body.requests.length} pending requests\n`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAILED: Expected 200 OK with requests array`, 'red');
        log(`   Response: ${JSON.stringify(getPendingResponse.body)}\n`, 'red');
        testsFailed++;
      }

      // Test 4: Get Specific Request
      log('Test 4: Get Specific Request by ID', 'yellow');
      log('─────────────────────────────────────────────');
      
      const getOneResponse = await makeRequest('GET', `/api/access-requests/${requestId}`);
      
      if (getOneResponse.status === 200 && getOneResponse.body.request_id === requestId) {
        log(`✅ PASSED: Retrieved request ${requestId}`, 'green');
        log(`   Status: ${getOneResponse.body.status}\n`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAILED: Could not retrieve specific request`, 'red');
        log(`   Response: ${JSON.stringify(getOneResponse.body)}\n`, 'red');
        testsFailed++;
      }

      // Test 5: Approve Request
      log('Test 5: Approve Request', 'yellow');
      log('─────────────────────────────────────────────');
      
      const approveData = {
        requestId: requestId,
        approverName: 'Test Admin',
        notes: 'Approved for testing'
      };

      const approveResponse = await makeRequest('POST', '/api/approve-request/approve', approveData);
      
      if (approveResponse.status === 200 && approveResponse.body.data.status === 'approved') {
        log('✅ PASSED: Request approved successfully', 'green');
        log(`   Reviewed by: ${approveResponse.body.data.reviewedBy}\n`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAILED: Could not approve request`, 'red');
        log(`   Status: ${approveResponse.status}`, 'red');
        log(`   Response: ${JSON.stringify(approveResponse.body)}\n`, 'red');
        testsFailed++;
      }

      // Test 6: Try to Reject Already-Approved Request
      log('Test 6: Try to Reject Already-Approved Request', 'yellow');
      log('─────────────────────────────────────────────');
      
      const rejectData = {
        requestId: requestId,
        approverName: 'Test Admin',
        notes: 'This should fail because it\'s already approved'
      };

      const rejectResponse = await makeRequest('POST', '/api/approve-request/reject', rejectData);
      
      if (rejectResponse.status === 409) {
        log('✅ PASSED: Correctly rejected attempt to re-review approved request', 'green');
        log(`   Error: ${rejectResponse.body.error}\n`, 'green');
        testsPassed++;
      } else {
        log(`❌ FAILED: Expected 409 Conflict, got ${rejectResponse.status}`, 'red');
        log(`   Response: ${JSON.stringify(rejectResponse.body)}\n`, 'red');
        testsFailed++;
      }

    } else {
      log(`❌ FAILED: Could not submit request`, 'red');
      log(`   Status: ${submitResponse.status}`, 'red');
      log(`   Response: ${JSON.stringify(submitResponse.body)}\n`, 'red');
      testsFailed++;
    }

    // Test 7: Invalid Request (Missing Required Field)
    log('Test 7: Submit Invalid Request (Missing Email)', 'yellow');
    log('─────────────────────────────────────────────');
    
    const invalidData = {
      fullName: 'Test User',
      reason: 'Missing email'
    };

    const invalidResponse = await makeRequest('POST', '/api/access-requests', invalidData);
    
    if (invalidResponse.status === 400) {
      log('✅ PASSED: Correctly rejected invalid request', 'green');
      log(`   Error: ${invalidResponse.body.error}\n`, 'green');
      testsPassed++;
    } else {
      log(`❌ FAILED: Expected 400 Bad Request, got ${invalidResponse.status}`, 'red');
      log(`   Response: ${JSON.stringify(invalidResponse.body)}\n`, 'red');
      testsFailed++;
    }

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    log(`\nMake sure the API is running at: ${BASE_URL}`, 'red');
    testsFailed++;
  }

  // Summary
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                    Test Results                           ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝\n', 'cyan');

  log(`Tests Passed: ${testsPassed}`, 'green');
  log(`Tests Failed: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`Total Tests:  ${testsPassed + testsFailed}`, 'blue');

  const percentage = Math.round((testsPassed / (testsPassed + testsFailed)) * 100) || 0;
  log(`Success Rate: ${percentage}%\n`, percentage === 100 ? 'green' : 'yellow');

  if (testsFailed === 0) {
    log('🎉 All tests passed! Your API is working correctly.\n', 'green');
    process.exit(0);
  } else {
    log('⚠️  Some tests failed. Check the output above for details.\n', 'yellow');
    process.exit(1);
  }
}

// Usage
console.log('Usage: API_URL=http://localhost:7071 node test-access-requests.js');
console.log('       API_URL=https://your-app.azurestaticapps.net node test-access-requests.js');
console.log('');

runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
