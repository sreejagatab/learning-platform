const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const config = require('config');

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test-middleware@example.com',
  password: 'password123'
};

let authToken;
let userId;

// Connect to test database before tests
beforeAll(async () => {
  const mongoURI = config.get('testMongoURI') || 'mongodb://localhost:27017/learning-platform-test';
  await mongoose.connect(mongoURI);
});

// Clear test database after tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

// Clear collections before each test
beforeEach(async () => {
  await User.deleteMany({});
  
  // Create a user and get auth token for tests
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerRes.body.token;
  
  // Get user ID
  const user = await User.findOne({ email: testUser.email });
  userId = user._id;
});

describe('Auth Middleware Tests', () => {
  test('should allow access with valid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', testUser.name);
  });
  
  test('should deny access without token', async () => {
    const res = await request(app)
      .get('/api/auth/me');
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'No token, authorization denied');
  });
  
  test('should deny access with invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token is not valid');
  });
  
  test('should deny access with expired token', async () => {
    // Create an expired token
    const payload = {
      user: {
        id: userId
      }
    };
    
    const expiredToken = jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: '1ms' } // Expire immediately
    );
    
    // Wait for token to expire
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Token is not valid');
  });
});

describe('Role Middleware Tests', () => {
  test('should allow admin access to admin routes', async () => {
    // Create an admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Generate token for admin user
    const payload = {
      user: {
        id: adminUser._id
      }
    };
    
    const adminToken = jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: config.get('jwtExpiration') }
    );
    
    // Try to access admin route
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  
  test('should deny regular user access to admin routes', async () => {
    // Try to access admin route with regular user token
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Not authorized to access this resource');
  });
});

describe('Rate Limiting Middleware Tests', () => {
  test('should allow requests within rate limit', async () => {
    // Make multiple requests but stay within rate limit
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(
        request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // All responses should be successful
    responses.forEach(res => {
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
  
  test('should block requests exceeding rate limit', async () => {
    // Make many requests to trigger rate limiting
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(
        request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: testUser.password
          })
      );
    }
    
    const responses = await Promise.all(promises);
    
    // At least one response should be rate limited
    const rateLimitedResponse = responses.find(res => res.statusCode === 429);
    expect(rateLimitedResponse).toBeDefined();
    expect(rateLimitedResponse.body).toHaveProperty('message', 'Too many requests, please try again later');
  });
});

describe('Validation Middleware Tests', () => {
  test('should validate registration input', async () => {
    const invalidUser = {
      name: 'T', // Too short
      email: 'not-an-email',
      password: '123' // Too short
    };
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(invalidUser);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
    
    // Check specific validation errors
    const nameError = res.body.errors.find(err => err.param === 'name');
    const emailError = res.body.errors.find(err => err.param === 'email');
    const passwordError = res.body.errors.find(err => err.param === 'password');
    
    expect(nameError).toBeDefined();
    expect(emailError).toBeDefined();
    expect(passwordError).toBeDefined();
  });
  
  test('should validate login input', async () => {
    const invalidLogin = {
      // Missing email and password
    };
    
    const res = await request(app)
      .post('/api/auth/login')
      .send(invalidLogin);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
    
    // Check specific validation errors
    const emailError = res.body.errors.find(err => err.param === 'email');
    const passwordError = res.body.errors.find(err => err.param === 'password');
    
    expect(emailError).toBeDefined();
    expect(passwordError).toBeDefined();
  });
  
  test('should validate content creation input', async () => {
    const invalidContent = {
      // Missing title and content
      type: 'note'
    };
    
    const res = await request(app)
      .post('/api/learning/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidContent);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(Array.isArray(res.body.errors)).toBe(true);
    expect(res.body.errors.length).toBeGreaterThan(0);
    
    // Check specific validation errors
    const titleError = res.body.errors.find(err => err.param === 'title');
    const contentError = res.body.errors.find(err => err.param === 'content');
    
    expect(titleError).toBeDefined();
    expect(contentError).toBeDefined();
  });
});

describe('Error Handling Middleware Tests', () => {
  test('should handle 404 errors', async () => {
    const res = await request(app)
      .get('/api/non-existent-route');
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Route not found');
  });
  
  test('should handle server errors', async () => {
    // Create a route that throws an error
    app.get('/api/test/error', (req, res, next) => {
      throw new Error('Test error');
    });
    
    const res = await request(app)
      .get('/api/test/error');
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('message', 'Server error');
  });
});
