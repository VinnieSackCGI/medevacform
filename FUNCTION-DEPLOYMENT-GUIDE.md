# Quick Fix: Create/Verify Functions in medevac-form-app SWA

## Overview
Your SWA (`medevac-form-app`) should automatically include the API functions from the `/api` directory when deployed via GitHub Actions. This guide helps you verify and fix any issues.

## Current Setup Status

### ✅ Configuration Verified
- **SWA Name**: medevac-form-app
- **API Runtime**: Node.js 18
- **API Location**: `/api` directory
- **GitHub Actions**: Correctly configured to deploy both app and API
- **Functions Available**: 
  - `/api/health` - Health check endpoint
  - `/api/locations` - Location data retrieval
  - `/api/perdiem` - Per diem calculation
  - `/api/medevac` - Main MEDEVAC form handling
  - `/api/request-account` - Account request handling
  - `/api/access-requests` - Access request handling

## Troubleshooting Steps

### Step 1: Run Deployment Diagnostic
Test if your current SWA endpoints are responding:

```powershell
# From workspace root
node test-deployment.js
# Or test against your specific SWA URL:
$env:SWA_URL="https://medevac-form-app.azurestaticapps.net"; node test-deployment.js
```

### Step 2: Check Azure Portal Deployment Status
If endpoints are failing:

1. Go to [Azure Portal](https://portal.azure.com)
2. Find your Static Web App: `medevac-form-app`
3. Check "Deployments" to see build status
4. Look for any build/deployment errors
5. Check "Build logs" in Azure DevOps or GitHub Actions

### Step 3: Verify Function Configuration
Ensure each function has correct `function.json`:

```bash
# Check that all function directories exist
ls api/
# Should show: health, locations, medevac, perdiem, request-account, access-requests

# Verify each function.json is valid JSON
cat api/health/function.json | ConvertFrom-Json
cat api/medevac/function.json | ConvertFrom-Json
```

### Step 4: Test Function Locally
Build and test locally before pushing:

```powershell
# Install dependencies
cd api
npm install

# Install Azure Functions Core Tools (if not already installed)
npm install -g azure-functions-core-tools@4 --unsafe-perm true

# Start local function runtime
func start

# Test endpoint in another terminal
curl http://localhost:7071/api/health
```

### Step 5: Force Redeploy
If deployment is stuck:

1. Go to Azure Portal → Static Web App → Deployments
2. Click the latest deployment
3. Click "Redeploy" button
4. Or push a new commit to trigger CI/CD:

```powershell
git add .
git commit -m "trigger redeployment"
git push origin master
```

## Common Issues & Solutions

### Issue: 404 on /api/health
**Problem**: Functions not deployed
**Solutions**:
1. Check GitHub Actions workflow succeeded
2. Verify `api/` directory exists at repo root (not nested)
3. Ensure `api/host.json` exists
4. Check Azure Portal build logs

### Issue: 500 Error on Function Calls
**Problem**: Function execution error
**Solutions**:
1. Check function implementation for errors
2. Verify environment variables are set (e.g., AZURE_STORAGE_CONNECTION_STRING)
3. Check Application Insights logs in Azure Portal
4. Test function locally with `func start`

### Issue: CORS Errors in Browser
**Problem**: Frontend can't call API
**Solutions**:
1. Check staticwebapp.config.json has CORS enabled
2. Verify functions return proper CORS headers (see medevac/index.js)
3. Current config includes: "Access-Control-Allow-Origin": "*"

## Next Steps if Functions Still Not Working

### Option A: Quick Function Creation (If Deployment Failed)
If the automated deployment didn't work, you can manually create functions in the SWA:

```powershell
# Install SWA CLI
npm install -g @azure/static-web-apps-cli

# Login and test locally
swa start

# Deploy if needed
swa deploy
```

### Option B: Verify via Azure CLI
Check SWA details:

```powershell
# Install Azure CLI if needed
# https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Check SWA status
az staticwebapp show --name medevac-form-app --resource-group [YOUR_RESOURCE_GROUP]

# Check deployment status
az staticwebapp list-deployment
```

### Option C: Manual Function Testing
Test API endpoints directly:

```powershell
# Test health check
curl https://medevac-form-app.azurestaticapps.net/api/health

# Test locations (requires storage account)
curl https://medevac-form-app.azurestaticapps.net/api/locations

# Test medevac POST (requires proper request body)
curl -X POST https://medevac-form-app.azurestaticapps.net/api/medevac `
     -H "Content-Type: application/json" `
     -d '{"name":"test"}'
```

## File Structure Verification Checklist

```
✓ api/
  ✓ host.json
  ✓ package.json
  ✓ health/
    ✓ function.json
    ✓ index.js
  ✓ medevac/
    ✓ function.json
    ✓ index.js
  ✓ locations/
    ✓ function.json
    ✓ index.js
  ✓ perdiem/
    ✓ function.json
    ✓ index.js
  ✓ request-account/
    ✓ function.json
    ✓ index.js
  ✓ access-requests/
    ✓ function.json
    ✓ index.js

✓ .github/workflows/
  ✓ azure-static-web-apps-gray-field-0a3d8780f.yml
  
✓ staticwebapp.config.json
```

## Key Environment Variables
For functions to work properly, these must be set in Azure Portal:

```
AZURE_STORAGE_CONNECTION_STRING = [your storage account connection string]
```

To set in Azure Portal:
1. Go to Static Web App → Settings → Configuration
2. Add the connection string there
3. Save and redeploy

## Support & Debugging
- **Azure Portal Logs**: Portal → Static Web App → Logs
- **Application Insights**: Portal → Application Insights → Live Metrics
- **GitHub Actions**: Repository → Actions tab → See workflow logs
- **Local Testing**: `func start` from `/api` directory

---

**Last Updated**: December 4, 2025
**Status**: Functions should be auto-deployed via GitHub Actions CI/CD
