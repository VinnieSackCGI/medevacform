#!/usr/bin/env node

/**
 * Validate medevac-form-app API structure
 * Ensures all functions are properly configured for SWA deployment
 */

const fs = require('fs');
const path = require('path');

const API_DIR = path.join(__dirname, 'api');

const REQUIRED_FUNCTIONS = [
    'health',
    'locations',
    'medevac',
    'perdiem',
    'request-account',
    'access-requests'
];

const REQUIRED_FILES = {
    'api': ['host.json', 'package.json'],
};

function validateJsonFile(filePath, name) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return { valid: true, file: name };
    } catch (err) {
        return { valid: false, file: name, error: err.message };
    }
}

function checkFileExists(filePath, name) {
    if (fs.existsSync(filePath)) {
        return { exists: true, file: name };
    }
    return { exists: false, file: name };
}

function validateApiStructure() {
    console.log('='.repeat(70));
    console.log('MEDEVAC Form App - API Structure Validation');
    console.log('='.repeat(70));

    let allValid = true;
    const results = {
        rootFiles: [],
        functions: {}
    };

    // Check root API files
    console.log('\n📁 Checking API root files...');
    for (const file of REQUIRED_FILES.api) {
        const filePath = path.join(API_DIR, file);
        const result = validateJsonFile(filePath, file);
        results.rootFiles.push(result);
        
        const status = result.valid ? '✅' : '❌';
        console.log(`${status} ${file}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
            allValid = false;
        }
    }

    // Check each function
    console.log('\n📦 Checking Function folders...');
    for (const func of REQUIRED_FUNCTIONS) {
        results.functions[func] = {};
        const funcPath = path.join(API_DIR, func);
        
        if (!fs.existsSync(funcPath)) {
            console.log(`❌ ${func}/ - MISSING`);
            allValid = false;
            continue;
        }

        console.log(`📂 ${func}/`);

        // Check function.json
        const functionJsonPath = path.join(funcPath, 'function.json');
        const jsonResult = validateJsonFile(functionJsonPath, 'function.json');
        results.functions[func]['function.json'] = jsonResult;
        const jsonStatus = jsonResult.valid ? '  ✅' : '  ❌';
        console.log(`${jsonStatus} function.json`);
        if (jsonResult.error) {
            console.log(`     Error: ${jsonResult.error}`);
            allValid = false;
        }

        // Check index.js
        const indexPath = path.join(funcPath, 'index.js');
        const indexExists = checkFileExists(indexPath, 'index.js');
        results.functions[func]['index.js'] = indexExists;
        const indexStatus = indexExists.exists ? '  ✅' : '  ❌';
        console.log(`${indexStatus} index.js`);
        if (!indexExists.exists) {
            allValid = false;
        }

        // Check package.json if present
        const pkgPath = path.join(funcPath, 'package.json');
        if (fs.existsSync(pkgPath)) {
            const pkgResult = validateJsonFile(pkgPath, 'package.json');
            results.functions[func]['package.json'] = pkgResult;
        }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('Validation Summary');
    console.log('='.repeat(70));

    if (allValid && Object.keys(results.functions).length === REQUIRED_FUNCTIONS.length) {
        console.log('\n✅ All API functions are properly configured!');
        console.log('\nYour SWA deployment should work. If not:');
        console.log('1. Check Azure Portal → Static Web App → Deployments');
        console.log('2. Review GitHub Actions workflow execution');
        console.log('3. Check for build errors in the logs');
        console.log('4. Run: npm install in /api directory');
        console.log('5. Push a new commit to trigger redeployment');
    } else {
        console.log('\n❌ Configuration issues found:');
        
        if (!REQUIRED_FILES.api.every(f => results.rootFiles.find(r => r.valid && r.file === f))) {
            console.log('   - Missing or invalid root files in /api');
        }
        
        const missingFuncs = REQUIRED_FUNCTIONS.filter(f => !results.functions[f] || !fs.existsSync(path.join(API_DIR, f)));
        if (missingFuncs.length > 0) {
            console.log(`   - Missing functions: ${missingFuncs.join(', ')}`);
        }

        const invalidConfigs = Object.entries(results.functions)
            .filter(([_, v]) => v['function.json'] && !v['function.json'].valid);
        if (invalidConfigs.length > 0) {
            console.log(`   - Invalid function.json in: ${invalidConfigs.map(([k]) => k).join(', ')}`);
        }

        console.log('\nPlease fix the issues above and commit changes.');
    }

    console.log('\n' + '='.repeat(70));
}

validateApiStructure();
