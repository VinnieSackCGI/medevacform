#!/usr/bin/env node

/**
 * Access Request System Validator
 * Checks that all components are properly created and configured
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  // API Functions
  { path: 'api/access-requests/function.json', type: 'Azure Function Config' },
  { path: 'api/access-requests/index.js', type: 'Azure Function' },
  { path: 'api/approve-request/function.json', type: 'Azure Function Config' },
  { path: 'api/approve-request/index.js', type: 'Azure Function' },
  
  // React Components
  { path: 'src/components/AccessRequestForm.jsx', type: 'React Component' },
  { path: 'src/components/AccessRequestForm.css', type: 'Component Styles' },
  { path: 'src/components/AccessRequestAdmin.jsx', type: 'React Component' },
  { path: 'src/components/AccessRequestAdmin.css', type: 'Component Styles' },
  
  // Documentation
  { path: 'ACCESS-REQUEST-SYSTEM.md', type: 'Documentation' }
];

const REQUIRED_FUNCTIONS = {
  'api/access-requests/index.js': ['POST', 'GET', 'OPTIONS', 'sql.connect', 'access_requests'],
  'api/approve-request/index.js': ['POST', 'approve', 'reject', 'UPDATE']
};

console.log('\n═══════════════════════════════════════════════════════════');
console.log('  Access Request System - Validation Report');
console.log('═══════════════════════════════════════════════════════════\n');

let filesFound = 0;
let filesMissing = 0;

console.log('📋 Checking Required Files:\n');

REQUIRED_FILES.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    console.log(`  ✅ ${file.type.padEnd(25)} ${file.path}`);
    filesFound++;
  } else {
    console.log(`  ❌ ${file.type.padEnd(25)} ${file.path} (MISSING)`);
    filesMissing++;
  }
});

console.log(`\n  Summary: ${filesFound} found, ${filesMissing} missing\n`);

// Check file contents
console.log('🔍 Checking File Contents:\n');

let contentIssues = 0;

Object.entries(REQUIRED_FUNCTIONS).forEach(([filePath, requiredStrings]) => {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const filename = path.basename(filePath);
    
    console.log(`  ${filename}:`);
    
    requiredStrings.forEach(requiredStr => {
      const found = content.includes(requiredStr) || content.toLowerCase().includes(requiredStr.toLowerCase());
      if (found) {
        console.log(`    ✅ Contains "${requiredStr}"`);
      } else {
        console.log(`    ⚠️  Missing "${requiredStr}"`);
        contentIssues++;
      }
    });
    console.log('');
  }
});

// Summary
console.log('═══════════════════════════════════════════════════════════\n');

if (filesMissing === 0 && contentIssues === 0) {
  console.log('✅ ALL CHECKS PASSED! Your access request system is ready.\n');
  console.log('Next Steps:');
  console.log('  1. Add routes to src/App.js:');
  console.log('     <Route path="/request-access" element={<AccessRequestForm />} />');
  console.log('     <Route path="/admin/requests" element={<AccessRequestAdmin />} />');
  console.log('\n  2. Deploy to Azure via GitHub:');
  console.log('     git add .');
  console.log('     git commit -m "Add access request system"');
  console.log('     git push origin master');
  console.log('\n  3. Test at: /request-access and /admin/requests');
  console.log('\n  📚 Full guide: ACCESS-REQUEST-SYSTEM.md\n');
  process.exit(0);
} else {
  console.log(`⚠️  VALIDATION ISSUES FOUND:\n`);
  console.log(`  • Missing files: ${filesMissing}`);
  console.log(`  • Content issues: ${contentIssues}`);
  console.log('\n  Please review the missing items above.\n');
  process.exit(1);
}
