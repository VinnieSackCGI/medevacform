const sql = require('mssql');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Azure SQL Database configuration
const dbConfig = {
  user: process.env.AZURE_SQL_USER || 'medevac_admin',
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER, // e.g., 'your-server.database.windows.net'
  database: process.env.AZURE_SQL_DATABASE || 'medevac_db',
  options: {
    encrypt: true, // Use encryption for Azure SQL
    trustServerCertificate: false // For production, should be false
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

// Initialize database connection and tables
const initializeDatabase = async () => {
  try {
    console.log('📡 Connecting to Azure SQL Database...');
    console.log('Server:', dbConfig.server);
    console.log('Database:', dbConfig.database);
    
    // Create connection pool
    pool = await sql.connect(dbConfig);
    console.log('✅ Database connection established');
    
    // Just verify connection with a simple query
    await pool.request().query('SELECT 1 as test');
    console.log('📊 Database connection verified');
    
    console.log('✅ Azure SQL Database connected and ready');
    return pool;
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(255) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(100),
        last_name NVARCHAR(100),
        post NVARCHAR(255),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
      )
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medevac_submissions' AND xtype='U')
      CREATE TABLE medevac_submissions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        patient_name NVARCHAR(255) NOT NULL,
        patient_rank NVARCHAR(50),
        patient_unit NVARCHAR(255),
        medical_condition NVARCHAR(MAX),
        urgency_level NVARCHAR(50) NOT NULL,
        origin_post NVARCHAR(255) NOT NULL,
        destination_location NVARCHAR(255) NOT NULL,
        estimated_cost DECIMAL(10,2),
        per_diem_total DECIMAL(10,2),
        accommodation_cost DECIMAL(10,2),
        transportation_cost DECIMAL(10,2),
        medical_cost DECIMAL(10,2),
        status NVARCHAR(50) DEFAULT 'draft',
        funding_cable_in_date DATE,
        funding_cable_sent_date DATE,
        initial_funding_total DECIMAL(10,2),
        obligation_number NVARCHAR(255),
        amendment_data NVARCHAR(MAX), -- JSON field for amendment details
        extensions_data NVARCHAR(MAX), -- JSON field for extensions
        form_data NVARCHAR(MAX) NOT NULL, -- Complete form data as JSON
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_sessions' AND xtype='U')
      CREATE TABLE user_sessions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        session_token NVARCHAR(255) UNIQUE NOT NULL,
        expires_at DATETIME2 NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='activity_log' AND xtype='U')
      CREATE TABLE activity_log (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        action NVARCHAR(100) NOT NULL,
        resource_type NVARCHAR(50),
        resource_id INT,
        details NVARCHAR(MAX),
        ip_address NVARCHAR(50),
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Azure SQL Database connected and tables initialized successfully');
    return pool;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Database helper functions
const dbHelpers = {
  // User management
  async createUser(username, email, password, firstName, lastName, post) {
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .input('email', sql.NVarChar, email)
        .input('password_hash', sql.NVarChar, passwordHash)
        .input('first_name', sql.NVarChar, firstName)
        .input('last_name', sql.NVarChar, lastName)
        .input('post', sql.NVarChar, post)
        .query(`
          INSERT INTO users (username, email, password_hash, first_name, last_name, post)
          OUTPUT INSERTED.id
          VALUES (@username, @email, @password_hash, @first_name, @last_name, @post)
        `);
      
      const userId = result.recordset[0].id;
      return { id: userId, username, email, firstName, lastName, post };
    } catch (error) {
      throw error;
    }
  },

  async authenticateUser(username, password) {
    try {
      const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query(`
          SELECT * FROM users 
          WHERE username = @username OR email = @username
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      const user = result.recordset[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (isValid) {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          post: user.post
        };
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  // Session management
  async createSession(userId) {
    try {
      const sessionToken = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      
      await pool.request()
        .input('user_id', sql.Int, userId)
        .input('session_token', sql.NVarChar, sessionToken)
        .input('expires_at', sql.DateTime2, expiresAt)
        .query(`
          INSERT INTO user_sessions (user_id, session_token, expires_at)
          VALUES (@user_id, @session_token, @expires_at)
        `);
      
      return { sessionToken, expiresAt };
    } catch (error) {
      throw error;
    }
  },

  async validateSession(sessionToken) {
    try {
      const result = await pool.request()
        .input('session_token', sql.NVarChar, sessionToken)
        .query(`
          SELECT u.*, s.expires_at 
          FROM user_sessions s
          JOIN users u ON s.user_id = u.id
          WHERE s.session_token = @session_token AND s.expires_at > GETDATE()
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      const row = result.recordset[0];
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        post: row.post
      };
    } catch (error) {
      throw error;
    }
  },

  // MEDEVAC submissions
  async saveMedevac(userId, medevacData) {
    try {
      const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .input('patient_name', sql.NVarChar, medevacData.patientName || '')
        .input('patient_rank', sql.NVarChar, medevacData.patientRank || '')
        .input('patient_unit', sql.NVarChar, medevacData.patientUnit || '')
        .input('medical_condition', sql.NVarChar, medevacData.medicalCondition || '')
        .input('urgency_level', sql.NVarChar, medevacData.urgencyLevel || 'routine')
        .input('origin_post', sql.NVarChar, medevacData.originPost || '')
        .input('destination_location', sql.NVarChar, medevacData.destinationLocation || '')
        .input('estimated_cost', sql.Decimal(10,2), medevacData.estimatedCost || 0)
        .input('per_diem_total', sql.Decimal(10,2), medevacData.perDiemTotal || 0)
        .input('accommodation_cost', sql.Decimal(10,2), medevacData.accommodationCost || 0)
        .input('transportation_cost', sql.Decimal(10,2), medevacData.transportationCost || 0)
        .input('medical_cost', sql.Decimal(10,2), medevacData.medicalCost || 0)
        .input('status', sql.NVarChar, medevacData.status || 'draft')
        .input('funding_cable_in_date', sql.Date, medevacData.fundingCableInDate || null)
        .input('funding_cable_sent_date', sql.Date, medevacData.fundingCableSentDate || null)
        .input('initial_funding_total', sql.Decimal(10,2), medevacData.initialFundingTotal || 0)
        .input('obligation_number', sql.NVarChar, medevacData.obligationNumber || '')
        .input('amendment_data', sql.NVarChar, JSON.stringify(medevacData.amendment || {}))
        .input('extensions_data', sql.NVarChar, JSON.stringify(medevacData.extensions || []))
        .input('form_data', sql.NVarChar, JSON.stringify(medevacData))
        .query(`
          INSERT INTO medevac_submissions (
            user_id, patient_name, patient_rank, patient_unit, medical_condition,
            urgency_level, origin_post, destination_location, estimated_cost,
            per_diem_total, accommodation_cost, transportation_cost, medical_cost,
            status, funding_cable_in_date, funding_cable_sent_date, initial_funding_total,
            obligation_number, amendment_data, extensions_data, form_data
          ) OUTPUT INSERTED.id
          VALUES (
            @user_id, @patient_name, @patient_rank, @patient_unit, @medical_condition,
            @urgency_level, @origin_post, @destination_location, @estimated_cost,
            @per_diem_total, @accommodation_cost, @transportation_cost, @medical_cost,
            @status, @funding_cable_in_date, @funding_cable_sent_date, @initial_funding_total,
            @obligation_number, @amendment_data, @extensions_data, @form_data
          )
        `);

      const medevacId = result.recordset[0].id;
      return { id: medevacId };
    } catch (error) {
      throw error;
    }
  },

  async getUserMedevacs(userId) {
    try {
      const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT id, patient_name, urgency_level, origin_post, destination_location,
                 estimated_cost, status, created_at, updated_at
          FROM medevac_submissions 
          WHERE user_id = @user_id
          ORDER BY created_at DESC
        `);

      return result.recordset;
    } catch (error) {
      throw error;
    }
  },

  async getMedevacById(id, userId) {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT * FROM medevac_submissions 
          WHERE id = @id AND user_id = @user_id
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      const row = result.recordset[0];
      // Parse JSON fields
      try {
        row.amendment_data = JSON.parse(row.amendment_data || '{}');
        row.extensions_data = JSON.parse(row.extensions_data || '[]');
        row.form_data = JSON.parse(row.form_data || '{}');
      } catch (parseErr) {
        console.error('Error parsing JSON data:', parseErr);
      }
      return row;
    } catch (error) {
      throw error;
    }
  },

  async updateMedevac(id, userId, medevacData) {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('user_id', sql.Int, userId)
        .input('patient_name', sql.NVarChar, medevacData.patientName || '')
        .input('patient_rank', sql.NVarChar, medevacData.patientRank || '')
        .input('patient_unit', sql.NVarChar, medevacData.patientUnit || '')
        .input('medical_condition', sql.NVarChar, medevacData.medicalCondition || '')
        .input('urgency_level', sql.NVarChar, medevacData.urgencyLevel || 'routine')
        .input('origin_post', sql.NVarChar, medevacData.originPost || '')
        .input('destination_location', sql.NVarChar, medevacData.destinationLocation || '')
        .input('estimated_cost', sql.Decimal(10,2), medevacData.estimatedCost || 0)
        .input('per_diem_total', sql.Decimal(10,2), medevacData.perDiemTotal || 0)
        .input('accommodation_cost', sql.Decimal(10,2), medevacData.accommodationCost || 0)
        .input('transportation_cost', sql.Decimal(10,2), medevacData.transportationCost || 0)
        .input('medical_cost', sql.Decimal(10,2), medevacData.medicalCost || 0)
        .input('status', sql.NVarChar, medevacData.status || 'draft')
        .input('funding_cable_in_date', sql.Date, medevacData.fundingCableInDate || null)
        .input('funding_cable_sent_date', sql.Date, medevacData.fundingCableSentDate || null)
        .input('initial_funding_total', sql.Decimal(10,2), medevacData.initialFundingTotal || 0)
        .input('obligation_number', sql.NVarChar, medevacData.obligationNumber || '')
        .input('amendment_data', sql.NVarChar, JSON.stringify(medevacData.amendment || {}))
        .input('extensions_data', sql.NVarChar, JSON.stringify(medevacData.extensions || []))
        .input('form_data', sql.NVarChar, JSON.stringify(medevacData))
        .query(`
          UPDATE medevac_submissions SET
            patient_name = @patient_name, patient_rank = @patient_rank, 
            patient_unit = @patient_unit, medical_condition = @medical_condition,
            urgency_level = @urgency_level, origin_post = @origin_post, 
            destination_location = @destination_location, estimated_cost = @estimated_cost,
            per_diem_total = @per_diem_total, accommodation_cost = @accommodation_cost, 
            transportation_cost = @transportation_cost, medical_cost = @medical_cost,
            status = @status, funding_cable_in_date = @funding_cable_in_date, 
            funding_cable_sent_date = @funding_cable_sent_date, 
            initial_funding_total = @initial_funding_total,
            obligation_number = @obligation_number, amendment_data = @amendment_data, 
            extensions_data = @extensions_data, form_data = @form_data,
            updated_at = GETDATE()
          WHERE id = @id AND user_id = @user_id
        `);

      return { changes: result.rowsAffected[0] };
    } catch (error) {
      throw error;
    }
  },

  async deleteMedevac(id, userId) {
    try {
      const result = await pool.request()
        .input('id', sql.Int, id)
        .input('user_id', sql.Int, userId)
        .query(`
          DELETE FROM medevac_submissions 
          WHERE id = @id AND user_id = @user_id
        `);

      return { changes: result.rowsAffected[0] };
    } catch (error) {
      throw error;
    }
  },

  // Activity logging
  async logActivity(userId, action, resourceType = null, resourceId = null, details = null, ipAddress = null) {
    try {
      const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .input('action', sql.NVarChar, action)
        .input('resource_type', sql.NVarChar, resourceType)
        .input('resource_id', sql.Int, resourceId)
        .input('details', sql.NVarChar, details)
        .input('ip_address', sql.NVarChar, ipAddress)
        .query(`
          INSERT INTO activity_log (user_id, action, resource_type, resource_id, details, ip_address)
          OUTPUT INSERTED.id
          VALUES (@user_id, @action, @resource_type, @resource_id, @details, @ip_address)
        `);

      return { id: result.recordset[0].id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  pool,
  initializeDatabase,
  dbHelpers
};