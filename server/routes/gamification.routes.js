const express = require('express');
const {
  getGamificationData,
  updateDailyGoal,
  recordActivity,
  getAllBadges,
  getUserBadges,
  getLeaderboard
} = require('../controllers/gamification.controller');

const router = express.Router();

// Import middleware
const { protect } = require('../middleware/auth');

// Routes
router.get('/', protect, getGamificationData);
router.put('/daily-goal', protect, updateDailyGoal);
router.post('/activity', protect, recordActivity);
router.get('/badges', protect, getAllBadges);
router.get('/my-badges', protect, getUserBadges);
router.get('/leaderboard', protect, getLeaderboard);

module.exports = router;
