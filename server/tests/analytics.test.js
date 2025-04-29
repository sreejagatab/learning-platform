const mongoose = require('mongoose');
const { 
  UserActivity, 
  LearningProgress, 
  UserInsight 
} = require('../models/analytics.model');
const User = require('../models/user.model');
const config = require('config');

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
  await UserActivity.deleteMany({});
  await LearningProgress.deleteMany({});
  await UserInsight.deleteMany({});
  await User.deleteMany({});
});

describe('Analytics Model Tests', () => {
  let testUser;

  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  describe('UserActivity Model', () => {
    it('should create a new user activity', async () => {
      const activityData = {
        user: testUser._id,
        activityType: 'content_view',
        details: {
          contentId: new mongoose.Types.ObjectId(),
          contentType: 'article'
        },
        clientInfo: {
          userAgent: 'Mozilla/5.0',
          ipAddress: '127.0.0.1',
          deviceType: 'desktop'
        }
      };

      const activity = await UserActivity.create(activityData);
      expect(activity).toBeDefined();
      expect(activity.user.toString()).toBe(testUser._id.toString());
      expect(activity.activityType).toBe(activityData.activityType);
      expect(activity.details.contentType).toBe(activityData.details.contentType);
      expect(activity.clientInfo.deviceType).toBe(activityData.clientInfo.deviceType);
    });

    it('should not create an activity without required fields', async () => {
      const activityData = {
        user: testUser._id
        // Missing activityType (required)
      };

      await expect(UserActivity.create(activityData)).rejects.toThrow();
    });
  });

  describe('LearningProgress Model', () => {
    it('should create a new learning progress record', async () => {
      const progressData = {
        user: testUser._id,
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
        overallProgress: 70,
        timeSpent: 3600 // 1 hour in seconds
      };

      const progress = await LearningProgress.create(progressData);
      expect(progress).toBeDefined();
      expect(progress.user.toString()).toBe(testUser._id.toString());
      expect(progress.topic).toBe(progressData.topic);
      expect(progress.subtopics.length).toBe(2);
      expect(progress.overallProgress).toBe(70);
      expect(progress.timeSpent).toBe(3600);
    });

    it('should update the updatedAt field on save', async () => {
      const progress = await LearningProgress.create({
        user: testUser._id,
        topic: 'Python',
        overallProgress: 30,
        timeSpent: 1800
      });

      const originalUpdatedAt = progress.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));
      
      progress.overallProgress = 40;
      await progress.save();
      
      expect(progress.updatedAt).not.toEqual(originalUpdatedAt);
    });
  });

  describe('UserInsight Model', () => {
    it('should create a new user insight', async () => {
      const insightData = {
        user: testUser._id,
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
      };

      const insight = await UserInsight.create(insightData);
      expect(insight).toBeDefined();
      expect(insight.user.toString()).toBe(testUser._id.toString());
      expect(insight.learningStyle).toBe(insightData.learningStyle);
      expect(insight.preferredTopics.length).toBe(2);
      expect(insight.strengths.length).toBe(1);
      expect(insight.areasForImprovement.length).toBe(1);
    });

    it('should update the lastUpdated field on save', async () => {
      const insight = await UserInsight.create({
        user: testUser._id,
        learningStyle: 'reading'
      });

      const originalLastUpdated = insight.lastUpdated;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));
      
      insight.learningStyle = 'kinesthetic';
      await insight.save();
      
      expect(insight.lastUpdated).not.toEqual(originalLastUpdated);
    });
  });
});
