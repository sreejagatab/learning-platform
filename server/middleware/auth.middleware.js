const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/user.model');
const logger = require('../utils/logger');

/**
 * Protect routes - authentication middleware
 */
module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || config.get('jwtSecret'));
    
    // Add user from payload
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found, authorization denied' });
    }
    
    // Update last active timestamp occasionally (not on every request)
    const ACTIVITY_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes
    if (user.lastActive && (Date.now() - new Date(user.lastActive).getTime() > ACTIVITY_UPDATE_INTERVAL)) {
      user.lastActive = Date.now();
      await user.save({ validateBeforeSave: false });
    }
    
    // Set user in request
    req.user = {
      id: user._id,
      role: user.role
    };
    
    next();
  } catch (err) {
    logger.error(`Auth middleware error: ${err.message}`);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
