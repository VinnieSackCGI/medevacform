/**
 * Approval Request API Function
 * Handles approving and rejecting access requests
 * Admin only endpoint
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
  }
  return pool;
};

module.exports = async function (context, req) {
    const method = req.method;
    const action = context.bindingData.action;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: getCorsHeaders()
        };
        return;
    }

    // Only allow POST
    if (method !== 'POST') {
        context.res = {
            status: 405,
            headers: getCorsHeaders(),
            body: { error: "Method not allowed. Only POST is supported." }
        };
        return;
    }

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
        context.res = {
            status: 400,
            headers: getCorsHeaders(),
            body: { error: "Invalid action. Must be 'approve' or 'reject'." }
        };
        return;
    }

    try {
        const { requestId, approverName, notes } = req.body;

        // Validate required fields
        if (!requestId || !approverName) {
            context.res = {
                status: 400,
                headers: getCorsHeaders(),
                body: { 
                    error: "Missing required fields",
                    required: ["requestId", "approverName"],
                    optional: ["notes"]
                }
            };
            return;
        }

        const pool = await getPool();

        // Check if request exists
        const checkResult = await pool.request()
            .input('requestId', sql.NVarChar(50), requestId)
            .query('SELECT * FROM access_requests WHERE request_id = @requestId');

        if (checkResult.recordset.length === 0) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "Access request not found" }
            };
            return;
        }

        const existingRequest = checkResult.recordset[0];

        // Check if already reviewed
        if (existingRequest.status !== 'pending') {
            context.res = {
                status: 409,
                headers: getCorsHeaders(),
                body: { 
                    error: `Cannot ${action} a request that has already been ${existingRequest.status}`,
                    currentStatus: existingRequest.status,
                    reviewedAt: existingRequest.reviewed_at,
                    reviewedBy: existingRequest.reviewed_by
                }
            };
            return;
        }

        // Update the request
        const updateResult = await pool.request()
            .input('requestId', sql.NVarChar(50), requestId)
            .input('status', sql.NVarChar(50), action === 'approve' ? 'approved' : 'rejected')
            .input('reviewedBy', sql.NVarChar(255), approverName)
            .input('approvalNotes', sql.NVarChar(sql.MAX), notes || '')
            .query(`
                UPDATE access_requests
                SET 
                    status = @status,
                    reviewed_at = GETUTCDATE(),
                    reviewed_by = @reviewedBy,
                    approval_notes = @approvalNotes
                WHERE request_id = @requestId
                
                SELECT * FROM access_requests WHERE request_id = @requestId
            `);

        const updatedRequest = updateResult.recordset[0];

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                success: true,
                message: `Access request ${action}ed successfully`,
                data: {
                    requestId: updatedRequest.request_id,
                    email: updatedRequest.email,
                    fullName: updatedRequest.full_name,
                    status: updatedRequest.status,
                    reviewedBy: updatedRequest.reviewed_by,
                    reviewedAt: updatedRequest.reviewed_at,
                    notes: updatedRequest.approval_notes
                }
            }
        };

    } catch (error) {
        context.log.error('Error in approve-request function:', error);
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
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };
}
