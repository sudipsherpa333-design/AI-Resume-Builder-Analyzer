// src/routes/adminRoutes.js - COMPLETE PRODUCTION VERSION
import express from 'express';
const router = express.Router();

// Import controllers
import * as authController from '../admin/controllers/authController.js';
import * as dashboardController from '../admin/controllers/dashboardController.js';
import * as userController from '../admin/controllers/userController.js';
import * as resumeController from '../admin/controllers/resumeController.js';
import * as templateController from '../admin/controllers/templateController.js';
import * as analyticsController from '../admin/controllers/analyticsController.js';
import * as settingController from '../admin/controllers/settingController.js';
import * as logController from '../admin/controllers/logController.js';
import * as systemController from '../admin/controllers/systemController.js';

// Import middlewares
import {
    authenticateAdmin,
    checkRole,
    checkPermission,
    rateLimitMiddleware
} from '../admin/middlewares/adminAuth.js';

// ======================
// PUBLIC ADMIN ROUTES
// ======================

// Admin login with rate limiting
router.post('/auth/login',
    rateLimitMiddleware('login', 5, 15 * 60 * 1000), // 5 attempts per 15 minutes
    authController.login
);

// Password reset
router.post('/auth/forgot-password',
    rateLimitMiddleware('forgot-password', 3, 60 * 60 * 1000), // 3 attempts per hour
    authController.forgotPassword
);

router.post('/auth/reset-password',
    authController.resetPassword
);

// Verify email
router.get('/auth/verify-email/:token',
    authController.verifyEmail
);

// ======================
// PROTECTED ADMIN ROUTES
// ======================
router.use(authenticateAdmin);

// ======================
// ADMIN PROFILE & AUTH
// ======================
router.get('/auth/profile', authController.getProfile);
router.put('/auth/profile', authController.updateProfile);
router.post('/auth/change-password', authController.changePassword);
router.post('/auth/logout', authController.logout);
router.get('/auth/session', authController.getSessionInfo);

// 2FA endpoints
router.get('/auth/2fa/setup', authController.setup2FA);
router.post('/auth/2fa/enable', authController.enable2FA);
router.post('/auth/2fa/disable', authController.disable2FA);
router.post('/auth/2fa/verify', authController.verify2FA);

// ======================
// DASHBOARD
// ======================
router.get('/dashboard/overview',
    checkPermission('dashboard.view'),
    dashboardController.getOverview
);

router.get('/dashboard/stats',
    checkPermission('dashboard.view'),
    dashboardController.getStats
);

router.get('/dashboard/quick-stats',
    checkPermission('dashboard.view'),
    dashboardController.getQuickStats
);

router.get('/dashboard/recent-activity',
    checkPermission('dashboard.view'),
    dashboardController.getRecentActivity
);

router.get('/dashboard/performance',
    checkPermission('dashboard.analytics'),
    dashboardController.getPerformanceMetrics
);

router.get('/dashboard/alerts',
    checkPermission('dashboard.view'),
    dashboardController.getSystemAlerts
);

// ======================
// USER MANAGEMENT
// ======================
router.get('/users',
    checkPermission('users.view'),
    userController.getUsers
);

router.get('/users/:id',
    checkPermission('users.view'),
    userController.getUserById
);

router.post('/users',
    checkPermission('users.create'),
    userController.createUser
);

router.put('/users/:id',
    checkPermission('users.edit'),
    userController.updateUser
);

router.delete('/users/:id',
    checkPermission('users.delete'),
    userController.deleteUser
);

router.patch('/users/:id/status',
    checkPermission('users.edit'),
    userController.updateUserStatus
);

router.patch('/users/:id/role',
    checkRole(['super_admin']),
    userController.updateUserRole
);

router.get('/users/:id/activity',
    checkPermission('users.view'),
    userController.getUserActivity
);

router.get('/users/:id/resumes',
    checkPermission('users.view'),
    userController.getUserResumes
);

router.post('/users/export',
    checkPermission('users.export'),
    userController.exportUsers
);

router.post('/users/bulk-action',
    checkPermission('users.edit'),
    userController.bulkAction
);

// ======================
// RESUME MANAGEMENT
// ======================
router.get('/resumes',
    checkPermission('resumes.view'),
    resumeController.getResumes
);

router.get('/resumes/:id',
    checkPermission('resumes.view'),
    resumeController.getResumeById
);

router.put('/resumes/:id',
    checkPermission('resumes.edit'),
    resumeController.updateResume
);

router.delete('/resumes/:id',
    checkPermission('resumes.delete'),
    resumeController.deleteResume
);

router.patch('/resumes/:id/status',
    checkPermission('resumes.edit'),
    resumeController.updateResumeStatus
);

router.get('/resumes/:id/preview',
    checkPermission('resumes.view'),
    resumeController.getResumePreview
);

router.get('/resumes/:id/analytics',
    checkPermission('resumes.view'),
    resumeController.getResumeAnalytics
);

router.post('/resumes/export',
    checkPermission('resumes.export'),
    resumeController.exportResumes
);

// ======================
// TEMPLATE MANAGEMENT
// ======================
router.get('/templates',
    checkPermission('templates.view'),
    templateController.getTemplates
);

router.get('/templates/:id',
    checkPermission('templates.view'),
    templateController.getTemplateById
);

router.post('/templates',
    checkPermission('templates.create'),
    templateController.createTemplate
);

router.put('/templates/:id',
    checkPermission('templates.edit'),
    templateController.updateTemplate
);

router.delete('/templates/:id',
    checkPermission('templates.delete'),
    templateController.deleteTemplate
);

router.patch('/templates/:id/status',
    checkPermission('templates.edit'),
    templateController.updateTemplateStatus
);

router.get('/templates/:id/usage',
    checkPermission('templates.view'),
    templateController.getTemplateUsage
);

router.post('/templates/:id/preview',
    checkPermission('templates.view'),
    templateController.generatePreview
);

// ======================
// src/admin/controllers/dashboardController.js - PRODUCTION VERSION
import DashboardService from '../services/DashboardService.js';
import AdminLog from '../models/AdminLog.js';

/**
 * @desc    Get dashboard overview with all data
 * @route   GET /api/admin/dashboard/overview
 * @access  Private/Admin
 */
export const getOverview = async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        const [stats, recentActivity, alerts, topPerformers] = await Promise.all([
            DashboardService.getStats(range),
            DashboardService.getRecentActivities(10),
            DashboardService.getSystemAlerts(),
            DashboardService.getTopPerformers()
        ]);

        // Log the dashboard view
        await AdminLog.create({
            adminId: req.admin._id,
            action: 'view_dashboard',
            resource: 'dashboard',
            description: 'Viewed dashboard overview',
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.json({
            success: true,
            data: {
                stats,
                recentActivity,
                alerts,
                topPerformers,
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[DashboardController] Overview error:', error);

        await AdminLog.create({
            adminId: req.admin._id,
            action: 'view_dashboard_error',
            resource: 'dashboard',
            description: 'Error viewing dashboard',
            status: 'failed',
            error: error.message,
            ipAddress: req.ip,
            userAgent: req.get('user-agent')
        });

        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard overview',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private/Admin
 */
export const getStats = async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        const stats = await DashboardService.getStats(range);

        res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[DashboardController] Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics'
        });
    }
};

/**
 * @desc    Get quick statistics for header/sidebar
 * @route   GET /api/admin/dashboard/quick-stats
 * @access  Private/Admin
 */
export const getQuickStats = async (req, res) => {
    try {
        const stats = await DashboardService.getQuickStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('[DashboardController] Quick stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quick statistics'
        });
    }
};

/**
 * @desc    Get recent admin activities
 * @route   GET /api/admin/dashboard/recent-activity
 * @access  Private/Admin
 */
export const getRecentActivity = async (req, res) => {
    try {
        const { limit = 10, type = 'all' } = req.query;

        const activities = await DashboardService.getRecentActivities(parseInt(limit), type);

        res.json({
            success: true,
            data: activities
        });

    } catch (error) {
        console.error('[DashboardController] Recent activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activity'
        });
    }
};

/**
 * @desc    Get system performance metrics
 * @route   GET /api/admin/dashboard/performance
 * @access  Private/Admin
 */
export const getPerformanceMetrics = async (req, res) => {
    try {
        const metrics = await DashboardService.getPerformanceMetrics();

        res.json({
            success: true,
            data: metrics
        });

    } catch (error) {
        console.error('[DashboardController] Performance metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch performance metrics'
        });
    }
};

/**
 * @desc    Get system alerts
 * @route   GET /api/admin/dashboard/alerts
 * @access  Private/Admin
 */
export const getSystemAlerts = async (req, res) => {
    try {
        const alerts = await DashboardService.getSystemAlerts();

        res.json({
            success: true,
            data: alerts
        });

    } catch (error) {
        console.error('[DashboardController] System alerts error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch system alerts'
        });
    }
};