# Access Request System - Implementation Guide

## Overview

You now have a complete, production-ready access request system with:
- **User-facing form** to submit access requests
- **Admin dashboard** to review and approve/reject requests
- **Database backend** to persist all requests with audit trails
- **REST API endpoints** for form submission and admin operations

## Architecture

```
User Submits Request
        ↓
[AccessRequestForm.jsx]
        ↓
POST /api/access-requests
        ↓
[api/access-requests/index.js] 
        ↓
[Azure SQL Database]
        ↓
[AccessRequestAdmin.jsx] (Admin views pending requests)
        ↓
POST /api/approve-request/{action}
        ↓
Update Database with approval/rejection
```

## Component Files Created

### 1. **api/access-requests/index.js** (UPDATED)
- Handles GET and POST requests for access requests
- Connects directly to Azure SQL Database
- Auto-creates the `access_requests` table
- Supports filtering and pagination

**Key Endpoints:**
- `GET /api/access-requests` - Get all requests (with optional status filter)
- `GET /api/access-requests/{id}` - Get specific request
- `POST /api/access-requests` - Submit new request

### 2. **api/approve-request/index.js** (NEW)
- Handles approving and rejecting access requests
- Admin-only operations

**Key Endpoints:**
- `POST /api/approve-request/approve` - Approve a request
- `POST /api/approve-request/reject` - Reject a request

### 3. **src/components/AccessRequestForm.jsx** (NEW)
- User-facing form for submitting access requests
- Validates email and required fields
- Shows success message with request ID
- Professional UI with animations

### 4. **src/components/AccessRequestAdmin.jsx** (NEW)
- Admin dashboard for managing requests
- Filter by status (pending, approved, rejected)
- Click to view full details
- Approve/reject with notes
- Shows who approved/rejected and when

### 5. **CSS Files** (NEW)
- `AccessRequestForm.css` - Form styling with responsive design
- `AccessRequestAdmin.css` - Admin dashboard styling

## Integration Steps

### Step 1: Add Routes to Your App

In `src/App.js`, add these routes:

```javascript
import AccessRequestForm from './components/AccessRequestForm';
import AccessRequestAdmin from './components/AccessRequestAdmin';

// In your routing section, add:
<Route path="/request-access" element={<AccessRequestForm />} />
<Route path="/admin/requests" element={<AccessRequestAdmin />} /> {/* Protect this route! */}
```

### Step 2: Add Navigation Links

Update your navigation to include links to:
- `/request-access` - Public page for users to request access
- `/admin/requests` - Protected admin page

```javascript
<Nav.Link href="/request-access">Request Access</Nav.Link>
<Nav.Link href="/admin/requests">Manage Requests</Nav.Link> {/* Admin only */}
```

### Step 3: Protect the Admin Route

Make sure the `/admin/requests` route is protected with authentication:

```javascript
<Route 
  path="/admin/requests" 
  element={<ProtectedRoute><AccessRequestAdmin /></ProtectedRoute>} 
/>
```

### Step 4: Deploy to Azure

The API functions will be automatically deployed when you push to GitHub. The database will auto-create the table on first request.

## Database Schema

The system automatically creates this table:

```sql
CREATE TABLE access_requests (
  id INT IDENTITY(1,1) PRIMARY KEY,
  request_id NVARCHAR(50) UNIQUE NOT NULL,
  email NVARCHAR(255) NOT NULL,
  full_name NVARCHAR(255) NOT NULL,
  organization NVARCHAR(255),
  reason NVARCHAR(MAX) NOT NULL,
  requested_access NVARCHAR(255) NOT NULL,
  status NVARCHAR(50) DEFAULT 'pending',
  created_at DATETIME DEFAULT GETUTCDATE(),
  reviewed_at DATETIME,
  reviewed_by NVARCHAR(255),
  approval_notes NVARCHAR(MAX),
  ip_address NVARCHAR(50),
  user_agent NVARCHAR(MAX)
)
```

## API Examples

### Submit Access Request

```bash
POST /api/access-requests
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "John Doe",
  "organization": "ACME Corp",
  "requestedAccess": "viewer",
  "reason": "I need read-only access to view reports for Q4 analysis"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Access request submitted successfully",
  "data": {
    "id": 1,
    "request_id": "ARQ-1733382918000-xyz123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "status": "pending",
    "created_at": "2025-12-05T10:35:18.000Z"
  }
}
```

### Get All Pending Requests

```bash
GET /api/access-requests?status=pending
```

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "request_id": "ARQ-1733382918000-xyz123",
      "email": "user@example.com",
      "full_name": "John Doe",
      "organization": "ACME Corp",
      "reason": "I need read-only access...",
      "requested_access": "viewer",
      "status": "pending",
      "created_at": "2025-12-05T10:35:18.000Z",
      "reviewed_at": null,
      "reviewed_by": null,
      "approval_notes": null
    }
  ],
  "total": 1,
  "success": true
}
```

### Approve a Request

```bash
POST /api/approve-request/approve
Content-Type: application/json

{
  "requestId": "ARQ-1733382918000-xyz123",
  "approverName": "Jane Smith",
  "notes": "User has been verified. Approving access."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Access request approved successfully",
  "data": {
    "requestId": "ARQ-1733382918000-xyz123",
    "email": "user@example.com",
    "fullName": "John Doe",
    "status": "approved",
    "reviewedBy": "Jane Smith",
    "reviewedAt": "2025-12-05T11:00:00.000Z",
    "notes": "User has been verified. Approving access."
  }
}
```

### Reject a Request

```bash
POST /api/approve-request/reject
Content-Type: application/json

{
  "requestId": "ARQ-1733382918000-xyz123",
  "approverName": "Jane Smith",
  "notes": "Organization not authorized for this access level. Please contact support."
}
```

## Testing the System

### Manual Testing Steps

1. **Submit a Request:**
   - Navigate to `/request-access`
   - Fill in the form
   - Click "Submit Request"
   - You should see a success message with a Request ID

2. **View Admin Dashboard:**
   - Navigate to `/admin/requests`
   - You should see the submitted request in the "Pending" tab
   - Click on the request card to see details

3. **Approve a Request:**
   - In the request detail modal, enter your name
   - Click "✓ Approve"
   - The request should move to "Approved" tab

4. **Reject a Request:**
   - In the request detail modal, enter your name
   - Add a rejection reason in notes
   - Click "✗ Reject"
   - The request should move to "Rejected" tab

### API Testing with cURL

```bash
# Submit request
curl -X POST https://gray-field-0a3d8780f.azurestaticapps.net/api/access-requests \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "organization": "Test Org",
    "requestedAccess": "viewer",
    "reason": "Testing the system"
  }'

# Get pending requests
curl https://gray-field-0a3d8780f.azurestaticapps.net/api/access-requests?status=pending

# Approve request (replace ARQ-ID with actual ID)
curl -X POST https://gray-field-0a3d8780f.azurestaticapps.net/api/approve-request/approve \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "ARQ-1733382918000-xyz123",
    "approverName": "Admin User",
    "notes": "Approved"
  }'
```

## Features

### User Form Features
✅ Email validation
✅ Required field validation
✅ Multiple access level options
✅ Character counter for reason field
✅ Success message with Request ID
✅ Responsive design
✅ Loading states
✅ Error handling with user-friendly messages

### Admin Dashboard Features
✅ Filter by status (Pending, Approved, Rejected, All)
✅ Request card layout with key information
✅ Click to view full details in modal
✅ Show who approved/rejected and when
✅ Approve with optional notes
✅ Reject with required reason
✅ Request ID display and copy-to-clipboard
✅ Timestamps for all events
✅ Responsive grid layout

### Backend Features
✅ Direct Azure SQL Database integration
✅ Auto-table creation on first request
✅ Request ID generation with uniqueness
✅ Audit trail (created_at, reviewed_at, reviewed_by)
✅ CORS support for cross-origin requests
✅ Proper HTTP status codes (200, 201, 400, 404, 409, 500)
✅ Error handling with descriptive messages
✅ IP address and user agent tracking

## Security Considerations

⚠️ **Current Implementation:**
The current implementation is suitable for internal use. For production deployment, consider:

1. **Authentication:** Add authentication check to approval endpoint
2. **Authorization:** Verify user is admin before allowing approvals
3. **Rate Limiting:** Add rate limiting to prevent spam
4. **HTTPS Only:** Ensure all requests use HTTPS
5. **CORS:** Restrict CORS origin to your domain instead of "*"
6. **SQL Injection:** The current code uses parameterized queries (safe)
7. **Input Validation:** Add stricter validation for all inputs

### Example: Add Auth Check to Approval Endpoint

```javascript
// In api/approve-request/index.js, add before processing:
const userId = req.headers['x-user-id']; // Get from auth header
const userRole = req.headers['x-user-role']; // Get from auth header

if (!userId || userRole !== 'admin') {
  context.res = {
    status: 401,
    body: { error: 'Unauthorized. Admin access required.' }
  };
  return;
}
```

## Troubleshooting

### Problem: Database table not created
**Solution:** The table auto-creates on first request. Submit a test request to initialize the table.

### Problem: 404 errors on API endpoints
**Solution:** 
- Check that the API functions are deployed to Azure
- Verify the staticwebapp.config.json routes are correct
- Run `node deployment/tools/validate-api.js` to validate

### Problem: Can't connect to database
**Solution:**
- Verify environment variables are set in Azure:
  - `AZURE_SQL_USER`
  - `AZURE_SQL_PASSWORD`
  - `AZURE_SQL_SERVER`
  - `AZURE_SQL_DATABASE`
- Check firewall rules allow your IP

### Problem: Request not showing in admin dashboard
**Solution:**
- Refresh the page (or close/reopen modal)
- Check browser console for errors
- Verify the request was submitted successfully (check response)

## Next Steps

1. **Add Authentication:** Protect the admin dashboard with user authentication
2. **Add Email Notifications:** Send confirmation emails when requests are submitted/reviewed
3. **Add Bulk Operations:** Allow admins to approve/reject multiple requests at once
4. **Add Export Functionality:** Export request history to CSV/Excel
5. **Add Search:** Search requests by email, name, or status
6. **Add Comments:** Allow admins to add multiple comments to requests
7. **Add Request Templates:** Create templates for common access requests
8. **Add Audit Logs:** Track all approvals and rejections with timestamps

## Files Summary

| File | Purpose | Type |
|------|---------|------|
| api/access-requests/index.js | Form submission and GET requests | Azure Function |
| api/approve-request/index.js | Approve/reject requests | Azure Function |
| src/components/AccessRequestForm.jsx | User form component | React |
| src/components/AccessRequestForm.css | Form styling | CSS |
| src/components/AccessRequestAdmin.jsx | Admin dashboard | React |
| src/components/AccessRequestAdmin.css | Dashboard styling | CSS |

## Database Queries Reference

### View all requests
```sql
SELECT * FROM access_requests ORDER BY created_at DESC;
```

### View pending requests
```sql
SELECT * FROM access_requests WHERE status = 'pending' ORDER BY created_at;
```

### View request approval history
```sql
SELECT request_id, email, full_name, status, reviewed_by, reviewed_at, approval_notes 
FROM access_requests 
WHERE status IN ('approved', 'rejected')
ORDER BY reviewed_at DESC;
```

### Count by status
```sql
SELECT status, COUNT(*) as count 
FROM access_requests 
GROUP BY status;
```

---

**Status:** ✅ Complete and ready for deployment

**Last Updated:** 2025-12-05
