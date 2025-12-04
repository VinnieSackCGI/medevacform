# Access Request System - Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MEDEVAC FORM APPLICATION                           │
│                      (Azure Static Web App)                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │     REACT FRONTEND              │
                    │  (JavaScript/JSX)              │
                    └────────────────────────────────┘
                            │               │
                            ▼               ▼
                    ┌──────────────┐  ┌──────────────────┐
                    │ Access       │  │ Admin            │
                    │ Request Form │  │ Dashboard        │
                    └──────────────┘  └──────────────────┘
                            │               │
                            │               │
                    ┌───────┴───────────────┴──────────┐
                    │                                  │
                    ▼                                  ▼
        ┌─────────────────────┐          ┌────────────────────┐
        │ POST /api/access-   │          │ GET/POST /api/     │
        │ requests            │          │ approve-request    │
        │                     │          │                    │
        │ Submit Form Data    │          │ Approve/Reject     │
        └─────────────────────┘          └────────────────────┘
                    │                                  │
                    │                                  │
                    └───────────────┬──────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   AZURE FUNCTIONS               │
                    │   (Node.js Runtime: 18.x)       │
                    ├─────────────────────────────────┤
                    │ • API Routes                    │
                    │ • Database Connections          │
                    │ • Business Logic                │
                    │ • Validation & Error Handling   │
                    └─────────────────────────────────┘
                                    │
                                    ▼
                    ┌─────────────────────────────────┐
                    │   AZURE SQL DATABASE            │
                    │   (medevac_db)                  │
                    ├─────────────────────────────────┤
                    │ access_requests Table:          │
                    │ • request_id (unique)           │
                    │ • email                         │
                    │ • full_name                     │
                    │ • organization                  │
                    │ • reason                        │
                    │ • requested_access              │
                    │ • status (pending/approved/     │
                    │           rejected)             │
                    │ • created_at (timestamp)        │
                    │ • reviewed_at (timestamp)       │
                    │ • reviewed_by (admin name)      │
                    │ • approval_notes                │
                    │ • ip_address                    │
                    │ • user_agent                    │
                    └─────────────────────────────────┘
```

## Request Flow Diagram

```
USER SUBMITS REQUEST
        │
        ▼
┌─────────────────────────────────┐
│ AccessRequestForm Component     │
│ (/request-access)              │
│ • Email validation             │
│ • Required field validation    │
│ • Form submission              │
└─────────────────────────────────┘
        │
        ▼ POST /api/access-requests
┌─────────────────────────────────┐
│ api/access-requests/index.js    │
│ • Parse request body           │
│ • Validate fields              │
│ • Generate unique Request ID    │
│ • Connect to database          │
│ • Insert into access_requests   │
│ • Return 201 Created           │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Azure SQL Database              │
│ • Store in access_requests      │
│ • Set status = 'pending'        │
│ • Set created_at timestamp      │
└─────────────────────────────────┘
        │
        ▼ Success Message
┌─────────────────────────────────┐
│ User sees confirmation          │
│ • Request ID displayed          │
│ • "Pending Review" status       │
│ • Submit date/time              │
└─────────────────────────────────┘
```

## Admin Approval Flow

```
ADMIN VIEWS DASHBOARD
        │
        ▼
┌─────────────────────────────────┐
│ AccessRequestAdmin Component    │
│ (/admin/requests)              │
│ GET /api/access-requests       │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Azure SQL Database              │
│ • Query access_requests         │
│ • Filter by status: pending     │
│ • Return list of requests       │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Display Request Cards           │
│ • Show request details          │
│ • Badge with status             │
│ • Click to expand               │
└─────────────────────────────────┘
        │
        ▼
┌──────────────┬──────────────┐
│ APPROVE      │ REJECT       │
└──────────────┴──────────────┘
        │              │
        ▼              ▼
POST /api/approve-request/approve
        │
        ▼
┌─────────────────────────────────┐
│ api/approve-request/index.js    │
│ • Validate request ID           │
│ • Check if still pending        │
│ • Update status = 'approved'    │
│ • Set reviewed_by               │
│ • Set reviewed_at timestamp     │
│ • Store approval notes          │
│ • Return updated request        │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Azure SQL Database              │
│ • Update access_requests row    │
│ • status = 'approved'           │
│ • reviewed_by = admin name      │
│ • approval_notes = notes        │
│ • reviewed_at = now()           │
└─────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────┐
│ Admin sees confirmation         │
│ • Request moved to Approved tab │
│ • Shows reviewer info           │
│ • Timestamp recorded            │
└─────────────────────────────────┘
```

## Data Flow Sequence

```
Time →

User              Form              API Function         Database
 │                 │                  │                    │
 │ Enter Data      │                  │                    │
 ├────────────────→│                  │                    │
 │                 │ POST /api/access │                    │
 │                 │ -requests        │                    │
 │                 ├─────────────────→│                    │
 │                 │                  │ Validate Data      │
 │                 │                  │ Generate ID        │
 │                 │                  │ INSERT INTO        │
 │                 │                  ├───────────────────→│
 │                 │                  │                    │ Store Data
 │                 │                  │←───────────────────┤
 │                 │                  │ Return Success     │
 │                 │←─────────────────┤                    │
 │ Success + ID    │                  │                    │
 │←────────────────┤                  │                    │
 │                 │                  │                    │
 └─────────────────────────────────────────────────────────┘

 Admin Views Requests

Admin             Dashboard          API Function         Database
 │                 │                  │                    │
 │ Visit           │                  │                    │
 │ /admin/         │                  │                    │
 │ requests        │                  │                    │
 ├────────────────→│                  │                    │
 │                 │ GET /api/access  │                    │
 │                 │ -requests        │                    │
 │                 ├─────────────────→│                    │
 │                 │                  │ Query DB           │
 │                 │                  ├───────────────────→│
 │                 │                  │                    │ Fetch Requests
 │                 │                  │←───────────────────┤
 │                 │                  │ Return JSON        │
 │                 │←─────────────────┤                    │
 │ Display Cards   │                  │                    │
 │←────────────────┤                  │                    │
 │                 │                  │                    │
 │ Click Approve   │                  │                    │
 ├────────────────→│                  │                    │
 │                 │ POST /api/       │                    │
 │                 │ approve-request  │                    │
 │                 │ /approve         │                    │
 │                 ├─────────────────→│                    │
 │                 │                  │ Validate ID        │
 │                 │                  │ UPDATE status      │
 │                 │                  ├───────────────────→│
 │                 │                  │                    │ Update Record
 │                 │                  │←───────────────────┤
 │                 │                  │ Return Updated     │
 │                 │←─────────────────┤                    │
 │ Show Success    │                  │                    │
 │←────────────────┤                  │                    │
 │                 │                  │                    │
 └─────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (React)
├── Navigation
│   ├── Link: /request-access → AccessRequestForm
│   └── Link: /admin/requests → AccessRequestAdmin
│
├── Route: /request-access
│   └── AccessRequestForm
│       ├── Form Component
│       │   ├── Email Input
│       │   ├── Name Input
│       │   ├── Organization Input
│       │   ├── Access Level Select
│       │   └── Reason TextArea
│       ├── Submit Button
│       └── Success Message (conditionally rendered)
│           ├── Request ID Display
│           ├── Copy Button
│           └── Submit Another Button
│
└── Route: /admin/requests (Protected)
    └── AccessRequestAdmin
        ├── Header
        ├── Filter Tabs
        │   ├── Pending
        │   ├── Approved
        │   ├── Rejected
        │   └── All
        ├── Request Cards Grid
        │   └── RequestCard (repeating)
        │       ├── Name
        │       ├── Status Badge
        │       ├── Email
        │       ├── Organization
        │       ├── Requested Access
        │       └── View Details Button
        └── Detail Modal (conditionally rendered)
            ├── Header
            ├── Request Details
            │   ├── Request ID
            │   ├── Email
            │   ├── Organization
            │   ├── Status
            │   ├── Submitted Date
            │   ├── Reason Text
            │   ├── Reviewed By (if reviewed)
            │   └── Approval Notes (if reviewed)
            └── Review Section (if pending)
                ├── Approver Name Input
                ├── Notes TextArea
                ├── Approve Button
                └── Reject Button
```

## Environment & Deployment

```
Local Development
    ↓
    ├── npm install
    └── npm start (port 3000)
        │
        └── http://localhost:3000/request-access
            http://localhost:3000/admin/requests

GitHub Repository
    ↓
    ├── VinnieSackCGI/medevacform
    ├── Branch: master
    └── All files committed

GitHub Actions (Auto-triggered on push)
    ↓
    ├── Build React app (npm build)
    ├── Create Function bundle
    ├── Deploy to Azure

Azure Static Web App
    ↓
    ├── Frontend: React SPA
    │   ├── /request-access route
    │   └── /admin/requests route
    │
    ├── API Functions: /api/*
    │   ├── /api/access-requests
    │   └── /api/approve-request/*
    │
    └── Azure SQL Database
        └── medevac_db.access_requests table

Live URL:
    gray-field-0a3d8780f.azurestaticapps.net
    ├── /request-access (user form)
    └── /admin/requests (admin dashboard)
```

## Error Handling Flow

```
Request Received
    │
    ├─→ Invalid Method? → Return 405 Method Not Allowed
    │
    ├─→ Missing Fields? → Return 400 Bad Request
    │
    ├─→ Database Error? → Return 500 Internal Server Error
    │
    ├─→ Request Not Found? → Return 404 Not Found
    │
    ├─→ Already Reviewed? → Return 409 Conflict
    │
    └─→ Success → Return 200 OK or 201 Created with Data
```

## Status Transitions

```
PENDING
   │
   ├─→ Admin Approves → APPROVED (+ reviewer info, timestamp)
   │
   └─→ Admin Rejects → REJECTED (+ reason, timestamp)

Final States: APPROVED or REJECTED
(Cannot be changed once finalized)
```

---

This architecture provides:
- ✅ Scalable cloud deployment
- ✅ Database persistence
- ✅ RESTful API design
- ✅ Responsive user interface
- ✅ Complete audit trail
- ✅ Error handling at each layer
- ✅ Security best practices (parameterized queries, CORS, HTTPS)

**System Status: ✅ Production Ready**
