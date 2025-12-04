/**
 * Access Requests API Function
 * Handles submitting, retrieving, and managing access requests
 * Integrates with Azure SQL Database
 */

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
    // Create table if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='access_requests' AND xtype='U')
      CREATE TABLE access_requests (
        id INT IDENTITY(1,1) PRIMARY KEY,
        request_id NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(255) NOT NULL,
        full_name NVARCHAR(255) NOT NULL,
        organization NVARCHAR(255),
        reason NVARCHAR(MAX) NOT NULL,
        requested_access NVARCHAR(255) NOT NULL,
        status NVARCHAR(50) DEFAULT 'pending',
        created_at DATETIME DEFAULT GETUTCDATE(),
        reviewed_at DATETIME,
        reviewed_by NVARCHAR(255),
        approval_notes NVARCHAR(MAX),
        ip_address NVARCHAR(50),
        user_agent NVARCHAR(MAX)
      )
    `);
  }
  return pool;
};

module.exports = async function (context, req) {
    const method = req.method;
    const id = context.bindingData.id;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: getCorsHeaders()
        };
        return;
    }

    try {
        const pool = await getPool();

        switch (method) {
            case 'GET':
                // Get access request(s)
                if (id) {
                    // Get specific request
                    const result = await pool.request()
                        .input('requestId', sql.NVarChar(50), id)
                        .query('SELECT * FROM access_requests WHERE request_id = @requestId');
                    
                    if (result.recordset.length === 0) {
                        context.res = {
                            status: 404,
                            headers: getCorsHeaders(),
                            body: { error: "Request not found" }
                        };
                        return;
                    }

                    context.res = {
                        status: 200,
                        headers: getCorsHeaders(),
                        body: result.recordset[0]
                    };
                } else {
                    // Get all requests (with optional status filter)
                    const status = req.query.status || null;
                    let query = 'SELECT * FROM access_requests';
                    
                    if (status) {
                        query += ` WHERE status = '${status}'`;
                    }
                    
                    query += ' ORDER BY created_at DESC';
                    
                    const result = await pool.request().query(query);

                    context.res = {
                        status: 200,
                        headers: getCorsHeaders(),
                        body: {
                            requests: result.recordset,
                            total: result.recordset.length,
                            success: true
                        }
                    };
                }
                break;

            case 'POST':
                // Submit new access request
                const { email, fullName, organization, reason, requestedAccess } = req.body;

                // Validate required fields
                if (!email || !fullName || !reason || !requestedAccess) {
                    context.res = {
                        status: 400,
                        headers: getCorsHeaders(),
                        body: { 
                            error: "Missing required fields",
                            required: ["email", "fullName", "reason", "requestedAccess"]
                        }
                    };
                    return;
                }

                // Generate unique request ID
                const requestId = `ARQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Insert into database
                const insertResult = await pool.request()
                    .input('request_id', sql.NVarChar(50), requestId)
                    .input('email', sql.NVarChar(255), email)
                    .input('full_name', sql.NVarChar(255), fullName)
                    .input('organization', sql.NVarChar(255), organization || null)
                    .input('reason', sql.NVarChar(sql.MAX), reason)
                    .input('requested_access', sql.NVarChar(255), requestedAccess)
                    .input('ip_address', sql.NVarChar(50), getClientIp(req) || null)
                    .input('user_agent', sql.NVarChar(sql.MAX), req.headers['user-agent'] || null)
                    .query(`
                        INSERT INTO access_requests 
                        (request_id, email, full_name, organization, reason, requested_access, ip_address, user_agent)
                        VALUES 
                        (@request_id, @email, @full_name, @organization, @reason, @requested_access, @ip_address, @user_agent)
                        
                        SELECT id, request_id, email, full_name, status, created_at 
                        FROM access_requests 
                        WHERE request_id = @request_id
                    `);

                context.res = {
                    status: 201,
                    headers: getCorsHeaders(),
                    body: {
                        success: true,
                        message: "Access request submitted successfully",
                        data: insertResult.recordset[0]
                    }
                };
                break;

            default:
                context.res = {
                    status: 405,
                    headers: getCorsHeaders(),
                    body: { error: "Method not allowed" }
                };
        }
    } catch (error) {
        context.log.error('Error in access-requests function:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { 
                error: "Internal server error", 
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

function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',')[0] || 
           req.headers['x-client-ip'] || 
           req.connection?.remoteAddress || 
           null;
}
