/**
 * Learning Path Controller
 * Handles API requests related to advanced learning paths
 * Implements adaptive learning features, prerequisite mapping, and branching paths
 */
const { validationResult } = require('express-validator');
const learningPathService = require('../services/learning-path.service');
const logger = require('../utils/logger');

/**
 * Create a new learning path
 * @route POST /api/learning-paths
 * @access Private
 */
exports.createLearningPath = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { topic, level, preferences } = req.body;
    const userId = req.user.id;

    // Get user preferences
    const userContext = {
      level: level || 'intermediate',
      preferences: preferences || {}
    };

    // Create the learning path
    const learningPath = await learningPathService.createLearningPath(topic, userContext, userId);

    return res.json(learningPath);
  } catch (error) {
    logger.error(`Error in createLearningPath: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a learning path by ID
 * @route GET /api/learning-paths/:id
 * @access Private
 */
exports.getLearningPath = async (req, res) => {
  try {
    const pathId = req.params.id;
    const learningPath = await learningPathService.getLearningPathById(pathId);

    // Check if the path belongs to the user
    if (learningPath.user.toString() !== req.user.id && !learningPath.isPublic) {
      return res.status(403).json({ message: 'Not authorized to access this learning path' });
    }

    return res.json(learningPath);
  } catch (error) {
    logger.error(`Error in getLearningPath: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update a learning path
 * @route PUT /api/learning-paths/:id
 * @access Private
 */
exports.updateLearningPath = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pathId = req.params.id;
    const updates = req.body;

    // Get the current path to check ownership
    const currentPath = await learningPathService.getLearningPathById(pathId);

    // Check if the path belongs to the user
    if (currentPath.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this learning path' });
    }

    // Update the learning path
    const updatedPath = await learningPathService.updateLearningPath(pathId, updates);

    return res.json(updatedPath);
  } catch (error) {
    logger.error(`Error in updateLearningPath: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Complete a step in a learning path
 * @route POST /api/learning-paths/:id/steps/:stepId/complete
 * @access Private
 */
exports.completeStep = async (req, res) => {
  try {
    const { id: pathId, stepId } = req.params;

    // Get the current path to check ownership
    const currentPath = await learningPathService.getLearningPathById(pathId);

    // Check if the path belongs to the user
    if (currentPath.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this learning path' });
    }

    // Complete the step
    const updatedPath = await learningPathService.completeStep(pathId, stepId);

    return res.json(updatedPath);
  } catch (error) {
    logger.error(`Error in completeStep: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Take a checkpoint in a learning path
 * @route POST /api/learning-paths/:id/checkpoints/:checkpointId
 * @access Private
 */
exports.takeCheckpoint = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id: pathId, checkpointId } = req.params;
    const { answers } = req.body;

    // Get the current path to check ownership
    const currentPath = await learningPathService.getLearningPathById(pathId);

    // Check if the path belongs to the user
    if (currentPath.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this learning path' });
    }

    // Take the checkpoint
    const result = await learningPathService.takeCheckpoint(pathId, checkpointId, answers);

    return res.json(result);
  } catch (error) {
    logger.error(`Error in takeCheckpoint: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get learning paths for the current user
 * @route GET /api/learning-paths
 * @access Private
 */
exports.getUserLearningPaths = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit, skip, sort } = req.query;

    // Parse query parameters
    const options = {
      limit: limit ? parseInt(limit) : 10,
      skip: skip ? parseInt(skip) : 0,
      sort: sort ? JSON.parse(sort) : { createdAt: -1 }
    };

    // Get the user's learning paths
    const paths = await learningPathService.getUserLearningPaths(userId, options);

    return res.json(paths);
  } catch (error) {
    logger.error(`Error in getUserLearningPaths: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get prerequisites for a topic
 * @route GET /api/learning-paths/prerequisites
 * @access Private
 */
exports.getPrerequisites = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { topic, level } = req.query;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required' });
    }

    // Get prerequisites for the topic
    const prerequisites = await learningPathService.identifyPrerequisites(topic, level || 'intermediate');

    return res.json(prerequisites);
  } catch (error) {
    logger.error(`Error in getPrerequisites: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a branch in a learning path
 * @route POST /api/learning-paths/:id/branches
 * @access Private
 */
exports.createBranch = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pathId = req.params.id;
    const { branchName, condition, topic, description, level } = req.body;

    if (!branchName) {
      return res.status(400).json({ message: 'Branch name is required' });
    }

    // Get the current path to check ownership
    const currentPath = await learningPathService.getLearningPathById(pathId);

    // Check if the path belongs to the user
    if (currentPath.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this learning path' });
    }

    // Create the branch
    const branchData = { topic, description, level };
    const updatedPath = await learningPathService.createBranch(pathId, branchName, condition, branchData);

    return res.json(updatedPath);
  } catch (error) {
    logger.error(`Error in createBranch: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Adapt a learning path based on user performance
 * @route POST /api/learning-paths/:id/adapt
 * @access Private
 */
exports.adaptPath = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const pathId = req.params.id;
    const { checkpointId, score, areas } = req.body;

    if (!checkpointId || score === undefined) {
      return res.status(400).json({ message: 'Checkpoint ID and score are required' });
    }

    // Get the current path to check ownership
    const currentPath = await learningPathService.getLearningPathById(pathId);

    // Check if the path belongs to the user
    if (currentPath.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this learning path' });
    }

    // Adapt the path based on performance
    const performanceData = { checkpointId, score, areas };
    const updatedPath = await learningPathService.adaptPathBasedOnPerformance(pathId, performanceData);

    return res.json(updatedPath);
  } catch (error) {
    logger.error(`Error in adaptPath: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
