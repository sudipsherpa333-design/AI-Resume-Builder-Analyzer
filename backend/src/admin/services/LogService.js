const AdminLog = require('../models/AdminLog');
const Admin = require('../models/Admin');

class LogService {
    // Create log entry
    static async createActionLog(adminId, action, details = {}) {
        try {
            const log = new AdminLog({
                admin: adminId,
                action,
                ...details
            });

            await log.save();
            return log;
        } catch (error) {
            console.error('Error creating log:', error);
            // Don't throw error for log failures
        }
    }

    // Get logs with filters
    static async getLogs(filters = {}, page = 1, limit = 50) {
        try {
            const query = {};

            // Apply filters
            if (filters.adminId) query.admin = filters.adminId;
            if (filters.action) query.action = filters.action;
            if (filters.module) query.module = filters.module;
            if (filters.success !== undefined) query.success = filters.success;

            // Date range filter
            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) {
                    query.timestamp.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.timestamp.$lte = endDate;
                }
            }

            // Search in details
            if (filters.search) {
                query.$or = [
                    { 'details.email': { $regex: filters.search, $options: 'i' } },
                    { 'details.ip': { $regex: filters.search, $options: 'i' } },
                    { errorMessage: { $regex: filters.search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;

            const [logs, total] = await Promise.all([
                AdminLog.find(query)
                    .populate('admin', 'name email role')
                    .sort({ timestamp: -1 })
                    .skip(skip)
                    .limit(limit),
                AdminLog.countDocuments(query)
            ]);

            // Format logs for response
            const formattedLogs = logs.map(log => ({
                id: log._id,
                action: log.action,
                module: log.module,
                admin: log.admin,
                ipAddress: log.ipAddress,
                userAgent: log.userAgent,
                details: log.details,
                success: log.success,
                errorMessage: log.errorMessage,
                timestamp: log.timestamp,
                createdAt: log.createdAt
            }));

            return {
                logs: formattedLogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // Get login logs
    static async getLoginLogs(filters = {}, page = 1, limit = 50) {
        filters.action = 'login';
        return await this.getLogs(filters, page, limit);
    }

    // Get audit logs
    static async getAuditLogs(filters = {}, page = 1, limit = 50) {
        filters.action = { $in: ['create', 'update', 'delete'] };
        return await this.getLogs(filters, page, limit);
    }

    // Get system statistics
    static async getLogStatistics() {
        try {
            const stats = await AdminLog.aggregate([
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                        },
                        total: { $sum: 1 },
                        success: {
                            $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
                        },
                        failed: {
                            $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
                        }
                    }
                },
                { $sort: { _id: -1 } },
                { $limit: 30 }
            ]);

            // Get top actions
            const topActions = await AdminLog.aggregate([
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // Get admin activity
            const adminActivity = await AdminLog.aggregate([
                {
                    $group: {
                        _id: '$admin',
                        count: { $sum: 1 },
                        lastActivity: { $max: '$timestamp' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]);

            // Populate admin names
            const adminIds = adminActivity.map(a => a._id);
            const admins = await Admin.find({ _id: { $in: adminIds } })
                .select('name email role');

            const activityWithNames = adminActivity.map(activity => {
                const admin = admins.find(a => a._id.equals(activity._id));
                return {
                    admin: admin ? {
                        name: admin.name,
                        email: admin.email,
                        role: admin.role
                    } : null,
                    count: activity.count,
                    lastActivity: activity.lastActivity
                };
            });

            return {
                dailyStats: stats,
                topActions,
                adminActivity: activityWithNames,
                totalLogs: await AdminLog.countDocuments(),
                successRate: await this.calculateSuccessRate()
            };
        } catch (error) {
            throw error;
        }
    }

    // Calculate success rate
    static async calculateSuccessRate() {
        const result = await AdminLog.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    success: {
                        $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
                    }
                }
            }
        ]);

        if (result.length === 0 || result[0].total === 0) {
            return 0;
        }

        return (result[0].success / result[0].total) * 100;
    }

    // Clear old logs (keep last 90 days)
    static async clearOldLogs() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 90);

            const result = await AdminLog.deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            return {
                deletedCount: result.deletedCount,
                message: `Cleared logs older than ${cutoffDate.toISOString()}`
            };
        } catch (error) {
            throw error;
        }
    }

    // Export logs
    static async exportLogs(filters = {}) {
        try {
            const query = {};

            if (filters.startDate || filters.endDate) {
                query.timestamp = {};
                if (filters.startDate) {
                    query.timestamp.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    const endDate = new Date(filters.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    query.timestamp.$lte = endDate;
                }
            }

            const logs = await AdminLog.find(query)
                .populate('admin', 'name email role')
                .sort({ timestamp: -1 })
                .limit(1000); // Limit exports to 1000 records

            // Format for CSV/Excel
            const formattedLogs = logs.map(log => ({
                'Log ID': log._id,
                'Timestamp': log.timestamp.toISOString(),
                'Action': log.action,
                'Module': log.module || '',
                'Admin Name': log.admin ? log.admin.name : 'System',
                'Admin Email': log.admin ? log.admin.email : '',
                'Admin Role': log.admin ? log.admin.role : '',
                'IP Address': log.ipAddress || '',
                'Success': log.success ? 'Yes' : 'No',
                'Error Message': log.errorMessage || '',
                'Details': JSON.stringify(log.details || {})
            }));

            return formattedLogs;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LogService;