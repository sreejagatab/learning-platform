const mongoose = require('mongoose');

/**
 * Badge Schema - Represents achievements and badges users can earn
 */
const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['learning', 'engagement', 'achievement', 'special'],
    default: 'learning'
  },
  level: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  criteria: {
    type: {
      type: String,
      enum: ['sessions', 'streak', 'content', 'topics', 'questions', 'time'],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    additionalParams: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * User Gamification Schema - Tracks user's gamification progress
 */
const GamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    total: {
      type: Number,
      default: 0
    },
    history: [{
      amount: Number,
      reason: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  level: {
    current: {
      type: Number,
      default: 1
    },
    progress: {
      type: Number,
      default: 0
    },
    nextLevelAt: {
      type: Number,
      default: 100
    }
  },
  badges: [{
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    displayed: {
      type: Boolean,
      default: false
    }
  }],
  streak: {
    current: {
      type: Number,
      default: 0
    },
    longest: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date
    }
  },
  dailyGoals: {
    target: {
      type: Number,
      default: 10 // minutes of learning per day
    },
    progress: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    history: [{
      date: Date,
      completed: Boolean,
      progress: Number
    }]
  },
  achievements: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    icon: String
  }],
  stats: {
    sessionsCompleted: {
      type: Number,
      default: 0
    },
    questionsAsked: {
      type: Number,
      default: 0
    },
    contentCreated: {
      type: Number,
      default: 0
    },
    topicsExplored: {
      type: Number,
      default: 0
    },
    totalLearningTime: {
      type: Number, // in minutes
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create indexes
BadgeSchema.index({ name: 1 }, { unique: true });
BadgeSchema.index({ category: 1, level: 1 });
GamificationSchema.index({ user: 1 }, { unique: true });
GamificationSchema.index({ 'points.total': -1 }); // For leaderboards

// Pre-save hook to update lastUpdated
GamificationSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Method to add points
GamificationSchema.methods.addPoints = function(amount, reason) {
  this.points.total += amount;
  this.points.history.push({
    amount,
    reason,
    timestamp: Date.now()
  });
  
  // Update level progress
  this.level.progress += amount;
  
  // Check if user leveled up
  if (this.level.progress >= this.level.nextLevelAt) {
    this.level.current += 1;
    this.level.progress -= this.level.nextLevelAt;
    this.level.nextLevelAt = Math.floor(this.level.nextLevelAt * 1.5); // Increase points needed for next level
  }
  
  return this.save();
};

// Method to update streak
GamificationSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastActivity = this.streak.lastActivity || new Date(0);
  
  // Calculate days between last activity and now
  const daysSinceLastActivity = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastActivity === 0) {
    // Already logged in today, no streak update needed
    return this;
  } else if (daysSinceLastActivity === 1) {
    // Consecutive day, increase streak
    this.streak.current += 1;
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }
  } else {
    // Streak broken
    this.streak.current = 1;
  }
  
  this.streak.lastActivity = now;
  return this.save();
};

// Method to update daily goals
GamificationSchema.methods.updateDailyGoal = function(progress) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastUpdate = new Date(this.dailyGoals.lastUpdated);
  lastUpdate.setHours(0, 0, 0, 0);
  
  // Check if this is a new day
  if (today.getTime() !== lastUpdate.getTime()) {
    // Save yesterday's progress to history
    this.dailyGoals.history.push({
      date: this.dailyGoals.lastUpdated,
      completed: this.dailyGoals.progress >= this.dailyGoals.target,
      progress: this.dailyGoals.progress
    });
    
    // Reset progress for today
    this.dailyGoals.progress = 0;
  }
  
  // Add today's progress
  this.dailyGoals.progress += progress;
  this.dailyGoals.lastUpdated = new Date();
  
  return this.save();
};

// Create models
const Badge = mongoose.model('Badge', BadgeSchema);
const Gamification = mongoose.model('Gamification', GamificationSchema);

module.exports = { Badge, Gamification };
