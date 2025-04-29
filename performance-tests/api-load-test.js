import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const authErrors = new Counter('auth_errors');
const learningErrors = new Counter('learning_errors');
const requestsPerSecond = new Rate('requests_per_second');
const authDuration = new Trend('auth_duration');
const learningDuration = new Trend('learning_duration');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
    { duration: '1m', target: 50 }, // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 },  // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.05'],   // Less than 5% of requests should fail
    'auth_duration': ['p(95)<300'],   // 95% of auth requests should be below 300ms
    'learning_duration': ['p(95)<1000'], // 95% of learning requests should be below 1000ms
  },
};

// Shared variables
const BASE_URL = 'http://localhost:5000/api';
const users = [];

// Generate test users
for (let i = 0; i < 100; i++) {
  users.push({
    name: `Test User ${i}`,
    email: `test-user-${i}@example.com`,
    password: 'password123'
  });
}

// Main test function
export default function () {
  const userIndex = __VU % users.length;
  const user = users[userIndex];
  
  // Register or login
  let token;
  let authStart = new Date();
  
  // Try to register (will fail if user already exists, which is fine)
  let registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  });
  
  // If registration fails, login
  if (registerRes.status !== 201) {
    let loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
      email: user.email,
      password: user.password
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    check(loginRes, {
      'login successful': (r) => r.status === 200,
    }) || authErrors.add(1);
    
    if (loginRes.status === 200) {
      token = JSON.parse(loginRes.body).token;
    }
  } else {
    token = JSON.parse(registerRes.body).token;
  }
  
  authDuration.add(new Date() - authStart);
  
  // If we have a token, make authenticated requests
  if (token) {
    // Get user profile
    let profileRes = http.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    check(profileRes, {
      'profile request successful': (r) => r.status === 200,
    });
    
    // Ask a learning question
    let learningStart = new Date();
    let questionRes = http.post(`${BASE_URL}/learning/query`, JSON.stringify({
      query: 'What is JavaScript?',
      options: {
        level: 'beginner'
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    check(questionRes, {
      'learning query successful': (r) => r.status === 200,
    }) || learningErrors.add(1);
    
    learningDuration.add(new Date() - learningStart);
    
    // Get gamification data
    let gamificationRes = http.get(`${BASE_URL}/gamification`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
    
    check(gamificationRes, {
      'gamification request successful': (r) => r.status === 200,
    });
    
    // Record activity
    http.post(`${BASE_URL}/analytics/track`, JSON.stringify({
      activityType: 'learning_session',
      details: {
        sessionDuration: 60,
        topic: 'JavaScript'
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  }
  
  // Track request rate
  requestsPerSecond.add(1);
  
  // Wait between iterations
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
