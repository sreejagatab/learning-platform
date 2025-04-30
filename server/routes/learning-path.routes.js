/**
 * Learning Path Routes
 * Handles API routes for advanced learning paths
 * Implements adaptive learning features, prerequisite mapping, and branching paths
 */
const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const auth = require('../middleware/auth.middleware');
const learningPathController = require('../controllers/learning-path.controller');

/**
 * @route   POST /api/learning-paths
 * @desc    Create a new learning path
 * @access  Private
 */
router.post(
  '/',
  [
    auth,
    [
      check('topic', 'Topic is required').not().isEmpty()
    ]
  ],
  learningPathController.createLearningPath
);

/**
 * @route   GET /api/learning-paths
 * @desc    Get all learning paths for the current user
 * @access  Private
 */
router.get(
  '/',
  auth,
  learningPathController.getUserLearningPaths
);

/**
 * @route   GET /api/learning-paths/:id
 * @desc    Get a learning path by ID
 * @access  Private
 */
router.get(
  '/:id',
  auth,
  learningPathController.getLearningPath
);

/**
 * @route   PUT /api/learning-paths/:id
 * @desc    Update a learning path
 * @access  Private
 */
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Title is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty()
    ]
  ],
  learningPathController.updateLearningPath
);

/**
 * @route   POST /api/learning-paths/:id/steps/:stepId/complete
 * @desc    Mark a step as completed
 * @access  Private
 */
router.post(
  '/:id/steps/:stepId/complete',
  auth,
  learningPathController.completeStep
);

/**
 * @route   POST /api/learning-paths/:id/checkpoints/:checkpointId
 * @desc    Take a checkpoint
 * @access  Private
 */
router.post(
  '/:id/checkpoints/:checkpointId',
  [
    auth,
    [
      check('answers', 'Answers are required').isArray()
    ]
  ],
  learningPathController.takeCheckpoint
);

/**
 * @route   GET /api/learning-paths/prerequisites
 * @desc    Get prerequisites for a topic
 * @access  Private
 */
router.get(
  '/prerequisites',
  [
    auth,
    [
      check('topic', 'Topic is required').not().isEmpty()
    ]
  ],
  learningPathController.getPrerequisites
);

/**
 * @route   POST /api/learning-paths/:id/branches
 * @desc    Create a branch in a learning path
 * @access  Private
 */
router.post(
  '/:id/branches',
  [
    auth,
    [
      check('branchName', 'Branch name is required').not().isEmpty()
    ]
  ],
  learningPathController.createBranch
);

/**
 * @route   POST /api/learning-paths/:id/adapt
 * @desc    Adapt a learning path based on user performance
 * @access  Private
 */
router.post(
  '/:id/adapt',
  [
    auth,
    [
      check('checkpointId', 'Checkpoint ID is required').not().isEmpty(),
      check('score', 'Score is required').isNumeric()
    ]
  ],
  learningPathController.adaptPath
);

module.exports = router;
