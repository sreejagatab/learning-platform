/**
 * Mock user data and authentication for development mode
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Demo users for development
const demoUsers = [
  {
    _id: 'demo-admin-001',
    name: 'Admin User',
    email: 'admin@learnsphere.dev',
    password: 'admin123', // Plain text for development
    role: 'admin',
    preferences: {
      level: 'advanced',
      topicsOfInterest: ['AI', 'Machine Learning', 'Education Technology'],
      learningStyle: 'multimodal',
      contentFormat: 'detailed'
    },
    emailVerified: true,
    lastActive: new Date(),
    createdAt: new Date('2023-01-01')
  },
  {
    _id: 'demo-user-001',
    name: 'Demo User',
    email: 'user@learnsphere.dev',
    password: 'demo123', // Plain text for development
    role: 'user',
    preferences: {
      level: 'intermediate',
      topicsOfInterest: ['Programming', 'Science', 'History'],
      learningStyle: 'visual',
      contentFormat: 'example-based'
    },
    emailVerified: true,
    lastActive: new Date(),
    createdAt: new Date('2023-03-15')
  }
];

// In-memory user storage
const users = [...demoUsers];

/**
 * Find a user by email
 * @param {string} email - User email
 * @returns {Object|null} User object or null if not found
 */
const findUserByEmail = (email) => {
  return users.find(user => user.email === email) || null;
};

/**
 * Find a user by ID
 * @param {string} id - User ID
 * @returns {Object|null} User object or null if not found
 */
const findUserById = (id) => {
  return users.find(user => user._id === id) || null;
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Object} Created user object
 */
const createUser = async (userData) => {
  // Check if user already exists
  if (findUserByEmail(userData.email)) {
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  // Create new user
  const newUser = {
    _id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: userData.role || 'user',
    preferences: userData.preferences || {
      level: 'intermediate',
      topicsOfInterest: [],
      learningStyle: 'multimodal',
      contentFormat: 'detailed'
    },
    emailVerified: false,
    lastActive: new Date(),
    createdAt: new Date()
  };

  // Add to users array
  users.push(newUser);

  // Return user without password
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Update a user
 * @param {string} id - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user object
 */
const updateUser = (id, updateData) => {
  const userIndex = users.findIndex(user => user._id === id);

  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // Update user data
  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    lastActive: new Date()
  };

  // Return user without password
  const { password, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

/**
 * Verify password
 * @param {string} enteredPassword - Password to verify
 * @param {string} hashedPassword - Stored hashed password
 * @returns {Promise<boolean>} True if password matches
 */
const verifyPassword = async (enteredPassword, storedPassword) => {
  console.log('Verifying password:', { enteredPassword, storedPassword });

  // For development, we're using plain text passwords
  if (process.env.NODE_ENV === 'development') {
    const result = enteredPassword === storedPassword;
    console.log('Password verification result (plain text):', result);
    return result;
  }

  // For production, use bcrypt
  const result = await bcrypt.compare(enteredPassword, storedPassword);
  console.log('Password verification result (bcrypt):', result);
  return result;
};

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'dev_secret_key_for_testing_only',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

module.exports = {
  demoUsers,
  users,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  verifyPassword,
  generateToken
};
