const express = require('express');
const {
  trackActivity,
  getLearningProgress,
  getUserInsights,
  getRecommendations,
  getPlatformAnalytics,
  getUserActivity
} = require('../controllers/analytics.controller');

const router = express.Router();

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Routes
router.post('/track', protect, trackActivity);
router.get('/progress', protect, getLearningProgress);
router.get('/insights', protect, getUserInsights);
router.get('/recommendations', protect, getRecommendations);
router.get('/activity', protect, getUserActivity);
router.get('/platform', protect, authorize('admin'), getPlatformAnalytics);

module.exports = router;
