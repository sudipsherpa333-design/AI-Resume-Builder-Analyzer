const SettingService = require('../services/SettingService');
const LogService = require('../services/LogService');

class SettingController {
    // Get all settings
    async getSettings(req, res) {
        try {
            const { group, category } = req.query;
            const settings = await SettingService.getAllSettings(group, category);

            res.json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error('Get settings error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch settings'
            });
        }
    }

    // Get setting by key
    async getSettingByKey(req, res) {
        try {
            const { key } = req.params;
            const setting = await SettingService.getSettingByKey(key);

            if (!setting) {
                return res.status(404).json({
                    success: false,
                    message: 'Setting not found'
                });
            }

            res.json({
                success: true,
                data: setting
            });
        } catch (error) {
            console.error('Get setting error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch setting'
            });
        }
    }

    // Update settings (bulk)
    async updateSettings(req, res) {
        try {
            const settings = req.body;

            if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Settings data is required'
                });
            }

            const result = await SettingService.updateSettings(settings, req.admin._id);

            await LogService.createActionLog(req.admin._id, 'settings_update', {
                keys: Object.keys(settings),
                count: Object.keys(settings).length
            });

            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: result
            });
        } catch (error) {
            console.error('Update settings error:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update settings'
            });
        }
    }

    // Get system information
    async getSystemInfo(req, res) {
        try {
            const systemInfo = await SettingService.getSystemInfo();

            res.json({
                success: true,
                data: systemInfo
            });
        } catch (error) {
            console.error('Get system info error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch system information'
            });
        }
    }

    // Clear cache
    async clearCache(req, res) {
        try {
            const { cacheType = 'all' } = req.query;
            const result = await SettingService.clearCache(cacheType);

            await LogService.createActionLog(req.admin._id, 'cache_clear', {
                cacheType,
                result
            });

            res.json({
                success: true,
                message: 'Cache cleared successfully',
                data: result
            });
        } catch (error) {
            console.error('Clear cache error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to clear cache'
            });
        }
    }

    // Get backup status
    async getBackupStatus(req, res) {
        try {
            const status = await SettingService.getBackupStatus();

            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('Get backup status error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch backup status'
            });
        }
    }

    // Create manual backup
    async createBackup(req, res) {
        try {
            const { type = 'manual', description } = req.body;
            const backup = await SettingService.createBackup(type, description, req.admin._id);

            await LogService.createActionLog(req.admin._id, 'backup_create', {
                type,
                description,
                backupId: backup._id
            });

            res.json({
                success: true,
                message: 'Backup created successfully',
                data: backup
            });
        } catch (error) {
            console.error('Create backup error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create backup'
            });
        }
    }

    // Restore from backup
    async restoreBackup(req, res) {
        try {
            const { backupId } = req.params;
            const { confirm } = req.body;

            if (!confirm) {
                return res.status(400).json({
                    success: false,
                    message: 'Confirmation is required for restore operation'
                });
            }

            const result = await SettingService.restoreBackup(backupId, req.admin._id);

            await LogService.createActionLog(req.admin._id, 'backup_restore', {
                backupId,
                result
            });

            res.json({
                success: true,
                message: 'Backup restored successfully',
                data: result
            });
        } catch (error) {
            console.error('Restore backup error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to restore backup'
            });
        }
    }

    // Get system logs
    async getSystemLogs(req, res) {
        try {
            const { type = 'error', limit = 100 } = req.query;
            const logs = await SettingService.getSystemLogs(type, parseInt(limit));

            res.json({
                success: true,
                data: logs
            });
        } catch (error) {
            console.error('Get system logs error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch system logs'
            });
        }
    }

    // Update maintenance mode
    async updateMaintenanceMode(req, res) {
        try {
            const { enabled, message } = req.body;

            if (enabled === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Enabled status is required'
                });
            }

            const result = await SettingService.updateMaintenanceMode(enabled, message, req.admin._id);

            await LogService.createActionLog(req.admin._id, 'maintenance_mode_update', {
                enabled,
                message
            });

            res.json({
                success: true,
                message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
                data: result
            });
        } catch (error) {
            console.error('Update maintenance mode error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update maintenance mode'
            });
        }
    }
}

module.exports = new SettingController();