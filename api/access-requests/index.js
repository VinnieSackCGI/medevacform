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
    // Note: Use user_requests table (created by setup-azure-db.js)
    // This matches the standardized schema
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
                        .input('requestId', sql.Int, parseInt(id))
                        .query('SELECT * FROM user_requests WHERE id = @requestId');
                    
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
                    let query = 'SELECT * FROM user_requests';
                    
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
                const { email, firstName, lastName, requestedUsername, justification } = req.body;

                // Validate required fields
                if (!email || !firstName || !lastName || !requestedUsername) {
                    context.res = {
                        status: 400,
                        headers: getCorsHeaders(),
                        body: { 
                            error: "Missing required fields",
                            required: ["email", "firstName", "lastName", "requestedUsername"]
                        }
                    };
                    return;
                }

                // Insert into database (user_requests table)
                const insertResult = await pool.request()
                    .input('email', sql.NVarChar(100), email)
                    .input('first_name', sql.NVarChar(50), firstName)
                    .input('last_name', sql.NVarChar(50), lastName)
                    .input('requested_username', sql.NVarChar(50), requestedUsername)
                    .input('justification', sql.NVarChar(sql.MAX), justification || null)
                    .query(`
                        INSERT INTO user_requests 
                        (email, first_name, last_name, requested_username, justification)
                        OUTPUT INSERTED.id, INSERTED.email, INSERTED.first_name, INSERTED.last_name, 
                               INSERTED.requested_username, INSERTED.status, INSERTED.created_at
                        VALUES 
                        (@email, @first_name, @last_name, @requested_username, @justification)
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
