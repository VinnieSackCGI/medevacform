# medevac-form-app SWA - Deployment Checklist

**Status**: Ready for Deployment ✅
**Last Updated**: December 4, 2025
**Target**: Azure Static Web App `medevac-form-app`

---

## What Was Done

### 1. ✅ API Structure Validated
All required Azure Functions are properly configured:
- ✅ `api/host.json` - Runtime configuration
- ✅ `api/package.json` - Dependencies
- ✅ `api/health/` - Health check endpoint
- ✅ `api/locations/` - Location data API
- ✅ `api/medevac/` - Main form handler
- ✅ `api/perdiem/` - Per diem calculator
- ✅ `api/request-account/` - Account requests
- ✅ `api/access-requests/` - Access control (NEWLY CREATED)

### 2. ✅ Configuration Files Created
- `validate-api.js` - Structure validation script
- `test-deployment.js` - Endpoint testing script
- `FUNCTION-DEPLOYMENT-GUIDE.md` - Comprehensive deployment guide

### 3. ✅ GitHub Actions CI/CD
Workflow file verified: `.github/workflows/azure-static-web-apps-gray-field-0a3d8780f.yml`
- App location: `/` (React frontend)
- API location: `api` (Azure Functions)
- Output location: `build` (build artifacts)
- Node.js runtime: 20
- Build command: `npm run build`

---

## How to Deploy

### Option 1: Automatic Deployment (Recommended)
Your GitHub Actions workflow will automatically deploy when you push to `master`:

```powershell
# From your workspace root
git add .
git commit -m "fix: create missing access-requests function for SWA"
git push origin master
```

Then monitor:
1. Go to GitHub → Your Repo → Actions
2. Watch the workflow complete (usually 5-10 minutes)
3. Check Azure Portal → Static Web App → Deployments

### Option 2: Manual Testing Before Deployment

```powershell
# 1. Validate structure locally
node validate-api.js

# 2. Install dependencies
cd api
npm install
cd ..

# 3. Test functions locally
cd api
func start
# In another terminal, test:
curl http://localhost:7071/api/health
```

### Option 3: Force Redeploy from Azure Portal
If automatic deployment doesn't trigger:
1. Go to Azure Portal
2. Navigate to `medevac-form-app` Static Web App
3. Click "Deployments" 
4. Find the latest deployment
5. Click the "..." menu and select "Redeploy"

---

## Post-Deployment Verification

### Test the Endpoints
Once deployed, verify each endpoint is working:

```powershell
# Replace with your actual SWA URL
$SWA_URL = "https://medevac-form-app.azurestaticapps.net"

# Test health check
curl "$SWA_URL/api/health"

# Expected response: 200 OK with health status

# Test locations
curl "$SWA_URL/api/locations"

# Test medevac (requires valid JSON body)
curl -X POST "$SWA_URL/api/medevac" `
     -H "Content-Type: application/json" `
     -d '{"name":"test"}'
```

Or run the automated test:
```powershell
$env:SWA_URL = "https://medevac-form-app.azurestaticapps.net"
node test-deployment.js
```

### Check Azure Portal Logs
1. Static Web App → Logs
2. Application Insights → Live Metrics
3. GitHub Actions → Workflow run logs

---

## Current API Endpoints

| Endpoint | Method | Purpose | Route |
|----------|--------|---------|-------|
| `/api/health` | GET | Health check | `api/health` |
| `/api/locations` | GET | Location data | `api/locations` |
| `/api/perdiem` | POST | Calculate per diem | `api/perdiem` |
| `/api/medevac` | POST/GET/PUT/DELETE | Main MEDEVAC form | `api/medevac/{id?}` |
| `/api/request-account` | GET/POST | Account requests | `api/request-account/{id?}` |
| `/api/access-requests` | GET/POST | Access control | `api/access-requests/{id?}` |

---

## Configuration Requirements

For functions to work fully, ensure these are set in Azure Portal:

### Environment Variables
Navigate to: **Static Web App → Settings → Configuration**

Add:
```
AZURE_STORAGE_CONNECTION_STRING = [your connection string]
```

To find your connection string:
1. Azure Portal → Storage Account → `medevaciafstorage`
2. Settings → Access keys
3. Copy the "Connection string"

### CORS Settings
Already configured in:
- `staticwebapp.config.json` - Allows `/api/*`
- Each function returns proper CORS headers
- Frontend and API can communicate

### Blob Storage Setup
Ensure these containers exist in storage account:
- `application-data` - For MEDEVAC submissions
- `perdiem-cache` - For per diem rates
- `rate-history` - For rate history
- `scraper-logs` - For data scraping logs

---

## Troubleshooting

### If endpoints return 404
```powershell
# 1. Check deployment status
az staticwebapp show --name medevac-form-app --resource-group [YOUR_RG]

# 2. Check build logs in GitHub Actions
# Go to: GitHub → Repo → Actions → Latest workflow

# 3. Force redeployment
git add .
git commit -m "trigger redeployment"
git push origin master
```

### If endpoints return 500
```powershell
# 1. Check Application Insights
az monitor app-insights query --app [APP_ID] --analytics-query "traces | take 50"

# 2. Check environment variables are set
az staticwebapp appsettings list --name medevac-form-app

# 3. Verify storage account access
# Test storage connection string is valid
```

### If React frontend loads but API calls fail
```powershell
# 1. Check browser console for CORS errors
# 2. Verify CORS headers in function response
# 3. Check that API_URL in React app matches: /api/

# Example in React:
const response = await fetch('/api/health')
# Not: 'https://..../api/health'
```

---

## File Structure for Reference

```
medevacform/
├── .github/workflows/
│   └── azure-static-web-apps-gray-field-0a3d8780f.yml  ✅ CI/CD
├── api/                                                  ✅ Functions
│   ├── host.json
│   ├── package.json
│   ├── health/
│   │   ├── function.json
│   │   └── index.js
│   ├── locations/
│   │   ├── function.json
│   │   └── index.js
│   ├── medevac/
│   │   ├── function.json
│   │   └── index.js
│   ├── perdiem/
│   │   ├── function.json
│   │   └── index.js
│   ├── request-account/
│   │   ├── function.json
│   │   └── index.js
│   └── access-requests/                                 ✅ NEWLY CREATED
│       ├── function.json
│       └── index.js
├── src/                                                  ✅ React frontend
│   └── ...
├── public/
├── build/                                               ✅ Build output
├── staticwebapp.config.json                             ✅ SWA config
├── package.json
└── validate-api.js                                      ✅ NEW: Validation script
```

---

## Next Steps

### Immediate (Do This Now)
- [ ] Review this checklist
- [ ] Run `node validate-api.js` to confirm all functions exist
- [ ] Commit changes: `git add . && git commit -m "fix: add missing access-requests function"`
- [ ] Push to master: `git push origin master`
- [ ] Monitor GitHub Actions for deployment

### After Deployment (5-15 minutes)
- [ ] Go to Azure Portal → Static Web App
- [ ] Check Deployments tab for successful build
- [ ] Run endpoint tests: `node test-deployment.js`
- [ ] Test in browser: Visit the SWA URL and check console for errors

### If Issues Arise
- [ ] Check Application Insights logs
- [ ] Review GitHub Actions workflow logs
- [ ] Verify environment variables are set
- [ ] Run local function tests with `func start`

---

## Quick Commands Reference

```powershell
# Validate setup
node validate-api.js

# Test endpoints (after deployment)
$env:SWA_URL = "https://medevac-form-app.azurestaticapps.net"
node test-deployment.js

# Test locally
cd api
npm install
func start

# Deploy
git add .
git commit -m "your message"
git push origin master

# Check logs
az staticwebapp show --name medevac-form-app --resource-group [RG_NAME]
```

---

## Support

**Common Issues & Solutions**: See `FUNCTION-DEPLOYMENT-GUIDE.md`
**API Documentation**: Check individual `index.js` files in each function folder
**Architecture Overview**: See `docs/documentation/AZURE_ARCHITECTURE.md`

---

**Status: Ready to Deploy** ✅
All API functions are configured and ready for Azure Static Web App deployment.
