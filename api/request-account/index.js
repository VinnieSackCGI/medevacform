const sql = require('mssql');

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
        context.log('Request received for account request');
        
        const { firstName, lastName, email, requestedUsername, justification } = req.body;
        
        // Validate required fields
        if (!firstName || !lastName || !email || !requestedUsername) {
            context.log('Missing required fields');
            context.res = {
                status: 400,
                headers: getCorsHeaders(),
                body: { error: 'First name, last name, email, and username are required' }
            };
            return;
        }

        // Connect to database and insert request
        const pool = await getPool();
        
        const result = await pool.request()
            .input('first_name', sql.NVarChar(50), firstName)
            .input('last_name', sql.NVarChar(50), lastName)
            .input('email', sql.NVarChar(100), email)
            .input('requested_username', sql.NVarChar(50), requestedUsername)
            .input('justification', sql.NVarChar(sql.MAX), justification || null)
            .query(`
                INSERT INTO user_requests 
                (first_name, last_name, email, requested_username, justification)
                OUTPUT INSERTED.id, INSERTED.created_at, INSERTED.status
                VALUES 
                (@first_name, @last_name, @email, @requested_username, @justification)
            `);

        context.log('Account request saved:', result.recordset[0]);

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: { 
                success: true,
                message: 'Account request submitted successfully. You will be notified when reviewed.',
                requestId: result.recordset[0].id
            }
        };
        
    } catch (error) {
        context.log.error('Error processing account request:', error);
        
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { 
                success: false,
                error: 'Failed to submit account request. Please try again.',
                message: error.message 
            }
        };
    }
};

function getCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };
}