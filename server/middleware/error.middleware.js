const logger = require('../utils/logger');

/**
 * Custom error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error(`[${req.method}] ${req.path} >> ${err.message}`);
  logger.error(err.stack);

  // Set default error status and message
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    
    // Get field name for more specific error message
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Handle JWT expiry
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Return error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = errorHandler;
