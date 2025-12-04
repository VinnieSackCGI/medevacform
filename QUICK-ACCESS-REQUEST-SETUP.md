# Quick Setup Guide - Access Request System

## What Was Built

You now have a **complete database-driven access request system** with:

✅ **User Form** - Users can submit access requests
✅ **Admin Dashboard** - Admins can review and approve/reject requests
✅ **Database Backend** - All requests stored in Azure SQL with audit trail
✅ **REST APIs** - Complete REST API for form submission and approvals
✅ **Authentication Trail** - Tracks who approved/rejected and when

## Files Created

```
api/access-requests/
  ├── function.json          ← Azure Function config
  └── index.js               ← Handles form submissions

api/approve-request/
  ├── function.json          ← Azure Function config
  └── index.js               ← Handles approvals/rejections

src/components/
  ├── AccessRequestForm.jsx  ← User form component
  ├── AccessRequestForm.css  ← Form styling
  ├── AccessRequestAdmin.jsx ← Admin dashboard
  └── AccessRequestAdmin.css ← Dashboard styling

ACCESS-REQUEST-SYSTEM.md     ← Full documentation
```

## How It Works

### 1. User Submits Request
- User goes to `/request-access`
- Fills in the form (email, name, organization, access level, reason)
- Clicks "Submit Request"
- Gets a confirmation with Request ID

### 2. Data Saved to Database
- Request stored in `access_requests` table
- Assigned unique Request ID
- Status = "pending"
- Timestamp recorded

### 3. Admin Reviews
- Admin goes to `/admin/requests`
- Sees all pending requests in cards
- Clicks on request to see full details
- Can filter by status (Pending, Approved, Rejected)

### 4. Admin Approves or Rejects
- Admin enters their name
- (For rejection: adds reason in notes)
- Clicks Approve or Reject
- Database updated with approval/rejection
- Timestamp and reviewer name recorded

## Integration - 3 Simple Steps

### Step 1: Add Routes to App.js

Open `src/App.js` and add these imports:

```javascript
import AccessRequestForm from './components/AccessRequestForm';
import AccessRequestAdmin from './components/AccessRequestAdmin';
```

Then add these routes (replace with your actual routing setup):

```javascript
<Route path="/request-access" element={<AccessRequestForm />} />
<Route path="/admin/requests" element={<AccessRequestAdmin />} />
```

### Step 2: Add Navigation Links

Update your navigation to include links:

```html
<a href="/request-access">Request Access</a>
<a href="/admin/requests">Manage Requests</a>  <!-- Admin only -->
```

### Step 3: Deploy to Azure

```bash
git add .
git commit -m "Add access request system with database backend"
git push origin master
```

That's it! GitHub Actions will automatically deploy everything to Azure.

## Testing Locally

### Test the User Form
1. `npm start` (if running locally)
2. Navigate to `/request-access`
3. Fill in the form and submit
4. You should see a success message with Request ID

### Test the Admin Dashboard
1. Navigate to `/admin/requests`
2. You should see your submitted request in "Pending"
3. Click on it
4. Try approving/rejecting it
5. Check different status tabs

## Live URLs

Once deployed to Azure:

- **Submit Request:** `https://gray-field-0a3d8780f.azurestaticapps.net/request-access`
- **Admin Dashboard:** `https://gray-field-0a3d8780f.azurestaticapps.net/admin/requests`
- **API Endpoint:** `https://gray-field-0a3d8780f.azurestaticapps.net/api/access-requests`

## Key Features

**User Form:**
- Email validation
- Required field checking
- Success confirmation with Request ID
- Responsive design
- Professional UI

**Admin Dashboard:**
- Filter by status (Pending, Approved, Rejected, All)
- Request cards with key info
- Click to view full details
- Modal dialog for approvals
- Approval notes and reviewer tracking
- Shows who approved/rejected and when

**Backend:**
- Direct Azure SQL Database connection
- Auto-creates table on first request
- Unique Request IDs
- Complete audit trail
- CORS support
- Error handling

## Database (Auto-Created)

The system automatically creates this table:

```sql
access_requests (
  id (auto-increment),
  request_id (unique),
  email,
  full_name,
  organization,
  reason,
  requested_access,
  status (pending/approved/rejected),
  created_at (auto timestamp),
  reviewed_at (when approved/rejected),
  reviewed_by (who approved/rejected),
  approval_notes,
  ip_address,
  user_agent
)
```

## API Reference

### Submit Request
```
POST /api/access-requests
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "organization": "Acme Corp",
  "requestedAccess": "viewer",
  "reason": "Need read-only access for Q4 reporting"
}
```

### Get Pending Requests
```
GET /api/access-requests?status=pending
```

### Approve Request
```
POST /api/approve-request/approve
{
  "requestId": "ARQ-1733382918000-xyz123",
  "approverName": "Jane Smith",
  "notes": "User verified and approved"
}
```

### Reject Request
```
POST /api/approve-request/reject
{
  "requestId": "ARQ-1733382918000-xyz123",
  "approverName": "Jane Smith",
  "notes": "Organization not authorized for this access"
}
```

## Validate Everything is Set Up

Run this to verify all files are in place:

```bash
node deployment/tools/validate-access-requests.js
```

Should show: ✅ ALL CHECKS PASSED!

## Next Steps (Optional Enhancements)

1. **Add Email Notifications** - Email users when request is approved/rejected
2. **Add Authentication** - Protect admin dashboard with login
3. **Add Search** - Search requests by email or name
4. **Add Export** - Export requests to CSV
5. **Add Comments** - Allow admins to add multiple comments
6. **Add Bulk Operations** - Approve/reject multiple requests at once

## Security Note

The current implementation is suitable for internal use. For production with sensitive data:

1. Add authentication to the admin endpoint
2. Restrict CORS to your domain instead of "*"
3. Add rate limiting to prevent abuse
4. Use HTTPS everywhere (Azure does this by default)
5. Add input validation and sanitization

## Troubleshooting

**Problem:** Getting 404 errors
- Solution: Run `node deployment/tools/validate-api.js` to ensure all functions are deployed

**Problem:** Database connection errors
- Solution: Check your Azure SQL credentials are set in environment variables

**Problem:** Admin dashboard shows no requests
- Solution: Submit a test request first, then refresh the page

**Problem:** Can't approve requests
- Solution: Enter your name in the "Your Name" field and try again

## Documentation

For complete details, see: **`ACCESS-REQUEST-SYSTEM.md`**

---

**Status:** ✅ Complete and Ready to Deploy

**Created:** 2025-12-05
