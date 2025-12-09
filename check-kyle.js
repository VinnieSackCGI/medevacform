const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.AZURE_SQL_USER,
  password: process.env.AZURE_SQL_PASSWORD,
  server: process.env.AZURE_SQL_SERVER,
  database: process.env.AZURE_SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

async function checkKyle() {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(dbConfig);
    
    const result = await pool.request()
      .input('username', sql.NVarChar, 'kmacnamee')
      .query(`
        SELECT id, username, email, first_name, last_name, post, created_at
        FROM users
        WHERE username = @username
      `);
    
    if (result.recordset.length > 0) {
      console.log('\n✅ Kyle MacNamee found in database:');
      console.log(JSON.stringify(result.recordset[0], null, 2));
    } else {
      console.log('\n❌ Kyle MacNamee NOT found in database');
    }
    
    await pool.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkKyle();
