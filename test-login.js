const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with user@learnsphere.dev / demo123');
    
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'user@learnsphere.dev',
      password: 'demo123'
    });
    
    console.log('Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login failed!');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
