const {
  UserActivity,
  LearningProgress,
  UserInsight,
  PlatformAnalytics
} = require('../models/analytics.model');
const User = require('../models/user.model');
const Content = require('../models/content.model');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * @desc    Track user activity
 * @route   POST /api/analytics/track
 * @access  Private
 */
exports.trackActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { activityType, details = {} } = req.body;

  if (!activityType) {
    return next(new ErrorResponse('Please provide an activity type', 400));
  }

  // Get client info from request
  const clientInfo = {
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || req.connection.remoteAddress,
    deviceType: getDeviceType(req.headers['user-agent'])
  };

  // Create activity record
  const activity = await UserActivity.create({
    user: userId,
    activityType,
    details,
    clientInfo
  });

  // Update learning progress if applicable
  if (activityType === 'learning_session' && details.sessionDuration) {
    await updateLearningProgress(userId, details);
  }

  // Update user insights periodically
  const shouldUpdateInsights = Math.random() < 0.1; // 10% chance to update insights on each activity
  if (shouldUpdateInsights) {
    // This is done asynchronously to not block the response
    updateUserInsights(userId).catch(err => {
      logger.error(`Error updating user insights: ${err.message}`);
    });
  }

  res.status(200).json({
    success: true,
    data: activity
  });
});

/**
 * @desc    Get user's learning progress
 * @route   GET /api/analytics/progress
 * @access  Private
 */
exports.getLearningProgress = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { topic } = req.query;

  let query = { user: userId };
  if (topic) {
    query.topic = topic;
  }

  const progress = await LearningProgress.find(query);

  res.status(200).json({
    success: true,
    count: progress.length,
    data: progress
  });
});

/**
 * @desc    Get user's insights
 * @route   GET /api/analytics/insights
 * @access  Private
 */
exports.getUserInsights = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find or create user insights
  let insights = await UserInsight.findOne({ user: userId });

  if (!insights) {
    // Create initial insights
    insights = await UserInsight.create({
      user: userId
    });

    // Generate initial insights asynchronously
    updateUserInsights(userId).catch(err => {
      logger.error(`Error generating initial user insights: ${err.message}`);
    });
  }

  res.status(200).json({
    success: true,
    data: insights
  });
});

/**
 * @desc    Get personalized recommendations
 * @route   GET /api/analytics/recommendations
 * @access  Private
 */
exports.getRecommendations = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { type, limit = 10 } = req.query;

  // Find user insights
  const insights = await UserInsight.findOne({ user: userId });

  if (!insights) {
    // If no insights exist yet, create them
    await updateUserInsights(userId);
    return res.status(200).json({
      success: true,
      data: []
    });
  }

  // Filter recommendations by type if specified
  let recommendations = insights.recommendations;
  if (type) {
    recommendations = recommendations.filter(rec => rec.type === type);
  }

  // Sort by score (highest first) and limit
  recommendations = recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, parseInt(limit));

  // If recommendations are content IDs, populate with content details
  if (recommendations.some(rec => rec.type === 'content')) {
    const contentIds = recommendations
      .filter(rec => rec.type === 'content')
      .map(rec => rec.item);

    if (contentIds.length > 0) {
      const contentItems = await Content.find({ _id: { $in: contentIds } })
        .select('title description type tags createdAt');

      // Merge content details with recommendations
      recommendations = recommendations.map(rec => {
        if (rec.type === 'content') {
          const contentItem = contentItems.find(
            item => item._id.toString() === rec.item
          );
          if (contentItem) {
            return {
              ...rec.toObject(),
              content: contentItem
            };
          }
        }
        return rec;
      });
    }
  }

  res.status(200).json({
    success: true,
    count: recommendations.length,
    data: recommendations
  });
});

/**
 * @desc    Get platform analytics (admin only)
 * @route   GET /api/analytics/platform
 * @access  Private/Admin
 */
exports.getPlatformAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  let query = {};
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const analytics = await PlatformAnalytics.find(query).sort({ date: -1 });

  res.status(200).json({
    success: true,
    count: analytics.length,
    data: analytics
  });
});

/**
 * @desc    Get user activity history
 * @route   GET /api/analytics/activity
 * @access  Private
 */
exports.getUserActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { activityType, startDate, endDate, limit = 50, page = 1 } = req.query;

  // Build query
  let query = { user: userId };
  
  if (activityType) {
    query.activityType = activityType;
  }
  
  if (startDate && endDate) {
    query.timestamp = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Execute query
  const activities = await UserActivity.find(query)
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const total = await UserActivity.countDocuments(query);

  res.status(200).json({
    success: true,
    count: activities.length,
    total,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    },
    data: activities
  });
});

/**
 * Helper function to determine device type from user agent
 * @param {string} userAgent - User agent string
 * @returns {string} - Device type (desktop, tablet, mobile, unknown)
 */
function getDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  
  userAgent = userAgent.toLowerCase();
  
  if (/ipad|tablet|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  
  if (/macintosh|windows|linux/i.test(userAgent)) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Helper function to update learning progress
 * @param {string} userId - User ID
 * @param {Object} details - Activity details
 */
async function updateLearningProgress(userId, details) {
  try {
    const { topic, subtopic, sessionDuration } = details;
    
    if (!topic || !sessionDuration) return;
    
    // Find or create learning progress record
    let progress = await LearningProgress.findOne({ user: userId, topic });
    
    if (!progress) {
      progress = new LearningProgress({
        user: userId,
        topic,
        subtopics: [],
        overallProgress: 0,
        timeSpent: 0
      });
    }
    
    // Update time spent
    progress.timeSpent += sessionDuration;
    progress.lastActivity = Date.now();
    
    // Update subtopic progress if provided
    if (subtopic) {
      const existingSubtopic = progress.subtopics.find(s => s.name === subtopic);
      
      if (existingSubtopic) {
        // Increment progress (capped at 100)
        existingSubtopic.progress = Math.min(100, existingSubtopic.progress + 5);
        existingSubtopic.lastUpdated = Date.now();
      } else {
        // Add new subtopic
        progress.subtopics.push({
          name: subtopic,
          progress: 5,
          lastUpdated: Date.now()
        });
      }
    }
    
    // Calculate overall progress
    if (progress.subtopics.length > 0) {
      const totalProgress = progress.subtopics.reduce((sum, s) => sum + s.progress, 0);
      progress.overallProgress = Math.min(100, Math.round(totalProgress / progress.subtopics.length));
    }
    
    await progress.save();
  } catch (err) {
    logger.error(`Error updating learning progress: ${err.message}`);
  }
}

/**
 * Helper function to update user insights
 * @param {string} userId - User ID
 */
async function updateUserInsights(userId) {
  try {
    // Get user activities
    const activities = await UserActivity.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(1000); // Analyze last 1000 activities
    
    if (activities.length === 0) return;
    
    // Get learning progress
    const progressRecords = await LearningProgress.find({ user: userId });
    
    // Find or create user insights
    let insights = await UserInsight.findOne({ user: userId });
    
    if (!insights) {
      insights = new UserInsight({
        user: userId,
        preferredTopics: [],
        preferredContentTypes: [],
        strengths: [],
        areasForImprovement: [],
        recommendations: []
      });
    }
    
    // Analyze learning style
    insights.learningStyle = analyzeLearningStyle(activities);
    
    // Analyze preferred topics
    insights.preferredTopics = analyzePreferredTopics(activities, progressRecords);
    
    // Analyze preferred content types
    insights.preferredContentTypes = analyzePreferredContentTypes(activities);
    
    // Analyze learning patterns
    insights.learningPatterns = analyzeLearningPatterns(activities);
    
    // Analyze strengths and areas for improvement
    const { strengths, areasForImprovement } = analyzeStrengthsAndWeaknesses(progressRecords);
    insights.strengths = strengths;
    insights.areasForImprovement = areasForImprovement;
    
    // Generate recommendations
    insights.recommendations = await generateRecommendations(
      userId,
      insights,
      activities,
      progressRecords
    );
    
    // Save insights
    await insights.save();
    
    return insights;
  } catch (err) {
    logger.error(`Error updating user insights: ${err.message}`);
    throw err;
  }
}

/**
 * Analyze user's learning style based on activities
 * @param {Array} activities - User activities
 * @returns {string} - Learning style
 */
function analyzeLearningStyle(activities) {
  // Count activities by type
  const contentViews = activities.filter(a => a.activityType === 'content_view');
  
  // Count by content type
  let visual = 0;
  let reading = 0;
  let interactive = 0;
  
  contentViews.forEach(activity => {
    const contentType = activity.details?.contentType;
    
    if (contentType === 'video' || contentType === 'image') {
      visual++;
    } else if (contentType === 'text' || contentType === 'article') {
      reading++;
    } else if (contentType === 'interactive' || contentType === 'quiz') {
      interactive++;
    }
  });
  
  // Determine dominant style
  const total = visual + reading + interactive;
  
  if (total === 0) return 'multimodal';
  
  const visualPercent = (visual / total) * 100;
  const readingPercent = (reading / total) * 100;
  const interactivePercent = (interactive / total) * 100;
  
  // If one style is clearly dominant (>50%)
  if (visualPercent > 50) return 'visual';
  if (readingPercent > 50) return 'reading';
  if (interactivePercent > 50) return 'kinesthetic';
  
  // If no clear dominance, return multimodal
  return 'multimodal';
}

/**
 * Analyze user's preferred topics
 * @param {Array} activities - User activities
 * @param {Array} progressRecords - Learning progress records
 * @returns {Array} - Preferred topics with scores
 */
function analyzePreferredTopics(activities, progressRecords) {
  // Count content views by topic
  const topicCounts = {};
  
  activities.forEach(activity => {
    if (activity.details?.metadata?.topic) {
      const topic = activity.details.metadata.topic;
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
  });
  
  // Add topics from progress records
  progressRecords.forEach(record => {
    topicCounts[record.topic] = (topicCounts[record.topic] || 0) + 
      Math.ceil(record.timeSpent / 60); // Add 1 count per minute spent
  });
  
  // Convert to array and calculate scores
  const topics = Object.keys(topicCounts);
  const maxCount = Math.max(...Object.values(topicCounts), 1);
  
  return topics.map(topic => ({
    topic,
    score: Math.min(100, Math.round((topicCounts[topic] / maxCount) * 100))
  })).sort((a, b) => b.score - a.score);
}

/**
 * Analyze user's preferred content types
 * @param {Array} activities - User activities
 * @returns {Array} - Preferred content types with scores
 */
function analyzePreferredContentTypes(activities) {
  // Count content views by type
  const typeCounts = {};
  
  activities.forEach(activity => {
    if (activity.activityType === 'content_view' && activity.details?.contentType) {
      const type = activity.details.contentType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }
  });
  
  // Convert to array and calculate scores
  const types = Object.keys(typeCounts);
  const maxCount = Math.max(...Object.values(typeCounts), 1);
  
  return types.map(type => ({
    type,
    score: Math.min(100, Math.round((typeCounts[type] / maxCount) * 100))
  })).sort((a, b) => b.score - a.score);
}

/**
 * Analyze user's learning patterns
 * @param {Array} activities - User activities
 * @returns {Object} - Learning patterns
 */
function analyzeLearningPatterns(activities) {
  // Default patterns
  const patterns = {
    preferredTimeOfDay: 'varied',
    averageSessionDuration: 0,
    sessionsPerWeek: 0,
    consistencyScore: 0
  };
  
  if (activities.length === 0) return patterns;
  
  // Analyze time of day
  const hourCounts = Array(24).fill(0);
  
  activities.forEach(activity => {
    const hour = new Date(activity.timestamp).getHours();
    hourCounts[hour]++;
  });
  
  const maxHourCount = Math.max(...hourCounts);
  const totalActivities = activities.length;
  
  // If more than 40% of activities happen in one time period, consider it preferred
  if (maxHourCount > totalActivities * 0.4) {
    const maxHour = hourCounts.indexOf(maxHourCount);
    
    if (maxHour >= 5 && maxHour < 12) {
      patterns.preferredTimeOfDay = 'morning';
    } else if (maxHour >= 12 && maxHour < 17) {
      patterns.preferredTimeOfDay = 'afternoon';
    } else if (maxHour >= 17 && maxHour < 22) {
      patterns.preferredTimeOfDay = 'evening';
    } else {
      patterns.preferredTimeOfDay = 'night';
    }
  }
  
  // Calculate average session duration
  const learningActivities = activities.filter(a => a.activityType === 'learning_session');
  
  if (learningActivities.length > 0) {
    const totalDuration = learningActivities.reduce(
      (sum, activity) => sum + (activity.details?.sessionDuration || 0),
      0
    );
    patterns.averageSessionDuration = Math.round(totalDuration / learningActivities.length);
  }
  
  // Calculate sessions per week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentSessions = learningActivities.filter(
    a => new Date(a.timestamp) >= oneWeekAgo
  );
  
  patterns.sessionsPerWeek = recentSessions.length;
  
  // Calculate consistency score
  const dayMap = {};
  const now = new Date();
  
  // Check last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dayMap[dateString] = 0;
  }
  
  // Count activities per day
  activities.forEach(activity => {
    const dateString = new Date(activity.timestamp).toISOString().split('T')[0];
    if (dayMap[dateString] !== undefined) {
      dayMap[dateString]++;
    }
  });
  
  // Count active days
  const activeDays = Object.values(dayMap).filter(count => count > 0).length;
  
  // Calculate consistency score (0-100)
  patterns.consistencyScore = Math.round((activeDays / 30) * 100);
  
  return patterns;
}

/**
 * Analyze user's strengths and areas for improvement
 * @param {Array} progressRecords - Learning progress records
 * @returns {Object} - Strengths and areas for improvement
 */
function analyzeStrengthsAndWeaknesses(progressRecords) {
  const strengths = [];
  const areasForImprovement = [];
  
  progressRecords.forEach(record => {
    const topic = record.topic;
    const progress = record.overallProgress;
    
    if (progress >= 70) {
      strengths.push({
        topic,
        score: progress
      });
    } else if (progress <= 40 && record.timeSpent > 0) {
      areasForImprovement.push({
        topic,
        score: 100 - progress // Invert score for areas of improvement
      });
    }
  });
  
  return {
    strengths: strengths.sort((a, b) => b.score - a.score),
    areasForImprovement: areasForImprovement.sort((a, b) => b.score - a.score)
  };
}

/**
 * Generate personalized recommendations
 * @param {string} userId - User ID
 * @param {Object} insights - User insights
 * @param {Array} activities - User activities
 * @param {Array} progressRecords - Learning progress records
 * @returns {Array} - Recommendations
 */
async function generateRecommendations(userId, insights, activities, progressRecords) {
  const recommendations = [];
  
  try {
    // 1. Recommend content based on preferred topics
    if (insights.preferredTopics.length > 0) {
      const preferredTopics = insights.preferredTopics
        .slice(0, 3)
        .map(t => t.topic);
      
      // Find content related to preferred topics
      const relatedContent = await Content.find({
        tags: { $in: preferredTopics },
        'metadata.author': { $ne: userId } // Exclude user's own content
      })
        .sort({ createdAt: -1 })
        .limit(5);
      
      // Add content recommendations
      relatedContent.forEach(content => {
        // Check if user has already viewed this content
        const alreadyViewed = activities.some(
          a => a.activityType === 'content_view' && 
               a.details?.contentId?.toString() === content._id.toString()
        );
        
        if (!alreadyViewed) {
          recommendations.push({
            type: 'content',
            item: content._id.toString(),
            reason: `Based on your interest in ${content.tags[0]}`,
            score: 90
          });
        }
      });
    }
    
    // 2. Recommend topics for improvement
    insights.areasForImprovement.forEach(area => {
      recommendations.push({
        type: 'topic',
        item: area.topic,
        reason: 'To improve your knowledge in this area',
        score: area.score
      });
    });
    
    // 3. Recommend features based on usage patterns
    const featureUsage = {};
    
    activities.forEach(activity => {
      if (activity.activityType === 'feature_use' && activity.details?.feature) {
        featureUsage[activity.details.feature] = 
          (featureUsage[activity.details.feature] || 0) + 1;
      }
    });
    
    // Recommend underused features
    const allFeatures = [
      'content_creation',
      'search',
      'question_asking',
      'learning_paths',
      'notes',
      'bookmarks'
    ];
    
    allFeatures.forEach(feature => {
      if (!featureUsage[feature] || featureUsage[feature] < 3) {
        recommendations.push({
          type: 'feature',
          item: feature,
          reason: 'Try this feature to enhance your learning experience',
          score: 70
        });
      }
    });
    
    // 4. Recommend learning paths
    // This would typically involve a more complex recommendation algorithm
    // For now, we'll add a simple recommendation
    recommendations.push({
      type: 'learning_path',
      item: 'beginner_to_advanced',
      reason: 'A structured learning path to improve your skills',
      score: 80
    });
    
    // Sort recommendations by score
    return recommendations.sort((a, b) => b.score - a.score);
  } catch (err) {
    logger.error(`Error generating recommendations: ${err.message}`);
    return [];
  }
}
