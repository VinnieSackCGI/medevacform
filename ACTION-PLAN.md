# 🎯 ACTION PLAN: Deploy Your medevac-form-app Now

**Status**: All systems ready ✅  
**Target**: Azure Static Web App (medevac-form-app)  
**Time to Deploy**: 1 minute setup + 5-10 minutes deployment  

---

## ⚡ TL;DR - Do This Now

```powershell
# Three commands to deploy:
node validate-api.js
git add .
git commit -m "fix: create missing access-requests function for SWA"
git push origin master
```

Then wait 5-10 minutes and your app will be live!

---

## 📋 Step-by-Step Deployment

### Step 1: Validate Everything (1 minute)
```powershell
cd c:\Users\VSACK\medevacform
node validate-api.js
```

**Expected Output:**
```
✅ All API functions are properly configured!
✅ Your SWA deployment should work.
```

If you see errors, check `FUNCTION-DEPLOYMENT-GUIDE.md` for fixes.

### Step 2: Commit Changes (1 minute)
```powershell
git add .
git commit -m "fix: create missing access-requests function for SWA deployment"
```

### Step 3: Deploy to Azure (1 minute)
```powershell
git push origin master
```

### Step 4: Monitor Deployment (5-10 minutes)

**Option A - GitHub Actions (Recommended)**
1. Open GitHub in your browser
2. Go to your repository
3. Click "Actions" tab
4. Watch the "Azure Static Web Apps CI/CD" workflow
5. Wait for it to turn ✅ green

**Option B - Azure Portal**
1. Go to https://portal.azure.com
2. Find your Static Web App: `medevac-form-app`
3. Click "Deployments"
4. Watch status: Building → Processing → Succeeded

### Step 5: Test Your Deployment (5 minutes)

Once deployment shows "Succeeded":

```powershell
# Set your SWA URL
$env:SWA_URL = "https://medevac-form-app.azurestaticapps.net"

# Run the test script
node test-deployment.js
```

**Expected Output:**
```
✅ /api/health: 200
✅ /api/locations: 200
✅ /api/perdiem: 200
✅ /api/medevac: 200

All endpoints are working!
```

---

## 🔍 What Gets Deployed

When you push to `master`, GitHub Actions automatically:

1. **Builds React Frontend**
   - Runs `npm run build`
   - Creates optimized production build
   - Deploys to Static Web App website

2. **Deploys Azure Functions**
   - Uploads all functions from `/api` directory
   - Sets up Node.js 18 runtime
   - Configures API routes (`/api/*`)

3. **Configures Everything**
   - Sets up CORS headers
   - Configures routing
   - Enables health checks

**Time**: Usually 5-10 minutes total

---

## ✅ Verification Checklist

After deployment completes:

- [ ] GitHub Actions shows ✅ Succeeded
- [ ] Azure Portal shows "Succeeded" deployment status
- [ ] Test endpoints return 200 OK
- [ ] React frontend loads at https://medevac-form-app.azurestaticapps.net
- [ ] Browser console shows no errors
- [ ] API calls work from frontend

---

## 📚 What You Created

### New Azure Function
**`api/access-requests/`** - Access control API
- Handles GET requests to retrieve access requests
- Handles POST requests to submit new access requests
- Supports optional ID parameter for specific requests

### Validation Tools
- **validate-api.js** - Ensures all functions are properly configured
- **test-deployment.js** - Tests deployed API endpoints
- **deployment-summary.js** - Shows deployment information

### Documentation
- **DEPLOY-NOW.md** - Quick start guide
- **DEPLOYMENT-CHECKLIST.md** - Complete deployment checklist
- **FUNCTION-DEPLOYMENT-GUIDE.md** - Troubleshooting guide
- **README-DEPLOYMENT.md** - Overview and summary

---

## 🛠️ Configuration (Already Done)

Your deployment is pre-configured with:

✅ **GitHub Actions Workflow**
- File: `.github/workflows/azure-static-web-apps-gray-field-0a3d8780f.yml`
- Triggers on: Push to master
- Builds: React app + Azure Functions
- Deploys to: Static Web App

✅ **Static Web App Configuration**
- File: `staticwebapp.config.json`
- API Runtime: Node.js 18
- API Routes: `/api/*`
- CORS: Enabled for all origins

✅ **Azure Functions Setup**
- Runtime: Node.js 18
- Dependencies: Configured in `/api/package.json`
- Bindings: All properly configured in `function.json` files

---

## 🌐 Deployed Endpoints

After deployment, access these endpoints:

| Endpoint | Method | Purpose | URL |
|----------|--------|---------|-----|
| Health Check | GET | System health | `/api/health` |
| Locations | GET | Location data | `/api/locations` |
| Per Diem | POST | Calculate rate | `/api/perdiem` |
| MEDEVAC | POST/GET/PUT/DELETE | Form handling | `/api/medevac` |
| Account Requests | GET/POST | Account access | `/api/request-account` |
| Access Requests | GET/POST | Access control | `/api/access-requests` |

**Base URL**: `https://medevac-form-app.azurestaticapps.net`

Example:
```
https://medevac-form-app.azurestaticapps.net/api/health
```

---

## ⚠️ Important Notes

### Environment Variables
If your functions need Azure Storage connection, set this in Azure Portal:
1. Portal → Static Web App → Settings → Configuration
2. Add: `AZURE_STORAGE_CONNECTION_STRING = [your connection string]`
3. Redeploy for changes to take effect

### Frontend API Calls
Make sure your React app uses relative paths:
```javascript
// ✅ CORRECT
const response = await fetch('/api/health');

// ❌ WRONG
const response = await fetch('https://your-api.azurewebsites.net/api/health');
```

### CORS Headers
Already configured in all functions. Requests from your frontend will work.

---

## 🆘 Troubleshooting

### "Deployment Failed"
Check GitHub Actions logs:
1. GitHub → Actions → Latest workflow
2. Look for red ❌ error messages
3. Common issues:
   - Missing dependencies (run `npm install` in `/api`)
   - JSON syntax errors in function files
   - Build command failed

### "API returns 404"
1. Check Azure Portal → Deployments (should be "Succeeded")
2. Wait 5-10 minutes for full deployment
3. Refresh browser page
4. Check that API endpoint is spelled correctly

### "API returns 500"
1. Check Azure Portal → Application Insights → Live Metrics
2. Look for error messages
3. Verify environment variables are set correctly
4. Check function logs for specific errors

### "Cannot connect to API from frontend"
1. Check browser console for CORS errors
2. Verify functions return CORS headers
3. Ensure using relative API paths (`/api/...`)
4. Check staticwebapp.config.json CORS settings

Full troubleshooting guide: See `FUNCTION-DEPLOYMENT-GUIDE.md`

---

## 📞 Getting Help

**Quick Issues:**
- Validation failures → Run `node validate-api.js` again
- Endpoint not working → Check Azure Portal logs
- Need details → Run `node deployment-summary.js`

**Detailed Help:**
- Quick start → See `DEPLOY-NOW.md`
- Full guide → See `DEPLOYMENT-CHECKLIST.md`
- Troubleshooting → See `FUNCTION-DEPLOYMENT-GUIDE.md`

---

## ✨ You're All Set!

Your medevac-form-app is ready to deploy. Everything is configured and tested.

**Ready to go live?**

```powershell
git push origin master
```

Watch it deploy in GitHub Actions (5-10 minutes) → Test with `node test-deployment.js` → Done! 🎉

---

**Status**: ✅ Ready to Deploy  
**Last Updated**: December 4, 2025  
**Next Action**: Run `git push origin master`
