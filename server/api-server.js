const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase, dbHelpers } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../build')));

// Authentication middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await dbHelpers.validateSession(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, post } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const user = await dbHelpers.createUser(username, email, password, firstName, lastName, post);
    const session = await dbHelpers.createSession(user.id);

    await dbHelpers.logActivity(user.id, 'register', 'user', user.id, null, req.ip);

    res.json({
      user,
      token: session.sessionToken,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await dbHelpers.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const session = await dbHelpers.createSession(user.id);

    await dbHelpers.logActivity(user.id, 'login', 'user', user.id, null, req.ip);

    res.json({
      user,
      token: session.sessionToken,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticateUser, async (req, res) => {
  try {
    // In a more complete implementation, we'd invalidate the session
    await dbHelpers.logActivity(req.user.id, 'logout', 'user', req.user.id, null, req.ip);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// User profile route
app.get('/api/user/profile', authenticateUser, async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// MEDEVAC routes
app.get('/api/medevacs', authenticateUser, async (req, res) => {
  try {
    const medevacs = await dbHelpers.getUserMedevacs(req.user.id);
    res.json({ medevacs });
  } catch (error) {
    console.error('Get medevacs error:', error);
    res.status(500).json({ error: 'Failed to retrieve MEDEVACs' });
  }
});

app.get('/api/medevacs/:id', authenticateUser, async (req, res) => {
  try {
    const medevac = await dbHelpers.getMedevacById(req.params.id, req.user.id);
    
    if (!medevac) {
      return res.status(404).json({ error: 'MEDEVAC not found' });
    }

    res.json({ medevac });
  } catch (error) {
    console.error('Get medevac error:', error);
    res.status(500).json({ error: 'Failed to retrieve MEDEVAC' });
  }
});

app.post('/api/medevacs', authenticateUser, async (req, res) => {
  try {
    const result = await dbHelpers.saveMedevac(req.user.id, req.body);
    
    await dbHelpers.logActivity(
      req.user.id, 
      'create', 
      'medevac', 
      result.id, 
      `Created MEDEVAC for ${req.body.patientName}`,
      req.ip
    );

    res.json({ id: result.id, message: 'MEDEVAC saved successfully' });
  } catch (error) {
    console.error('Save medevac error:', error);
    res.status(500).json({ error: 'Failed to save MEDEVAC' });
  }
});

app.put('/api/medevacs/:id', authenticateUser, async (req, res) => {
  try {
    const result = await dbHelpers.updateMedevac(req.params.id, req.user.id, req.body);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'MEDEVAC not found' });
    }

    await dbHelpers.logActivity(
      req.user.id, 
      'update', 
      'medevac', 
      req.params.id, 
      `Updated MEDEVAC for ${req.body.patientName}`,
      req.ip
    );

    res.json({ message: 'MEDEVAC updated successfully' });
  } catch (error) {
    console.error('Update medevac error:', error);
    res.status(500).json({ error: 'Failed to update MEDEVAC' });
  }
});

app.delete('/api/medevacs/:id', authenticateUser, async (req, res) => {
  try {
    const result = await dbHelpers.deleteMedevac(req.params.id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'MEDEVAC not found' });
    }

    await dbHelpers.logActivity(
      req.user.id, 
      'delete', 
      'medevac', 
      req.params.id, 
      'Deleted MEDEVAC',
      req.ip
    );

    res.json({ message: 'MEDEVAC deleted successfully' });
  } catch (error) {
    console.error('Delete medevac error:', error);
    res.status(500).json({ error: 'Failed to delete MEDEVAC' });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Initialize database and start server
console.log('Starting MEDEVAC API Server...');
console.log('Initializing database connection...');

initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully');
    app.listen(PORT, () => {
      console.log(`🚀 MEDEVAC API Server running on port ${PORT}`);
      console.log(`📊 Database connected and ready`);
      console.log(`🌐 Server ready at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    console.error('Error details:', error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
    process.exit(1);
  });

module.exports = app;