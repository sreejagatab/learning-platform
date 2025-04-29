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
  let details = null;

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';

    // Provide more detailed error information
    const errorPosition = err.message.match(/position (\d+)/);
    const errorLine = err.message.match(/line (\d+)/);
    const errorColumn = err.message.match(/column (\d+)/);

    let errorDetails = 'The request contains malformed JSON. Please check your request format.';
    if (errorPosition || errorLine || errorColumn) {
      errorDetails += ' Error detected at: ';
      if (errorLine && errorColumn) {
        errorDetails += `line ${errorLine[1]}, column ${errorColumn[1]}`;
      } else if (errorPosition) {
        errorDetails += `position ${errorPosition[1]}`;
      }
    }

    details = errorDetails;

    // Log the request body and headers for debugging
    logger.debug('Malformed JSON request body:', req.body);
    logger.debug('Request headers:', req.headers);

    // Try to log the raw request body if available
    if (req.rawBody) {
      logger.debug('Raw request body:', req.rawBody);
    }
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    details = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';

    // Get field name for more specific error message
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      details = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
    details = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Authentication error';
    details = 'Invalid token';
  }

  // Handle JWT expiry
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication error';
    details = 'Token expired';
  }

  // Return error response
  res.status(statusCode).json({
    success: false,
    message,
    details,
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = errorHandler;
