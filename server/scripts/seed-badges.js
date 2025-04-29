/**
 * Seed script for creating initial badges in the gamification system
 * Run with: node scripts/seed-badges.js
 */
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const config = require('config');
const { Badge } = require('../models/gamification.model');
const logger = require('../utils/logger');

// Initial badges data
const initialBadges = [
  // Learning badges
  {
    name: 'First Step',
    description: 'Complete your first learning session',
    icon: '/badges/first-step.png',
    category: 'learning',
    level: 1,
    criteria: {
      type: 'sessions',
      threshold: 1
    }
  },
  {
    name: 'Knowledge Seeker',
    description: 'Complete 10 learning sessions',
    icon: '/badges/knowledge-seeker.png',
    category: 'learning',
    level: 2,
    criteria: {
      type: 'sessions',
      threshold: 10
    }
  },
  {
    name: 'Learning Enthusiast',
    description: 'Complete 50 learning sessions',
    icon: '/badges/learning-enthusiast.png',
    category: 'learning',
    level: 3,
    criteria: {
      type: 'sessions',
      threshold: 50
    }
  },
  {
    name: 'Master Scholar',
    description: 'Complete 100 learning sessions',
    icon: '/badges/master-scholar.png',
    category: 'learning',
    level: 4,
    criteria: {
      type: 'sessions',
      threshold: 100
    }
  },
  
  // Streak badges
  {
    name: 'Consistent Learner',
    description: 'Maintain a 3-day learning streak',
    icon: '/badges/consistent-learner.png',
    category: 'engagement',
    level: 1,
    criteria: {
      type: 'streak',
      threshold: 3
    }
  },
  {
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: '/badges/week-warrior.png',
    category: 'engagement',
    level: 2,
    criteria: {
      type: 'streak',
      threshold: 7
    }
  },
  {
    name: 'Fortnight Focus',
    description: 'Maintain a 14-day learning streak',
    icon: '/badges/fortnight-focus.png',
    category: 'engagement',
    level: 3,
    criteria: {
      type: 'streak',
      threshold: 14
    }
  },
  {
    name: 'Monthly Master',
    description: 'Maintain a 30-day learning streak',
    icon: '/badges/monthly-master.png',
    category: 'engagement',
    level: 4,
    criteria: {
      type: 'streak',
      threshold: 30
    }
  },
  
  // Content creation badges
  {
    name: 'Note Taker',
    description: 'Create your first piece of content',
    icon: '/badges/note-taker.png',
    category: 'achievement',
    level: 1,
    criteria: {
      type: 'content',
      threshold: 1
    }
  },
  {
    name: 'Content Creator',
    description: 'Create 5 pieces of content',
    icon: '/badges/content-creator.png',
    category: 'achievement',
    level: 2,
    criteria: {
      type: 'content',
      threshold: 5
    }
  },
  {
    name: 'Knowledge Curator',
    description: 'Create 20 pieces of content',
    icon: '/badges/knowledge-curator.png',
    category: 'achievement',
    level: 3,
    criteria: {
      type: 'content',
      threshold: 20
    }
  },
  
  // Topic exploration badges
  {
    name: 'Explorer',
    description: 'Explore 3 different topics',
    icon: '/badges/explorer.png',
    category: 'learning',
    level: 1,
    criteria: {
      type: 'topics',
      threshold: 3
    }
  },
  {
    name: 'Polymath',
    description: 'Explore 10 different topics',
    icon: '/badges/polymath.png',
    category: 'learning',
    level: 3,
    criteria: {
      type: 'topics',
      threshold: 10
    }
  },
  
  // Question badges
  {
    name: 'Curious Mind',
    description: 'Ask 5 learning questions',
    icon: '/badges/curious-mind.png',
    category: 'learning',
    level: 1,
    criteria: {
      type: 'questions',
      threshold: 5
    }
  },
  {
    name: 'Inquisitive Thinker',
    description: 'Ask 25 learning questions',
    icon: '/badges/inquisitive-thinker.png',
    category: 'learning',
    level: 2,
    criteria: {
      type: 'questions',
      threshold: 25
    }
  },
  {
    name: 'Question Master',
    description: 'Ask 100 learning questions',
    icon: '/badges/question-master.png',
    category: 'learning',
    level: 3,
    criteria: {
      type: 'questions',
      threshold: 100
    }
  },
  
  // Time-based badges
  {
    name: 'Learning Hour',
    description: 'Spend 60 minutes learning',
    icon: '/badges/learning-hour.png',
    category: 'engagement',
    level: 1,
    criteria: {
      type: 'time',
      threshold: 60
    }
  },
  {
    name: 'Dedicated Student',
    description: 'Spend 5 hours learning',
    icon: '/badges/dedicated-student.png',
    category: 'engagement',
    level: 2,
    criteria: {
      type: 'time',
      threshold: 300
    }
  },
  {
    name: 'Learning Devotee',
    description: 'Spend 24 hours learning',
    icon: '/badges/learning-devotee.png',
    category: 'engagement',
    level: 3,
    criteria: {
      type: 'time',
      threshold: 1440
    }
  },
  {
    name: 'Knowledge Sage',
    description: 'Spend 100 hours learning',
    icon: '/badges/knowledge-sage.png',
    category: 'engagement',
    level: 4,
    criteria: {
      type: 'time',
      threshold: 6000
    }
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || config.get('mongoURI');
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected');
    return true;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    return false;
  }
};

// Seed badges
const seedBadges = async () => {
  try {
    // Connect to database
    const connected = await connectDB();
    if (!connected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Check if badges already exist
    const existingBadgesCount = await Badge.countDocuments();
    if (existingBadgesCount > 0) {
      logger.info(`${existingBadgesCount} badges already exist. Skipping seed.`);
      logger.info('To reseed, drop the badges collection first.');
      process.exit(0);
    }

    // Insert badges
    await Badge.insertMany(initialBadges);
    logger.info(`Successfully seeded ${initialBadges.length} badges`);

    // Disconnect from database
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
    process.exit(0);
  } catch (err) {
    logger.error(`Error seeding badges: ${err.message}`);
    process.exit(1);
  }
};

// Run the seed function
seedBadges();
