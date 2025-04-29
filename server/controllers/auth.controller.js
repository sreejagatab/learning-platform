/**
 * Authentication controller for user management
 * In development mode, can work without MongoDB connection
 */
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('config');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// Check if we're in development mode without MongoDB
const USE_MOCK_DB = process.env.NODE_ENV === 'development' &&
                    (!process.env.MONGO_URI || process.env.MONGO_URI === 'mongodb://localhost:27017/learnsphere');

// Import mock user service if in development mode
let mockUserService;
if (USE_MOCK_DB) {
  try {
    mockUserService = require('../mock/users');
    logger.info('Using mock user service for authentication');
    logger.info('Demo accounts available:');
    logger.info('- Admin: admin@learnsphere.dev / admin123');
    logger.info('- User: user@learnsphere.dev / demo123');
  } catch (error) {
    logger.error(`Failed to load mock user service: ${error.message}`);
  }
}

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
exports.register = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, preferences } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      name,
      email,
      password,
      preferences: preferences || {}
    });

    // Save user to database
    await user.save();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // Return token
    res.status(201).json({
      success: true,
      token
    });
  } catch (error) {
    logger.error(`Error in register: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
exports.login = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  // Debug logging
  console.log('Login attempt with:', { email, password });

  try {
    let user;
    let token;
    let isMatch = false;

    if (USE_MOCK_DB && mockUserService) {
      // Use mock user service in development mode
      user = mockUserService.findUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if password matches
      isMatch = await mockUserService.verifyPassword(password, user.password);

      // Debug logging
      console.log('Password verification result:', isMatch);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last active timestamp
      user.lastActive = new Date();

      // Generate JWT token
      token = mockUserService.generateToken(user);

      logger.info(`Mock user logged in: ${user.email} (${user.role})`);
    } else {
      // Use MongoDB in production
      user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if password matches
      isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last active timestamp
      user.lastActive = Date.now();
      await user.save();

      // Generate JWT token
      token = user.getSignedJwtToken();
    }

    // Return token
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences
      }
    });
  } catch (error) {
    logger.error(`Error in login: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
exports.getMe = async (req, res) => {
  try {
    let user;

    if (USE_MOCK_DB && mockUserService) {
      // Use mock user service in development mode
      user = mockUserService.findUserById(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      user = userWithoutPassword;

      logger.info(`Mock user profile retrieved: ${user.email}`);
    } else {
      // Use MongoDB in production
      user = await User.findById(req.user.id).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }

    res.json(user);
  } catch (error) {
    logger.error(`Error in getMe: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile
 * @route PUT /api/auth/profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, preferences } = req.body;
    const updateFields = {};

    // Only update fields that were actually sent
    if (name) updateFields.name = name;
    if (preferences) updateFields.preferences = preferences;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    logger.error(`Error in updateProfile: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Change password
 * @route PUT /api/auth/password
 * @access Private
 */
exports.changePassword = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    logger.error(`Error in changePassword: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Forgot password - send reset email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // In a production environment, send an email with the reset URL
    // For now, just return the token for testing purposes
    res.json({
      success: true,
      message: 'Password reset token generated',
      resetToken, // Remove in production
      resetUrl    // Remove in production
    });
  } catch (error) {
    logger.error(`Error in forgotPassword: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
