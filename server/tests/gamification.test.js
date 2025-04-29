const mongoose = require('mongoose');
const { Badge, Gamification } = require('../models/gamification.model');
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
  await Badge.deleteMany({});
  await Gamification.deleteMany({});
  await User.deleteMany({});
});

describe('Gamification Model Tests', () => {
  describe('Badge Model', () => {
    it('should create a new badge', async () => {
      const badgeData = {
        name: 'Test Badge',
        description: 'A test badge',
        icon: '/badges/test-badge.png',
        category: 'learning',
        level: 1,
        criteria: {
          type: 'sessions',
          threshold: 5
        }
      };

      const badge = await Badge.create(badgeData);
      expect(badge).toBeDefined();
      expect(badge.name).toBe(badgeData.name);
      expect(badge.description).toBe(badgeData.description);
      expect(badge.level).toBe(badgeData.level);
      expect(badge.criteria.type).toBe(badgeData.criteria.type);
      expect(badge.criteria.threshold).toBe(badgeData.criteria.threshold);
    });

    it('should not create a badge without required fields', async () => {
      const badgeData = {
        name: 'Incomplete Badge',
        // Missing description and other required fields
      };

      await expect(Badge.create(badgeData)).rejects.toThrow();
    });
  });

  describe('Gamification Model', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should create a new gamification profile', async () => {
      const gamificationData = {
        user: testUser._id
      };

      const gamification = await Gamification.create(gamificationData);
      expect(gamification).toBeDefined();
      expect(gamification.user.toString()).toBe(testUser._id.toString());
      expect(gamification.points.total).toBe(0);
      expect(gamification.level.current).toBe(1);
      expect(gamification.streak.current).toBe(0);
    });

    it('should add points correctly', async () => {
      const gamification = await Gamification.create({
        user: testUser._id
      });

      await gamification.addPoints(10, 'Test points');
      
      // Reload from database
      const updatedGamification = await Gamification.findById(gamification._id);
      
      expect(updatedGamification.points.total).toBe(10);
      expect(updatedGamification.points.history.length).toBe(1);
      expect(updatedGamification.points.history[0].amount).toBe(10);
      expect(updatedGamification.points.history[0].reason).toBe('Test points');
    });

    it('should update streak correctly', async () => {
      const gamification = await Gamification.create({
        user: testUser._id
      });

      // Set last activity to yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      gamification.streak.lastActivity = yesterday;
      gamification.streak.current = 1;
      await gamification.save();

      // Update streak (should increase by 1)
      await gamification.updateStreak();
      
      // Reload from database
      const updatedGamification = await Gamification.findById(gamification._id);
      
      expect(updatedGamification.streak.current).toBe(2);
      expect(updatedGamification.streak.longest).toBe(2);
      
      // Update streak again on same day (should not change)
      await updatedGamification.updateStreak();
      
      const reloadedGamification = await Gamification.findById(gamification._id);
      expect(reloadedGamification.streak.current).toBe(2);
    });

    it('should update daily goals correctly', async () => {
      const gamification = await Gamification.create({
        user: testUser._id,
        dailyGoals: {
          target: 30,
          progress: 0
        }
      });

      // Add progress
      await gamification.updateDailyGoal(15);
      
      // Reload from database
      const updatedGamification = await Gamification.findById(gamification._id);
      
      expect(updatedGamification.dailyGoals.progress).toBe(15);
      
      // Add more progress
      await updatedGamification.updateDailyGoal(20);
      
      const reloadedGamification = await Gamification.findById(gamification._id);
      expect(reloadedGamification.dailyGoals.progress).toBe(35);
    });
  });
});
