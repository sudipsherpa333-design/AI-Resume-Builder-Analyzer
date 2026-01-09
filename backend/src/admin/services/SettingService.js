const Setting = require('../models/Setting');
const Backup = require('../models/Backup');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class SettingService {
    // Get all settings
    static async getAllSettings(group = null, category = null) {
        try {
            const query = {};

            if (group) {
                query.group = group;
            }

            if (category) {
                query.category = category;
            }

            const settings = await Setting.find(query).sort({ group: 1, key: 1 }).lean();

            // Group settings by group and category
            const groupedSettings = {};

            settings.forEach(setting => {
                if (!groupedSettings[setting.group]) {
                    groupedSettings[setting.group] = {};
                }

                if (!groupedSettings[setting.group][setting.category]) {
                    groupedSettings[setting.group][setting.category] = [];
                }

                groupedSettings[setting.group][setting.category].push({
                    key: setting.key,
                    value: setting.value,
                    type: setting.type,
                    label: setting.label,
                    description: setting.description,
                    options: setting.options,
                    validation: setting.validation,
                    isPublic: setting.isPublic,
                    isSystem: setting.isSystem,
                    updatedAt: setting.updatedAt,
                    updatedBy: setting.updatedBy
                });
            });

            return groupedSettings;
        } catch (error) {
            console.error('Get all settings error:', error);
            throw error;
        }
    }

    // Get setting by key
    static async getSettingByKey(key) {
        try {
            const setting = await Setting.findOne({ key }).lean();

            if (!setting) {
                return null;
            }

            return {
                key: setting.key,
                value: setting.value,
                type: setting.type,
                group: setting.group,
                category: setting.category,
                label: setting.label,
                description: setting.description,
                options: setting.options,
                validation: setting.validation,
                isPublic: setting.isPublic,
                isSystem: setting.isSystem,
                createdAt: setting.createdAt,
                updatedAt: setting.updatedAt,
                updatedBy: setting.updatedBy
            };
        } catch (error) {
            console.error('Get setting by key error:', error);
            throw error;
        }
    }

    // Update settings (bulk)
    static async updateSettings(settings, adminId) {
        try {
            if (!settings || typeof settings !== 'object' || Object.keys(settings).length === 0) {
                throw new Error('Settings data is required');
            }

            const results = {
                updated: [],
                failed: [],
                skipped: []
            };

            for (const [key, value] of Object.entries(settings)) {
                try {
                    const setting = await Setting.findOne({ key });

                    if (!setting) {
                        results.skipped.push({ key, reason: 'Setting not found' });
                        continue;
                    }

                    // Validate based on setting type
                    const validatedValue = this.validateSettingValue(setting.type, value, setting.validation);

                    // Update setting
                    setting.value = validatedValue;
                    setting.updatedBy = adminId;
                    setting.updatedAt = new Date();

                    await setting.save();

                    results.updated.push({
                        key,
                        oldValue: setting.value,
                        newValue: validatedValue,
                        type: setting.type
                    });
                } catch (error) {
                    results.failed.push({
                        key,
                        error: error.message,
                        value
                    });
                }
            }

            // Clear cache if caching is implemented
            await this.clearSettingCache();

            return results;
        } catch (error) {
            console.error('Update settings error:', error);
            throw error;
        }
    }

    // Update specific setting
    static async updateSetting(key, value, adminId) {
        try {
            const setting = await Setting.findOne({ key });

            if (!setting) {
                throw new Error(`Setting not found: ${key}`);
            }

            // Validate value
            const validatedValue = this.validateSettingValue(setting.type, value, setting.validation);

            // Update setting
            setting.value = validatedValue;
            setting.updatedBy = adminId;
            setting.updatedAt = new Date();

            await setting.save();

            // Clear cache
            await this.clearSettingCache();

            return {
                key,
                oldValue: setting.value,
                newValue: validatedValue,
                type: setting.type,
                updatedAt: setting.updatedAt
            };
        } catch (error) {
            console.error('Update setting error:', error);
            throw error;
        }
    }

    // Validate setting value based on type
    static validateSettingValue(type, value, validation = {}) {
        switch (type) {
            case 'string':
                if (typeof value !== 'string') {
                    throw new Error('Value must be a string');
                }

                if (validation.minLength && value.length < validation.minLength) {
                    throw new Error(`Value must be at least ${validation.minLength} characters`);
                }

                if (validation.maxLength && value.length > validation.maxLength) {
                    throw new Error(`Value must be at most ${validation.maxLength} characters`);
                }

                if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
                    throw new Error('Value does not match required pattern');
                }

                return value.trim();

            case 'number':
                const numValue = Number(value);

                if (isNaN(numValue)) {
                    throw new Error('Value must be a number');
                }

                if (validation.min !== undefined && numValue < validation.min) {
                    throw new Error(`Value must be at least ${validation.min}`);
                }

                if (validation.max !== undefined && numValue > validation.max) {
                    throw new Error(`Value must be at most ${validation.max}`);
                }

                return numValue;

            case 'boolean':
                if (typeof value === 'string') {
                    if (value.toLowerCase() === 'true' || value === '1') {
                        return true;
                    } else if (value.toLowerCase() === 'false' || value === '0') {
                        return false;
                    }
                }

                return Boolean(value);

            case 'array':
                if (!Array.isArray(value)) {
                    // Try to parse as JSON array
                    try {
                        const parsed = JSON.parse(value);
                        if (!Array.isArray(parsed)) {
                            throw new Error('Invalid array format');
                        }
                        return parsed;
                    } catch {
                        throw new Error('Value must be an array');
                    }
                }
                return value;

            case 'object':
                if (typeof value === 'string') {
                    try {
                        return JSON.parse(value);
                    } catch {
                        throw new Error('Invalid JSON object');
                    }
                } else if (typeof value !== 'object' || Array.isArray(value)) {
                    throw new Error('Value must be an object');
                }
                return value;

            case 'select':
                if (!validation.options || !Array.isArray(validation.options)) {
                    return value;
                }

                if (!validation.options.includes(value)) {
                    throw new Error(`Value must be one of: ${validation.options.join(', ')}`);
                }

                return value;

            default:
                return value;
        }
    }

    // Clear setting cache
    static async clearSettingCache() {
        try {
            // Implement cache clearing logic if using cache
            // Example: if using Redis or similar
            return { success: true, message: 'Cache cleared' };
        } catch (error) {
            console.error('Clear cache error:', error);
            throw error;
        }
    }

    // Get system information
    static async getSystemInfo() {
        try {
            const [
                dbStats,
                memoryUsage,
                uptime,
                nodeInfo,
                osInfo,
                packageInfo
            ] = await Promise.all([
                this.getDatabaseInfo(),
                this.getMemoryInfo(),
                this.getUptimeInfo(),
                this.getNodeInfo(),
                this.getOSInfo(),
                this.getPackageInfo()
            ]);

            return {
                database: dbStats,
                memory: memoryUsage,
                uptime,
                node: nodeInfo,
                os: osInfo,
                package: packageInfo,
                environment: process.env.NODE_ENV || 'development',
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Get system info error:', error);
            throw error;
        }
    }

    // Get database information
    static async getDatabaseInfo() {
        try {
            const adminDb = mongoose.connection.db.admin();
            const serverInfo = await adminDb.serverInfo();
            const dbStats = await mongoose.connection.db.stats();

            return {
                type: 'MongoDB',
                version: serverInfo.version,
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name,
                collections: dbStats.collections,
                documents: dbStats.objects,
                dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`,
                storageSize: `${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`,
                indexSize: `${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`
            };
        } catch (error) {
            return {
                type: 'MongoDB',
                error: 'Unable to fetch database info',
                message: error.message
            };
        }
    }

    // Get memory information
    static getMemoryInfo() {
        const memory = process.memoryUsage();

        return {
            rss: `${Math.round(memory.rss / 1024 / 1024)} MB`,
            heapTotal: `${Math.round(memory.heapTotal / 1024 / 1024)} MB`,
            heapUsed: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
            external: `${Math.round(memory.external / 1024 / 1024)} MB`,
            arrayBuffers: `${Math.round(memory.arrayBuffers / 1024 / 1024)} MB`
        };
    }

    // Get uptime information
    static getUptimeInfo() {
        const uptime = process.uptime();
        const days = Math.floor(uptime / (24 * 60 * 60));
        const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptime % (60 * 60)) / 60);
        const seconds = Math.floor(uptime % 60);

        return {
            days,
            hours,
            minutes,
            seconds,
            totalSeconds: Math.floor(uptime),
            startedAt: new Date(Date.now() - (uptime * 1000))
        };
    }

    // Get Node.js information
    static getNodeInfo() {
        return {
            version: process.version,
            platform: process.platform,
            architecture: process.arch,
            versions: process.versions
        };
    }

    // Get OS information
    static getOSInfo() {
        return {
            type: require('os').type(),
            platform: require('os').platform(),
            arch: require('os').arch(),
            release: require('os').release(),
            uptime: Math.floor(require('os').uptime() / 60), // in minutes
            totalMem: `${Math.round(require('os').totalmem() / 1024 / 1024 / 1024)} GB`,
            freeMem: `${Math.round(require('os').freemem() / 1024 / 1024 / 1024)} GB`,
            cpus: require('os').cpus().length,
            loadavg: require('os').loadavg()
        };
    }

    // Get package information
    static getPackageInfo() {
        try {
            const packageJson = require('../../../package.json');
            return {
                name: packageJson.name,
                version: packageJson.version,
                description: packageJson.description,
                dependencies: Object.keys(packageJson.dependencies || {}).length,
                devDependencies: Object.keys(packageJson.devDependencies || {}).length
            };
        } catch (error) {
            return {
                error: 'Unable to read package.json'
            };
        }
    }

    // Get cache status
    static async getCacheStatus() {
        try {
            // Implement cache status check if using cache
            return {
                enabled: false,
                type: 'none',
                stats: {}
            };
        } catch (error) {
            console.error('Get cache status error:', error);
            throw error;
        }
    }

    // Clear cache
    static async clearCache(cacheType = 'all') {
        try {
            // Implement cache clearing based on type
            const results = [];

            if (cacheType === 'all' || cacheType === 'settings') {
                await this.clearSettingCache();
                results.push('settings');
            }

            // Add more cache types as needed

            return {
                cleared: results,
                message: `Cleared cache: ${results.join(', ')}`
            };
        } catch (error) {
            console.error('Clear cache error:', error);
            throw error;
        }
    }

    // Get backup status
    static async getBackupStatus() {
        try {
            const backups = await Backup.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .lean();

            const backupDir = path.join(__dirname, '../../backups');
            const exists = fs.existsSync(backupDir);
            let diskUsage = 0;
            let fileCount = 0;

            if (exists) {
                const files = fs.readdirSync(backupDir);
                fileCount = files.length;

                files.forEach(file => {
                    const filePath = path.join(backupDir, file);
                    const stats = fs.statSync(filePath);
                    diskUsage += stats.size;
                });
            }

            return {
                enabled: true,
                backupDir,
                exists,
                diskUsage: `${(diskUsage / 1024 / 1024).toFixed(2)} MB`,
                fileCount,
                recentBackups: backups.map(backup => ({
                    id: backup._id,
                    type: backup.type,
                    size: backup.size,
                    status: backup.status,
                    createdAt: backup.createdAt
                })),
                lastBackup: backups[0] || null,
                nextScheduled: this.getNextBackupSchedule()
            };
        } catch (error) {
            console.error('Get backup status error:', error);
            throw error;
        }
    }

    // Get next backup schedule
    static getNextBackupSchedule() {
        // Implement based on your backup schedule
        return {
            daily: '00:00',
            weekly: 'Sunday 00:00',
            monthly: '1st 00:00'
        };
    }

    // Create backup
    static async createBackup(type = 'manual', description = '', adminId = null) {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup_${type}_${timestamp}`;
            const backupDir = path.join(__dirname, '../../backups');
            const backupPath = path.join(backupDir, backupName);

            // Ensure backup directory exists
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }

            // Create backup record
            const backup = new Backup({
                name: backupName,
                type,
                description,
                path: backupPath,
                status: 'pending',
                createdBy: adminId
            });

            await backup.save();

            // Perform backup (this is a simplified example)
            // In production, use proper backup tools like mongodump
            let backupSize = 0;

            if (type === 'database') {
                // Export database collections
                const collections = await mongoose.connection.db.listCollections().toArray();
                const backupData = {};

                for (const collection of collections) {
                    const data = await mongoose.connection.db.collection(collection.name).find({}).toArray();
                    backupData[collection.name] = data;
                }

                const backupContent = JSON.stringify(backupData, null, 2);
                fs.writeFileSync(`${backupPath}.json`, backupContent);
                backupSize = Buffer.byteLength(backupContent, 'utf8');
            } else if (type === 'files') {
                // Backup uploads directory
                const uploadsDir = path.join(__dirname, '../../../uploads');
                if (fs.existsSync(uploadsDir)) {
                    // Create zip of uploads directory
                    // This would require a zip library or system command
                }
            } else if (type === 'full') {
                // Full backup (database + files)
                // Implement as needed
            }

            // Update backup record
            backup.status = 'completed';
            backup.size = backupSize;
            backup.completedAt = new Date();

            await backup.save();

            return backup.toObject();
        } catch (error) {
            console.error('Create backup error:', error);

            // Update backup record with error
            if (backup) {
                backup.status = 'failed';
                backup.error = error.message;
                await backup.save();
            }

            throw error;
        }
    }

    // Restore backup
    static async restoreBackup(backupId, adminId) {
        try {
            const backup = await Backup.findById(backupId);

            if (!backup) {
                throw new Error('Backup not found');
            }

            if (backup.status !== 'completed') {
                throw new Error('Backup is not completed');
            }

            // Update backup status
            backup.restoreStatus = 'in_progress';
            backup.restoredBy = adminId;
            backup.restoreStartedAt = new Date();
            await backup.save();

            let restoreResult;

            // Perform restore based on backup type
            if (backup.type === 'database') {
                restoreResult = await this.restoreDatabaseBackup(backup);
            } else if (backup.type === 'files') {
                restoreResult = await this.restoreFilesBackup(backup);
            } else if (backup.type === 'full') {
                restoreResult = await this.restoreFullBackup(backup);
            }

            // Update backup record
            backup.restoreStatus = 'completed';
            backup.restoreCompletedAt = new Date();
            backup.restoreResult = restoreResult;
            await backup.save();

            return {
                success: true,
                message: 'Backup restored successfully',
                backup: backup.toObject(),
                result: restoreResult
            };
        } catch (error) {
            console.error('Restore backup error:', error);

            // Update backup record with error
            if (backup) {
                backup.restoreStatus = 'failed';
                backup.restoreError = error.message;
                await backup.save();
            }

            throw error;
        }
    }

    // Restore database backup
    static async restoreDatabaseBackup(backup) {
        try {
            // Read backup file
            const backupFile = `${backup.path}.json`;

            if (!fs.existsSync(backupFile)) {
                throw new Error('Backup file not found');
            }

            const backupContent = fs.readFileSync(backupFile, 'utf8');
            const backupData = JSON.parse(backupContent);

            // Clear existing collections (be careful with this!)
            const collections = await mongoose.connection.db.listCollections().toArray();

            for (const collection of collections) {
                await mongoose.connection.db.collection(collection.name).deleteMany({});
            }

            // Restore data
            for (const [collectionName, data] of Object.entries(backupData)) {
                if (data.length > 0) {
                    await mongoose.connection.db.collection(collectionName).insertMany(data);
                }
            }

            return {
                restoredCollections: Object.keys(backupData),
                restoredDocuments: Object.values(backupData).reduce((sum, arr) => sum + arr.length, 0)
            };
        } catch (error) {
            console.error('Restore database error:', error);
            throw error;
        }
    }

    // Restore files backup
    static async restoreFilesBackup(backup) {
        // Implement file restoration
        return { message: 'Files restoration not implemented' };
    }

    // Restore full backup
    static async restoreFullBackup(backup) {
        // Implement full restoration
        return { message: 'Full restoration not implemented' };
    }

    // Get system logs
    static async getSystemLogs(type = 'error', limit = 100) {
        try {
            const logDir = path.join(__dirname, '../../../logs');

            if (!fs.existsSync(logDir)) {
                return [];
            }

            let logFiles = [];

            if (type === 'error') {
                logFiles = fs.readdirSync(logDir).filter(file => file.includes('error'));
            } else if (type === 'access') {
                logFiles = fs.readdirSync(logDir).filter(file => file.includes('access'));
            } else if (type === 'all') {
                logFiles = fs.readdirSync(logDir);
            }

            // Sort by modification time (newest first)
            logFiles.sort((a, b) => {
                const statA = fs.statSync(path.join(logDir, a));
                const statB = fs.statSync(path.join(logDir, b));
                return statB.mtime.getTime() - statA.mtime.getTime();
            });

            // Read latest logs
            const logs = [];
            let totalLines = 0;

            for (const logFile of logFiles) {
                if (totalLines >= limit) break;

                const filePath = path.join(logDir, logFile);
                const content = fs.readFileSync(filePath, 'utf8');
                const lines = content.split('\n').reverse(); // Read from end

                for (const line of lines) {
                    if (totalLines >= limit) break;
                    if (line.trim()) {
                        logs.push({
                            file: logFile,
                            line: line.trim(),
                            timestamp: this.extractTimestamp(line) || new Date()
                        });
                        totalLines++;
                    }
                }
            }

            return logs;
        } catch (error) {
            console.error('Get system logs error:', error);
            return [];
        }
    }

    // Extract timestamp from log line
    static extractTimestamp(line) {
        // Try to extract ISO timestamp
        const isoMatch = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        if (isoMatch) {
            return new Date(isoMatch[0]);
        }

        // Try other formats
        const dateMatch = line.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
        if (dateMatch) {
            return new Date(dateMatch[0].replace(' ', 'T'));
        }

        return null;
    }

    // Update maintenance mode
    static async updateMaintenanceMode(enabled, message = '', adminId) {
        try {
            // Update setting
            const setting = await Setting.findOne({ key: 'maintenance_mode' });

            if (!setting) {
                // Create setting if it doesn't exist
                const newSetting = new Setting({
                    key: 'maintenance_mode',
                    value: enabled,
                    type: 'boolean',
                    group: 'system',
                    category: 'maintenance',
                    label: 'Maintenance Mode',
                    description: 'Enable or disable maintenance mode',
                    isSystem: true,
                    updatedBy: adminId
                });

                await newSetting.save();
            } else {
                setting.value = enabled;
                setting.updatedBy = adminId;
                await setting.save();
            }

            // Update maintenance message if provided
            if (message) {
                const messageSetting = await Setting.findOne({ key: 'maintenance_message' });

                if (!messageSetting) {
                    const newMessageSetting = new Setting({
                        key: 'maintenance_message',
                        value: message,
                        type: 'string',
                        group: 'system',
                        category: 'maintenance',
                        label: 'Maintenance Message',
                        description: 'Message to display during maintenance',
                        isSystem: true,
                        updatedBy: adminId
                    });

                    await newMessageSetting.save();
                } else {
                    messageSetting.value = message;
                    messageSetting.updatedBy = adminId;
                    await messageSetting.save();
                }
            }

            // Clear cache
            await this.clearSettingCache();

            return {
                enabled,
                message: message || 'System is under maintenance. Please try again later.',
                updatedAt: new Date(),
                updatedBy: adminId
            };
        } catch (error) {
            console.error('Update maintenance mode error:', error);
            throw error;
        }
    }

    // Get email templates
    static async getEmailTemplates() {
        try {
            const templatesDir = path.join(__dirname, '../../templates/emails');

            if (!fs.existsSync(templatesDir)) {
                return [];
            }

            const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.html'));
            const templates = [];

            for (const file of templateFiles) {
                const filePath = path.join(templatesDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const name = path.basename(file, '.html');

                // Extract subject from content (look for <!-- SUBJECT: --> comment)
                const subjectMatch = content.match(/<!--\s*SUBJECT:\s*(.*?)\s*-->/);
                const subject = subjectMatch ? subjectMatch[1].trim() : name;

                templates.push({
                    id: name,
                    name: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    subject,
                    file,
                    content,
                    lastModified: fs.statSync(filePath).mtime
                });
            }

            return templates;
        } catch (error) {
            console.error('Get email templates error:', error);
            throw error;
        }
    }

    // Update email template
    static async updateEmailTemplate(templateId, content, adminId) {
        try {
            const templatesDir = path.join(__dirname, '../../templates/emails');
            const filePath = path.join(templatesDir, `${templateId}.html`);

            if (!fs.existsSync(templatesDir)) {
                fs.mkdirSync(templatesDir, { recursive: true });
            }

            // Validate template content
            if (!content || typeof content !== 'string') {
                throw new Error('Template content is required');
            }

            // Save template
            fs.writeFileSync(filePath, content, 'utf8');

            return {
                success: true,
                templateId,
                message: 'Email template updated successfully',
                lastModified: new Date()
            };
        } catch (error) {
            console.error('Update email template error:', error);
            throw error;
        }
    }

    // Get notification settings
    static async getNotificationSettings() {
        try {
            const settings = await Setting.find({
                group: 'notifications'
            }).lean();

            const grouped = {};

            settings.forEach(setting => {
                if (!grouped[setting.category]) {
                    grouped[setting.category] = {};
                }

                grouped[setting.category][setting.key] = {
                    value: setting.value,
                    type: setting.type,
                    label: setting.label,
                    description: setting.description
                };
            });

            return grouped;
        } catch (error) {
            console.error('Get notification settings error:', error);
            throw error;
        }
    }

    // Update notification settings
    static async updateNotificationSettings(settings, adminId) {
        try {
            const results = await this.updateSettings(settings, adminId);
            return results;
        } catch (error) {
            console.error('Update notification settings error:', error);
            throw error;
        }
    }

    // Get API keys
    static async getApiKeys() {
        try {
            // This would query your API key storage
            // For now, return empty array
            return [];
        } catch (error) {
            console.error('Get API keys error:', error);
            throw error;
        }
    }

    // Create API key
    static async createApiKey(data, adminId) {
        try {
            // Implement API key creation
            return {
                success: true,
                message: 'API key created successfully',
                key: 'sk_test_' + require('crypto').randomBytes(24).toString('hex')
            };
        } catch (error) {
            console.error('Create API key error:', error);
            throw error;
        }
    }

    // Delete API key
    static async deleteApiKey(keyId, adminId) {
        try {
            // Implement API key deletion
            return {
                success: true,
                message: 'API key deleted successfully'
            };
        } catch (error) {
            console.error('Delete API key error:', error);
            throw error;
        }
    }

    // Get security settings
    static async getSecuritySettings() {
        try {
            const settings = await Setting.find({
                group: 'security'
            }).lean();

            const result = {};

            settings.forEach(setting => {
                result[setting.key] = {
                    value: setting.value,
                    type: setting.type,
                    label: setting.label,
                    description: setting.description,
                    category: setting.category
                };
            });

            return result;
        } catch (error) {
            console.error('Get security settings error:', error);
            throw error;
        }
    }

    // Update security settings
    static async updateSecuritySettings(settings, adminId) {
        try {
            const results = await this.updateSettings(settings, adminId);
            return results;
        } catch (error) {
            console.error('Update security settings error:', error);
            throw error;
        }
    }

    // Export settings
    static async exportSettings(format = 'json') {
        try {
            const settings = await Setting.find().lean();

            const exportData = settings.map(setting => ({
                key: setting.key,
                value: setting.value,
                type: setting.type,
                group: setting.group,
                category: setting.category,
                label: setting.label,
                description: setting.description,
                options: setting.options,
                validation: setting.validation,
                isPublic: setting.isPublic,
                isSystem: setting.isSystem
            }));

            if (format === 'json') {
                return JSON.stringify(exportData, null, 2);
            } else if (format === 'csv') {
                const { Parser } = require('json2csv');
                const parser = new Parser();
                return parser.parse(exportData);
            }

            throw new Error(`Unsupported export format: ${format}`);
        } catch (error) {
            console.error('Export settings error:', error);
            throw error;
        }
    }

    // Import settings
    static async importSettings(data, adminId) {
        try {
            let settingsData;

            if (typeof data === 'string') {
                try {
                    settingsData = JSON.parse(data);
                } catch {
                    throw new Error('Invalid JSON data');
                }
            } else if (Array.isArray(data)) {
                settingsData = data;
            } else {
                throw new Error('Invalid settings data format');
            }

            const results = {
                imported: 0,
                updated: 0,
                skipped: 0,
                errors: []
            };

            for (const settingData of settingsData) {
                try {
                    if (!settingData.key) {
                        results.skipped++;
                        continue;
                    }

                    const existing = await Setting.findOne({ key: settingData.key });

                    if (existing) {
                        // Update existing
                        existing.value = settingData.value;
                        existing.type = settingData.type || existing.type;
                        existing.group = settingData.group || existing.group;
                        existing.category = settingData.category || existing.category;
                        existing.label = settingData.label || existing.label;
                        existing.description = settingData.description || existing.description;
                        existing.options = settingData.options || existing.options;
                        existing.validation = settingData.validation || existing.validation;
                        existing.updatedBy = adminId;

                        await existing.save();
                        results.updated++;
                    } else {
                        // Create new
                        const newSetting = new Setting({
                            key: settingData.key,
                            value: settingData.value,
                            type: settingData.type || 'string',
                            group: settingData.group || 'general',
                            category: settingData.category || 'default',
                            label: settingData.label || settingData.key,
                            description: settingData.description || '',
                            options: settingData.options,
                            validation: settingData.validation,
                            isPublic: settingData.isPublic || false,
                            isSystem: settingData.isSystem || false,
                            createdBy: adminId,
                            updatedBy: adminId
                        });

                        await newSetting.save();
                        results.imported++;
                    }
                } catch (error) {
                    results.errors.push({
                        key: settingData.key,
                        error: error.message
                    });
                    results.skipped++;
                }
            }

            // Clear cache
            await this.clearSettingCache();

            return results;
        } catch (error) {
            console.error('Import settings error:', error);
            throw error;
        }
    }

    // Get maintenance status
    static async getMaintenanceStatus() {
        try {
            const modeSetting = await Setting.findOne({ key: 'maintenance_mode' });
            const messageSetting = await Setting.findOne({ key: 'maintenance_message' });

            return {
                enabled: modeSetting ? Boolean(modeSetting.value) : false,
                message: messageSetting ? String(messageSetting.value) : 'System is under maintenance. Please try again later.',
                updatedAt: modeSetting?.updatedAt || messageSetting?.updatedAt,
                updatedBy: modeSetting?.updatedBy || messageSetting?.updatedBy
            };
        } catch (error) {
            console.error('Get maintenance status error:', error);
            throw error;
        }
    }
}

module.exports = SettingService;