const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const config = require('config');
const path = require('path');
const logger = require('./utils/logger');
const errorMiddleware = require('./middleware/error.middleware');

// Create Express app
const app = express();

// Apply middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
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

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/learning', require('./routes/learning.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/history', require('./routes/history.routes'));

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
