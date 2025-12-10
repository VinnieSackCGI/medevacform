# How to Create a New Project from This Template

This guide will help you create a brand new React application based on this template.

## 📋 Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- npm 10+ installed
- Git installed
- Visual Studio Code (recommended)
- Azure account (for deployment)

## 🎯 Step-by-Step Setup

### Step 1: Clone/Copy the Template

**Option A: Create a new repository from template**
1. Create a new repository on GitHub
2. Clone this repository locally
3. Copy these essential files/folders to your new project:
   ```
   src/
   public/
   api/
   package.json
   tailwind.config.js
   postcss.config.js
   jsconfig.json
   staticwebapp.config.json
   .gitignore
   TEMPLATE-README.md (rename to README.md)
   ```

**Option B: Direct copy**
```bash
# Copy template to new location
cp -r /path/to/medevacform /path/to/new-project
cd /path/to/new-project

# Remove old git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "Initial commit from template"
```

### Step 2: Clean Up Template-Specific Code

**Files to delete (template-specific):**
```bash
# Remove MEDEVAC-specific pages
rm src/pages/EntryForm.jsx
rm src/pages/MedevacDashboard.jsx
rm src/pages/MedevacManagement.jsx
rm src/pages/ScraperForm.jsx
rm src/pages/PostData.jsx
rm src/pages/DatabaseView.jsx
rm src/pages/AIShowcase.jsx
rm src/pages/Presentation.jsx
rm src/pages/DocumentationPage.jsx

# Remove template documentation files
rm -rf docs/
rm -rf Examples/
rm -rf deployment/
rm -rf scripts/
rm ACTION-PLAN.md
rm ARCHITECTURE-DIAGRAMS.md
rm AZURE-SETUP.md
rm DEPLOYMENT*.md
rm convert-excel.ps1
# ... (all other template documentation)

# Remove MEDEVAC-specific components
rm -rf src/components/medevac/
rm src/components/AccessRequestForm.jsx
rm src/components/AccessRequestAdmin.jsx
rm src/components/Instructions.jsx

# Remove MEDEVAC-specific APIs
rm -rf api/medevac/
rm -rf api/perdiem/
rm -rf api/locations/
rm -rf api/scraper/
rm -rf api/docs/
rm -rf api/approve-request/
rm -rf api/request-account/
rm -rf api/access-requests/

# Keep these essential APIs:
# api/auth/ (authentication)
# api/health/ (health check)
# api/test/ (testing endpoint)
```

**Update package.json:**
```json
{
  "name": "your-project-name",
  "version": "0.1.0",
  "description": "Your project description",
  "private": true,
  // ... rest of the dependencies stay the same
}
```

### Step 3: Create Your Base Structure

**1. Create a simple landing page:**
```javascript
// src/pages/LandingPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Your App
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Start building your application here
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
```

**2. Simplify App.js:**
```javascript
// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/themes.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import LoginPage from './pages/SimpleLoginPage';
import LandingPage from './pages/LandingPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-theme-bg-primary text-theme-text-primary">
      <Navigation />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Add your protected routes here */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="container mx-auto p-8">
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p>Protected content goes here</p>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

**3. Update Navigation.js:**
```javascript
// src/components/Navigation.js
const allNavItems = [
  { path: '/', label: 'Home', icon: HomeIcon, requiresAuth: false },
  { path: '/dashboard', label: 'Dashboard', icon: ChartBarIcon, requiresAuth: true },
  // Add your navigation items here
];
```

### Step 4: Customize Branding

**1. Update Tailwind colors:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary': '#3B82F6',      // Your primary brand color
        'secondary': '#10B981',     // Your secondary color
        'accent': '#F59E0B',        // Your accent color
      },
    },
  },
}
```

**2. Update theme CSS:**
```css
/* src/styles/themes.css */
:root {
  --theme-bg-primary: #ffffff;
  --theme-bg-secondary: #f9fafb;
  --theme-text-primary: #1f2937;
  --theme-text-secondary: #6b7280;
  /* Customize your theme variables */
}
```

**3. Replace logo:**
- Add your logo to `src/assets/images/`
- Update import in `Navigation.js`

**4. Update manifest:**
```json
// public/manifest.json
{
  "short_name": "Your App",
  "name": "Your Application Name",
  "description": "Your app description"
}
```

### Step 5: Set Up Azure Functions

**1. Keep basic structure:**
```
api/
├── host.json
├── package.json
├── auth/              # Keep for authentication
├── health/            # Keep for health checks
└── test/              # Keep for testing
```

**2. Add your custom functions as needed** (see TEMPLATE-README.md)

### Step 6: Configure Environment

**1. Create .env file:**
```bash
# .env
REACT_APP_API_URL=http://localhost:7071/api
REACT_APP_APP_NAME=Your App Name
```

**2. Update .gitignore** (already configured)

### Step 7: Test Your Setup

```bash
# Install dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..

# Run development server
npm start

# In another terminal, run API (if needed)
cd api
func start
```

### Step 8: Initialize Git Repository

```bash
# Initialize git
git init

# Create .gitignore if not exists
# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Project setup from template"

# Add remote
git remote add origin <your-github-repo-url>

# Push to remote
git push -u origin main
```

### Step 9: Deploy to Azure

**1. Create Azure Static Web App:**
- Go to Azure Portal
- Create "Static Web App"
- Connect to your new GitHub repository
- Configure build:
  - App location: `/`
  - Api location: `api`
  - Output location: `build`

**2. Configure environment variables in Azure**

**3. Push to trigger deployment**

## 🎨 Customization Checklist

- [ ] Update package.json (name, description, version)
- [ ] Remove template-specific pages
- [ ] Remove template-specific components
- [ ] Remove template-specific API functions
- [ ] Create your landing page
- [ ] Simplify App.js routes
- [ ] Update Navigation items
- [ ] Customize colors (Tailwind + CSS variables)
- [ ] Replace logo/branding
- [ ] Update manifest.json
- [ ] Create .env file
- [ ] Test locally
- [ ] Initialize git repository
- [ ] Deploy to Azure
- [ ] Update README.md for your project

## 📝 What to Keep from Template

**Essential Structure:**
- ✅ `src/components/ui/` - Base UI components
- ✅ `src/contexts/` - Auth and Theme contexts
- ✅ `src/styles/themes.css` - Theme system
- ✅ `src/services/api.js` - API service layer
- ✅ `api/auth/` - Authentication API
- ✅ `api/health/` - Health check API
- ✅ Tailwind configuration
- ✅ Static Web App configuration

**You Can Remove:**
- ❌ All MEDEVAC-specific pages
- ❌ All MEDEVAC-specific components
- ❌ All MEDEVAC-specific APIs
- ❌ Template documentation files
- ❌ Examples folder
- ❌ Deployment scripts

## 🆘 Getting Help

If you run into issues:
1. Check `TEMPLATE-README.md` for detailed guides
2. Review Azure Static Web Apps documentation
3. Check React and Tailwind CSS documentation
4. Ask your team lead

## 🎯 Next Steps After Setup

1. Design your data model
2. Create database schema (if needed)
3. Build your API endpoints
4. Create your UI pages
5. Implement business logic
6. Test thoroughly
7. Deploy to production

Good luck with your new project! 🚀
