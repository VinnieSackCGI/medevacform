const bcrypt = require('bcrypt');

// The password we set for Kyle
const password = 'Welcome123!';

// The hash we used in the SQL insert
const storedHash = '$2b$10$Eq5z3F6tT0OxR.kGBqGJ9eYlN3xB.qR7qp6nR8FKFwJjqN9xYzL2S';

async function testPassword() {
  console.log('Testing password match...');
  console.log('Password:', password);
  console.log('Hash:', storedHash);
  
  const match = await bcrypt.compare(password, storedHash);
  console.log('\n✅ Password match result:', match);
  
  // Also generate a fresh hash for comparison
  const freshHash = await bcrypt.hash(password, 10);
  console.log('\n📝 Fresh hash (for reference):', freshHash);
  
  const freshMatch = await bcrypt.compare(password, freshHash);
  console.log('✅ Fresh hash match:', freshMatch);
}

testPassword();
