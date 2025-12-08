const sql = require('mssql');
const bcrypt = require('bcrypt');

// Database configuration from environment variables
const dbConfig = {
  user: process.env.AZURE_SQL_USER || 'medevac_admin',
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE || 'medevac_db',
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

let pool = null;

// Initialize database connection
const getPool = async () => {
  if (!pool) {
    pool = await sql.connect(dbConfig);
  }
  return pool;
};

module.exports = async function (context, req) {
    const method = req.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: getCorsHeaders()
        };
        return;
    }

    try {
        const { username, password } = req.body;

        // Validate required fields
        if (!username || !password) {
            context.res = {
                status: 400,
                headers: getCorsHeaders(),
                body: { error: 'Username and password are required' }
            };
            return;
        }

        // Connect to database
        const pool = await getPool();
        
        // Find user by username or email
        const result = await pool.request()
            .input('username', sql.NVarChar(50), username)
            .input('email', sql.NVarChar(100), username)
            .query(`
                SELECT id, username, email, password_hash, first_name, last_name, role, last_login
                FROM users 
                WHERE username = @username OR email = @email
            `);

        if (result.recordset.length === 0) {
            context.res = {
                status: 401,
                headers: getCorsHeaders(),
                body: { error: 'Invalid username or password' }
            };
            return;
        }

        const user = result.recordset[0];

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            context.res = {
                status: 401,
                headers: getCorsHeaders(),
                body: { error: 'Invalid username or password' }
            };
            return;
        }

        // Update last login time
        await pool.request()
            .input('userId', sql.Int, user.id)
            .query('UPDATE users SET last_login = GETDATE() WHERE id = @userId');

        // Generate simple token (user ID + timestamp)
        const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

        // Create session in database
        const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await pool.request()
            .input('userId', sql.Int, user.id)
            .input('token', sql.NVarChar(255), token)
            .input('expiresAt', sql.DateTime2, sessionExpiry)
            .query(`
                INSERT INTO user_sessions (user_id, session_token, expires_at)
                VALUES (@userId, @token, @expiresAt)
            `);

        // Return user data (excluding password)
        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                success: true,
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: user.role
                }
            }
        };

    } catch (error) {
        context.log.error('Login error:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { 
                error: 'Login failed. Please try again.',
                message: error.message 
            }
        };
    }
};

function getCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };
}
