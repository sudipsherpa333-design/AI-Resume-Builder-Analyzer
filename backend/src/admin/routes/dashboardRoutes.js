const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const PermissionMiddleware = require('../middlewares/permission');

// All routes require authentication
router.use(authenticateAdmin);

// Main dashboard statistics
router.get('/stats',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getStats
);

// Dashboard widgets data
router.get('/widgets',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getWidgetsData
);

// Quick stats (for header/sidebar)
router.get('/quick-stats',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getQuickStats
);

// Recent activities
router.get('/recent-activities',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getRecentActivities
);

// Top performing content
router.get('/top-performing',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getTopPerforming
);

// System alerts
router.get('/alerts',
    PermissionMiddleware.checkModuleAccess('system'),
    dashboardController.getSystemAlerts
);

// Performance metrics
router.get('/performance',
    PermissionMiddleware.checkPermission('dashboard.analytics'),
    dashboardController.getPerformanceMetrics
);

// Custom dashboard layout
router.get('/layout',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getDashboardLayout
);

router.put('/layout',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.updateDashboardLayout
);

// Notifications
router.get('/notifications',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.getNotifications
);

router.put('/notifications/read/:id',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.markNotificationAsRead
);

router.put('/notifications/read-all',
    PermissionMiddleware.checkPermission('dashboard.view'),
    dashboardController.markAllNotificationsAsRead
);

module.exports = router;