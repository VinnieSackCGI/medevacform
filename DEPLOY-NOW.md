# 🚀 IMMEDIATE DEPLOYMENT INSTRUCTIONS

**Your medevac-form-app is ready to deploy!**

## What Was Fixed
✅ Created missing `access-requests` API function  
✅ All 6 API functions now properly configured  
✅ Ready for Azure Static Web App deployment  

## Deploy in 3 Steps

### Step 1: Validate Everything is Ready
```powershell
node validate-api.js
```
**Expected Output**: All functions should show ✅

### Step 2: Commit and Push to Azure
```powershell
git add .
git commit -m "fix: create missing access-requests function for SWA"
git push origin master
```

### Step 3: Monitor Deployment
**Option A - GitHub Actions:**
- Go to: GitHub → Your Repo → Actions
- Watch the "Azure Static Web Apps CI/CD" workflow
- Should complete in 5-10 minutes

**Option B - Azure Portal:**
- Go to: Azure Portal → Static Web App → medevac-form-app
- Click "Deployments" tab
- Watch status change from "Building" → "Succeeded"

## After Deployment (5-15 minutes)

### Test Your API
Once deployment completes, test endpoints:

```powershell
# Set your SWA URL (replace with actual)
$env:SWA_URL = "https://medevac-form-app.azurestaticapps.net"

# Run tests
node test-deployment.js
```

### Manual Testing
```powershell
# Test health endpoint
curl https://medevac-form-app.azurestaticapps.net/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-12-04T...",
#   "version": "1.0.0"
# }
```

## If Something Goes Wrong

### Issue: Deployment Failed
1. Check GitHub Actions logs for errors
2. Common causes:
   - Missing dependencies (run `npm install` in `/api`)
   - Invalid JSON in function.json files
   - Build command failed

**Fix**: 
```powershell
cd api
npm install
cd ..
git add .
git commit -m "fix: install dependencies"
git push origin master
```

### Issue: API returns 404
1. Check Azure Portal → Static Web App → Deployments
2. Ensure deployment shows "Succeeded" status
3. Try refreshing or waiting a few minutes
4. Check Application Insights for errors

### Issue: API returns 500
1. Check Azure Portal → Application Insights → Live Metrics
2. Look for error traces
3. Verify environment variables are set:
   - Azure Portal → Static Web App → Settings → Configuration
   - Should have: `AZURE_STORAGE_CONNECTION_STRING`

## What Gets Deployed

When you push to `master`, GitHub Actions will:

1. **Build React Frontend**
   - Located in `/src`
   - Output to `/build` directory
   - Deployed to SWA website

2. **Deploy Azure Functions**
   - Located in `/api` directory
   - All 6 functions deploy automatically
   - Available at `/api/*` endpoints

3. **Configure SWA**
   - Sets up CORS
   - Configures routing
   - Enables Node.js runtime

## Key Files for Reference

| File | Purpose |
|------|---------|
| `api/` | All Azure Functions |
| `api/health/` | Health check endpoint |
| `api/medevac/` | Main MEDEVAC form handler |
| `api/perdiem/` | Per diem calculator |
| `api/locations/` | Location data retrieval |
| `api/access-requests/` | Access control (NEW!) |
| `api/request-account/` | Account requests |
| `staticwebapp.config.json` | SWA configuration |
| `.github/workflows/` | CI/CD pipeline |

## Documentation Reference

**For Complete Details:**
- 📖 `DEPLOYMENT-CHECKLIST.md` - Full deployment guide
- 📖 `FUNCTION-DEPLOYMENT-GUIDE.md` - Troubleshooting
- 📖 `AZURE_ARCHITECTURE.md` - Architecture overview
- 📖 `AZURE-SETUP.md` - Setup instructions

**For Quick Validation:**
```powershell
node validate-api.js      # Validate structure
node test-deployment.js   # Test endpoints
node deployment-summary.js # See full summary
```

## What's Your SWA URL?

To find your deployed URL:
1. Azure Portal → Static Web App → medevac-form-app
2. Look for "URL" field in Overview tab
3. Should be: `https://medevac-form-app.azurestaticapps.net`

Or in terminal:
```powershell
# (requires Azure CLI)
az staticwebapp show --name medevac-form-app --query "defaultHostname"
```

## Ready? Let's Go!

```powershell
# 1. Validate
node validate-api.js

# 2. Deploy
git add .
git commit -m "fix: create missing access-requests function for SWA"
git push origin master

# 3. Check status
# → Open GitHub Actions and watch the workflow
# → Open Azure Portal and check Static Web App deployments

# 4. Test (after 5-10 minutes)
$env:SWA_URL = "https://medevac-form-app.azurestaticapps.net"
node test-deployment.js
```

---

**Status: ✅ READY TO DEPLOY**

Your medevac-form-app SWA has all functions configured and is ready for Azure deployment!

