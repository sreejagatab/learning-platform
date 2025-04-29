const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const Content = require('../models/content.model');
const History = require('../models/history.model');
const { Badge, Gamification } = require('../models/gamification.model');
const config = require('config');

// Test user credentials
const testUser = {
  name: 'Edge Case Test User',
  email: 'edge-case-test@example.com',
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
  await Content.deleteMany({});
  await History.deleteMany({});
  await Badge.deleteMany({});
  await Gamification.deleteMany({});
  
  // Create a user and get auth token for tests
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerRes.body.token;
  
  // Get user ID
  const user = await User.findOne({ email: testUser.email });
  userId = user._id;
});

describe('Edge Cases and Complex Scenarios', () => {
  describe('Concurrent Requests', () => {
    test('should handle multiple concurrent requests to the same endpoint', async () => {
      // Create multiple concurrent requests to the same endpoint
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`)
        );
      }
      
      const responses = await Promise.all(promises);
      
      // All responses should be successful
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', testUser.name);
      });
    });
    
    test('should handle concurrent content creation', async () => {
      // Create multiple concurrent content creation requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/learning/content')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              title: `Concurrent Content ${i}`,
              content: `This is concurrent content ${i}`,
              type: 'note'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // All responses should be successful
      responses.forEach(res => {
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('content');
      });
      
      // Check if all content was created
      const content = await Content.find({ user: userId });
      expect(content.length).toBe(5);
    });
  });
  
  describe('Large Data Handling', () => {
    test('should handle large content creation', async () => {
      // Generate a large content string (approximately 100KB)
      const largeContent = 'A'.repeat(100 * 1024);
      
      const res = await request(app)
        .post('/api/learning/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Large Content',
          content: largeContent,
          type: 'note'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', 'Large Content');
      
      // Check if content was stored correctly
      const content = await Content.findById(res.body._id);
      expect(content.content).toBe(largeContent);
    });
    
    test('should handle large query responses', async () => {
      // Create a history entry with a large response
      const largeResponse = 'A'.repeat(100 * 1024);
      
      const history = await History.create({
        user: userId,
        query: 'What is a large response?',
        response: largeResponse,
        sessionId: 'large-response-test'
      });
      
      const res = await request(app)
        .get(`/api/history/${history._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('response', largeResponse);
    });
  });
  
  describe('Unicode and Special Characters', () => {
    test('should handle content with unicode characters', async () => {
      const unicodeContent = {
        title: '유니코드 테스트 🚀',
        content: '这是一个测试 😊 مرحبا بالعالم',
        type: 'note'
      };
      
      const res = await request(app)
        .post('/api/learning/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(unicodeContent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', unicodeContent.title);
      expect(res.body).toHaveProperty('content', unicodeContent.content);
      
      // Check if content was stored correctly
      const content = await Content.findById(res.body._id);
      expect(content.title).toBe(unicodeContent.title);
      expect(content.content).toBe(unicodeContent.content);
    });
    
    test('should handle queries with special characters', async () => {
      const specialCharsQuery = 'What is SQL injection? Examples: \'; DROP TABLE users; --';
      
      // Mock the learning query response
      jest.mock('../services/learning.service', () => ({
        processLearningQuery: jest.fn().mockResolvedValue({
          content: 'SQL injection is a code injection technique...',
          citations: [],
          followUpQuestions: []
        })
      }));
      
      const res = await request(app)
        .post('/api/learning/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: specialCharsQuery
        });
      
      expect(res.statusCode).toBe(200);
      
      // Check if query was stored correctly
      const history = await History.findOne({ query: specialCharsQuery });
      expect(history).toBeDefined();
      expect(history.query).toBe(specialCharsQuery);
    });
  });
  
  describe('Race Conditions', () => {
    test('should handle concurrent updates to the same resource', async () => {
      // Create a content item
      const content = await Content.create({
        user: userId,
        title: 'Original Title',
        content: 'Original content',
        type: 'note'
      });
      
      // Create multiple concurrent update requests
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .put(`/api/learning/content/${content._id}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              title: `Updated Title ${i}`,
              content: `Updated content ${i}`
            })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // All responses should be successful
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('content');
      });
      
      // Check the final state of the content
      const updatedContent = await Content.findById(content._id);
      expect(updatedContent).toBeDefined();
      expect(updatedContent.title).toMatch(/^Updated Title \d$/);
      expect(updatedContent.content).toMatch(/^Updated content \d$/);
    });
    
    test('should handle concurrent gamification updates', async () => {
      // Create gamification data
      await Gamification.create({
        user: userId,
        points: {
          total: 0
        }
      });
      
      // Create multiple concurrent activity records
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/gamification/activity')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              type: 'learning_session',
              duration: 10,
              details: {
                topic: `Topic ${i}`
              }
            })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // All responses should be successful
      responses.forEach(res => {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('pointsEarned');
      });
      
      // Check the final state of the gamification data
      const gamification = await Gamification.findOne({ user: userId });
      expect(gamification).toBeDefined();
      expect(gamification.points.total).toBeGreaterThan(0);
      
      // Total points should be the sum of all activities
      const totalPointsEarned = responses.reduce((sum, res) => sum + res.body.pointsEarned, 0);
      expect(gamification.points.total).toBe(totalPointsEarned);
    });
  });
  
  describe('Error Recovery', () => {
    test('should recover from database errors', async () => {
      // Mock mongoose to throw an error on the first call and succeed on the second
      const originalFindById = mongoose.Model.findById;
      let callCount = 0;
      
      mongoose.Model.findById = jest.fn().mockImplementation(function(id) {
        callCount++;
        if (callCount === 1) {
          throw new Error('Simulated database error');
        }
        return originalFindById.call(this, id);
      });
      
      // Create a content item
      const content = await Content.create({
        user: userId,
        title: 'Test Content',
        content: 'This is test content',
        type: 'note'
      });
      
      // First request should fail due to the mocked error
      try {
        await request(app)
          .get(`/api/learning/content/${content._id}`)
          .set('Authorization', `Bearer ${authToken}`);
      } catch (err) {
        // Expected to fail
      }
      
      // Second request should succeed
      const res = await request(app)
        .get(`/api/learning/content/${content._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Test Content');
      
      // Restore original function
      mongoose.Model.findById = originalFindById;
    });
    
    test('should handle transaction rollback', async () => {
      // This test simulates a transaction that should be rolled back
      
      // Start a session
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Create a content item in the transaction
        await Content.create([{
          user: userId,
          title: 'Transaction Content',
          content: 'This content should be rolled back',
          type: 'note'
        }], { session });
        
        // Throw an error to trigger rollback
        throw new Error('Simulated error to trigger rollback');
      } catch (err) {
        // Expected to fail, abort the transaction
        await session.abortTransaction();
      } finally {
        await session.endSession();
      }
      
      // Check that the content was not created
      const content = await Content.findOne({ title: 'Transaction Content' });
      expect(content).toBeNull();
    });
  });
  
  describe('Boundary Values', () => {
    test('should handle minimum and maximum values', async () => {
      // Test with minimum valid values
      const minContent = {
        title: 'a', // Minimum title length
        content: 'a', // Minimum content length
        type: 'note'
      };
      
      const minRes = await request(app)
        .post('/api/learning/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minContent);
      
      expect(minRes.statusCode).toBe(201);
      
      // Test with very long values (but within limits)
      const maxContent = {
        title: 'a'.repeat(200), // Long but valid title
        content: 'a'.repeat(10000), // Long but valid content
        type: 'note'
      };
      
      const maxRes = await request(app)
        .post('/api/learning/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maxContent);
      
      expect(maxRes.statusCode).toBe(201);
      
      // Test with values just beyond limits
      const beyondLimitContent = {
        title: 'a'.repeat(300), // Beyond title length limit
        content: 'a'.repeat(1000000), // Beyond content length limit
        type: 'note'
      };
      
      const beyondLimitRes = await request(app)
        .post('/api/learning/content')
        .set('Authorization', `Bearer ${authToken}`)
        .send(beyondLimitContent);
      
      // Should either return 400 Bad Request or truncate the values
      if (beyondLimitRes.statusCode === 400) {
        expect(beyondLimitRes.body).toHaveProperty('errors');
      } else {
        expect(beyondLimitRes.statusCode).toBe(201);
        // Check if values were truncated
        const content = await Content.findById(beyondLimitRes.body._id);
        expect(content.title.length).toBeLessThan(beyondLimitContent.title.length);
      }
    });
  });
});
