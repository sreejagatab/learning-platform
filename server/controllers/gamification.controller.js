const { Badge, Gamification } = require('../models/gamification.model');
const User = require('../models/user.model');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');

/**
 * @desc    Get user's gamification data
 * @route   GET /api/gamification
 * @access  Private
 */
exports.getGamificationData = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find user's gamification data or create if it doesn't exist
  let gamificationData = await Gamification.findOne({ user: userId })
    .populate('badges.badge');

  if (!gamificationData) {
    // Create new gamification profile for user
    gamificationData = await Gamification.create({
      user: userId
    });

    // Update user reference
    await User.findByIdAndUpdate(userId, { gamification: gamificationData._id });
  }

  res.status(200).json({
    success: true,
    data: gamificationData
  });
});

/**
 * @desc    Update user's daily goal
 * @route   PUT /api/gamification/daily-goal
 * @access  Private
 */
exports.updateDailyGoal = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { target } = req.body;

  if (!target || target < 1) {
    return next(new ErrorResponse('Please provide a valid daily goal target', 400));
  }

  // Find user's gamification data
  let gamificationData = await Gamification.findOne({ user: userId });

  if (!gamificationData) {
    // Create new gamification profile for user
    gamificationData = await Gamification.create({
      user: userId
    });

    // Update user reference
    await User.findByIdAndUpdate(userId, { gamification: gamificationData._id });
  }

  // Update daily goal target
  gamificationData.dailyGoals.target = target;
  await gamificationData.save();

  res.status(200).json({
    success: true,
    data: gamificationData.dailyGoals
  });
});

/**
 * @desc    Record learning activity and update gamification data
 * @route   POST /api/gamification/activity
 * @access  Private
 */
exports.recordActivity = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { activityType, duration, details } = req.body;

  if (!activityType) {
    return next(new ErrorResponse('Please provide an activity type', 400));
  }

  // Find user's gamification data
  let gamificationData = await Gamification.findOne({ user: userId });

  if (!gamificationData) {
    // Create new gamification profile for user
    gamificationData = await Gamification.create({
      user: userId
    });

    // Update user reference
    await User.findByIdAndUpdate(userId, { gamification: gamificationData._id });
  }

  // Update streak
  await gamificationData.updateStreak();

  // Award points based on activity type
  let pointsAwarded = 0;
  let reason = '';

  switch (activityType) {
    case 'learning_session':
      pointsAwarded = Math.floor(duration / 60) * 5; // 5 points per minute
      reason = 'Completed a learning session';
      gamificationData.stats.sessionsCompleted += 1;
      gamificationData.stats.totalLearningTime += duration;
      break;
    case 'question_asked':
      pointsAwarded = 2;
      reason = 'Asked a learning question';
      gamificationData.stats.questionsAsked += 1;
      break;
    case 'content_created':
      pointsAwarded = 10;
      reason = 'Created learning content';
      gamificationData.stats.contentCreated += 1;
      break;
    case 'topic_explored':
      pointsAwarded = 5;
      reason = 'Explored a new topic';
      gamificationData.stats.topicsExplored += 1;
      break;
    default:
      pointsAwarded = 1;
      reason = 'Learning activity';
  }

  // Add points
  await gamificationData.addPoints(pointsAwarded, reason);

  // Update daily goal progress if duration is provided
  if (duration && duration > 0) {
    await gamificationData.updateDailyGoal(duration);
  }

  // Check for badges that can be awarded
  await checkAndAwardBadges(gamificationData);

  res.status(200).json({
    success: true,
    data: {
      pointsAwarded,
      newTotal: gamificationData.points.total,
      streak: gamificationData.streak,
      level: gamificationData.level,
      dailyGoals: gamificationData.dailyGoals
    }
  });
});

/**
 * @desc    Get all available badges
 * @route   GET /api/gamification/badges
 * @access  Private
 */
exports.getAllBadges = asyncHandler(async (req, res, next) => {
  const badges = await Badge.find();

  res.status(200).json({
    success: true,
    count: badges.length,
    data: badges
  });
});

/**
 * @desc    Get user's badges
 * @route   GET /api/gamification/my-badges
 * @access  Private
 */
exports.getUserBadges = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Find user's gamification data
  const gamificationData = await Gamification.findOne({ user: userId })
    .populate('badges.badge');

  if (!gamificationData) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: []
    });
  }

  res.status(200).json({
    success: true,
    count: gamificationData.badges.length,
    data: gamificationData.badges
  });
});

/**
 * @desc    Get leaderboard
 * @route   GET /api/gamification/leaderboard
 * @access  Private
 */
exports.getLeaderboard = asyncHandler(async (req, res, next) => {
  const leaderboard = await Gamification.find()
    .sort({ 'points.total': -1 })
    .limit(10)
    .populate('user', 'name avatar');

  res.status(200).json({
    success: true,
    data: leaderboard.map(entry => ({
      user: {
        id: entry.user._id,
        name: entry.user.name,
        avatar: entry.user.avatar
      },
      points: entry.points.total,
      level: entry.level.current,
      streak: entry.streak.current,
      badges: entry.badges.length
    }))
  });
});

/**
 * Helper function to check and award badges based on user's stats
 * @param {Object} gamificationData - User's gamification data
 */
async function checkAndAwardBadges(gamificationData) {
  try {
    // Get all badges
    const badges = await Badge.find();

    // Check each badge criteria
    for (const badge of badges) {
      // Skip if user already has this badge
      const hasBadge = gamificationData.badges.some(
        userBadge => userBadge.badge.toString() === badge._id.toString()
      );

      if (hasBadge) continue;

      // Check if user meets badge criteria
      let meetsRequirements = false;

      switch (badge.criteria.type) {
        case 'sessions':
          meetsRequirements = gamificationData.stats.sessionsCompleted >= badge.criteria.threshold;
          break;
        case 'streak':
          meetsRequirements = gamificationData.streak.current >= badge.criteria.threshold;
          break;
        case 'content':
          meetsRequirements = gamificationData.stats.contentCreated >= badge.criteria.threshold;
          break;
        case 'topics':
          meetsRequirements = gamificationData.stats.topicsExplored >= badge.criteria.threshold;
          break;
        case 'questions':
          meetsRequirements = gamificationData.stats.questionsAsked >= badge.criteria.threshold;
          break;
        case 'time':
          meetsRequirements = gamificationData.stats.totalLearningTime >= badge.criteria.threshold;
          break;
      }

      // Award badge if requirements are met
      if (meetsRequirements) {
        gamificationData.badges.push({
          badge: badge._id,
          earnedAt: Date.now(),
          displayed: false
        });

        // Add achievement
        gamificationData.achievements.push({
          name: badge.name,
          description: badge.description,
          earnedAt: Date.now(),
          icon: badge.icon
        });

        // Award bonus points for earning a badge
        await gamificationData.addPoints(
          badge.level * 20, // Points based on badge level
          `Earned the ${badge.name} badge`
        );

        logger.info(`User ${gamificationData.user} earned badge: ${badge.name}`);
      }
    }

    await gamificationData.save();
  } catch (err) {
    logger.error(`Error awarding badges: ${err.message}`);
  }
}
