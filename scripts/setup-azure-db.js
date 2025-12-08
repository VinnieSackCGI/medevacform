const sql = require('mssql');
require('dotenv').config();

const config = {
  server: process.env.AZURE_SQL_SERVER,
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
  },
};

async function setupDatabase() {
  console.log('🚀 Setting up Azure SQL Database...');
  console.log('Connection config:', {
    server: config.server ? '✓' : '✗ Missing AZURE_SQL_SERVER',
    user: config.user ? '✓' : '✗ Missing AZURE_SQL_USER',
    password: config.password ? '✓' : '✗ Missing AZURE_SQL_PASSWORD',
    database: config.database ? '✓' : '✗ Missing AZURE_SQL_DATABASE',
  });

  if (!config.server || !config.user || !config.password || !config.database) {
    console.error('❌ Missing required environment variables. Please set:');
    console.error('- AZURE_SQL_SERVER (e.g., your-server.database.windows.net)');
    console.error('- AZURE_SQL_USER');
    console.error('- AZURE_SQL_PASSWORD');
    console.error('- AZURE_SQL_DATABASE');
    process.exit(1);
  }

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const pool = await sql.connect(config);
    console.log('✅ Connected successfully!');

    // Create tables
    console.log('📊 Creating tables...');

    // Users table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(50) UNIQUE NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password_hash NVARCHAR(255) NOT NULL,
        first_name NVARCHAR(50),
        last_name NVARCHAR(50),
        role NVARCHAR(20) DEFAULT 'user',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        last_login DATETIME2
      )
    `);
    console.log('✅ Users table ready');

    // User sessions table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_sessions' AND xtype='U')
      CREATE TABLE user_sessions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        session_token NVARCHAR(255) UNIQUE NOT NULL,
        created_at DATETIME2 DEFAULT GETDATE(),
        expires_at DATETIME2 NOT NULL,
        ip_address NVARCHAR(45),
        user_agent NVARCHAR(500),
        is_active BIT DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ User sessions table ready');

    // MEDEVAC submissions table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='medevac_submissions' AND xtype='U')
      CREATE TABLE medevac_submissions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        patient_name NVARCHAR(100),
        obligation_number NVARCHAR(50),
        origin_post NVARCHAR(100),
        destination_location NVARCHAR(100),
        medevac_type NVARCHAR(50),
        status NVARCHAR(20) DEFAULT 'pending',
        form_data NVARCHAR(MAX),
        created_by NVARCHAR(100),
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        updated_at DATETIME2 DEFAULT GETUTCDATE()
      )
    `);
    
    // Migrations: Add columns if they don't exist (for existing tables)
    const medevacColumns = [
      { name: 'created_by', type: 'NVARCHAR(100)' },
      { name: 'patient_name', type: 'NVARCHAR(100)' },
      { name: 'obligation_number', type: 'NVARCHAR(50)' },
      { name: 'origin_post', type: 'NVARCHAR(100)' },
      { name: 'destination_location', type: 'NVARCHAR(100)' },
      { name: 'medevac_type', type: 'NVARCHAR(50)' },
      { name: 'status', type: 'NVARCHAR(20)', default: "'pending'" },
      { name: 'form_data', type: 'NVARCHAR(MAX)' },
      { name: 'created_at', type: 'DATETIME2', default: 'GETUTCDATE()' },
      { name: 'updated_at', type: 'DATETIME2', default: 'GETUTCDATE()' }
    ];
    
    for (const column of medevacColumns) {
      await pool.request().query(`
        IF NOT EXISTS (
          SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_NAME = 'medevac_submissions' AND COLUMN_NAME = '${column.name}'
        )
        BEGIN
          ALTER TABLE medevac_submissions ADD ${column.name} ${column.type} ${column.default ? `DEFAULT ${column.default}` : ''}
        END
      `);
    }
    
    console.log('✅ MEDEVAC submissions table ready');

    // Activity log table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='activity_log' AND xtype='U')
      CREATE TABLE activity_log (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT,
        action NVARCHAR(100) NOT NULL,
        resource_type NVARCHAR(50),
        resource_id INT,
        details NVARCHAR(MAX),
        ip_address NVARCHAR(45),
        created_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Activity log table ready');

    // User requests table
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='user_requests' AND xtype='U')
      CREATE TABLE user_requests (
        id INT IDENTITY(1,1) PRIMARY KEY,
        first_name NVARCHAR(50) NOT NULL,
        last_name NVARCHAR(50) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        username NVARCHAR(50) NOT NULL,
        justification NVARCHAR(MAX),
        status NVARCHAR(20) DEFAULT 'pending',
        created_at DATETIME2 DEFAULT GETUTCDATE(),
        reviewed_at DATETIME2,
        reviewed_by NVARCHAR(100),
        notes NVARCHAR(MAX)
      )
    `);
    console.log('✅ User requests table ready');

    // Create indices for performance
    console.log('📈 Creating indices...');
    
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_user_sessions_token')
      CREATE INDEX IX_user_sessions_token ON user_sessions (session_token)
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_user_sessions_user_id')
      CREATE INDEX IX_user_sessions_user_id ON user_sessions (user_id)
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_medevac_submissions_user_id')
      CREATE INDEX IX_medevac_submissions_user_id ON medevac_submissions (user_id)
    `);

    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_activity_log_user_id')
      CREATE INDEX IX_activity_log_user_id ON activity_log (user_id)
    `);

    console.log('✅ Indices created');

    // Test basic operations
    console.log('🧪 Testing basic operations...');
    
    const testResult = await pool.request().query('SELECT GETDATE() as CurrentTime');
    console.log('✅ Database query test passed:', testResult.recordset[0].CurrentTime);

    console.log('🎉 Azure SQL Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Test the application with: npm run dev');
    console.log('2. Try creating a user account');
    console.log('3. Submit a test MEDEVAC form');

    await pool.close();
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.originalError) {
      console.error('Original error:', error.originalError.message);
    }
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };