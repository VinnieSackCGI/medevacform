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

async function viewDatabase() {
  try {
    console.log('🔌 Connecting to Azure SQL Database...');
    const pool = await sql.connect(config);
    
    // Show all tables
    console.log('\n📊 DATABASE TABLES:');
    const tables = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    tables.recordset.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // Show users
    console.log('\n👥 USERS:');
    const users = await pool.request().query('SELECT id, username, email, first_name, last_name, created_at FROM users');
    if (users.recordset.length === 0) {
      console.log('  No users found');
    } else {
      users.recordset.forEach(user => {
        console.log(`  ${user.id}: ${user.username} (${user.email}) - ${user.first_name} ${user.last_name}`);
      });
    }

    // Show MEDEVAC submissions
    console.log('\n🏥 MEDEVAC SUBMISSIONS:');
    const medevacs = await pool.request().query(`
      SELECT m.id, m.patient_name, m.status, m.urgency_level, u.username, m.created_at
      FROM medevac_submissions m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.created_at DESC
    `);
    
    if (medevacs.recordset.length === 0) {
      console.log('  No MEDEVAC submissions found');
    } else {
      medevacs.recordset.forEach(medevac => {
        console.log(`  ${medevac.id}: ${medevac.patient_name} - ${medevac.status} (${medevac.urgency_level}) by ${medevac.username}`);
      });
    }

    // Show active sessions
    console.log('\n🔐 ACTIVE SESSIONS:');
    const sessions = await pool.request().query(`
      SELECT s.id, u.username, s.created_at, s.expires_at, s.ip_address
      FROM user_sessions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.is_active = 1 AND s.expires_at > GETDATE()
      ORDER BY s.created_at DESC
    `);
    
    if (sessions.recordset.length === 0) {
      console.log('  No active sessions found');
    } else {
      sessions.recordset.forEach(session => {
        console.log(`  ${session.username} - ${session.ip_address} (expires: ${session.expires_at})`);
      });
    }

    await pool.close();
    console.log('\n✅ Database view complete!');
    
  } catch (error) {
    console.error('❌ Database view failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  viewDatabase();
}

module.exports = { viewDatabase };