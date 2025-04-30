/**
 * Advanced Learning Path Tests
 * Tests for adaptive learning features, prerequisite mapping, and branching paths
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const LearningPath = require('../models/learning-path.model');
const jwt = require('jsonwebtoken');
const config = require('config');

// Mock user for testing
const testUser = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123'
};

// Generate JWT token for authentication
const token = jwt.sign(
  { id: testUser._id, role: 'user' },
  process.env.JWT_SECRET || config.get('jwtSecret') || 'test_secret',
  { expiresIn: '1h' }
);

// Mock learning path
let testPath;

// Setup before tests
beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/learning-platform-test');

  // Clear relevant collections
  await User.deleteMany({});
  await LearningPath.deleteMany({});

  // Create test user
  await User.create(testUser);

  // Create a test learning path
  const pathResponse = await request(app)
    .post('/api/learning-paths')
    .set('Authorization', `Bearer ${token}`)
    .send({
      topic: 'Advanced JavaScript',
      level: 'intermediate'
    });

  testPath = pathResponse.body;
});

// Cleanup after tests
afterAll(async () => {
  await User.deleteMany({});
  await LearningPath.deleteMany({});
  await mongoose.connection.close();
});

describe('Advanced Learning Path Features', () => {
  // Test prerequisites endpoint
  describe('Prerequisites', () => {
    test('Should get prerequisites for a topic', async () => {
      const response = await request(app)
        .get('/api/learning-paths/prerequisites?topic=React&level=intermediate')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Check if prerequisites have the expected structure
      if (response.body.length > 0) {
        const prereq = response.body[0];
        expect(prereq).toHaveProperty('topic');
        expect(prereq).toHaveProperty('importance');
      }
    });

    test('Should return 400 if topic is missing', async () => {
      const response = await request(app)
        .get('/api/learning-paths/prerequisites')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
    });
  });

  // Test branching paths
  describe('Branching Paths', () => {
    test('Should create a branch in a learning path', async () => {
      const response = await request(app)
        .post(`/api/learning-paths/${testPath._id}/branches`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          branchName: 'Functional Programming',
          condition: 'interest',
          description: 'A deep dive into functional programming concepts'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('branches');
      expect(response.body.branches.length).toBeGreaterThan(0);

      // Check if the branch has the expected structure
      const branch = response.body.branches[0];
      expect(branch).toHaveProperty('name', 'Functional Programming');
      expect(branch).toHaveProperty('condition', 'interest');

      // Update testPath with the new data
      testPath = response.body;
    });

    test('Should return 400 if branch name is missing', async () => {
      const response = await request(app)
        .post(`/api/learning-paths/${testPath._id}/branches`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          condition: 'interest'
        });

      expect(response.status).toBe(400);
    });
  });

  // Test adaptive learning
  describe('Adaptive Learning', () => {
    test('Should adapt a learning path based on performance', async () => {
      // First, find a checkpoint in the path
      let checkpointId;
      if (testPath.checkpoints && testPath.checkpoints.length > 0) {
        checkpointId = testPath.checkpoints[0]._id;
      } else {
        // Create a checkpoint if none exists
        const updateResponse = await request(app)
          .put(`/api/learning-paths/${testPath._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            checkpoints: [{
              afterStep: 2,
              questions: [
                {
                  question: 'What is the main concept covered in "Functional Programming"?',
                  options: ['Object-oriented design', 'Pure functions', 'Class inheritance', 'Imperative programming'],
                  correctAnswer: 1,
                  explanation: 'Functional programming emphasizes pure functions without side effects.'
                }
              ],
              passingScore: 70
            }]
          });

        testPath = updateResponse.body;
        checkpointId = testPath.checkpoints[0]._id;
      }

      // Now test the adapt endpoint
      const response = await request(app)
        .post(`/api/learning-paths/${testPath._id}/adapt`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          checkpointId,
          score: 60,
          areas: ['Functional Programming Concepts']
        });

      expect(response.status).toBe(200);

      // The path should be updated with remedial content
      // This is hard to test precisely as it depends on the implementation
      // but we can check that the path was returned
      expect(response.body).toHaveProperty('_id', testPath._id.toString());
    });

    test('Should return 400 if checkpoint ID is missing', async () => {
      const response = await request(app)
        .post(`/api/learning-paths/${testPath._id}/adapt`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          score: 60
        });

      expect(response.status).toBe(400);
    });
  });
});
