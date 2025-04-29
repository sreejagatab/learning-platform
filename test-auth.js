const bcrypt = require('bcryptjs');

async function testPasswordVerification() {
  const storedHash = '$2a$10$XFE/odQxDAMoVXW/i2hs7uVZZ6HHZ.3/HkP1pC0KYj/nUcVBN7cP2';
  const password = 'demo123';
  
  try {
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log('Password match result:', isMatch);
  } catch (error) {
    console.error('Error verifying password:', error);
  }
}

testPasswordVerification();
