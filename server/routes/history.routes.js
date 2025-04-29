const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const historyController = require('../controllers/history.controller');

/**
 * @route   GET /api/history
 * @desc    Get user's learning history
 * @access  Private
 */
router.get('/', auth, historyController.getLearningHistory);

/**
 * @route   GET /api/history/:id
 * @desc    Get history item by ID
 * @access  Private
 */
router.get('/:id', auth, historyController.getHistoryById);

module.exports = router;
