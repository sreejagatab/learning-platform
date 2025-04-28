/**
 * Controller for handling learning-related requests
 */
const { validationResult } = require('express-validator');
const perplexityService = require('../services/perplexity.service');
const History = require('../models/history.model');
const Content = require('../models/content.model');
const logger = require('../utils/logger');

/**
 * Get educational response for a user query
 * @route POST /api/learning/query
 * @access Private
 */
exports.getResponse = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { query, options = {} } = req.body;
    const userId = req.user.id;

    // Get user preferences from options or use defaults
    const userContext = {
      level: options.level || 'intermediate',
      preferences: options.preferences || {},
      previousContext: options.previousContext || []
    };

    // Call Perplexity Sonar API
    const response = await perplexityService.querySonarAPI(query, userContext);

    // Create history entry
    await History.create({
      user: userId,
      query,
      response: response.content,
      citations: response.citations,
      queryTimestamp: new Date()
    });

    return res.json(response);
  } catch (error) {
    logger.error(`Error in getResponse: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Ask a follow-up question based on previous conversation
 * @route POST /api/learning/follow-up
 * @access Private
 */
exports.askFollowUp = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { followUpQuery, messages, sessionId } = req.body;
    const userId = req.user.id;

    // Get user context from database or request
    const userContext = {
      level: req.body.level || 'intermediate',
      preferences: req.body.preferences || {}
    };

    // Call Perplexity API for follow-up
    const response = await perplexityService.askFollowUpQuestion(
      followUpQuery,
      messages,
      userContext
    );

    // Update history with follow-up
    await History.findOneAndUpdate(
      { sessionId },
      { 
        $push: { 
          followUps: {
            query: followUpQuery,
            response: response.content,
            citations: response.citations,
            timestamp: new Date()
          } 
        } 
      },
      { new: true }
    );

    return res.json(response);
  } catch (error) {
    logger.error(`Error in askFollowUp: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Generate a learning path for a topic
 * @route POST /api/learning/path
 * @access Private
 */
exports.createLearningPath = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { topic } = req.body;
    const userId = req.user.id;

    // Get user preferences
    const userContext = {
      level: req.body.level || 'intermediate',
      preferences: req.body.preferences || {}
    };

    // Generate learning path
    const learningPath = await perplexityService.generateLearningPath(topic, userContext);

    // Save learning path to database
    const savedPath = await Content.create({
      user: userId,
      type: 'learning_path',
      title: `Learning Path: ${topic}`,
      content: learningPath.content,
      metadata: {
        topic,
        level: userContext.level,
        citations: learningPath.citations
      },
      createdAt: new Date()
    });

    return res.json({
      pathId: savedPath._id,
      ...learningPath
    });
  } catch (error) {
    logger.error(`Error in createLearningPath: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Save learning content to user's collection
 * @route POST /api/learning/save
 * @access Private
 */
exports.saveContent = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, content, type, metadata } = req.body;
    const userId = req.user.id;

    // Save content to database
    const savedContent = await Content.create({
      user: userId,
      type: type || 'note',
      title,
      content,
      metadata: metadata || {},
      createdAt: new Date()
    });

    return res.json({
      success: true,
      contentId: savedContent._id,
      message: 'Content saved successfully'
    });
  } catch (error) {
    logger.error(`Error in saveContent: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user's saved content
 * @route GET /api/learning/content
 * @access Private
 */
exports.getUserContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: userId };
    if (type) query.type = type;

    // Pagination
    const skip = (page - 1) * limit;

    // Get content from database
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title type createdAt metadata');

    // Get total count
    const total = await Content.countDocuments(query);

    return res.json({
      content,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Error in getUserContent: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get content by ID
 * @route GET /api/learning/content/:id
 * @access Private
 */
exports.getContentById = async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.id;

    // Find content
    const content = await Content.findOne({
      _id: contentId,
      user: userId
    });

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    return res.json(content);
  } catch (error) {
    logger.error(`Error in getContentById: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
