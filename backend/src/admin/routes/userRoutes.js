const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const PermissionMiddleware = require('../middlewares/permission');

// All routes require authentication
router.use(authenticateAdmin);

// Get all users with pagination and filters
router.get('/',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getAllUsers
);

// Search users
router.get('/search',
    PermissionMiddleware.checkPermission('users.view'),
    userController.searchUsers
);

// Get user by ID
router.get('/:id',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserById
);

// Create user
router.post('/',
    PermissionMiddleware.checkPermission('users.create'),
    userController.createUser
);

// Update user
router.put('/:id',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.updateUser
);

// Delete user
router.delete('/:id',
    PermissionMiddleware.checkPermission('users.delete'),
    userController.deleteUser
);

// Export users
router.get('/export/data',
    PermissionMiddleware.checkAnyPermission(['export.all', 'users.export']),
    userController.exportUsers
);

// User statistics
router.get('/stats/overview',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserStats
);

// Bulk user actions
router.post('/bulk/action',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.bulkUserAction
);

// User specific operations
router.put('/:id/status',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.updateUserStatus
);

router.put('/:id/role',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.updateUserRole
);

router.post('/:id/reset-password',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.resetUserPassword
);

router.get('/:id/activity',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserActivity
);

router.get('/:id/resumes',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserResumes
);

// User notes
router.post('/:id/notes',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.addUserNote
);

router.get('/:id/notes',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserNotes
);

router.delete('/:id/notes/:noteId',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.deleteUserNote
);

// User sessions
router.get('/:id/sessions',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserSessions
);

router.delete('/:id/sessions/:sessionId',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.revokeUserSession
);

// User subscriptions/payments
router.get('/:id/subscriptions',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserSubscriptions
);

router.get('/:id/payments',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserPayments
);

// User preferences
router.get('/:id/preferences',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserPreferences
);

router.put('/:id/preferences',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.updateUserPreferences
);

// Impersonate user (super admin only)
router.post('/:id/impersonate',
    PermissionMiddleware.checkPermission('users.manage'),
    PermissionMiddleware.canManageUsers(),
    userController.impersonateUser
);

// Stop impersonation
router.post('/impersonate/stop',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.stopImpersonation
);

// Send email to user
router.post('/:id/send-email',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.sendEmailToUser
);

// User verification
router.post('/:id/verify',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.verifyUser
);

// Merge duplicate users
router.post('/merge',
    PermissionMiddleware.checkPermission('users.manage'),
    userController.mergeUsers
);

// User tags/categories
router.get('/tags/all',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserTags
);

router.post('/:id/tags',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.addUserTag
);

router.delete('/:id/tags/:tag',
    PermissionMiddleware.checkPermission('users.edit'),
    userController.removeUserTag
);

// User import/export
router.post('/import',
    PermissionMiddleware.checkPermission('import.all'),
    userController.importUsers
);

// User analytics
router.get('/analytics/overview',
    PermissionMiddleware.checkPermission('users.view'),
    userController.getUserAnalytics
);

module.exports = router;