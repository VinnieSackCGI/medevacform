# Template Component Reference

Quick reference for all reusable components in this template.

## 🎨 UI Components (`src/components/ui/`)

### Button
```javascript
import { Button } from '../components/ui/button';

<Button onClick={handleClick}>Click Me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Card
```javascript
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>
```

### Input
```javascript
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

<div>
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
</div>
```

### ThemeToggle
```javascript
import ThemeToggle from '../components/ui/ThemeToggle';

<ThemeToggle />
<ThemeToggle variant="ghost" />
```

## 🔐 Authentication (`src/contexts/AuthContext.js`)

```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, loading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(username, password);
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  const handleLogout = () => {
    logout();
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.firstName}!</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

**User Object Structure:**
```javascript
{
  id: 1,
  username: "johndoe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  role: "user"
}
```

## 🎨 Theme System (`src/contexts/ThemeContext.js`)

```javascript
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
}
```

**Available CSS Variables:**
```css
/* Use in your components */
className="bg-theme-bg-primary text-theme-text-primary"
className="border-theme-border-primary"
className="hover:bg-theme-bg-secondary"
```

## 🧭 Navigation (`src/components/Navigation.js`)

**Adding Navigation Items:**
```javascript
const allNavItems = [
  { 
    path: '/dashboard', 
    label: 'Dashboard', 
    icon: ChartBarIcon,      // From Heroicons
    requiresAuth: true        // Show only when logged in
  },
  { 
    path: '/settings', 
    label: 'Settings', 
    icon: CogIcon,
    requiresAuth: true
  },
];
```

**Available Heroicons:**
```javascript
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  UserIcon,
  DocumentTextIcon,
  // ... import as needed
} from '@heroicons/react/24/outline';
```

## 🛣️ Routing Patterns

### Basic Route
```javascript
<Route path="/about" element={<AboutPage />} />
```

### Protected Route
```javascript
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

### Route with Parameter
```javascript
<Route path="/user/:id" element={<UserProfile />} />

// In component:
import { useParams } from 'react-router-dom';
const { id } = useParams();
```

### Redirect
```javascript
<Route path="/old-path" element={<Navigate to="/new-path" replace />} />
```

### Navigation
```javascript
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/dashboard')}>
      Go to Dashboard
    </button>
  );
}
```

## 🌐 API Service (`src/services/api.js`)

```javascript
import api from '../services/api';

// GET request
const data = await api.get('/endpoint');

// POST request
const result = await api.post('/endpoint', { key: 'value' });

// PUT request
const updated = await api.put('/endpoint/123', { key: 'newValue' });

// DELETE request
await api.delete('/endpoint/123');
```

**Custom API Function:**
```javascript
// In src/services/api.js or new file
export const fetchUserData = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
};

// Use in component:
import { fetchUserData } from '../services/api';

const userData = await fetchUserData(123);
```

## 📦 Common Patterns

### Loading State
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await api.get('/data');
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);

if (loading) return <div>Loading...</div>;
```

### Form Handling
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/submit', formData);
  } catch (error) {
    console.error(error);
  }
};

<form onSubmit={handleSubmit}>
  <Input 
    name="email"
    value={formData.email}
    onChange={handleChange}
  />
  <Button type="submit">Submit</Button>
</form>
```

### Error Handling
```javascript
const [error, setError] = useState(null);

try {
  const data = await api.get('/endpoint');
} catch (err) {
  setError(err.message);
}

{error && (
  <div className="bg-red-100 text-red-700 p-4 rounded">
    {error}
  </div>
)}
```

## 🎨 Tailwind Common Classes

### Layout
```javascript
<div className="container mx-auto">           // Centered container
<div className="flex justify-between">        // Flex with space between
<div className="grid grid-cols-3 gap-4">      // 3-column grid
<div className="max-w-4xl mx-auto">           // Max width centered
```

### Spacing
```javascript
className="p-4"        // Padding all sides
className="px-4 py-2"  // Padding horizontal/vertical
className="m-4"        // Margin all sides
className="space-y-4"  // Vertical spacing between children
```

### Colors
```javascript
className="bg-blue-600 text-white"
className="bg-gray-100 text-gray-900"
className="border-gray-300"
```

### Responsive
```javascript
className="text-sm md:text-base lg:text-lg"   // Responsive text
className="hidden md:block"                    // Hide on mobile
className="grid-cols-1 md:grid-cols-2"        // Responsive grid
```

### Hover/Focus
```javascript
className="hover:bg-blue-700"
className="focus:outline-none focus:ring-2"
className="transition-all duration-200"
```

## 🔧 Azure Functions

### Basic Function Structure
```javascript
// api/my-function/index.js
module.exports = async function (context, req) {
    const { param } = req.query;
    const body = req.body;
    
    try {
        // Your logic here
        
        context.res = {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: {
                success: true,
                data: { /* your data */ }
            }
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};
```

### Function with Database
```javascript
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { encrypt: true }
};

module.exports = async function (context, req) {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT * FROM Users');
        
        context.res = {
            status: 200,
            body: result.recordset
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};
```

## 📚 Additional Resources

- **React Hooks:** https://react.dev/reference/react
- **Tailwind CSS:** https://tailwindcss.com/docs
- **React Router:** https://reactrouter.com/
- **Heroicons:** https://heroicons.com/
- **Azure Functions:** https://docs.microsoft.com/azure/azure-functions/

---

Keep this file handy as a quick reference while building your application!
