# Azure Infrastructure Assessment
**Date**: December 8, 2025  
**Project**: MEDEVAC Form System

## Executive Summary

### ✅ What's Working
- Azure Static Web App configuration and CI/CD pipeline
- GitHub Actions deployment workflow
- React frontend build process
- API structure and endpoints

### ⚠️ Critical Issues Found
1. **Azure SQL Database**: Connection timeout (firewall/network issue)
2. **Missing Dependencies**: `mssql` package not installed in `/api` folder
3. **Environment Variables**: Not configured in Azure Static Web App settings
4. **Table Schema Conflicts**: Multiple table definitions with inconsistencies

### ❌ Blockers
- Cannot verify database tables (connection timeout)
- API functions using SQL will fail in Azure (missing dependencies)
- Access requests endpoint will not work

---

## Detailed Assessment

### 1. Azure Static Web App Configuration ✅

**File**: `staticwebapp.config.json`

```json
{
  "navigationFallback": { "rewrite": "/index.html" },
  "routes": [
    { "route": "/api/*" },
    { "route": "/*" }
  ],
  "platform": { "apiRuntime": "node:18" }
}
```

**Status**: ✅ **Correct**
- Proper SPA routing with fallback
- API routes configured
- Node 18 runtime specified

**Recommendation**: Consider upgrading to `node:20` to match local development.

---

### 2. GitHub Actions CI/CD Pipeline ✅

**File**: `.github/workflows/azure-static-web-apps-gray-field-0a3d8780f.yml`

**Status**: ✅ **Properly Configured**
- Automatic deployment on push to `master`
- Node.js 20 for build
- Correct paths: app `/`, api `api`, output `build`
- CI warnings disabled (`CI: false`)

**Deployed URL**: `https://gray-field-0a3d8780f.3.azurestaticapps.net`

---

### 3. Azure SQL Database ❌

**Configuration**:
```
Server: medevac-server.database.windows.net
Database: medevac-db
User: medevacadmin
```

**Status**: ❌ **CONNECTION TIMEOUT**

**Issue**: 
```
Failed to connect to medevac-server.database.windows.net:1433 in 15000ms
Error code: ETIMEOUT
```

**Possible Causes**:
1. **Firewall Rules**: Your current IP is not allowed
2. **Server Doesn't Exist**: Server may not be provisioned
3. **Network Issue**: Corporate firewall blocking port 1433
4. **Wrong Server Name**: Server name may be incorrect

**Required Actions**:
```powershell
# 1. Verify server exists in Azure Portal
# 2. Add firewall rule for your IP
# 3. Test connection:
az sql server firewall-rule create \
  --resource-group IAF-MEDEVAC \
  --server medevac-server \
  --name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP
```

---

### 4. Database Table Schema ⚠️

**Status**: ⚠️ **INCONSISTENT DEFINITIONS**

Found **3 different table definitions** across the codebase:

#### A. `scripts/setup-azure-db.js` (Most Complete)
```sql
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) UNIQUE NOT NULL,
  email NVARCHAR(100) UNIQUE NOT NULL,
  password_hash NVARCHAR(255) NOT NULL,
  first_name NVARCHAR(50),
  last_name NVARCHAR(50),
  role NVARCHAR(20) DEFAULT 'user',
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE(),
  last_login DATETIME2
)
```

Tables defined:
- ✅ `users`
- ✅ `user_sessions`
- ✅ `medevac_submissions`
- ✅ `activity_log`
- ✅ `user_requests` (for account requests)

#### B. `server/database.js` (Similar but different)
```sql
CREATE TABLE users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  username NVARCHAR(50) UNIQUE NOT NULL,
  email NVARCHAR(255) UNIQUE NOT NULL,  -- Different size!
  password_hash NVARCHAR(255) NOT NULL,
  first_name NVARCHAR(100),  -- Different size!
  last_name NVARCHAR(100),   -- Different size!
  post NVARCHAR(255),        -- Different column!
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
)
```

#### C. `api/access-requests/index.js` (Separate table)
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

**Conflicts**:
1. `users.email`: NVARCHAR(100) vs NVARCHAR(255)
2. `users.first_name`: NVARCHAR(50) vs NVARCHAR(100)
3. `users.post` column missing in setup script
4. Two different account request systems: `user_requests` vs `access_requests`

**Recommendation**: **Standardize on `scripts/setup-azure-db.js`** as the source of truth.

---

### 5. API Functions Package Dependencies ❌

**File**: `api/package.json`

**Current**:
```json
{
  "dependencies": {
    "@azure/storage-blob": "^12.17.0"
  }
}
```

**Status**: ❌ **MISSING CRITICAL DEPENDENCIES**

**Required for Azure Functions**:
```json
{
  "dependencies": {
    "@azure/storage-blob": "^12.17.0",
    "mssql": "^10.0.2",
    "bcrypt": "^5.1.1"
  }
}
```

**Impact**:
- ❌ `/api/access-requests` will crash (requires `mssql`)
- ❌ `/api/approve-request` will crash (requires `mssql`)
- ❌ `/api/request-account` will crash (requires `mssql`)
- ✅ `/api/medevac` works (uses Blob Storage only)
- ✅ `/api/health` works (no dependencies)

---

### 6. Environment Variables ⚠️

**Local (.env)**: ✅ **Configured**
```
AZURE_SQL_SERVER=medevac-server.database.windows.net
AZURE_SQL_USER=medevacadmin
AZURE_SQL_PASSWORD=***
AZURE_SQL_DATABASE=medevac-db
```

**Azure Static Web App Settings**: ❌ **NOT CONFIGURED**

**Required Actions**:
1. Go to Azure Portal → Static Web App → Configuration
2. Add Application Settings:
   - `AZURE_SQL_SERVER`
   - `AZURE_SQL_USER`
   - `AZURE_SQL_PASSWORD`
   - `AZURE_SQL_DATABASE`
   - `AZURE_STORAGE_CONNECTION_STRING`

---

### 7. API Endpoints Status

| Endpoint | Status | Storage | Dependencies | Notes |
|----------|--------|---------|--------------|-------|
| `/api/health` | ✅ Working | None | None | Simple health check |
| `/api/medevac` | ✅ Working | Blob Storage | `@azure/storage-blob` | CRUD for submissions |
| `/api/locations` | ✅ Working | Blob Storage | `@azure/storage-blob` | Location data |
| `/api/perdiem` | ✅ Working | Blob Storage | `@azure/storage-blob` | Per diem lookup |
| `/api/access-requests` | ❌ Broken | Azure SQL | `mssql` ❌ | Missing dependency |
| `/api/approve-request` | ❌ Broken | Azure SQL | `mssql` ❌ | Missing dependency |
| `/api/request-account` | ⚠️ Unknown | Azure SQL | `mssql` ❌ | Need to verify |
| `/api/test` | ✅ Working | None | None | Test endpoint |

**Missing from API** (exists in local `/server`):
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/register`
- `/api/user/profile`

---

### 8. Data Storage Architecture

**Current Setup**:

```
┌─────────────────────────────────────────┐
│   Azure Static Web App (Frontend)      │
│   https://gray-field-0a3d8780f...       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│        Azure Functions API              │
│  (/api/* endpoints - Node.js 18)        │
└─────┬───────────────────────┬───────────┘
      │                       │
      │                       │
      ▼                       ▼
┌──────────────┐     ┌─────────────────────┐
│ Azure Blob   │     │   Azure SQL DB      │
│   Storage    │     │  (UNREACHABLE ❌)   │
│              │     │                     │
│ ✅ Working   │     │ medevac-server...   │
│              │     │ Port 1433 blocked   │
│ • medevac    │     │                     │
│ • locations  │     │ • users             │
│ • perdiem    │     │ • sessions          │
└──────────────┘     │ • access_requests   │
                     └─────────────────────┘
```

---

## Priority Action Items

### 🔴 Critical (Do First)

1. **Fix Azure SQL Connection**
   ```powershell
   # Check if server exists
   az sql server show --name medevac-server --resource-group IAF-MEDEVAC
   
   # If doesn't exist, create it
   # If exists, add firewall rule for your IP
   az sql server firewall-rule create \
     --resource-group IAF-MEDEVAC \
     --server medevac-server \
     --name AllowMyIP \
     --start-ip-address YOUR_IP \
     --end-ip-address YOUR_IP
   ```

2. **Install Missing Dependencies**
   ```powershell
   cd api
   npm install mssql@10.0.2 bcrypt@5.1.1
   git add package.json package-lock.json
   git commit -m "fix: add SQL dependencies to API functions"
   git push
   ```

3. **Configure Azure Environment Variables**
   - Azure Portal → Static Web App → Configuration
   - Add all SQL connection strings
   - Restart Static Web App

### 🟡 Important (Do Soon)

4. **Standardize Database Schema**
   - Use `scripts/setup-azure-db.js` as source of truth
   - Update `server/database.js` to match
   - Decide on `user_requests` vs `access_requests` table

5. **Verify Tables Once Connected**
   ```powershell
   npm run setup-db
   npm run view-db
   ```

6. **Migrate Auth Endpoints**
   - Create `/api/auth` function
   - Create `/api/user` function
   - Update frontend to use new endpoints

### 🟢 Nice to Have (Later)

7. **Upgrade Runtime**
   - Update `staticwebapp.config.json` to `node:20`

8. **Add Monitoring**
   - Configure Application Insights alerts
   - Set up health check monitoring

---

## Verification Checklist

Once fixes are applied:

- [ ] Can connect to Azure SQL from local machine
- [ ] Database tables created successfully
- [ ] `npm run setup-db` completes without errors
- [ ] API dependencies installed (`cd api && npm list mssql`)
- [ ] Environment variables configured in Azure Portal
- [ ] GitHub Actions deployment succeeds
- [ ] `/api/health` returns 200 OK
- [ ] `/api/access-requests` POST works
- [ ] Frontend can load deployed site
- [ ] Can submit MEDEVAC form end-to-end

---

## Recommendations

### Short Term
1. **Fix firewall** to enable SQL connection
2. **Install dependencies** in API folder
3. **Configure environment variables** in Azure

### Long Term
1. **Consolidate schema definitions** to single source
2. **Migrate all auth** to Azure Functions
3. **Add comprehensive error logging**
4. **Implement health checks** for all dependencies
5. **Consider Managed Identity** instead of connection strings

---

**Next Step**: Fix the Azure SQL firewall rule to unblock database access.