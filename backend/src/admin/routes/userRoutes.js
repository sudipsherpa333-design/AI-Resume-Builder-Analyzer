const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const PermissionMiddleware = require('../middlewares/permission');

/* =====================================================
   MIDDLEWARE
===================================================== */
router.use(authenticateAdmin);

/* =====================================================
   COLLECTION LEVEL ROUTES
===================================================== */

// Get all users (pagination + filters)
router.get('/',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getAllUsers
);

// Search users
router.get('/search',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.searchUsers
);

// User statistics (overview)
router.get('/stats/overview',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserStats
);

// User analytics
router.get('/analytics/overview',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserAnalytics
);

// Export users
router.get('/export/data',
    PermissionMiddleware.checkAnyPermission(['export.all', 'users.export']),
    UserController.exportUsers
);

// Import users
router.post('/import',
    PermissionMiddleware.checkPermission('import.all'),
    UserController.importUsers
);

// Bulk user actions
router.post('/bulk/action',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.bulkUserAction
);

// Merge duplicate users
router.post('/merge',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.mergeUsers
);

// User tags (global)
router.get('/tags/all',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserTags
);

/* =====================================================
   USER CREATION
===================================================== */

// Create new user
router.post('/',
    PermissionMiddleware.checkPermission('users.create'),
    UserController.createUser
);

/* =====================================================
   USER-SPECIFIC ROUTES (ID BASED)
===================================================== */

// Get user by ID
router.get('/:id',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserById
);

// Update user
router.put('/:id',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.updateUser
);

// Delete user
router.delete('/:id',
    PermissionMiddleware.checkPermission('users.delete'),
    UserController.deleteUser
);

// Update user status
router.put('/:id/status',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.updateUserStatus
);

// Update user role
router.put('/:id/role',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.updateUserRole
);

// Reset user password
router.post('/:id/reset-password',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.resetUserPassword
);

// Verify user
router.post('/:id/verify',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.verifyUser
);

// Get user activity
router.get('/:id/activity',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserActivity
);

// Get user resumes
router.get('/:id/resumes',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserResumes
);

// Get user sessions
router.get('/:id/sessions',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserSessions
);

// Revoke user session
router.delete('/:id/sessions/:sessionId',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.revokeUserSession
);

// User subscriptions
router.get('/:id/subscriptions',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserSubscriptions
);

// User payments
router.get('/:id/payments',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserPayments
);

// User preferences
router.get('/:id/preferences',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserPreferences
);

router.put('/:id/preferences',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.updateUserPreferences
);

/* =====================================================
   USER NOTES
===================================================== */

router.post('/:id/notes',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.addUserNote
);

router.get('/:id/notes',
    PermissionMiddleware.checkPermission('users.view'),
    UserController.getUserNotes
);

router.delete('/:id/notes/:noteId',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.deleteUserNote
);

/* =====================================================
   USER TAGS
===================================================== */

router.post('/:id/tags',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.addUserTag
);

router.delete('/:id/tags/:tag',
    PermissionMiddleware.checkPermission('users.edit'),
    UserController.removeUserTag
);

/* =====================================================
   ADMIN ADVANCED ACTIONS
===================================================== */

// Impersonate user (super admin)
router.post('/:id/impersonate',
    PermissionMiddleware.checkPermission('users.manage'),
    PermissionMiddleware.canManageUsers(),
    UserController.impersonateUser
);

// Stop impersonation
router.post('/impersonate/stop',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.stopImpersonation
);

// Send email to user
router.post('/:id/send-email',
    PermissionMiddleware.checkPermission('users.manage'),
    UserController.sendEmailToUser
);

module.exports = router;
