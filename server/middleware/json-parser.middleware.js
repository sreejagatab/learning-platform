/**
 * Enhanced JSON parser middleware with improved error handling
 */
const logger = require('../utils/logger');

/**
 * Middleware to enhance JSON parsing error handling
 * This middleware should be applied before express.json()
 */
const jsonParserMiddleware = (req, res, next) => {
  // Store the original data event handlers
  const originalDataHandlers = req.listeners('data');
  const originalEndHandlers = req.listeners('end');
  
  // Remove existing handlers
  req.removeAllListeners('data');
  req.removeAllListeners('end');
  
  // Raw request body for debugging
  let rawBody = '';
  
  // Add our own data handler to capture the raw body
  req.on('data', chunk => {
    rawBody += chunk.toString();
  });
  
  // Add our own end handler
  req.on('end', () => {
    // Store the raw body for debugging purposes
    req.rawBody = rawBody;
    
    // If the content-type is application/json, try to parse the body
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
      try {
        // Validate that the JSON is properly formatted
        if (rawBody.trim()) {
          // Try to parse the JSON
          req.body = JSON.parse(rawBody);
          
          // Log successful parsing for debugging
          logger.debug(`Successfully parsed JSON body for ${req.method} ${req.path}`);
        }
      } catch (error) {
        // Log the error and the raw body that caused it
        logger.error(`JSON parsing error for ${req.method} ${req.path}: ${error.message}`);
        logger.debug(`Raw body that caused the error: ${rawBody}`);
        
        // Create a detailed error response
        const errorPosition = error.message.match(/position (\d+)/);
        const errorLine = error.message.match(/line (\d+)/);
        const errorColumn = error.message.match(/column (\d+)/);
        
        let errorDetails = 'The request contains malformed JSON. Please check your request format.';
        if (errorPosition || errorLine || errorColumn) {
          errorDetails += ' Error detected at: ';
          if (errorLine && errorColumn) {
            errorDetails += `line ${errorLine[1]}, column ${errorColumn[1]}`;
          } else if (errorPosition) {
            errorDetails += `position ${errorPosition[1]}`;
          }
        }
        
        // Send a 400 Bad Request response with detailed error information
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          details: errorDetails,
          error: error.message
        });
      }
    }
    
    // Restore original handlers and continue
    originalDataHandlers.forEach(handler => {
      req.on('data', handler);
    });
    
    originalEndHandlers.forEach(handler => {
      req.on('end', handler);
    });
    
    // Continue to the next middleware
    next();
  });
};

module.exports = jsonParserMiddleware;
