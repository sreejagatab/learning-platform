/**
 * Controller for handling learning-related requests
 * In development mode, can work without MongoDB connection
 */
const { validationResult } = require('express-validator');
const perplexityService = require('../services/perplexity.service');
const History = require('../models/history.model');
const Content = require('../models/content.model');
const logger = require('../utils/logger');

// Check if we're in development mode without MongoDB
const USE_MOCK_DB = process.env.NODE_ENV === 'development' &&
                    (!process.env.MONGO_URI || process.env.MONGO_URI === 'mongodb://localhost:27017/learnsphere');

// In-memory storage for development mode
const mockStorage = {
  history: [],
  content: [],
  generateId: () => `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
};

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

    // Create session ID for tracking conversation
    const sessionId = mockStorage.generateId();

    // Create history entry
    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      mockStorage.history.push({
        _id: mockStorage.generateId(),
        user: userId,
        query,
        response: response.content,
        citations: response.citations,
        followUps: [],
        sessionId,
        queryTimestamp: new Date()
      });

      logger.info('Using mock database for history storage');
    } else {
      // Use MongoDB in production
      await History.create({
        user: userId,
        query,
        response: response.content,
        citations: response.citations,
        sessionId,
        queryTimestamp: new Date()
      });
    }

    // Add session ID to response
    return res.json({
      ...response,
      sessionId
    });
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
    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      const historyEntry = mockStorage.history.find(h => h.sessionId === sessionId);

      if (historyEntry) {
        if (!historyEntry.followUps) {
          historyEntry.followUps = [];
        }

        historyEntry.followUps.push({
          query: followUpQuery,
          response: response.content,
          citations: response.citations,
          timestamp: new Date()
        });

        logger.info('Using mock database for follow-up storage');
      }
    } else {
      // Use MongoDB in production
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
    }

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

    let pathId;

    // Save learning path to database
    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      pathId = mockStorage.generateId();

      mockStorage.content.push({
        _id: pathId,
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

      logger.info('Using mock database for learning path storage');
    } else {
      // Use MongoDB in production
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

      pathId = savedPath._id;
    }

    return res.json({
      pathId,
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

    let contentId;

    // Save content to database
    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      contentId = mockStorage.generateId();

      mockStorage.content.push({
        _id: contentId,
        user: userId,
        type: type || 'note',
        title,
        content,
        metadata: metadata || {},
        createdAt: new Date()
      });

      logger.info('Using mock database for content storage');
    } else {
      // Use MongoDB in production
      const savedContent = await Content.create({
        user: userId,
        type: type || 'note',
        title,
        content,
        metadata: metadata || {},
        createdAt: new Date()
      });

      contentId = savedContent._id;
    }

    return res.json({
      success: true,
      contentId,
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

    let content = [];
    let total = 0;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      // Filter content by user and type
      let filteredContent = mockStorage.content.filter(item => item.user === userId);
      if (type) {
        filteredContent = filteredContent.filter(item => item.type === type);
      }

      // Sort by createdAt descending
      filteredContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination
      const skip = (page - 1) * limit;
      content = filteredContent.slice(skip, skip + parseInt(limit)).map(item => ({
        _id: item._id,
        title: item.title,
        type: item.type,
        createdAt: item.createdAt,
        metadata: item.metadata
      }));

      total = filteredContent.length;

      logger.info('Using mock database for content retrieval');
    } else {
      // Build query
      const query = { user: userId };
      if (type) query.type = type;

      // Pagination
      const skip = (page - 1) * limit;

      // Get content from database
      content = await Content.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('title type createdAt metadata');

      // Get total count
      total = await Content.countDocuments(query);
    }

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

    let content;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      content = mockStorage.content.find(item =>
        item._id === contentId && item.user === userId
      );

      logger.info('Using mock database for content retrieval by ID');
    } else {
      // Find content in MongoDB
      content = await Content.findOne({
        _id: contentId,
        user: userId
      });
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    return res.json(content);
  } catch (error) {
    logger.error(`Error in getContentById: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
