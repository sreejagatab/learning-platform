/**
 * Test Data Generator
 * 
 * This script generates realistic test data for the learning platform.
 * It creates users, content, learning history, gamification data, and analytics.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const config = require('config');
const User = require('../models/user.model');
const Content = require('../models/content.model');
const History = require('../models/history.model');
const { Badge, Gamification } = require('../models/gamification.model');
const { UserActivity, LearningProgress, UserInsight } = require('../models/analytics.model');

// Configuration
const NUM_USERS = 50;
const NUM_CONTENT_PER_USER = 10;
const NUM_HISTORY_PER_USER = 20;
const NUM_BADGES = 15;

// Connect to database
mongoose.connect(config.get('mongoURI'))
  .then(() => {
    console.log('Connected to MongoDB');
    generateData();
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Main function to generate all data
async function generateData() {
  try {
    // Clear existing data
    await clearData();
    
    // Generate badges first (needed for gamification)
    const badges = await generateBadges();
    
    // Generate users and their related data
    const users = await generateUsers();
    
    // Generate content for each user
    await generateContent(users);
    
    // Generate learning history for each user
    await generateHistory(users);
    
    // Generate gamification data for each user
    await generateGamification(users, badges);
    
    // Generate analytics data for each user
    await generateAnalytics(users);
    
    console.log('Test data generation complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error generating test data:', err);
    process.exit(1);
  }
}

// Clear existing data
async function clearData() {
  console.log('Clearing existing data...');
  await User.deleteMany({});
  await Content.deleteMany({});
  await History.deleteMany({});
  await Badge.deleteMany({});
  await Gamification.deleteMany({});
  await UserActivity.deleteMany({});
  await LearningProgress.deleteMany({});
  await UserInsight.deleteMany({});
}

// Generate badges
async function generateBadges() {
  console.log('Generating badges...');
  
  const badgeCategories = ['learning', 'streak', 'content', 'social'];
  const badgeTypes = ['sessions', 'streak', 'content_created', 'questions_asked', 'topics_explored'];
  
  const badges = [];
  
  for (let i = 0; i < NUM_BADGES; i++) {
    const category = faker.helpers.arrayElement(badgeCategories);
    const type = faker.helpers.arrayElement(badgeTypes);
    const level = faker.number.int({ min: 1, max: 5 });
    const threshold = faker.number.int({ min: 5, max: 100 }) * level;
    
    const badge = new Badge({
      name: `${faker.word.adjective()} ${faker.word.noun()}`,
      description: faker.lorem.sentence(),
      icon: `/badges/badge-${i + 1}.png`,
      category,
      level,
      criteria: {
        type,
        threshold
      }
    });
    
    await badge.save();
    badges.push(badge);
  }
  
  console.log(`Created ${badges.length} badges`);
  return badges;
}

// Generate users
async function generateUsers() {
  console.log('Generating users...');
  
  const users = [];
  const levels = ['beginner', 'intermediate', 'advanced'];
  const topics = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'Web Development', 'Mobile Development'];
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
    preferences: {
      level: 'advanced',
      topicsOfInterest: faker.helpers.arrayElements(topics, faker.number.int({ min: 2, max: 5 }))
    }
  });
  
  await admin.save();
  users.push(admin);
  
  // Create regular users
  for (let i = 0; i < NUM_USERS; i++) {
    const password = await bcrypt.hash('password123', 10);
    const user = new User({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password,
      role: 'user',
      preferences: {
        level: faker.helpers.arrayElement(levels),
        topicsOfInterest: faker.helpers.arrayElements(topics, faker.number.int({ min: 1, max: 4 }))
      }
    });
    
    await user.save();
    users.push(user);
  }
  
  console.log(`Created ${users.length} users`);
  return users;
}

// Generate content for users
async function generateContent(users) {
  console.log('Generating content...');
  
  const contentTypes = ['note', 'article', 'quiz', 'learning_path'];
  const topics = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Science', 'Web Development', 'Mobile Development'];
  
  for (const user of users) {
    const numContent = faker.number.int({ min: 0, max: NUM_CONTENT_PER_USER });
    
    for (let i = 0; i < numContent; i++) {
      const type = faker.helpers.arrayElement(contentTypes);
      const topic = faker.helpers.arrayElement(topics);
      
      const content = new Content({
        user: user._id,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 5 })),
        type,
        metadata: {
          topic,
          subtopics: faker.helpers.arrayElements(
            ['Variables', 'Functions', 'Classes', 'Modules', 'Frameworks', 'Libraries', 'Best Practices'],
            faker.number.int({ min: 0, max: 3 })
          ),
          level: user.preferences.level,
          tags: faker.helpers.arrayElements(
            ['programming', 'tutorial', 'guide', 'reference', 'example', 'project'],
            faker.number.int({ min: 0, max: 3 })
          )
        },
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: faker.date.recent({ days: 30 })
      });
      
      await content.save();
    }
  }
  
  const contentCount = await Content.countDocuments();
  console.log(`Created ${contentCount} content items`);
}

// Generate learning history for users
async function generateHistory(users) {
  console.log('Generating learning history...');
  
  const questions = [
    'What is JavaScript?',
    'How do I create a React component?',
    'What are Python decorators?',
    'Explain Node.js event loop',
    'What is machine learning?',
    'How to use async/await in JavaScript?',
    'What is the difference between var, let, and const?',
    'How to implement authentication in Node.js?',
    'What are React hooks?',
    'How to handle state in React?'
  ];
  
  for (const user of users) {
    const numHistory = faker.number.int({ min: 0, max: NUM_HISTORY_PER_USER });
    
    for (let i = 0; i < numHistory; i++) {
      const query = faker.helpers.arrayElement(questions);
      const sessionId = faker.string.uuid();
      
      const history = new History({
        user: user._id,
        query,
        response: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
        sessionId,
        citations: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
          id: faker.string.uuid(),
          title: faker.lorem.sentence(),
          url: faker.internet.url()
        })),
        queryTimestamp: faker.date.recent({ days: 30 }),
        followUps: Array.from({ length: faker.number.int({ min: 0, max: 2 }) }, () => ({
          query: `Follow-up: ${faker.lorem.sentence()}?`,
          response: faker.lorem.paragraphs(1),
          citations: [],
          timestamp: faker.date.recent({ days: 30 })
        }))
      });
      
      await history.save();
    }
  }
  
  const historyCount = await History.countDocuments();
  console.log(`Created ${historyCount} history entries`);
}

// Generate gamification data for users
async function generateGamification(users, badges) {
  console.log('Generating gamification data...');
  
  for (const user of users) {
    // Determine user's level and points based on activity
    const level = faker.number.int({ min: 1, max: 10 });
    const points = level * faker.number.int({ min: 100, max: 500 });
    const streak = faker.number.int({ min: 0, max: 30 });
    
    // Assign random badges to user
    const userBadges = faker.helpers.arrayElements(
      badges,
      faker.number.int({ min: 0, max: Math.min(level * 2, badges.length) })
    ).map(badge => ({
      badge: badge._id,
      earnedAt: faker.date.recent({ days: 90 }),
      displayed: faker.datatype.boolean()
    }));
    
    const gamification = new Gamification({
      user: user._id,
      points: {
        total: points,
        history: Array.from({ length: faker.number.int({ min: 5, max: 20 }) }, () => ({
          amount: faker.number.int({ min: 5, max: 50 }),
          reason: faker.helpers.arrayElement([
            'Completed a learning session',
            'Created content',
            'Answered a question',
            'Daily streak bonus',
            'Completed a quiz'
          ]),
          timestamp: faker.date.recent({ days: 90 })
        }))
      },
      level: {
        current: level,
        progress: faker.number.int({ min: 0, max: 100 })
      },
      streak: {
        current: streak,
        longest: Math.max(streak, faker.number.int({ min: streak, max: streak + 10 })),
        lastActivity: faker.date.recent({ days: 1 })
      },
      badges: userBadges,
      dailyGoals: {
        target: faker.helpers.arrayElement([10, 15, 20, 30, 45, 60]),
        progress: faker.number.int({ min: 0, max: 60 }),
        lastUpdated: faker.date.recent({ days: 1 })
      }
    });
    
    await gamification.save();
  }
  
  const gamificationCount = await Gamification.countDocuments();
  console.log(`Created ${gamificationCount} gamification profiles`);
}

// Generate analytics data for users
async function generateAnalytics(users) {
  console.log('Generating analytics data...');
  
  const activityTypes = ['page_view', 'learning_session', 'content_view', 'content_creation', 'search'];
  const pages = ['dashboard', 'learn', 'content', 'profile', 'gamification', 'analytics'];
  const topics = ['JavaScript', 'Python', 'React', 'Node.js', 'Machine Learning', 'Data Science'];
  const learningStyles = ['visual', 'auditory', 'reading', 'kinesthetic'];
  const timeOfDay = ['morning', 'afternoon', 'evening', 'night'];
  
  for (const user of users) {
    // Generate user activities
    const numActivities = faker.number.int({ min: 10, max: 50 });
    
    for (let i = 0; i < numActivities; i++) {
      const activityType = faker.helpers.arrayElement(activityTypes);
      let details = {};
      
      switch (activityType) {
        case 'page_view':
          details = { page: faker.helpers.arrayElement(pages) };
          break;
        case 'learning_session':
          details = {
            sessionDuration: faker.number.int({ min: 60, max: 3600 }),
            topic: faker.helpers.arrayElement(topics),
            sessionId: faker.string.uuid()
          };
          break;
        case 'content_view':
          details = {
            contentId: faker.string.uuid(),
            contentType: faker.helpers.arrayElement(['note', 'article', 'quiz']),
            viewDuration: faker.number.int({ min: 30, max: 1800 })
          };
          break;
        case 'content_creation':
          details = {
            contentId: faker.string.uuid(),
            contentType: faker.helpers.arrayElement(['note', 'article', 'quiz']),
            creationDuration: faker.number.int({ min: 300, max: 3600 })
          };
          break;
        case 'search':
          details = {
            query: faker.lorem.sentence(),
            resultCount: faker.number.int({ min: 0, max: 20 })
          };
          break;
      }
      
      const activity = new UserActivity({
        user: user._id,
        activityType,
        details,
        timestamp: faker.date.recent({ days: 30 }),
        clientInfo: {
          userAgent: faker.internet.userAgent(),
          ipAddress: faker.internet.ip(),
          deviceType: faker.helpers.arrayElement(['desktop', 'tablet', 'mobile'])
        }
      });
      
      await activity.save();
    }
    
    // Generate learning progress
    const userTopics = faker.helpers.arrayElements(topics, faker.number.int({ min: 1, max: 4 }));
    
    for (const topic of userTopics) {
      const subtopics = [];
      const numSubtopics = faker.number.int({ min: 3, max: 8 });
      
      for (let i = 0; i < numSubtopics; i++) {
        subtopics.push({
          name: faker.lorem.word(),
          progress: faker.number.int({ min: 0, max: 100 })
        });
      }
      
      const overallProgress = Math.floor(
        subtopics.reduce((sum, subtopic) => sum + subtopic.progress, 0) / subtopics.length
      );
      
      const progress = new LearningProgress({
        user: user._id,
        topic,
        subtopics,
        overallProgress,
        timeSpent: faker.number.int({ min: 1800, max: 36000 }),
        questionsAsked: faker.number.int({ min: 0, max: 50 }),
        contentCreated: faker.number.int({ min: 0, max: 10 }),
        lastUpdated: faker.date.recent({ days: 14 })
      });
      
      await progress.save();
    }
    
    // Generate user insights
    const preferredTopics = userTopics.map(topic => ({
      topic,
      score: faker.number.int({ min: 60, max: 100 })
    }));
    
    const strengths = faker.helpers.arrayElements(
      preferredTopics,
      faker.number.int({ min: 0, max: preferredTopics.length })
    ).map(item => ({
      topic: item.topic,
      score: faker.number.int({ min: 75, max: 100 })
    }));
    
    const areasForImprovement = faker.helpers.arrayElements(
      topics.filter(topic => !userTopics.includes(topic)),
      faker.number.int({ min: 0, max: 3 })
    ).map(topic => ({
      topic,
      score: faker.number.int({ min: 20, max: 60 })
    }));
    
    const recommendations = [
      ...faker.helpers.arrayElements(
        topics.filter(topic => !userTopics.includes(topic)),
        faker.number.int({ min: 0, max: 2 })
      ).map(topic => ({
        type: 'topic',
        item: topic,
        reason: `Based on your interest in ${faker.helpers.arrayElement(userTopics)}`,
        score: faker.number.int({ min: 70, max: 95 })
      })),
      ...Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
        type: 'content',
        item: faker.lorem.sentence(),
        reason: faker.lorem.sentence(),
        score: faker.number.int({ min: 70, max: 95 })
      }))
    ];
    
    const insight = new UserInsight({
      user: user._id,
      learningStyle: faker.helpers.arrayElement(learningStyles),
      preferredTopics,
      preferredContentTypes: [
        { type: 'article', score: faker.number.int({ min: 0, max: 100 }) },
        { type: 'video', score: faker.number.int({ min: 0, max: 100 }) },
        { type: 'interactive', score: faker.number.int({ min: 0, max: 100 }) }
      ],
      learningPatterns: {
        preferredTimeOfDay: faker.helpers.arrayElement(timeOfDay),
        averageSessionDuration: faker.number.int({ min: 600, max: 3600 }),
        sessionsPerWeek: faker.number.int({ min: 1, max: 14 }),
        consistencyScore: faker.number.int({ min: 0, max: 100 })
      },
      strengths,
      areasForImprovement,
      recommendations,
      lastUpdated: faker.date.recent({ days: 7 })
    });
    
    await insight.save();
  }
  
  const activityCount = await UserActivity.countDocuments();
  const progressCount = await LearningProgress.countDocuments();
  const insightCount = await UserInsight.countDocuments();
  
  console.log(`Created ${activityCount} user activities`);
  console.log(`Created ${progressCount} learning progress records`);
  console.log(`Created ${insightCount} user insights`);
}

// Handle process termination
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  });
});
