const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const { authenticateAdmin } = require('../middlewares/adminAuth');
const PermissionMiddleware = require('../middlewares/permission');

// All routes require authentication
router.use(authenticateAdmin);

// Get all settings
router.get('/',
    PermissionMiddleware.checkPermission('settings.view'),
    settingController.getSettings
);

// Get setting by key
router.get('/:key',
    PermissionMiddleware.checkPermission('settings.view'),
    settingController.getSettingByKey
);

// Update settings (bulk)
router.put('/',
    PermissionMiddleware.checkPermission('settings.edit'),
    settingController.updateSettings
);

// Update specific setting
router.put('/:key',
    PermissionMiddleware.checkPermission('settings.edit'),
    settingController.updateSetting
);

// System information
router.get('/system/info',
    PermissionMiddleware.checkModuleAccess('system'),
    settingController.getSystemInfo
);

// Cache management
router.get('/cache/status',
    PermissionMiddleware.checkModuleAccess('system'),
    settingController.getCacheStatus
);

router.delete('/cache/clear',
    PermissionMiddleware.checkModuleAccess('system'),
    settingController.clearCache
);

// Backup management
router.get('/backups',
    PermissionMiddleware.checkPermission('system.maintenance'),
    settingController.getBackupStatus
);

router.post('/backups',
    PermissionMiddleware.checkPermission('system.maintenance'),
    settingController.createBackup
);

router.post('/backups/:backupId/restore',
    PermissionMiddleware.checkPermission('system.maintenance'),
    settingController.restoreBackup
);

router.delete('/backups/:backupId',
    PermissionMiddleware.checkPermission('system.maintenance'),
    settingController.deleteBackup
);

// System logs
router.get('/logs/system',
    PermissionMiddleware.checkPermission('logs.view'),
    settingController.getSystemLogs
);

// Maintenance mode
router.get('/maintenance',
    PermissionMiddleware.checkPermission('system.maintenance'),
    settingController.getMaintenanceStatus
);

router.put('/maintenance',
    PermissionMiddleware.checkPermission('system.maintenance'),
    settingController.updateMaintenanceMode
);

// Email settings
router.get('/email/templates',
    PermissionMiddleware.checkPermission('settings.view'),
    settingController.getEmailTemplates
);

router.put('/email/templates/:templateId',
    PermissionMiddleware.checkPermission('settings.edit'),
    settingController.updateEmailTemplate
);

// Notification settings
router.get('/notifications',
    PermissionMiddleware.checkPermission('settings.view'),
    settingController.getNotificationSettings
);

router.put('/notifications',
    PermissionMiddleware.checkPermission('settings.edit'),
    settingController.updateNotificationSettings
);

// API settings
router.get('/api/keys',
    PermissionMiddleware.checkPermission('settings.manage'),
    settingController.getApiKeys
);

router.post('/api/keys',
    PermissionMiddleware.checkPermission('settings.manage'),
    settingController.createApiKey
);

router.delete('/api/keys/:keyId',
    PermissionMiddleware.checkPermission('settings.manage'),
    settingController.deleteApiKey
);

// Security settings
router.get('/security',
    PermissionMiddleware.checkPermission('settings.manage'),
    settingController.getSecuritySettings
);

router.put('/security',
    PermissionMiddleware.checkPermission('settings.manage'),
    settingController.updateSecuritySettings
);

// Import/Export settings
router.get('/export/settings',
    PermissionMiddleware.checkPermission('export.all'),
    settingController.exportSettings
);

router.post('/import/settings',
    PermissionMiddleware.checkPermission('import.all'),
    settingController.importSettings
);

module.exports = router;