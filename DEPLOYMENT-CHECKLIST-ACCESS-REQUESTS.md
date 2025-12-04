# Access Request System - Deployment Checklist

## Pre-Deployment (Code Integration)

- [ ] **Files Validated**
  - Run: `node deployment/tools/validate-access-requests.js`
  - Expected: ✅ ALL CHECKS PASSED!

- [ ] **Routes Added to App.js**
  ```javascript
  import AccessRequestForm from './components/AccessRequestForm';
  import AccessRequestAdmin from './components/AccessRequestAdmin';
  
  <Route path="/request-access" element={<AccessRequestForm />} />
  <Route path="/admin/requests" element={<AccessRequestAdmin />} />
  ```

- [ ] **Navigation Links Added**
  - Added link to `/request-access` for users
  - Added link to `/admin/requests` for admins (consider protecting this)

- [ ] **Code Reviewed**
  - Check API function logic
  - Verify database connection string is correct
  - Review CORS settings if needed

- [ ] **Local Testing (Optional)**
  ```bash
  npm start
  # Test http://localhost:3000/request-access
  # Test http://localhost:3000/admin/requests
  ```

## GitHub Deployment

- [ ] **Stage Changes**
  ```bash
  git add .
  ```

- [ ] **Create Commit**
  ```bash
  git commit -m "Add access request system with database backend and admin dashboard"
  ```

- [ ] **Push to GitHub**
  ```bash
  git push origin master
  ```

- [ ] **Monitor GitHub Actions**
  - Go to: https://github.com/VinnieSackCGI/medevacform/actions
  - Watch build process complete
  - Verify no errors in logs

## Azure Deployment

- [ ] **Verify Deployment Started**
  - Check Azure Portal
  - Navigate to: medevac-form-app Static Web App
  - Check "Deployments" tab

- [ ] **Wait for Build**
  - Build time: typically 2-5 minutes
  - Status: Green checkmark when complete

- [ ] **Check Function Health**
  ```bash
  curl https://gray-field-0a3d8780f.azurestaticapps.net/api/health
  ```
  Expected response: 200 OK with JSON

- [ ] **Verify API Functions**
  - Access-requests function: Created ✅
  - Approve-request function: Created ✅
  - Both listed in Azure Portal

## Post-Deployment Testing

### User Form Tests
- [ ] **Access Form Page**
  - URL: `https://gray-field-0a3d8780f.azurestaticapps.net/request-access`
  - Should load without errors
  - Form should be visible

- [ ] **Submit Test Request**
  - Fill in all fields
  - Click "Submit Request"
  - Should see success message
  - Should display Request ID

- [ ] **Verify Data Saved**
  - Login to Azure SQL
  - Query: `SELECT * FROM access_requests`
  - Verify your test request is there
  - Check: id, request_id, email, status='pending'

### Admin Dashboard Tests
- [ ] **Access Admin Dashboard**
  - URL: `https://gray-field-0a3d8780f.azurestaticapps.net/admin/requests`
  - Should load without errors
  - Dashboard should be visible

- [ ] **View Pending Requests**
  - Click "Pending" tab
  - Should see your test request card
  - Card should show: Name, Email, Status badge

- [ ] **View Request Details**
  - Click on the request card
  - Modal should open with full details
  - Verify all fields display correctly

- [ ] **Test Approve Function**
  - Enter your name
  - Click "✓ Approve"
  - Should see success message
  - Request should move to "Approved" tab

- [ ] **Test Reject Function**
  - Submit another test request
  - Open it in admin dashboard
  - Enter your name
  - Enter a rejection reason
  - Click "✗ Reject"
  - Should see success message
  - Request should move to "Rejected" tab

- [ ] **Verify Database Updated**
  - Login to Azure SQL
  - Query: `SELECT * FROM access_requests WHERE status = 'approved'`
  - Verify: reviewed_by, reviewed_at, approval_notes are populated
  - Same for rejected requests

### Filter Tests
- [ ] **Filter by Pending**
  - Click "Pending" tab
  - Should show only pending requests

- [ ] **Filter by Approved**
  - Click "Approved" tab
  - Should show only approved requests

- [ ] **Filter by Rejected**
  - Click "Rejected" tab
  - Should show only rejected requests

- [ ] **View All**
  - Click "All" tab
  - Should show all requests (pending + approved + rejected)

### API Tests
- [ ] **Test with cURL**
  ```bash
  # GET all requests
  curl https://gray-field-0a3d8780f.azurestaticapps.net/api/access-requests
  
  # GET pending only
  curl https://gray-field-0a3d8780f.azurestaticapps.net/api/access-requests?status=pending
  
  # POST new request
  curl -X POST https://gray-field-0a3d8780f.azurestaticapps.net/api/access-requests \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","fullName":"Test","requestedAccess":"viewer","reason":"test"}'
  ```

- [ ] **Test with Node Script**
  ```bash
  API_URL=https://gray-field-0a3d8780f.azurestaticapps.net \
  node deployment/tools/test-access-requests.js
  ```
  Expected: 7/7 tests passed ✅

### Error Handling Tests
- [ ] **Submit Invalid Form**
  - Try submitting with empty email
  - Should see error message

- [ ] **Invalid Email Format**
  - Enter bad email (e.g., "notanemail")
  - Should show validation error

- [ ] **Missing Required Fields**
  - Try submitting with empty fields
  - Should show which fields are required

- [ ] **Try Approving Non-Existent Request**
  - Get API error (404 or similar)
  - Should return proper error message

- [ ] **Try Approving Already Approved Request**
  - Approve a request
  - Try to approve same request again
  - Should get conflict error (409)

## Performance Testing

- [ ] **Load Time**
  - Access form page: < 2 seconds
  - Access admin page: < 2 seconds
  - Submit request: < 3 seconds

- [ ] **Submit Multiple Requests**
  - Submit 5+ requests quickly
  - All should succeed
  - All should appear in dashboard

- [ ] **Database Query Performance**
  - Admin dashboard loads with many requests
  - No noticeable lag
  - Filter operations are instant

## Security Verification

- [ ] **HTTPS Connection**
  - URL starts with `https://` ✅
  - No warnings about insecure content

- [ ] **CORS Working**
  - Cross-origin requests are allowed
  - From: Any domain (currently "*)

- [ ] **SQL Injection Protection**
  - All queries use parameterized statements ✅
  - No string concatenation in SQL queries ✅

- [ ] **Input Validation**
  - Email validation working ✅
  - Required fields checked ✅
  - No malicious input allowed ✅

## Browser Compatibility

- [ ] **Chrome**
  - Form works ✓
  - Dashboard works ✓
  - Buttons/interactions work ✓

- [ ] **Firefox**
  - Form works ✓
  - Dashboard works ✓
  - Buttons/interactions work ✓

- [ ] **Safari**
  - Form works ✓
  - Dashboard works ✓
  - Buttons/interactions work ✓

- [ ] **Edge**
  - Form works ✓
  - Dashboard works ✓
  - Buttons/interactions work ✓

- [ ] **Mobile (iOS Safari)**
  - Form responsive ✓
  - Dashboard responsive ✓
  - Touch interactions work ✓

- [ ] **Mobile (Android Chrome)**
  - Form responsive ✓
  - Dashboard responsive ✓
  - Touch interactions work ✓

## Documentation Verification

- [ ] **All docs created**
  - [ ] ACCESS-REQUEST-SYSTEM.md
  - [ ] QUICK-ACCESS-REQUEST-SETUP.md
  - [ ] ACCESS-REQUEST-COMPLETION-SUMMARY.md
  - [ ] ARCHITECTURE-DIAGRAMS.md
  - [ ] This checklist

- [ ] **Docs are accurate**
  - [ ] API endpoints are correct
  - [ ] Database schema is correct
  - [ ] Integration steps are clear
  - [ ] Examples are working

## Monitoring Setup (Optional)

- [ ] **Azure Monitor**
  - Check function execution logs
  - Verify no errors
  - Monitor performance metrics

- [ ] **Application Insights** (if configured)
  - View request traces
  - Check response times
  - Identify slow queries

- [ ] **Set Up Alerts** (if needed)
  - Alert on function errors
  - Alert on database issues
  - Alert on availability issues

## Rollback Plan

If something goes wrong:

- [ ] **Revert Code**
  ```bash
  git revert HEAD
  git push origin master
  ```

- [ ] **Delete Test Data** (Optional)
  ```sql
  DELETE FROM access_requests WHERE email = 'test@example.com'
  ```

- [ ] **Verify Rollback**
  - Check Azure deployment completed
  - Verify old version is running

## Success Criteria

✅ **Deployment is successful when:**

1. Forms page loads: `/request-access` ✅
2. Admin page loads: `/admin/requests` ✅
3. Can submit request via form ✅
4. Data saved to database ✅
5. Admin can see pending requests ✅
6. Admin can approve request ✅
7. Admin can reject request ✅
8. Database updated with approval/rejection ✅
9. All API endpoints respond correctly ✅
10. No errors in browser console ✅
11. No errors in Azure Function logs ✅
12. Responsive on mobile devices ✅

## Completion Sign-Off

- [ ] **Tester Name:** _____________________
- [ ] **Date Tested:** _____________________
- [ ] **All Tests Passed:** ✅ YES / ❌ NO
- [ ] **Ready for Production:** ✅ YES / ❌ NO

**Notes/Issues Found:**
```
[Space for notes]
```

---

## Quick Reference Commands

```bash
# Validate system setup
node deployment/tools/validate-access-requests.js

# Test API endpoints
API_URL=https://your-app.azurestaticapps.net \
node deployment/tools/test-access-requests.js

# View Azure logs (requires Azure CLI installed)
az functionapp logs tail --name medevac-form-app --resource-group medevac-rg

# Query database (requires Azure SQL tools)
sqlcmd -S your-server.database.windows.net -U admin -P yourpassword -d medevac_db \
  -Q "SELECT * FROM access_requests;"
```

---

**Checklist Version:** 1.0
**Last Updated:** 2025-12-05
**Status:** Ready for Deployment ✅
