const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, authController.getMe);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  [
    auth,
    [
      check('name', 'Name is required').optional(),
      check('preferences', 'Preferences must be an object').optional().isObject()
    ]
  ],
  authController.updateProfile
);

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').not().isEmpty(),
      check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
    ]
  ],
  authController.changePassword
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Forgot password - send reset email
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.forgotPassword
);

module.exports = router;
