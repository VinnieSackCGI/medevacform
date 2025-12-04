/**
 * Access Request Database Schema and Service
 * Handles storing, retrieving, and approving access requests
 */

const sql = require('mssql');
require('dotenv').config();

// Database configuration (same as main database)
const dbConfig = {
  user: process.env.AZURE_SQL_USER || 'medevac_admin',
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE || 'medevac_db',
  options: {
    encrypt: true,
    trustServerCertificate: false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

/**
 * Initialize database connection and create access_requests table
 */
const initializeAccessRequestsTable = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    // Create access_requests table if it doesn't exist
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
      );
    `);

    console.log('✅ Access requests table ready');
    return pool;
  } catch (error) {
    console.error('❌ Error initializing access requests table:', error);
    throw error;
  }
};

/**
 * Submit a new access request
 */
const submitAccessRequest = async (requestData) => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    const {
      email,
      fullName,
      organization,
      reason,
      requestedAccess,
      ipAddress,
      userAgent
    } = requestData;

    // Generate unique request ID
    const requestId = `ARQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.request()
      .input('request_id', sql.NVarChar(50), requestId)
      .input('email', sql.NVarChar(255), email)
      .input('full_name', sql.NVarChar(255), fullName)
      .input('organization', sql.NVarChar(255), organization || null)
      .input('reason', sql.NVarChar(sql.MAX), reason)
      .input('requested_access', sql.NVarChar(255), requestedAccess)
      .input('ip_address', sql.NVarChar(50), ipAddress || null)
      .input('user_agent', sql.NVarChar(sql.MAX), userAgent || null)
      .query(`
        INSERT INTO access_requests 
        (request_id, email, full_name, organization, reason, requested_access, ip_address, user_agent)
        VALUES 
        (@request_id, @email, @full_name, @organization, @reason, @requested_access, @ip_address, @user_agent)
        
        SELECT id, request_id, email, full_name, status, created_at 
        FROM access_requests 
        WHERE request_id = @request_id
      `);

    return {
      success: true,
      message: 'Access request submitted successfully',
      data: result.recordset[0]
    };
  } catch (error) {
    console.error('❌ Error submitting access request:', error);
    throw error;
  }
};

/**
 * Get all pending access requests (for admin dashboard)
 */
const getPendingRequests = async () => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    const result = await pool.request().query(`
      SELECT 
        id,
        request_id,
        email,
        full_name,
        organization,
        reason,
        requested_access,
        status,
        created_at
      FROM access_requests
      WHERE status = 'pending'
      ORDER BY created_at DESC
    `);

    return result.recordset;
  } catch (error) {
    console.error('❌ Error fetching pending requests:', error);
    throw error;
  }
};

/**
 * Get all access requests (with filtering)
 */
const getAllRequests = async (status = null) => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    let query = `
      SELECT 
        id,
        request_id,
        email,
        full_name,
        organization,
        reason,
        requested_access,
        status,
        created_at,
        reviewed_at,
        reviewed_by,
        approval_notes
      FROM access_requests
    `;

    if (status) {
      query += ` WHERE status = '${status}'`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.request().query(query);
    return result.recordset;
  } catch (error) {
    console.error('❌ Error fetching requests:', error);
    throw error;
  }
};

/**
 * Get request by ID
 */
const getRequestById = async (requestId) => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    const result = await pool.request()
      .input('request_id', sql.NVarChar(50), requestId)
      .query(`
        SELECT * FROM access_requests
        WHERE request_id = @request_id
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error('❌ Error fetching request:', error);
    throw error;
  }
};

/**
 * Approve an access request
 */
const approveRequest = async (requestId, approverName, notes = null) => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    const result = await pool.request()
      .input('request_id', sql.NVarChar(50), requestId)
      .input('reviewed_by', sql.NVarChar(255), approverName)
      .input('approval_notes', sql.NVarChar(sql.MAX), notes || null)
      .query(`
        UPDATE access_requests
        SET 
          status = 'approved',
          reviewed_at = GETUTCDATE(),
          reviewed_by = @reviewed_by,
          approval_notes = @approval_notes
        WHERE request_id = @request_id
        
        SELECT * FROM access_requests WHERE request_id = @request_id
      `);

    return {
      success: true,
      message: 'Access request approved',
      data: result.recordset[0]
    };
  } catch (error) {
    console.error('❌ Error approving request:', error);
    throw error;
  }
};

/**
 * Reject an access request
 */
const rejectRequest = async (requestId, approverName, notes = null) => {
  try {
    if (!pool) {
      pool = await sql.connect(dbConfig);
    }

    const result = await pool.request()
      .input('request_id', sql.NVarChar(50), requestId)
      .input('reviewed_by', sql.NVarChar(255), approverName)
      .input('rejection_reason', sql.NVarChar(sql.MAX), notes || null)
      .query(`
        UPDATE access_requests
        SET 
          status = 'rejected',
          reviewed_at = GETUTCDATE(),
          reviewed_by = @reviewed_by,
          approval_notes = @rejection_reason
        WHERE request_id = @request_id
        
        SELECT * FROM access_requests WHERE request_id = @request_id
      `);

    return {
      success: true,
      message: 'Access request rejected',
      data: result.recordset[0]
    };
  } catch (error) {
    console.error('❌ Error rejecting request:', error);
    throw error;
  }
};

module.exports = {
  initializeAccessRequestsTable,
  submitAccessRequest,
  getPendingRequests,
  getAllRequests,
  getRequestById,
  approveRequest,
  rejectRequest
};
