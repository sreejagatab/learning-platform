const http = require('http');

// Login data
const data = JSON.stringify({
  email: 'user@learnsphere.dev',
  password: 'demo123'
});

// Request options
const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

console.log('Sending login request with:', data);

// Make the request
const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);

  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
    console.log('Received chunk:', chunk.toString());
  });

  res.on('end', () => {
    console.log('Response body:', responseData);
    try {
      const parsedData = JSON.parse(responseData);
      console.log('Parsed response:', JSON.stringify(parsedData, null, 2));

      if (parsedData.token) {
        console.log('Login successful! Token received.');
      }
    } catch (e) {
      console.error('Error parsing response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

// Write data to request body
req.write(data);
req.end();
