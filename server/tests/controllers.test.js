const mongoose = require('mongoose');
const request = require('supertest');
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
  email: 'test-controllers@example.com',
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
  await UserActivity.deleteMany({});
  await LearningProgress.deleteMany({});
  await UserInsight.deleteMany({});
  
  // Create a user and get auth token for tests
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send(testUser);
  
  authToken = registerRes.body.token;
  
  // Get user ID
  const user = await User.findOne({ email: testUser.email });
  userId = user._id;
});

describe('Auth Controller Tests', () => {
  test('should register a new user', async () => {
    const newUser = {
      name: 'New User',
      email: 'new-user@example.com',
      password: 'password123'
    };
    
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('success', true);
    
    // Check if user was created in database
    const user = await User.findOne({ email: newUser.email });
    expect(user).toBeDefined();
    expect(user.name).toBe(newUser.name);
  });
  
  test('should login a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('success', true);
  });
  
  test('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', testUser.name);
    expect(res.body).toHaveProperty('email', testUser.email);
  });
  
  test('should update user profile', async () => {
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
    
    // Check if user was updated in database
    const user = await User.findById(userId);
    expect(user.name).toBe(updatedProfile.name);
    expect(user.preferences.level).toBe(updatedProfile.preferences.level);
  });
  
  test('should change user password', async () => {
    const passwordData = {
      currentPassword: testUser.password,
      newPassword: 'newpassword123'
    };
    
    const res = await request(app)
      .put('/api/auth/password')
      .set('Authorization', `Bearer ${authToken}`)
      .send(passwordData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Password updated successfully');
    
    // Try to login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'newpassword123'
      });
    
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});

describe('Learning Controller Tests', () => {
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
    expect(res.body).toHaveProperty('user', userId.toString());
    
    // Check if content was created in database
    const content = await Content.findById(res.body._id);
    expect(content).toBeDefined();
    expect(content.title).toBe(contentData.title);
  });
  
  test('should get content by ID', async () => {
    // First create content
    const content = await Content.create({
      user: userId,
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    });
    
    const res = await request(app)
      .get(`/api/learning/content/${content._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', content.title);
    expect(res.body).toHaveProperty('content', content.content);
    expect(res.body).toHaveProperty('type', content.type);
  });
  
  test('should update content', async () => {
    // First create content
    const content = await Content.create({
      user: userId,
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    });
    
    const updatedContent = {
      title: 'Updated Content',
      content: 'This is updated content'
    };
    
    const res = await request(app)
      .put(`/api/learning/content/${content._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedContent);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('title', updatedContent.title);
    expect(res.body).toHaveProperty('content', updatedContent.content);
    
    // Check if content was updated in database
    const updatedContentInDb = await Content.findById(content._id);
    expect(updatedContentInDb.title).toBe(updatedContent.title);
    expect(updatedContentInDb.content).toBe(updatedContent.content);
  });
  
  test('should delete content', async () => {
    // First create content
    const content = await Content.create({
      user: userId,
      title: 'Test Content',
      content: 'This is test content',
      type: 'note'
    });
    
    const res = await request(app)
      .delete(`/api/learning/content/${content._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Content deleted');
    
    // Check if content was deleted from database
    const deletedContent = await Content.findById(content._id);
    expect(deletedContent).toBeNull();
  });
  
  test('should get all user content', async () => {
    // Create multiple content items
    await Content.create({
      user: userId,
      title: 'Content 1',
      content: 'This is content 1',
      type: 'note'
    });
    
    await Content.create({
      user: userId,
      title: 'Content 2',
      content: 'This is content 2',
      type: 'article'
    });
    
    const res = await request(app)
      .get('/api/learning/content')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[1]).toHaveProperty('title');
  });
  
  test('should filter content by type', async () => {
    // Create multiple content items with different types
    await Content.create({
      user: userId,
      title: 'Note Content',
      content: 'This is a note',
      type: 'note'
    });
    
    await Content.create({
      user: userId,
      title: 'Article Content',
      content: 'This is an article',
      type: 'article'
    });
    
    const res = await request(app)
      .get('/api/learning/content?type=note')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('type', 'note');
  });
});

describe('History Controller Tests', () => {
  test('should get learning history', async () => {
    // Create history entries
    await History.create({
      user: userId,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id'
    });
    
    await History.create({
      user: userId,
      query: 'What is React?',
      response: 'React is a JavaScript library...',
      sessionId: 'test-session-id-2'
    });
    
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('query');
    expect(res.body[1]).toHaveProperty('query');
  });
  
  test('should get history by ID', async () => {
    // Create a history entry
    const history = await History.create({
      user: userId,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id'
    });
    
    const res = await request(app)
      .get(`/api/history/${history._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('query', history.query);
    expect(res.body).toHaveProperty('response', history.response);
  });
  
  test('should delete history', async () => {
    // Create a history entry
    const history = await History.create({
      user: userId,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id'
    });
    
    const res = await request(app)
      .delete(`/api/history/${history._id}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'History deleted');
    
    // Check if history was deleted from database
    const deletedHistory = await History.findById(history._id);
    expect(deletedHistory).toBeNull();
  });
  
  test('should clear all history', async () => {
    // Create multiple history entries
    await History.create({
      user: userId,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id'
    });
    
    await History.create({
      user: userId,
      query: 'What is React?',
      response: 'React is a JavaScript library...',
      sessionId: 'test-session-id-2'
    });
    
    const res = await request(app)
      .delete('/api/history')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'All history deleted');
    
    // Check if all history was deleted from database
    const history = await History.find({ user: userId });
    expect(history.length).toBe(0);
  });
});

describe('Gamification Controller Tests', () => {
  test('should get gamification data', async () => {
    // Create gamification data
    await Gamification.create({
      user: userId,
      points: {
        total: 100
      },
      level: {
        current: 5
      },
      streak: {
        current: 3,
        longest: 5
      }
    });
    
    const res = await request(app)
      .get('/api/gamification')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('points.total', 100);
    expect(res.body).toHaveProperty('level.current', 5);
    expect(res.body).toHaveProperty('streak.current', 3);
  });
  
  test('should update daily goal', async () => {
    // Create gamification data
    await Gamification.create({
      user: userId,
      dailyGoals: {
        target: 10,
        progress: 0
      }
    });
    
    const goalData = {
      target: 20 // 20 minutes
    };
    
    const res = await request(app)
      .put('/api/gamification/daily-goal')
      .set('Authorization', `Bearer ${authToken}`)
      .send(goalData);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.dailyGoals).toHaveProperty('target', goalData.target);
    
    // Check if daily goal was updated in database
    const gamification = await Gamification.findOne({ user: userId });
    expect(gamification.dailyGoals.target).toBe(goalData.target);
  });
  
  test('should record activity and earn points', async () => {
    // Create gamification data
    await Gamification.create({
      user: userId,
      points: {
        total: 0
      }
    });
    
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
    expect(res.body.pointsEarned).toBeGreaterThan(0);
    
    // Check if points were added in database
    const gamification = await Gamification.findOne({ user: userId });
    expect(gamification.points.total).toBeGreaterThan(0);
  });
  
  test('should get badges', async () => {
    // Create badges
    await Badge.create({
      name: 'Test Badge 1',
      description: 'A test badge',
      icon: '/badges/test-badge.png',
      category: 'learning',
      level: 1,
      criteria: {
        type: 'sessions',
        threshold: 5
      }
    });
    
    await Badge.create({
      name: 'Test Badge 2',
      description: 'Another test badge',
      icon: '/badges/test-badge-2.png',
      category: 'streak',
      level: 2,
      criteria: {
        type: 'streak',
        threshold: 7
      }
    });
    
    const res = await request(app)
      .get('/api/gamification/badges')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('name');
    expect(res.body[1]).toHaveProperty('name');
  });
  
  test('should get user badges', async () => {
    // Create a badge
    const badge = await Badge.create({
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
    
    // Create gamification data with the badge
    await Gamification.create({
      user: userId,
      badges: [
        {
          badge: badge._id,
          earnedAt: new Date(),
          displayed: false
        }
      ]
    });
    
    const res = await request(app)
      .get('/api/gamification/my-badges')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('badge.name', badge.name);
  });
  
  test('should mark badge as displayed', async () => {
    // Create a badge
    const badge = await Badge.create({
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
    
    // Create gamification data with the badge
    const gamification = await Gamification.create({
      user: userId,
      badges: [
        {
          badge: badge._id,
          earnedAt: new Date(),
          displayed: false
        }
      ]
    });
    
    const res = await request(app)
      .put(`/api/gamification/badges/${badge._id}/display`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Badge marked as displayed');
    
    // Check if badge was marked as displayed in database
    const updatedGamification = await Gamification.findById(gamification._id);
    expect(updatedGamification.badges[0].displayed).toBe(true);
  });
});

describe('Analytics Controller Tests', () => {
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
    
    // Check if activity was created in database
    const activity = await UserActivity.findOne({ user: userId });
    expect(activity).toBeDefined();
    expect(activity.activityType).toBe(activityData.activityType);
    expect(activity.details.page).toBe(activityData.details.page);
  });
  
  test('should get learning progress', async () => {
    // Create learning progress
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
    expect(res.body.length).toBe(1);
    expect(res.body[0]).toHaveProperty('topic', 'JavaScript');
    expect(res.body[0]).toHaveProperty('overallProgress', 70);
    expect(res.body[0].subtopics.length).toBe(2);
  });
  
  test('should get user insights', async () => {
    // Create user insights
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
    expect(res.body).toHaveProperty('strengths');
    expect(res.body).toHaveProperty('areasForImprovement');
  });
  
  test('should get recommendations', async () => {
    // Create user insights with recommendations
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
    // Create user activities
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
