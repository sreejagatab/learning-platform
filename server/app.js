const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('config');
const path = require('path');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/error.middleware');
const jsonParserMiddleware = require('./middleware/json-parser.middleware');
const { cacheMiddleware } = require('./middleware/cache.middleware');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses

// Apply enhanced JSON parser middleware
app.use(jsonParserMiddleware);

// Parse JSON bodies with improved error handling
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // This will only run if JSON parsing was successful
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// CORS configuration
const corsOptions = {
  origin: config.get('corsOrigin') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Cache middleware configuration
const contentCacheConfig = {
  ttl: 300, // 5 minutes cache for content
  methods: ['GET']
};

const userCacheConfig = {
  ttl: 60, // 1 minute cache for user data
  methods: ['GET']
};

// API routes with cache middleware where appropriate
app.use('/api/auth', require('./routes/auth.routes')); // No cache for auth routes
app.use('/api/learning', cacheMiddleware(contentCacheConfig), require('./routes/learning.routes'));
app.use('/api/learning-paths', require('./routes/learning-path.routes')); // Advanced learning paths
app.use('/api/users', cacheMiddleware(userCacheConfig), require('./routes/user.routes'));
app.use('/api/history', cacheMiddleware(contentCacheConfig), require('./routes/history.routes'));
app.use('/api/gamification', require('./routes/gamification.routes')); // No cache for gamification routes
app.use('/api/analytics', require('./routes/analytics.routes')); // No cache for analytics routes

// Cache stats endpoint (admin only)
app.get('/api/admin/cache-stats', (req, res) => {
  const { getCacheStats } = require('./middleware/cache.middleware');
  res.json(getCacheStats());
});

// Error handling middleware
app.use(errorMiddleware);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Any route not matched by API will serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

module.exports = app;
