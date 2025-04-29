const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const config = require('config');

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test-errors@example.com',
  password: 'password123'
};

let authToken;

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
  
  // Create a user and get auth token for tests that need it
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerRes.body.token;
});

describe('Error Handling Tests', () => {
  describe('Authentication Errors', () => {
    test('should return 400 for invalid registration data', async () => {
      const invalidUser = {
        name: 'Test',
        email: 'not-an-email',
        password: '123' // Too short
      };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });
    
    test('should return 401 for invalid login credentials', async () => {
      const invalidCredentials = {
        email: testUser.email,
        password: 'wrongpassword'
      };
      
      const res = await request(app)
        .post('/api/auth/login')
        .send(invalidCredentials);
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
    
    test('should return 401 for missing auth token', async () => {
      const res = await request(app)
        .get('/api/auth/me');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'No token, authorization denied');
    });
    
    test('should return 401 for invalid auth token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token is not valid');
    });
  });
  
  describe('Content API Errors', () => {
    test('should return 400 for missing required fields in content creation', async () => {
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
    });
    
    test('should return 404 for non-existent content', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/learning/content/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('message', 'Content not found');
    });
    
    test('should return 403 for unauthorized content access', async () => {
      // Create another user
      const anotherUser = {
        name: 'Another User',
        email: 'another@example.com',
        password: 'password123'
      };
      
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(anotherUser);
      
      const anotherToken = registerRes.body.token;
      
      // Create content with the first user
      const contentRes = await request(app)
        .post('/api/learning/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Content',
          content: 'This is test content',
          type: 'note'
        });
      
      const contentId = contentRes.body._id;
      
      // Try to access the content with the second user
      const res = await request(app)
        .get(`/api/learning/content/${contentId}`)
        .set('Authorization', `Bearer ${anotherToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to access this content');
    });
  });
  
  describe('Learning API Errors', () => {
    test('should return 400 for missing query in learning request', async () => {
      const res = await request(app)
        .post('/api/learning/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing query
          options: { level: 'beginner' }
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
    
    test('should return 400 for invalid learning path request', async () => {
      const res = await request(app)
        .post('/api/learning/path')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing topic
          level: 'beginner'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
    
    test('should return 400 for invalid follow-up request', async () => {
      const res = await request(app)
        .post('/api/learning/follow-up')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          followUpQuery: 'What are JavaScript frameworks?'
          // Missing messages and sessionId
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
  
  describe('Gamification API Errors', () => {
    test('should return 400 for invalid daily goal update', async () => {
      const res = await request(app)
        .put('/api/gamification/daily-goal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          target: 'not-a-number' // Should be a number
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid daily goal');
    });
    
    test('should return 400 for invalid activity record', async () => {
      const res = await request(app)
        .post('/api/gamification/activity')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing type
          duration: 15
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Activity type is required');
    });
  });
  
  describe('Analytics API Errors', () => {
    test('should return 400 for invalid activity tracking', async () => {
      const res = await request(app)
        .post('/api/analytics/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing activityType
          details: { page: 'dashboard' }
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'Activity type is required');
    });
    
    test('should return 403 for unauthorized access to platform analytics', async () => {
      // Regular users should not be able to access platform analytics
      const res = await request(app)
        .get('/api/analytics/platform')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('message', 'Not authorized to access this resource');
    });
  });
  
  describe('Rate Limiting', () => {
    test('should return 429 when rate limit is exceeded', async () => {
      // Make multiple requests in quick succession to trigger rate limiting
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
      
      // At least one of the responses should be rate limited
      const rateLimitedResponse = responses.find(res => res.statusCode === 429);
      expect(rateLimitedResponse).toBeDefined();
      expect(rateLimitedResponse.body).toHaveProperty('message', 'Too many requests, please try again later');
    });
  });
  
  describe('Database Connection Errors', () => {
    let originalConnect;
    
    beforeAll(() => {
      // Save the original connect method
      originalConnect = mongoose.connect;
    });
    
    afterAll(() => {
      // Restore the original connect method
      mongoose.connect = originalConnect;
    });
    
    test('should handle database connection errors', async () => {
      // Mock mongoose.connect to throw an error
      mongoose.connect = jest.fn().mockRejectedValue(new Error('Database connection error'));
      
      // Restart the app to trigger the connection error
      const newApp = require('../app');
      
      // Make a request to the app
      const res = await request(newApp)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      // The app should return a 500 error
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Server error');
    });
  });
  
  describe('External API Errors', () => {
    test('should handle Perplexity API errors', async () => {
      // Mock the Perplexity API to return an error
      jest.mock('../services/perplexity.service', () => ({
        querySonarAPI: jest.fn().mockRejectedValue(new Error('Perplexity API error'))
      }));
      
      const res = await request(app)
        .post('/api/learning/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: 'What is JavaScript?',
          options: { level: 'beginner' }
        });
      
      expect(res.statusCode).toBe(500);
      expect(res.body).toHaveProperty('message', 'Error processing learning query');
    });
  });
});
