/**
 * Controller for handling content-related requests
 */
const { validationResult } = require('express-validator');
const Content = require('../models/content.model');
const logger = require('../utils/logger');
const { invalidateCache, invalidateCachePattern } = require('../middleware/cache.middleware');

// Check if we're in development mode without MongoDB
const USE_MOCK_DB = process.env.NODE_ENV === 'development' &&
                    (!process.env.MONGO_URI || process.env.MONGO_URI === 'mongodb://localhost:27017/learnsphere');

// Reference to the mock storage
// This is a workaround since we don't have direct access to the mockStorage object
// In a real application, this would be a shared module
const mockStorage = {
  content: [],
  generateId: () => `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
};

/**
 * Get user's saved content
 * @route GET /api/learning/content
 * @access Private
 */
exports.getUserContent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type = null } = req.query;

    let content = [];
    let total = 0;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      // Filter content by user
      let filteredContent = mockStorage.content.filter(item => item.user === userId);

      // Filter by type if provided
      if (type) {
        filteredContent = filteredContent.filter(item => item.type === type);
      }

      // Sort by createdAt descending
      filteredContent.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Apply pagination
      const skip = (page - 1) * limit;
      content = filteredContent.slice(skip, skip + parseInt(limit));
      total = filteredContent.length;

      logger.info('Using mock database for content retrieval');
    } else {
      // Build query
      const mongoQuery = { user: userId };

      // Filter by type if provided
      if (type) {
        mongoQuery.type = type;
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Get content from database
      content = await Content.find(mongoQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      // Get total count
      total = await Content.countDocuments(mongoQuery);
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

    let contentItem;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      contentItem = mockStorage.content.find(item =>
        item._id === contentId && item.user === userId
      );

      logger.info('Using mock database for content retrieval by ID');
    } else {
      // Find content in MongoDB
      contentItem = await Content.findOne({
        _id: contentId,
        user: userId
      });
    }

    if (!contentItem) {
      return res.status(404).json({ message: 'Content not found' });
    }

    return res.json(contentItem);
  } catch (error) {
    logger.error(`Error in getContentById: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create new content
 * @route POST /api/learning/content
 * @access Private
 */
exports.createContent = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Log the request body for debugging
    logger.debug('Content creation request body:', JSON.stringify(req.body));

    // Extract data from request body with proper validation
    const { title, content, type = 'note', metadata = {} } = req.body;
    const userId = req.user.id;

    // Validate required fields again (belt and suspenders)
    if (!title || !content) {
      return res.status(400).json({
        message: 'Missing required fields',
        details: 'Title and content are required fields',
        receivedData: {
          title: title ? 'Provided' : 'Missing',
          content: content ? 'Provided' : 'Missing'
        }
      });
    }

    // Create new content object
    const newContent = {
      title,
      content,
      type,
      user: userId,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedContent;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      newContent._id = mockStorage.generateId();
      mockStorage.content.push(newContent);
      savedContent = newContent;

      logger.info('Using mock database for content creation');
    } else {
      // Save to MongoDB
      const contentModel = new Content(newContent);
      savedContent = await contentModel.save();
    }

    // Invalidate content cache for this user
    invalidateCachePattern(new RegExp(`^/api/learning/content\\?.*user=${userId}`));

    // Return a consistent response format
    return res.status(201).json({
      success: true,
      message: 'Content created successfully',
      _id: savedContent._id,
      data: savedContent
    });
  } catch (error) {
    logger.error(`Error in createContent: ${error.message}`);
    logger.error(error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating content',
      error: error.message
    });
  }
};

/**
 * Update content
 * @route PUT /api/learning/content/:id
 * @access Private
 */
exports.updateContent = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contentId = req.params.id;
    const userId = req.user.id;
    const { title, content, type, metadata } = req.body;

    // Build update object
    const updateData = {
      title,
      content,
      type,
      metadata,
      updatedAt: new Date()
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key =>
      updateData[key] === undefined && delete updateData[key]
    );

    let updatedContent;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      const contentIndex = mockStorage.content.findIndex(item =>
        item._id === contentId && item.user === userId
      );

      if (contentIndex === -1) {
        return res.status(404).json({ message: 'Content not found' });
      }

      // Update content
      mockStorage.content[contentIndex] = {
        ...mockStorage.content[contentIndex],
        ...updateData
      };

      updatedContent = mockStorage.content[contentIndex];

      logger.info('Using mock database for content update');
    } else {
      // Update in MongoDB
      updatedContent = await Content.findOneAndUpdate(
        { _id: contentId, user: userId },
        { $set: updateData },
        { new: true }
      );

      if (!updatedContent) {
        return res.status(404).json({ message: 'Content not found' });
      }
    }

    // Invalidate specific content cache
    invalidateCache(`/api/learning/content/${contentId}`);

    // Invalidate content list cache for this user
    invalidateCachePattern(new RegExp(`^/api/learning/content\\?.*user=${userId}`));

    return res.json(updatedContent);
  } catch (error) {
    logger.error(`Error in updateContent: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete content
 * @route DELETE /api/learning/content/:id
 * @access Private
 */
exports.deleteContent = async (req, res) => {
  try {
    const contentId = req.params.id;
    const userId = req.user.id;

    let result;

    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      const contentIndex = mockStorage.content.findIndex(item =>
        item._id === contentId && item.user === userId
      );

      if (contentIndex === -1) {
        return res.status(404).json({ message: 'Content not found' });
      }

      // Remove content
      mockStorage.content.splice(contentIndex, 1);
      result = { success: true };

      logger.info('Using mock database for content deletion');
    } else {
      // Delete from MongoDB
      result = await Content.findOneAndDelete({ _id: contentId, user: userId });

      if (!result) {
        return res.status(404).json({ message: 'Content not found' });
      }
    }

    // Invalidate specific content cache
    invalidateCache(`/api/learning/content/${contentId}`);

    // Invalidate content list cache for this user
    invalidateCachePattern(new RegExp(`^/api/learning/content\\?.*user=${userId}`));

    return res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteContent: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
