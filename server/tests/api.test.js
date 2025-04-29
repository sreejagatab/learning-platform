const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user.model');
const Content = require('../models/content.model');
const History = require('../models/history.model');
const { Badge, Gamification } = require('../models/gamification.model');
const { UserActivity, LearningProgress, UserInsight } = require('../models/analytics.model');
const config = require('config');

// Test user credentials
const testUser = {
  name: 'Test User',
  email: 'test-api@example.com',
  password: 'password123'
};

let authToken;
let userId;
let contentId;
let historyId;

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
  await UserActivity.deleteMany({});
  await LearningProgress.deleteMany({});
  await UserInsight.deleteMany({});
});

describe('Authentication API', () => {
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('success', true);
    
    // Save user ID for later tests
    const user = await User.findOne({ email: testUser.email });
    userId = user._id;
  });

  test('should not register a user with existing email', async () => {
    // First create a user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    // Try to create another user with the same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  test('should login a user', async () => {
    // First create a user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    // Login with the user
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('success', true);
    
    // Save token for later tests
    authToken = res.body.token;
  });

  test('should not login with incorrect password', async () => {
    // First create a user
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    // Try to login with incorrect password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  test('should get current user profile', async () => {
    // First create a user and login
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Get user profile
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', testUser.name);
    expect(res.body).toHaveProperty('email', testUser.email);
  });

  test('should update user profile', async () => {
    // First create a user and login
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Update user profile
    const updatedProfile = {
      name: 'Updated Name',
      preferences: {
        level: 'advanced',
        topicsOfInterest: ['JavaScript', 'React']
      }
    };
    
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', updatedProfile.name);
    expect(res.body.preferences).toHaveProperty('level', updatedProfile.preferences.level);
  });
});

describe('Learning API', () => {
  beforeEach(async () => {
    // Create a user and login before each test
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Get user ID
    const user = await User.findOne({ email: testUser.email });
    userId = user._id;
  });

  test('should create content', async () => {
    const contentData = {
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    };
    
    const res = await request(app)
      .post('/api/learning/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send(contentData);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('title', contentData.title);
    expect(res.body).toHaveProperty('content', contentData.content);
    expect(res.body).toHaveProperty('type', contentData.type);
    
    // Save content ID for later tests
    contentId = res.body._id;
  });

  test('should get content by ID', async () => {
    // First create content
    const contentData = {
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    };
    
    const createRes = await request(app)
      .post('/api/learning/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send(contentData);
    
    contentId = createRes.body._id;
    
    // Get content by ID
    const res = await request(app)
      .get(`/api/learning/content/${contentId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', contentData.title);
    expect(res.body).toHaveProperty('content', contentData.content);
  });

  test('should update content', async () => {
    // First create content
    const contentData = {
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    };
    
    const createRes = await request(app)
      .post('/api/learning/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send(contentData);
    
    contentId = createRes.body._id;
    
    // Update content
    const updatedContent = {
      title: 'Updated Content',
      content: 'This is updated content'
    };
    
    const res = await request(app)
      .put(`/api/learning/content/${contentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedContent);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', updatedContent.title);
    expect(res.body).toHaveProperty('content', updatedContent.content);
  });

  test('should delete content', async () => {
    // First create content
    const contentData = {
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    };
    
    const createRes = await request(app)
      .post('/api/learning/content')
      .set('Authorization', `Bearer ${authToken}`)
      .send(contentData);
    
    contentId = createRes.body._id;
    
    // Delete content
    const res = await request(app)
      .delete(`/api/learning/content/${contentId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Content deleted');
    
    // Verify content is deleted
    const content = await Content.findById(contentId);
    expect(content).toBeNull();
  });

  test('should get learning query response', async () => {
    const queryData = {
      query: 'What is JavaScript?',
      options: {
        level: 'beginner'
      }
    };
    
    const res = await request(app)
      .post('/api/learning/query')
      .set('Authorization', `Bearer ${authToken}`)
      .send(queryData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('content');
    expect(res.body).toHaveProperty('citations');
    expect(res.body).toHaveProperty('sessionId');
  });

  test('should create learning path', async () => {
    const pathData = {
      topic: 'JavaScript',
      level: 'beginner'
    };
    
    const res = await request(app)
      .post('/api/learning/path')
      .set('Authorization', `Bearer ${authToken}`)
      .send(pathData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('pathId');
    expect(res.body).toHaveProperty('topic', pathData.topic);
  });
});

describe('Gamification API', () => {
  beforeEach(async () => {
    // Create a user and login before each test
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Get user ID
    const user = await User.findOne({ email: testUser.email });
    userId = user._id;
  });

  test('should get gamification data', async () => {
    const res = await request(app)
      .get('/api/gamification')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('points');
    expect(res.body).toHaveProperty('level');
    expect(res.body).toHaveProperty('streak');
  });

  test('should update daily goal', async () => {
    const goalData = {
      target: 20 // 20 minutes
    };
    
    const res = await request(app)
      .put('/api/gamification/daily-goal')
      .set('Authorization', `Bearer ${authToken}`)
      .send(goalData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.dailyGoals).toHaveProperty('target', goalData.target);
  });

  test('should record activity', async () => {
    const activityData = {
      type: 'learning_session',
      duration: 15, // 15 minutes
      details: {
        topic: 'JavaScript'
      }
    };
    
    const res = await request(app)
      .post('/api/gamification/activity')
      .set('Authorization', `Bearer ${authToken}`)
      .send(activityData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('pointsEarned');
    expect(res.body).toHaveProperty('newBadges');
  });

  test('should get all badges', async () => {
    // First create a badge
    await Badge.create({
      name: 'Test Badge',
      description: 'A test badge',
      icon: '/badges/test-badge.png',
      category: 'learning',
      level: 1,
      criteria: {
        type: 'sessions',
        threshold: 5
      }
    });
    
    const res = await request(app)
      .get('/api/gamification/badges')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('name', 'Test Badge');
  });

  test('should get user badges', async () => {
    const res = await request(app)
      .get('/api/gamification/my-badges')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('should get leaderboard', async () => {
    const res = await request(app)
      .get('/api/gamification/leaderboard')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Analytics API', () => {
  beforeEach(async () => {
    // Create a user and login before each test
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Get user ID
    const user = await User.findOne({ email: testUser.email });
    userId = user._id;
  });

  test('should track activity', async () => {
    const activityData = {
      activityType: 'page_view',
      details: {
        page: 'dashboard'
      }
    };
    
    const res = await request(app)
      .post('/api/analytics/track')
      .set('Authorization', `Bearer ${authToken}`)
      .send(activityData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Activity tracked');
  });

  test('should get learning progress', async () => {
    // First create some learning progress
    await LearningProgress.create({
      user: userId,
      topic: 'JavaScript',
      subtopics: [
        {
          name: 'Variables',
          progress: 80
        },
        {
          name: 'Functions',
          progress: 60
        }
      ],
      overallProgress: 70
    });
    
    const res = await request(app)
      .get('/api/analytics/progress')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('topic', 'JavaScript');
    expect(res.body[0]).toHaveProperty('overallProgress', 70);
  });

  test('should get user insights', async () => {
    // First create user insights
    await UserInsight.create({
      user: userId,
      learningStyle: 'visual',
      preferredTopics: [
        { topic: 'JavaScript', score: 90 },
        { topic: 'Python', score: 75 }
      ],
      strengths: [
        { topic: 'JavaScript', score: 85 }
      ],
      areasForImprovement: [
        { topic: 'CSS', score: 60 }
      ]
    });
    
    const res = await request(app)
      .get('/api/analytics/insights')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('learningStyle', 'visual');
    expect(res.body).toHaveProperty('preferredTopics');
    expect(Array.isArray(res.body.preferredTopics)).toBe(true);
    expect(res.body.preferredTopics.length).toBe(2);
  });

  test('should get recommendations', async () => {
    // First create user insights with recommendations
    await UserInsight.create({
      user: userId,
      learningStyle: 'visual',
      preferredTopics: [
        { topic: 'JavaScript', score: 90 }
      ],
      recommendations: [
        {
          type: 'topic',
          item: 'React',
          reason: 'Based on your interest in JavaScript',
          score: 85
        },
        {
          type: 'content',
          item: 'JavaScript Fundamentals',
          reason: 'Strengthen your JavaScript skills',
          score: 90
        }
      ]
    });
    
    const res = await request(app)
      .get('/api/analytics/recommendations')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('type');
    expect(res.body[0]).toHaveProperty('item');
    expect(res.body[0]).toHaveProperty('reason');
  });

  test('should get user activity', async () => {
    // First create some user activity
    await UserActivity.create({
      user: userId,
      activityType: 'page_view',
      details: {
        page: 'dashboard'
      }
    });
    
    await UserActivity.create({
      user: userId,
      activityType: 'learning_session',
      details: {
        sessionDuration: 600, // 10 minutes
        sessionId: 'test-session-id'
      }
    });
    
    const res = await request(app)
      .get('/api/analytics/activity')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('activityType');
    expect(res.body[0]).toHaveProperty('details');
  });
});

describe('History API', () => {
  beforeEach(async () => {
    // Create a user and login before each test
    await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    authToken = loginRes.body.token;
    
    // Get user ID
    const user = await User.findOne({ email: testUser.email });
    userId = user._id;
  });

  test('should get learning history', async () => {
    // First create some history entries
    const history = await History.create({
      user: userId,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id',
      citations: [
        {
          id: 'citation-1',
          title: 'JavaScript Documentation',
          url: 'https://example.com/js-docs'
        }
      ]
    });
    
    historyId = history._id;
    
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('query', 'What is JavaScript?');
  });

  test('should get history by ID', async () => {
    // First create a history entry
    const history = await History.create({
      user: userId,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id',
      citations: [
        {
          id: 'citation-1',
          title: 'JavaScript Documentation',
          url: 'https://example.com/js-docs'
        }
      ]
    });
    
    historyId = history._id;
    
    const res = await request(app)
      .get(`/api/history/${historyId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('query', 'What is JavaScript?');
    expect(res.body).toHaveProperty('response');
    expect(res.body).toHaveProperty('citations');
  });
});
