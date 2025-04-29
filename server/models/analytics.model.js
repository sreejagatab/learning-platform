const mongoose = require('mongoose');

/**
 * User Activity Schema - Tracks individual user actions
 */
const UserActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'login',
      'content_view',
      'content_create',
      'content_edit',
      'search',
      'question_asked',
      'learning_session',
      'page_view',
      'feature_use'
    ],
    required: true
  },
  details: {
    // For content_view, content_create, content_edit
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content'
    },
    contentType: String,
    
    // For search, question_asked
    query: String,
    
    // For page_view
    page: String,
    
    // For feature_use
    feature: String,
    
    // For learning_session
    sessionDuration: Number, // in seconds
    sessionId: String,
    
    // Additional metadata
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Client information
  clientInfo: {
    userAgent: String,
    ipAddress: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown'],
      default: 'unknown'
    }
  }
});

/**
 * Learning Progress Schema - Tracks user's learning progress
 */
const LearningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  subtopics: [{
    name: String,
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
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
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * User Insights Schema - Stores computed insights about user behavior
 */
const UserInsightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'reading', 'kinesthetic', 'multimodal'],
    default: 'multimodal'
  },
  preferredTopics: [{
    topic: String,
    score: Number // 0-100 score indicating preference level
  }],
  preferredContentTypes: [{
    type: String,
    score: Number // 0-100 score indicating preference level
  }],
  learningPatterns: {
    preferredTimeOfDay: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'night', 'varied'],
      default: 'varied'
    },
    averageSessionDuration: Number, // in seconds
    sessionsPerWeek: Number,
    consistencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  strengths: [{
    topic: String,
    score: Number // 0-100 score
  }],
  areasForImprovement: [{
    topic: String,
    score: Number // 0-100 score
  }],
  recommendations: [{
    type: {
      type: String,
      enum: ['topic', 'content', 'feature', 'learning_path'],
      required: true
    },
    item: String, // Topic name, content ID, feature name, etc.
    reason: String,
    score: Number, // 0-100 relevance score
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

/**
 * Platform Analytics Schema - Stores aggregate platform-wide analytics
 */
const PlatformAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  activeUsers: {
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  newUsers: Number,
  totalSessions: Number,
  averageSessionDuration: Number, // in seconds
  topSearchQueries: [{
    query: String,
    count: Number
  }],
  topTopics: [{
    topic: String,
    count: Number
  }],
  contentCreated: {
    total: Number,
    byType: {
      type: Map,
      of: Number
    }
  },
  questionsAsked: Number,
  userRetention: {
    daily: Number, // percentage
    weekly: Number, // percentage
    monthly: Number // percentage
  },
  deviceUsage: {
    desktop: Number, // percentage
    tablet: Number, // percentage
    mobile: Number // percentage
  }
});

// Create indexes
UserActivitySchema.index({ user: 1, timestamp: -1 });
UserActivitySchema.index({ activityType: 1, timestamp: -1 });
UserActivitySchema.index({ 'details.contentId': 1 });
UserActivitySchema.index({ 'details.query': 'text' });

LearningProgressSchema.index({ user: 1, topic: 1 }, { unique: true });
LearningProgressSchema.index({ topic: 1 });
LearningProgressSchema.index({ 'subtopics.name': 1 });

UserInsightSchema.index({ user: 1 }, { unique: true });
UserInsightSchema.index({ 'preferredTopics.topic': 1 });
UserInsightSchema.index({ 'recommendations.item': 1 });

PlatformAnalyticsSchema.index({ date: -1 });

// Pre-save hooks
LearningProgressSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

UserInsightSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Create models
const UserActivity = mongoose.model('UserActivity', UserActivitySchema);
const LearningProgress = mongoose.model('LearningProgress', LearningProgressSchema);
const UserInsight = mongoose.model('UserInsight', UserInsightSchema);
const PlatformAnalytics = mongoose.model('PlatformAnalytics', PlatformAnalyticsSchema);

module.exports = {
  UserActivity,
  LearningProgress,
  UserInsight,
  PlatformAnalytics
};
