import express from 'express';
import { body } from 'express-validator';
import authController from '../../controllers/admin/authController.js';
import { adminAuth } from '../../middleware/adminAuth.js';

const router = express.Router();

// ====================
// PUBLIC ROUTES
// ====================

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
], authController.login);

// ====================
// PROTECTED ROUTES
// ====================

// @route   GET /api/admin/verify
// @desc    Verify admin token
// @access  Private/Admin
router.get('/verify', adminAuth, authController.verifyToken);

// @route   GET /api/admin/profile
// @desc    Get admin profile
// @access  Private/Admin
router.get('/profile', adminAuth, authController.getProfile);

// @route   PUT /api/admin/profile
// @desc    Update admin profile
// @access  Private/Admin
router.put('/profile', adminAuth, [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Name must be at least 2 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL')
], authController.updateProfile);

// @route   PUT /api/admin/change-password
// @desc    Change admin password
// @access  Private/Admin
router.put('/change-password', adminAuth, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
], authController.changePassword);

// @route   POST /api/admin/logout
// @desc    Admin logout
// @access  Private/Admin
router.post('/logout', adminAuth, authController.logout);

// @route   POST /api/admin/refresh-token
// @desc    Refresh admin token
// @access  Private/Admin
router.post('/refresh-token', adminAuth, authController.refreshToken);

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/dashboard/stats', adminAuth, authController.getDashboardStats);

export default router;