// Main server entry point
require('dotenv').config({ path: '../.env' });
const config = require('config');
const app = require('./app');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

// Debug environment variables
console.log('Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Database connection
const connectDB = async () => {
  try {
    // Check if we're in development mode and should use mock DB
    if (process.env.NODE_ENV === 'development' && !process.env.MONGO_URI) {
      logger.info('Running in development mode without MongoDB - using mock database');
      // Skip actual connection but continue app execution
      return;
    }

    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    if (process.env.NODE_ENV !== 'development') {
      // Only exit in production, continue in development
      process.exit(1);
    } else {
      logger.info('Continuing in development mode without database connection');
    }
  }
};

// Connect to database
connectDB();

// Server configuration
const PORT = 5001; // Force port 5001 for testing

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    mongoose.connection.close(false, () => {
      process.exit(0);
    });
  });
});

module.exports = server;
