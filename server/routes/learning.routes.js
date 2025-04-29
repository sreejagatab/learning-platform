const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const learningController = require('../controllers/learning.controller');
const contentController = require('../controllers/content.controller');

/**
 * @route   POST /api/learning/query
 * @desc    Get educational response for a query
 * @access  Private
 */
router.post(
  '/query',
  [
    auth,
    [
      check('query', 'Query is required').not().isEmpty()
    ]
  ],
  learningController.getResponse
);

/**
 * @route   POST /api/learning/follow-up
 * @desc    Ask a follow-up question
 * @access  Private
 */
router.post(
  '/follow-up',
  [
    auth,
    [
      check('followUpQuery', 'Follow-up query is required').not().isEmpty(),
      check('messages', 'Previous messages are required').isArray(),
      check('sessionId', 'Session ID is required').not().isEmpty()
    ]
  ],
  learningController.askFollowUp
);

/**
 * @route   POST /api/learning/path
 * @desc    Generate a learning path for a topic
 * @access  Private
 */
router.post(
  '/path',
  [
    auth,
    [
      check('topic', 'Topic is required').not().isEmpty()
    ]
  ],
  learningController.createLearningPath
);

/**
 * @route   POST /api/learning/save
 * @desc    Save learning content
 * @access  Private
 */
router.post(
  '/save',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  learningController.saveContent
);

/**
 * @route   GET /api/learning/content
 * @desc    Get user's saved content
 * @access  Private
 */
router.get('/content', auth, contentController.getUserContent);

/**
 * @route   GET /api/learning/content/:id
 * @desc    Get content by ID
 * @access  Private
 */
router.get('/content/:id', auth, contentController.getContentById);

/**
 * @route   POST /api/learning/content
 * @desc    Create new content
 * @access  Private
 */
router.post(
  '/content',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  contentController.createContent
);

/**
 * @route   PUT /api/learning/content/:id
 * @desc    Update content
 * @access  Private
 */
router.put(
  '/content/:id',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('content', 'Content is required').not().isEmpty()
    ]
  ],
  contentController.updateContent
);

/**
 * @route   DELETE /api/learning/content/:id
 * @desc    Delete content
 * @access  Private
 */
router.delete('/content/:id', auth, contentController.deleteContent);

module.exports = router;
