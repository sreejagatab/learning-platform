const bcrypt = require('bcryptjs');

async function generateHash() {
  try {
    const demo123Hash = await bcrypt.hash('demo123', 10);
    console.log('Hashed demo123:', demo123Hash);
    
    const admin123Hash = await bcrypt.hash('admin123', 10);
    console.log('Hashed admin123:', admin123Hash);
  } catch (error) {
    console.error('Error generating hash:', error);
  }
}

generateHash();
