/**
 * Controller for handling history-related requests
 */
const { validationResult } = require('express-validator');
const History = require('../models/history.model');
const logger = require('../utils/logger');

// Check if we're in development mode without MongoDB
const USE_MOCK_DB = process.env.NODE_ENV === 'development' &&
                    (!process.env.MONGO_URI || process.env.MONGO_URI === 'mongodb://localhost:27017/learnsphere');

// Reference to the mock storage from learning controller
// This is a workaround since we don't have direct access to the mockStorage object
// In a real application, this would be a shared module
const mockStorage = {
  history: [],
  generateId: () => `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
};

/**
 * Get user's learning history
 * @route GET /api/history
 * @access Private
 */
exports.getLearningHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, query = '' } = req.query;
    
    let history = [];
    let total = 0;
    
    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      // Filter history by user
      let filteredHistory = mockStorage.history.filter(item => item.user === userId);
      
      // Apply text search if query is provided
      if (query) {
        const searchTerms = query.toLowerCase().split(' ');
        filteredHistory = filteredHistory.filter(item => {
          const searchText = `${item.query} ${item.response}`.toLowerCase();
          return searchTerms.some(term => searchText.includes(term));
        });
      }
      
      // Sort by queryTimestamp descending
      filteredHistory.sort((a, b) => new Date(b.queryTimestamp) - new Date(a.queryTimestamp));
      
      // Apply pagination
      const skip = (page - 1) * limit;
      history = filteredHistory.slice(skip, skip + parseInt(limit));
      total = filteredHistory.length;
      
      logger.info('Using mock database for history retrieval');
    } else {
      // Build query
      const mongoQuery = { user: userId };
      
      // Text search if query is provided
      if (query) {
        mongoQuery.$text = { $search: query };
      }
      
      // Pagination
      const skip = (page - 1) * limit;
      
      // Get history from database
      history = await History.find(mongoQuery)
        .sort({ queryTimestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      // Get total count
      total = await History.countDocuments(mongoQuery);
    }
    
    return res.json({
      history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Error in getLearningHistory: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get history item by ID
 * @route GET /api/history/:id
 * @access Private
 */
exports.getHistoryById = async (req, res) => {
  try {
    const historyId = req.params.id;
    const userId = req.user.id;
    
    let historyItem;
    
    if (USE_MOCK_DB) {
      // Use in-memory storage in development mode
      historyItem = mockStorage.history.find(item => 
        item._id === historyId && item.user === userId
      );
      
      logger.info('Using mock database for history retrieval by ID');
    } else {
      // Find history in MongoDB
      historyItem = await History.findOne({
        _id: historyId,
        user: userId
      });
    }
    
    if (!historyItem) {
      return res.status(404).json({ message: 'History item not found' });
    }
    
    return res.json(historyItem);
  } catch (error) {
    logger.error(`Error in getHistoryById: ${error.message}`);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
