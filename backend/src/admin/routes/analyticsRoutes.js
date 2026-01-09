const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const PermissionMiddleware = require('../middlewares/permission');

// All routes require authentication
router.use(authenticateAdmin);

// Dashboard analytics
router.get('/dashboard',
    PermissionMiddleware.checkPermission('dashboard.view'),
    analyticsController.getDashboardAnalytics
);

// User analytics
router.get('/users',
    PermissionMiddleware.checkPermission('users.view'),
    analyticsController.getUserAnalytics
);

// Resume analytics
router.get('/resumes',
    PermissionMiddleware.checkPermission('resumes.view'),
    analyticsController.getResumeAnalytics
);

// System analytics
router.get('/system',
    PermissionMiddleware.checkPermission('dashboard.analytics'),
    analyticsController.getSystemAnalytics
);

// Real-time analytics
router.get('/realtime',
    PermissionMiddleware.checkPermission('dashboard.analytics'),
    analyticsController.getRealtimeAnalytics
);

// Export analytics data
router.get('/export',
    PermissionMiddleware.checkAnyPermission(['export.all', 'resumes.export', 'users.export']),
    analyticsController.exportAnalyticsData
);

// Custom report generation
router.post('/reports',
    PermissionMiddleware.checkPermission('dashboard.analytics'),
    analyticsController.generateCustomReport
);

// Get report by ID
router.get('/reports/:id',
    PermissionMiddleware.checkPermission('dashboard.analytics'),
    analyticsController.getReportById
);

module.exports = router;