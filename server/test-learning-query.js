const axios = require('axios');

async function testLearningQuery() {
  try {
    console.log('Testing learning query endpoint...');

    // First, let's get a valid token by logging in
    const loginResponse = await axios.post(
      'http://localhost:5001/api/auth/login',
      {
        email: 'user@learnsphere.dev',
        password: 'demo123'
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const token = loginResponse.data.token;
    console.log('Got token:', token);

    const response = await axios.post(
      'http://localhost:5001/api/learning/query',
      {
        query: 'What is machine learning?',
        options: {
          level: 'intermediate'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Response status:', response.status);
    console.log('Response data summary:');
    console.log('- Content length:', response.data.content.length);
    console.log('- Citations:', response.data.citations.length);
    console.log('- Follow-up questions:', response.data.followUpQuestions.length);
    console.log('- Session ID:', response.data.sessionId);
  } catch (error) {
    console.error('Error testing learning query endpoint:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLearningQuery();
