// Main server entry point
require('dotenv').config();
const config = require('config');
const app = require('./app');
const logger = require('./utils/logger');
const mongoose = require('mongoose');

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || config.get('mongoURI');
    await mongoose.connect(mongoURI);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Server configuration
const PORT = process.env.PORT || config.get('port') || 5000;

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
