const mongoose = require('mongoose');
const User = require('../models/user.model');
const Content = require('../models/content.model');
const History = require('../models/history.model');
const { Badge, Gamification } = require('../models/gamification.model');
const { UserActivity, LearningProgress, UserInsight, PlatformAnalytics } = require('../models/analytics.model');
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
  await User.deleteMany({});
  await Content.deleteMany({});
  await History.deleteMany({});
  await Badge.deleteMany({});
  await Gamification.deleteMany({});
  await UserActivity.deleteMany({});
  await LearningProgress.deleteMany({});
  await UserInsight.deleteMany({});
  await PlatformAnalytics.deleteMany({});
});

describe('User Model Tests', () => {
  test('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    // Password should be hashed
    expect(user.password).not.toBe(userData.password);
  });
  
  test('should not create a user with duplicate email', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    await User.create(userData);
    
    // Try to create another user with the same email
    await expect(User.create(userData)).rejects.toThrow();
  });
  
  test('should not create a user with invalid email', async () => {
    const userData = {
      name: 'Test User',
      email: 'not-an-email',
      password: 'password123'
    };
    
    await expect(User.create(userData)).rejects.toThrow();
  });
  
  test('should not create a user with short password', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: '123' // Too short
    };
    
    await expect(User.create(userData)).rejects.toThrow();
  });
  
  test('should generate JWT token', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    const token = user.getSignedJwtToken();
    
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });
  
  test('should match password correctly', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    
    // Get the user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    
    // Test correct password
    const isMatch = await userWithPassword.matchPassword('password123');
    expect(isMatch).toBe(true);
    
    // Test incorrect password
    const isNotMatch = await userWithPassword.matchPassword('wrongpassword');
    expect(isNotMatch).toBe(false);
  });
  
  test('should generate reset password token', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await User.create(userData);
    const resetToken = user.getResetPasswordToken();
    
    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe('string');
    expect(user.resetPasswordToken).toBeDefined();
    expect(user.resetPasswordExpire).toBeDefined();
  });
});

describe('Content Model Tests', () => {
  let testUser;
  
  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  test('should create a new content', async () => {
    const contentData = {
      user: testUser._id,
      type: 'note',
      title: 'Test Note',
      content: 'This is a test note'
    };
    
    const content = await Content.create(contentData);
    expect(content).toBeDefined();
    expect(content.user.toString()).toBe(testUser._id.toString());
    expect(content.type).toBe(contentData.type);
    expect(content.title).toBe(contentData.title);
    expect(content.content).toBe(contentData.content);
  });
  
  test('should not create content without required fields', async () => {
    // Missing title
    const contentData = {
      user: testUser._id,
      type: 'note',
      content: 'This is a test note'
    };
    
    await expect(Content.create(contentData)).rejects.toThrow();
  });
  
  test('should create content with metadata', async () => {
    const contentData = {
      user: testUser._id,
      type: 'learning_path',
      title: 'JavaScript Learning Path',
      content: 'This is a JavaScript learning path',
      metadata: {
        topic: 'JavaScript',
        subtopics: ['Variables', 'Functions', 'Objects'],
        level: 'intermediate',
        tags: ['programming', 'web development'],
        citations: [
          {
            id: 'citation-1',
            title: 'JavaScript Documentation',
            url: 'https://example.com/js-docs'
          }
        ]
      }
    };
    
    const content = await Content.create(contentData);
    expect(content).toBeDefined();
    expect(content.metadata).toBeDefined();
    expect(content.metadata.topic).toBe(contentData.metadata.topic);
    expect(content.metadata.subtopics).toEqual(contentData.metadata.subtopics);
    expect(content.metadata.level).toBe(contentData.metadata.level);
    expect(content.metadata.tags).toEqual(contentData.metadata.tags);
    expect(content.metadata.citations).toEqual(contentData.metadata.citations);
  });
  
  test('should validate content type', async () => {
    const contentData = {
      user: testUser._id,
      type: 'invalid_type', // Invalid type
      title: 'Test Note',
      content: 'This is a test note'
    };
    
    await expect(Content.create(contentData)).rejects.toThrow();
  });
});

describe('History Model Tests', () => {
  let testUser;
  
  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  test('should create a new history entry', async () => {
    const historyData = {
      user: testUser._id,
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
    };
    
    const history = await History.create(historyData);
    expect(history).toBeDefined();
    expect(history.user.toString()).toBe(testUser._id.toString());
    expect(history.query).toBe(historyData.query);
    expect(history.response).toBe(historyData.response);
    expect(history.sessionId).toBe(historyData.sessionId);
    expect(history.citations).toEqual(historyData.citations);
  });
  
  test('should add follow-up to history', async () => {
    const historyData = {
      user: testUser._id,
      query: 'What is JavaScript?',
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id'
    };
    
    const history = await History.create(historyData);
    
    const followUpData = {
      query: 'What are JavaScript frameworks?',
      response: 'Popular JavaScript frameworks include React, Vue, and Angular...',
      citations: [
        {
          id: 'citation-2',
          title: 'JavaScript Frameworks',
          url: 'https://example.com/js-frameworks'
        }
      ]
    };
    
    await history.addFollowUp(followUpData);
    
    // Reload history from database
    const updatedHistory = await History.findById(history._id);
    
    expect(updatedHistory.followUps).toBeDefined();
    expect(updatedHistory.followUps.length).toBe(1);
    expect(updatedHistory.followUps[0].query).toBe(followUpData.query);
    expect(updatedHistory.followUps[0].response).toBe(followUpData.response);
    expect(updatedHistory.followUps[0].citations).toEqual(followUpData.citations);
  });
  
  test('should not create history without required fields', async () => {
    // Missing query
    const historyData = {
      user: testUser._id,
      response: 'JavaScript is a programming language...',
      sessionId: 'test-session-id'
    };
    
    await expect(History.create(historyData)).rejects.toThrow();
  });
});

describe('Gamification Model Tests', () => {
  let testUser;
  
  beforeEach(async () => {
    // Create a test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  test('should create a new badge', async () => {
    const badgeData = {
      name: 'JavaScript Master',
      description: 'Completed 10 JavaScript lessons',
      icon: '/badges/js-master.png',
      category: 'learning',
      level: 2,
      criteria: {
        type: 'sessions',
        threshold: 10,
        additionalParams: {
          topic: 'JavaScript'
        }
      }
    };
    
    const badge = await Badge.create(badgeData);
    expect(badge).toBeDefined();
    expect(badge.name).toBe(badgeData.name);
    expect(badge.description).toBe(badgeData.description);
    expect(badge.icon).toBe(badgeData.icon);
    expect(badge.category).toBe(badgeData.category);
    expect(badge.level).toBe(badgeData.level);
    expect(badge.criteria.type).toBe(badgeData.criteria.type);
    expect(badge.criteria.threshold).toBe(badgeData.criteria.threshold);
    expect(badge.criteria.additionalParams.get('topic')).toBe(badgeData.criteria.additionalParams.topic);
  });
  
  test('should not create badge with duplicate name', async () => {
    const badgeData = {
      name: 'JavaScript Master',
      description: 'Completed 10 JavaScript lessons',
      icon: '/badges/js-master.png',
      category: 'learning',
      level: 2,
      criteria: {
        type: 'sessions',
        threshold: 10
      }
    };
    
    await Badge.create(badgeData);
    
    // Try to create another badge with the same name
    await expect(Badge.create(badgeData)).rejects.toThrow();
  });
  
  test('should create a new gamification profile', async () => {
    const gamificationData = {
      user: testUser._id
    };
    
    const gamification = await Gamification.create(gamificationData);
    expect(gamification).toBeDefined();
    expect(gamification.user.toString()).toBe(testUser._id.toString());
    expect(gamification.points.total).toBe(0);
    expect(gamification.level.current).toBe(1);
    expect(gamification.streak.current).toBe(0);
    expect(gamification.badges).toEqual([]);
    expect(gamification.dailyGoals.target).toBe(10);
  });
  
  test('should add points to gamification profile', async () => {
    const gamification = await Gamification.create({
      user: testUser._id
    });
    
    await gamification.addPoints(10, 'Completed a lesson');
    
    // Reload from database
    const updatedGamification = await Gamification.findById(gamification._id);
    
    expect(updatedGamification.points.total).toBe(10);
    expect(updatedGamification.points.history.length).toBe(1);
    expect(updatedGamification.points.history[0].amount).toBe(10);
    expect(updatedGamification.points.history[0].reason).toBe('Completed a lesson');
  });
  
  test('should add badge to gamification profile', async () => {
    const badge = await Badge.create({
      name: 'JavaScript Master',
      description: 'Completed 10 JavaScript lessons',
      icon: '/badges/js-master.png',
      category: 'learning',
      level: 2,
      criteria: {
        type: 'sessions',
        threshold: 10
      }
    });
    
    const gamification = await Gamification.create({
      user: testUser._id
    });
    
    await gamification.addBadge(badge._id);
    
    // Reload from database
    const updatedGamification = await Gamification.findById(gamification._id);
    
    expect(updatedGamification.badges.length).toBe(1);
    expect(updatedGamification.badges[0].badge.toString()).toBe(badge._id.toString());
    expect(updatedGamification.badges[0].displayed).toBe(false);
  });
  
  test('should update streak correctly', async () => {
    const gamification = await Gamification.create({
      user: testUser._id
    });
    
    // Set last activity to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    gamification.streak.lastActivity = yesterday;
    gamification.streak.current = 3;
    await gamification.save();
    
    // Update streak
    await gamification.updateStreak();
    
    // Reload from database
    const updatedGamification = await Gamification.findById(gamification._id);
    
    expect(updatedGamification.streak.current).toBe(4);
    expect(updatedGamification.streak.longest).toBe(4);
    expect(updatedGamification.streak.lastActivity).toBeDefined();
  });
  
  test('should reset streak if more than a day is missed', async () => {
    const gamification = await Gamification.create({
      user: testUser._id
    });
    
    // Set last activity to 2 days ago
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    gamification.streak.lastActivity = twoDaysAgo;
    gamification.streak.current = 5;
    gamification.streak.longest = 5;
    await gamification.save();
    
    // Update streak
    await gamification.updateStreak();
    
    // Reload from database
    const updatedGamification = await Gamification.findById(gamification._id);
    
    expect(updatedGamification.streak.current).toBe(1);
    expect(updatedGamification.streak.longest).toBe(5);
    expect(updatedGamification.streak.lastActivity).toBeDefined();
  });
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
  
  test('should create a new user activity', async () => {
    const activityData = {
      user: testUser._id,
      activityType: 'page_view',
      details: {
        page: 'dashboard'
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
    expect(activity.details.page).toBe(activityData.details.page);
    expect(activity.clientInfo.userAgent).toBe(activityData.clientInfo.userAgent);
    expect(activity.clientInfo.ipAddress).toBe(activityData.clientInfo.ipAddress);
    expect(activity.clientInfo.deviceType).toBe(activityData.clientInfo.deviceType);
  });
  
  test('should create a new learning progress', async () => {
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
      timeSpent: 3600, // 1 hour
      questionsAsked: 5,
      contentCreated: 2
    };
    
    const progress = await LearningProgress.create(progressData);
    expect(progress).toBeDefined();
    expect(progress.user.toString()).toBe(testUser._id.toString());
    expect(progress.topic).toBe(progressData.topic);
    expect(progress.subtopics.length).toBe(2);
    expect(progress.subtopics[0].name).toBe(progressData.subtopics[0].name);
    expect(progress.subtopics[0].progress).toBe(progressData.subtopics[0].progress);
    expect(progress.overallProgress).toBe(progressData.overallProgress);
    expect(progress.timeSpent).toBe(progressData.timeSpent);
    expect(progress.questionsAsked).toBe(progressData.questionsAsked);
    expect(progress.contentCreated).toBe(progressData.contentCreated);
  });
  
  test('should create a new user insight', async () => {
    const insightData = {
      user: testUser._id,
      learningStyle: 'visual',
      preferredTopics: [
        { topic: 'JavaScript', score: 90 },
        { topic: 'Python', score: 75 }
      ],
      preferredContentTypes: [
        { type: 'article', score: 85 },
        { type: 'tutorial', score: 70 }
      ],
      learningPatterns: {
        preferredTimeOfDay: 'evening',
        averageSessionDuration: 1800, // 30 minutes
        sessionsPerWeek: 4,
        consistencyScore: 75
      },
      strengths: [
        { topic: 'JavaScript', score: 85 }
      ],
      areasForImprovement: [
        { topic: 'CSS', score: 60 }
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
    };
    
    const insight = await UserInsight.create(insightData);
    expect(insight).toBeDefined();
    expect(insight.user.toString()).toBe(testUser._id.toString());
    expect(insight.learningStyle).toBe(insightData.learningStyle);
    expect(insight.preferredTopics.length).toBe(2);
    expect(insight.preferredTopics[0].topic).toBe(insightData.preferredTopics[0].topic);
    expect(insight.preferredTopics[0].score).toBe(insightData.preferredTopics[0].score);
    expect(insight.preferredContentTypes.length).toBe(2);
    expect(insight.learningPatterns.preferredTimeOfDay).toBe(insightData.learningPatterns.preferredTimeOfDay);
    expect(insight.strengths.length).toBe(1);
    expect(insight.areasForImprovement.length).toBe(1);
    expect(insight.recommendations.length).toBe(2);
    expect(insight.recommendations[0].type).toBe(insightData.recommendations[0].type);
    expect(insight.recommendations[0].item).toBe(insightData.recommendations[0].item);
    expect(insight.recommendations[0].reason).toBe(insightData.recommendations[0].reason);
    expect(insight.recommendations[0].score).toBe(insightData.recommendations[0].score);
  });
  
  test('should create platform analytics', async () => {
    const analyticsData = {
      date: new Date(),
      activeUsers: {
        daily: 100,
        weekly: 500,
        monthly: 1000
      },
      newUsers: 20,
      totalSessions: 250,
      averageSessionDuration: 1200, // 20 minutes
      topSearchQueries: [
        { query: 'JavaScript', count: 50 },
        { query: 'React', count: 30 },
        { query: 'Python', count: 20 }
      ],
      topTopics: [
        { topic: 'JavaScript', count: 100 },
        { topic: 'React', count: 80 },
        { topic: 'Python', count: 60 }
      ],
      contentCreated: {
        total: 50,
        byType: new Map([
          ['note', 20],
          ['article', 15],
          ['quiz', 10],
          ['learning_path', 5]
        ])
      },
      questionsAsked: 300,
      userRetention: {
        daily: 70, // 70%
        weekly: 60, // 60%
        monthly: 50 // 50%
      },
      deviceUsage: {
        desktop: 60, // 60%
        tablet: 20, // 20%
        mobile: 20 // 20%
      }
    };
    
    const analytics = await PlatformAnalytics.create(analyticsData);
    expect(analytics).toBeDefined();
    expect(analytics.date).toBeDefined();
    expect(analytics.activeUsers.daily).toBe(analyticsData.activeUsers.daily);
    expect(analytics.activeUsers.weekly).toBe(analyticsData.activeUsers.weekly);
    expect(analytics.activeUsers.monthly).toBe(analyticsData.activeUsers.monthly);
    expect(analytics.newUsers).toBe(analyticsData.newUsers);
    expect(analytics.totalSessions).toBe(analyticsData.totalSessions);
    expect(analytics.averageSessionDuration).toBe(analyticsData.averageSessionDuration);
    expect(analytics.topSearchQueries.length).toBe(3);
    expect(analytics.topTopics.length).toBe(3);
    expect(analytics.contentCreated.total).toBe(analyticsData.contentCreated.total);
    expect(analytics.contentCreated.byType.get('note')).toBe(20);
    expect(analytics.questionsAsked).toBe(analyticsData.questionsAsked);
    expect(analytics.userRetention.daily).toBe(analyticsData.userRetention.daily);
    expect(analytics.deviceUsage.desktop).toBe(analyticsData.deviceUsage.desktop);
  });
});
