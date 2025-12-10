# React Azure Static Web App Template

A production-ready React application template with Azure Static Web Apps deployment, authentication, theming, and best practices built in.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v10 or higher)
- Git
- Azure account (for deployment)

### Installation

1. **Clone and setup:**
```bash
git clone <your-repository-url>
cd <your-project-name>
npm install
```

2. **Run locally:**
```bash
npm start
```
Application will open at `http://localhost:3000`

3. **Build for production:**
```bash
npm run build
```

## 📁 Project Structure

```
project-root/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   ├── manifest.json      # PWA manifest
│   └── robots.txt
├── src/
│   ├── assets/            # Images, fonts, logos
│   │   └── images/
│   ├── components/        # Reusable components
│   │   ├── ui/            # Base UI components (buttons, cards, inputs)
│   │   └── Navigation.js  # Main navigation bar
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.js # Authentication state
│   │   └── ThemeContext.js # Dark/light theme
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components (routes)
│   │   └── LandingPage.jsx
│   ├── services/          # API service functions
│   │   └── api.js
│   ├── styles/            # Global styles and themes
│   │   └── themes.css
│   ├── utils/             # Utility functions
│   ├── App.js             # Main app component with routing
│   ├── App.css            # App-level styles
│   ├── index.js           # App entry point
│   └── index.css          # Global styles
├── api/                   # Azure Functions (backend)
│   ├── host.json
│   ├── package.json
│   └── [function-name]/   # Individual API endpoints
│       ├── function.json
│       └── index.js
├── .env                   # Environment variables (local)
├── package.json           # Dependencies and scripts
├── staticwebapp.config.json # Azure SWA configuration
└── README.md              # This file
```

## 🎨 Key Features

### 1. **Routing (React Router v6)**
Routes are defined in `src/App.js`:
```javascript
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/protected" element={
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  } />
</Routes>
```

### 2. **Authentication Context**
Located in `src/contexts/AuthContext.js`:
```javascript
const { user, login, logout, isAuthenticated } = useAuth();
```

### 3. **Theme System**
Dark/light mode in `src/contexts/ThemeContext.js`:
```javascript
const { theme, toggleTheme } = useTheme();
```

CSS variables defined in `src/styles/themes.css`:
- `--theme-bg-primary`
- `--theme-text-primary`
- `--theme-border-primary`

### 4. **UI Components**
Base components in `src/components/ui/`:
- `Button.jsx` - Customizable button
- `Card.jsx` - Card container
- `Input.jsx` - Form input
- `Label.jsx` - Form label

### 5. **Navigation**
Main navigation in `src/components/Navigation.js` with:
- Responsive mobile menu
- User authentication display
- Theme toggle
- Dynamic navigation items

## 🔧 Customization Guide

### Adding a New Page

1. **Create the page component:**
```javascript
// src/pages/NewPage.jsx
import React from 'react';

export default function NewPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>New Page</h1>
    </div>
  );
}
```

2. **Add route in App.js:**
```javascript
import NewPage from './pages/NewPage';

// In Routes:
<Route path="/new-page" element={<NewPage />} />
```

3. **Add to navigation (optional):**
```javascript
// In Navigation.js allNavItems array:
{ path: '/new-page', label: 'New Page', icon: YourIcon, requiresAuth: false }
```

### Adding an Azure Function (API Endpoint)

1. **Create function folder:**
```bash
mkdir api/my-function
```

2. **Create function.json:**
```json
{
  "bindings": [
    {
      "authLevel": "anonymous",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": ["get", "post"]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

3. **Create index.js:**
```javascript
module.exports = async function (context, req) {
    context.res = {
        status: 200,
        body: { message: "Hello from API" }
    };
};
```

4. **Call from frontend:**
```javascript
// In src/services/api.js
export const callMyFunction = async () => {
  const response = await fetch('/api/my-function');
  return response.json();
};
```

### Customizing Branding

1. **Update colors in `tailwind.config.js`:**
```javascript
colors: {
  'primary': '#YourColor',
  'secondary': '#YourColor',
  'accent': '#YourColor',
}
```

2. **Update theme CSS variables in `src/styles/themes.css`:**
```css
:root {
  --theme-bg-primary: #ffffff;
  --theme-text-primary: #1a1a1a;
}
```

3. **Replace logo in `src/assets/images/`**

4. **Update `public/manifest.json` with your app details**

### Adding a Database Connection

1. **Install mssql package in API:**
```bash
cd api
npm install mssql
```

2. **Add connection in Azure Function:**
```javascript
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: { encrypt: true }
};

const pool = await sql.connect(config);
```

3. **Add environment variables to Azure Static Web App settings**

## 🌐 Deployment to Azure

### First-Time Setup

1. **Create Azure Static Web App:**
   - Go to Azure Portal
   - Create new Static Web App
   - Connect to your GitHub repository
   - Set build configuration:
     - App location: `/`
     - Api location: `api`
     - Output location: `build`

2. **Configure environment variables:**
   - Go to Static Web App → Configuration
   - Add application settings (environment variables)

3. **Update `staticwebapp.config.json` for routing:**
```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ]
}
```

### Automatic Deployment

- Every push to `main/master` branch triggers automatic deployment
- GitHub Actions workflow is created automatically
- View deployment status in GitHub Actions tab

## 📦 Available Scripts

- `npm start` - Run development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (one-way operation)

## 🔐 Environment Variables

Create `.env` file in root (for local development):
```
REACT_APP_API_URL=http://localhost:7071/api
REACT_APP_ENV=development
```

For production, set these in Azure Static Web App Configuration.

## 🎯 Best Practices

1. **Component Organization:**
   - Keep components small and focused
   - Use functional components with hooks
   - Place reusable components in `components/ui/`
   - Place page-specific components in `pages/`

2. **State Management:**
   - Use Context API for global state (auth, theme)
   - Use local state for component-specific data
   - Consider Redux/Zustand for complex state

3. **Styling:**
   - Use Tailwind CSS utility classes
   - Create reusable component classes
   - Use CSS variables for theming
   - Keep custom CSS in component-specific files

4. **API Calls:**
   - Centralize API calls in `services/` folder
   - Handle errors consistently
   - Use async/await
   - Add loading states

5. **Security:**
   - Never commit `.env` files
   - Use environment variables for secrets
   - Validate user input
   - Implement proper authentication

## 🐛 Common Issues

### Build fails with module not found
```bash
npm install
```

### API not working locally
Make sure Azure Functions Core Tools is installed:
```bash
npm install -g azure-functions-core-tools@4
```

Run API locally:
```bash
cd api
func start
```

### Deployment fails
- Check GitHub Actions logs
- Verify `staticwebapp.config.json`
- Ensure all dependencies are in `package.json`

## 📚 Resources

- [React Documentation](https://react.dev)
- [Azure Static Web Apps Docs](https://docs.microsoft.com/azure/static-web-apps/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com/)
- [Heroicons](https://heroicons.com/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use this template for any project.

---

## 🚀 Next Steps

1. Customize branding (colors, logo, fonts)
2. Add your business logic and pages
3. Create Azure Functions for your API needs
4. Set up database connection if needed
5. Configure authentication rules
6. Deploy to Azure Static Web Apps
7. Add custom domain (optional)

Need help? Check the documentation links above or reach out to your team lead.
