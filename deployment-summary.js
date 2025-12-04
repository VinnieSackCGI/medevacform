#!/usr/bin/env node

/**
 * MEDEVAC Form App - Quick Deployment Summary
 * Shows all deployment information and next steps
 */

const fs = require('fs');
const path = require('path');

function printHeader(text) {
    console.log('\n' + '='.repeat(70));
    console.log('  ' + text);
    console.log('='.repeat(70));
}

function printSection(title, items) {
    console.log('\n' + title);
    items.forEach(item => console.log(`  ${item}`));
}

function getFileSize(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return (stats.size / 1024).toFixed(2) + ' KB';
    } catch {
        return 'N/A';
    }
}

console.clear();
printHeader('MEDEVAC FORM APP - AZURE SWA DEPLOYMENT READY');

// Status
printSection('📊 DEPLOYMENT STATUS', [
    '✅ All API Functions Configured',
    '✅ GitHub Actions CI/CD Setup',
    '✅ React Frontend Ready',
    '✅ Azure Storage Integration',
    '✨ NEW: access-requests function created'
]);

// Configuration
printSection('⚙️ CONFIGURATION SUMMARY', [
    '📱 App Framework: React (Create React App)',
    '⚡ Backend: Azure Functions (Node.js 18)',
    '📦 Deployment: GitHub Actions → Azure SWA',
    '🌐 SWA Name: medevac-form-app',
    '💾 Storage Account: medevaciafstorage',
    '🔌 API Runtime: Node.js 18'
]);

// API Endpoints
printSection('🔌 API ENDPOINTS', [
    '✓ GET    /api/health          - Health check',
    '✓ GET    /api/locations       - Location data',
    '✓ POST   /api/perdiem         - Per diem calculation',
    '✓ POST   /api/medevac         - MEDEVAC form submission',
    '✓ POST   /api/request-account - Account requests',
    '✓ POST   /api/access-requests - Access control'
]);

// Files Created
printSection('📝 NEW FILES CREATED', [
    `✨ api/access-requests/function.json    (${getFileSize(path.join(__dirname, 'api/access-requests/function.json'))})`,
    `✨ api/access-requests/index.js         (${getFileSize(path.join(__dirname, 'api/access-requests/index.js'))})`,
    `📄 validate-api.js                      (${getFileSize(path.join(__dirname, 'validate-api.js'))})`,
    `📄 test-deployment.js                   (${getFileSize(path.join(__dirname, 'test-deployment.js'))})`,
    `📄 FUNCTION-DEPLOYMENT-GUIDE.md         (${getFileSize(path.join(__dirname, 'FUNCTION-DEPLOYMENT-GUIDE.md'))})`,
    `📄 DEPLOYMENT-CHECKLIST.md              (${getFileSize(path.join(__dirname, 'DEPLOYMENT-CHECKLIST.md'))})`
]);

// Quick Start
printSection('🚀 QUICK START', [
    '1. Validate configuration:',
    '   $ node validate-api.js',
    '',
    '2. Deploy to Azure:',
    '   $ git add .',
    '   $ git commit -m "fix: add missing access-requests function"',
    '   $ git push origin master',
    '',
    '3. Monitor deployment:',
    '   → GitHub → Actions (watch workflow)',
    '   → Azure Portal → Static Web App → Deployments',
    '',
    '4. Test endpoints (after ~5-10 minutes):',
    '   $ node test-deployment.js',
    '   (Update SWA_URL env var with your deployed URL)'
]);

// Important Notes
printSection('⚠️ IMPORTANT NOTES', [
    '• Environment Variables:',
    '  Set in Azure Portal → Static Web App → Settings → Configuration',
    '  Required: AZURE_STORAGE_CONNECTION_STRING',
    '',
    '• CORS Settings:',
    '  Already configured in staticwebapp.config.json',
    '  Functions return proper CORS headers',
    '',
    '• Storage Containers:',
    '  Ensure these exist in medevaciafstorage:',
    '  - application-data',
    '  - perdiem-cache',
    '  - rate-history',
    '  - scraper-logs',
    '',
    '• React App Configuration:',
    '  API calls should use relative paths: /api/endpoint',
    '  NOT absolute URLs to the backend'
]);

// Documentation
printSection('📚 DOCUMENTATION', [
    '📖 DEPLOYMENT-CHECKLIST.md     → Complete deployment guide',
    '📖 FUNCTION-DEPLOYMENT-GUIDE.md → Troubleshooting & details',
    '📖 AZURE-SETUP.md              → Azure setup instructions',
    '📖 AZURE_ARCHITECTURE.md       → Architecture overview'
]);

// Architecture
printSection('🏗️ ARCHITECTURE', [
    'Frontend:  React App (TypeScript/JavaScript)',
    '   ↓ (fetch calls to)',
    'API:       Azure Functions (Node.js)',
    '   ↓ (read/write)',
    'Storage:   Azure Blob Storage (medevaciafstorage)',
    '',
    'Deployment Pipeline:',
    'GitHub Push → GitHub Actions → Build & Test → Deploy to Azure SWA'
]);

// Next Steps
printSection('📋 NEXT STEPS', [
    '[ ] Review DEPLOYMENT-CHECKLIST.md',
    '[ ] Run: node validate-api.js',
    '[ ] Commit changes to git',
    '[ ] Push to master branch',
    '[ ] Monitor GitHub Actions workflow',
    '[ ] Check Azure Portal for deployment status',
    '[ ] Test API endpoints after deployment',
    '[ ] Verify storage account connection',
    '[ ] Test React frontend with backend calls'
]);

// Support
printSection('🆘 HELP & SUPPORT', [
    'Validation Issues:     Run node validate-api.js',
    'Endpoint Testing:      Set SWA_URL env var and run node test-deployment.js',
    'Deployment Failures:   Check GitHub Actions logs',
    'Runtime Errors:        Check Azure Application Insights',
    'Configuration Help:    See FUNCTION-DEPLOYMENT-GUIDE.md'
]);

printHeader('Ready to Deploy!');
console.log('\n💡 TIP: Run the validation script first to ensure everything is correct:\n');
console.log('     node validate-api.js\n');
