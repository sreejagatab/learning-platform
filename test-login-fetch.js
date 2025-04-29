// Simple script to test login using fetch
const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('Testing login with user@learnsphere.dev / demo123');
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@learnsphere.dev',
        password: 'demo123'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Login successful!');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('Login failed!');
      console.error('Status:', response.status);
      console.error('Response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
