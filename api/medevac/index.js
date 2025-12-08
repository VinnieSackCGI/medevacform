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
            case 'POST':
                await handleCreate(context, req, pool);
                break;
            case 'GET':
                if (id) {
                    await handleGetById(context, id, pool);
                } else {
                    await handleGetAll(context, req, pool);
                }
                break;
            case 'PUT':
                if (!id) {
                    context.res = {
                        status: 400,
                        headers: getCorsHeaders(),
                        body: { error: "ID required for update" }
                    };
                    return;
                }
                await handleUpdate(context, req, id, pool);
                break;
            case 'DELETE':
                if (!id) {
                    context.res = {
                        status: 400,
                        headers: getCorsHeaders(),
                        body: { error: "ID required for delete" }
                    };
                    return;
                }
                await handleDelete(context, id, pool);
                break;
            default:
                context.res = {
                    status: 405,
                    headers: getCorsHeaders(),
                    body: { error: "Method not allowed" }
                };
        }
    } catch (error) {
        context.log.error('Error in MEDEVAC API:', error);
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

// Create new MEDEVAC submission
async function handleCreate(context, req, pool) {
    try {
        const formData = req.body;
        
        // Extract fields with safe defaults - all fields are optional
        const patientName = formData.patientName || formData.patient_name || null;
        const obligationNumber = formData.obligationNumber || formData.obligation_number || null;
        const originPost = formData.homePost || formData.originPost || formData.origin_post || null;
        const destinationLocation = formData.initialMedevacLocation || formData.destinationLocation || formData.destination_location || null;
        const medevacType = formData.medevacType || formData.medevac_type || null;
        const status = formData.status || 'pending';
        const createdBy = formData.createdBy || formData.created_by || 'system';
        
        // Check which columns exist in the table
        const columnsResult = await pool.request().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'medevac_submissions'
        `);
        
        const existingColumns = columnsResult.recordset.map(row => row.COLUMN_NAME.toLowerCase());
        
        // Build dynamic insert based on existing columns
        const columnMap = {
            'patient_name': { value: patientName, type: sql.NVarChar(100) },
            'obligation_number': { value: obligationNumber, type: sql.NVarChar(50) },
            'origin_post': { value: originPost, type: sql.NVarChar(100) },
            'destination_location': { value: destinationLocation, type: sql.NVarChar(100) },
            'medevac_type': { value: medevacType, type: sql.NVarChar(50) },
            'status': { value: status, type: sql.NVarChar(20) },
            'form_data': { value: JSON.stringify(formData), type: sql.NVarChar(sql.MAX) },
            'created_by': { value: createdBy, type: sql.NVarChar(100) },
            'created_at': { value: undefined, type: null }, // Use default
            'updated_at': { value: undefined, type: null }  // Use default
        };
        
        const request = pool.request();
        const columns = [];
        const values = [];
        const params = [];
        
        for (const [colName, colData] of Object.entries(columnMap)) {
            if (existingColumns.includes(colName)) {
                columns.push(colName);
                if (colName === 'created_at' || colName === 'updated_at') {
                    values.push('GETUTCDATE()');
                } else {
                    params.push(colName);
                    values.push(`@${colName}`);
                    request.input(colName, colData.type, colData.value);
                }
            }
        }
        
        const insertQuery = `
            INSERT INTO medevac_submissions (${columns.join(', ')})
            OUTPUT INSERTED.*
            VALUES (${values.join(', ')})
        `;
        
        context.log('Insert query:', insertQuery);
        context.log('Columns:', columns);
        
        const result = await request.query(insertQuery);

        const submission = result.recordset[0];
        
        // Parse form_data safely
        let parsedFormData = {};
        try {
            parsedFormData = JSON.parse(submission.form_data || '{}');
        } catch (e) {
            context.log.error('Error parsing form_data:', e);
        }

        context.res = {
            status: 201,
            headers: getCorsHeaders(),
            body: {
                success: true,
                id: submission.id,
                submission: {
                    id: submission.id,
                    patientName: submission.patient_name,
                    obligationNumber: submission.obligation_number,
                    originPost: submission.origin_post,
                    destinationLocation: submission.destination_location,
                    medevacType: submission.medevac_type,
                    status: submission.status,
                    createdAt: submission.created_at,
                    updatedAt: submission.updated_at,
                    ...parsedFormData
                }
            }
        };
    } catch (error) {
        context.log.error('Error creating submission:', error);
        context.log.error('Error stack:', error.stack);
        context.log.error('Request body:', JSON.stringify(req.body));
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { 
                error: "Failed to create submission", 
                message: error.message,
                details: error.toString()
            }
        };
    }
}

// Get submission by ID
async function handleGetById(context, id, pool) {
    try {
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('SELECT * FROM medevac_submissions WHERE id = @id');

        if (result.recordset.length === 0) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "Submission not found" }
            };
            return;
        }

        const submission = result.recordset[0];
        const formData = JSON.parse(submission.form_data || '{}');

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                id: submission.id,
                patientName: submission.patient_name,
                obligationNumber: submission.obligation_number,
                originPost: submission.origin_post,
                destinationLocation: submission.destination_location,
                medevacType: submission.medevac_type,
                status: submission.status,
                createdAt: submission.created_at,
                updatedAt: submission.updated_at,
                createdBy: submission.created_by,
                ...formData
            }
        };
    } catch (error) {
        context.log.error('Error getting submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to retrieve submission" }
        };
    }
}

// Get all submissions with optional filtering
async function handleGetAll(context, req, pool) {
    try {
        const { status, patientName, limit = 50, offset = 0 } = req.query;
        
        let query = 'SELECT * FROM medevac_submissions WHERE 1=1';
        const request = pool.request();

        if (status) {
            query += ' AND status = @status';
            request.input('status', sql.NVarChar(20), status);
        }

        if (patientName) {
            query += ' AND patient_name LIKE @patientName';
            request.input('patientName', sql.NVarChar(100), `%${patientName}%`);
        }

        query += ' ORDER BY created_at DESC';
        query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
        
        request.input('offset', sql.Int, parseInt(offset));
        request.input('limit', sql.Int, parseInt(limit));

        const result = await request.query(query);
        
        const submissions = result.recordset.map(sub => {
            const formData = JSON.parse(sub.form_data || '{}');
            return {
                id: sub.id,
                patientName: sub.patient_name,
                obligationNumber: sub.obligation_number,
                originPost: sub.origin_post,
                destinationLocation: sub.destination_location,
                medevacType: sub.medevac_type,
                status: sub.status,
                createdAt: sub.created_at,
                updatedAt: sub.updated_at,
                createdBy: sub.created_by,
                ...formData
            };
        });

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                medevacs: submissions,
                submissions: submissions,
                total: submissions.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        };
    } catch (error) {
        context.log.error('Error getting submissions:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to retrieve submissions", message: error.message }
        };
    }
}

// Update submission
async function handleUpdate(context, req, id, pool) {
    try {
        const formData = req.body;

        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('patient_name', sql.NVarChar(100), formData.patientName || '')
            .input('obligation_number', sql.NVarChar(50), formData.obligationNumber || '')
            .input('origin_post', sql.NVarChar(100), formData.originPost || '')
            .input('destination_location', sql.NVarChar(100), formData.destinationLocation || '')
            .input('medevac_type', sql.NVarChar(50), formData.medevacType || '')
            .input('status', sql.NVarChar(20), formData.status || 'draft')
            .input('form_data', sql.NVarChar(sql.MAX), JSON.stringify(formData))
            .query(`
                UPDATE medevac_submissions
                SET 
                    patient_name = @patient_name,
                    obligation_number = @obligation_number,
                    origin_post = @origin_post,
                    destination_location = @destination_location,
                    medevac_type = @medevac_type,
                    status = @status,
                    form_data = @form_data,
                    updated_at = GETUTCDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "Submission not found" }
            };
            return;
        }

        const submission = result.recordset[0];

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                success: true,
                submission: {
                    id: submission.id,
                    patientName: submission.patient_name,
                    obligationNumber: submission.obligation_number,
                    status: submission.status,
                    updatedAt: submission.updated_at,
                    ...JSON.parse(submission.form_data)
                }
            }
        };
    } catch (error) {
        context.log.error('Error updating submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to update submission" }
        };
    }
}

// Delete submission
async function handleDelete(context, id, pool) {
    try {
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM medevac_submissions WHERE id = @id; SELECT @@ROWCOUNT as deleted');

        if (result.recordset[0].deleted === 0) {
            context.res = {
                status: 404,
                headers: getCorsHeaders(),
                body: { error: "Submission not found" }
            };
            return;
        }

        context.res = {
            status: 200,
            headers: getCorsHeaders(),
            body: {
                success: true,
                message: "Submission deleted successfully"
            }
        };
    } catch (error) {
        context.log.error('Error deleting submission:', error);
        context.res = {
            status: 500,
            headers: getCorsHeaders(),
            body: { error: "Failed to delete submission" }
        };
    }
}

function getCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json"
    };
}
