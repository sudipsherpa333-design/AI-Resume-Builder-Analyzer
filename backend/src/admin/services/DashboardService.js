const mongoose = require('mongoose');
const User = require('../../api/models/User');
const Resume = require('../models/Resume');
const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');
const Setting = require('../models/Setting');
const moment = require('moment');

class DashboardService {
    // Get comprehensive dashboard statistics
    static async getDashboardStats(timeRange = '30d') {
        try {
            const dateRange = this.getDateRange(timeRange);

            const [
                userStats,
                resumeStats,
                adminStats,
                revenueStats,
                activityStats,
                systemStats,
                topResumes,
                recentActivities
            ] = await Promise.all([
                this.getUserStatistics(dateRange),
                this.getResumeStatistics(dateRange),
                this.getAdminStatistics(),
                this.getRevenueStatistics(dateRange),
                this.getActivityStatistics(dateRange),
                this.getSystemStatistics(),
                this.getTopResumes(5),
                this.getRecentActivities(10)
            ]);

            return {
                summary: {
                    totalUsers: userStats.total,
                    totalResumes: resumeStats.total,
                    totalAdmins: adminStats.total,
                    totalRevenue: revenueStats.total,
                    systemHealth: systemStats.healthScore
                },
                users: userStats,
                resumes: resumeStats,
                admins: adminStats,
                revenue: revenueStats,
                activity: activityStats,
                system: systemStats,
                topResumes,
                recentActivities,
                charts: {
                    userGrowth: await this.getUserGrowthChart(dateRange),
                    resumeGrowth: await this.getResumeGrowthChart(dateRange),
                    trafficSources: await this.getTrafficSourcesChart(dateRange),
                    templateUsage: await this.getTemplateUsageChart(dateRange)
                },
                lastUpdated: new Date()
            };
        } catch (error) {
            console.error('Dashboard stats error:', error);
            throw error;
        }
    }

    // Get date range based on time range parameter
    static getDateRange(timeRange) {
        const endDate = new Date();
        const startDate = new Date();

        switch (timeRange) {
            case '24h':
                startDate.setDate(endDate.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }

        return { startDate, endDate };
    }

    // Get user statistics
    static async getUserStatistics(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const stats = await User.aggregate([
                {
                    $facet: {
                        // Overall statistics
                        overall: [
                            { $count: 'total' }
                        ],
                        // Date range statistics
                        rangeStats: [
                            {
                                $match: {
                                    createdAt: { $gte: startDate, $lte: endDate }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    count: { $sum: 1 },
                                    verified: {
                                        $sum: { $cond: [{ $ifNull: ['$isEmailVerified', false] }, 1, 0] }
                                    },
                                    active: {
                                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                                    }
                                }
                            }
                        ],
                        // Daily registrations
                        dailyRegistrations: [
                            {
                                $match: {
                                    createdAt: { $gte: startDate, $lte: endDate }
                                }
                            },
                            {
                                $group: {
                                    _id: {
                                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                                    },
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { _id: 1 } }
                        ],
                        // By source
                        bySource: [
                            {
                                $group: {
                                    _id: '$source',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        // By status
                        byStatus: [
                            {
                                $group: {
                                    _id: '$status',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        // By role
                        byRole: [
                            {
                                $group: {
                                    _id: '$role',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        // Recent users
                        recentUsers: [
                            { $sort: { createdAt: -1 } },
                            { $limit: 5 },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1,
                                    createdAt: 1,
                                    lastLogin: 1,
                                    status: 1
                                }
                            }
                        ]
                    }
                }
            ]);

            const result = stats[0];
            const total = result.overall[0]?.total || 0;
            const rangeData = result.rangeStats[0] || { count: 0, verified: 0, active: 0 };

            return {
                total,
                range: {
                    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                    newUsers: rangeData.count,
                    verifiedUsers: rangeData.verified,
                    activeUsers: rangeData.active,
                    growthRate: total > 0 ? ((rangeData.count / total) * 100).toFixed(2) : 0
                },
                dailyRegistrations: result.dailyRegistrations.map(item => ({
                    date: item._id,
                    count: item.count
                })),
                bySource: result.bySource.reduce((acc, item) => {
                    acc[item._id || 'direct'] = item.count;
                    return acc;
                }, {}),
                byStatus: result.byStatus.reduce((acc, item) => {
                    acc[item._id || 'active'] = item.count;
                    return acc;
                }, {}),
                byRole: result.byRole.reduce((acc, item) => {
                    acc[item._id || 'user'] = item.count;
                    return acc;
                }, {}),
                recentUsers: result.recentUsers.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin,
                    status: user.status
                }))
            };
        } catch (error) {
            console.error('User statistics error:', error);
            throw error;
        }
    }

    // Get resume statistics
    static async getResumeStatistics(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const stats = await Resume.aggregate([
                {
                    $facet: {
                        // Overall statistics
                        overall: [
                            { $count: 'total' }
                        ],
                        // Date range statistics
                        rangeStats: [
                            {
                                $match: {
                                    createdAt: { $gte: startDate, $lte: endDate },
                                    status: { $ne: 'deleted' }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    count: { $sum: 1 },
                                    published: {
                                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                                    },
                                    views: { $sum: '$views' },
                                    downloads: { $sum: '$downloads' },
                                    avgCompletion: { $avg: '$completionPercentage' }
                                }
                            }
                        ],
                        // Daily creations
                        dailyCreations: [
                            {
                                $match: {
                                    createdAt: { $gte: startDate, $lte: endDate },
                                    status: { $ne: 'deleted' }
                                }
                            },
                            {
                                $group: {
                                    _id: {
                                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                                    },
                                    count: { $sum: 1 },
                                    views: { $sum: '$views' },
                                    downloads: { $sum: '$downloads' }
                                }
                            },
                            { $sort: { _id: 1 } }
                        ],
                        // By status
                        byStatus: [
                            {
                                $group: {
                                    _id: '$status',
                                    count: { $sum: 1 },
                                    avgCompletion: { $avg: '$completionPercentage' }
                                }
                            }
                        ],
                        // By template
                        byTemplate: [
                            {
                                $match: {
                                    status: { $ne: 'deleted' }
                                }
                            },
                            {
                                $group: {
                                    _id: '$template',
                                    count: { $sum: 1 },
                                    avgViews: { $avg: '$views' },
                                    avgCompletion: { $avg: '$completionPercentage' }
                                }
                            },
                            { $sort: { count: -1 } },
                            { $limit: 10 }
                        ],
                        // By completion
                        byCompletion: [
                            {
                                $match: {
                                    status: { $ne: 'deleted' }
                                }
                            },
                            {
                                $bucket: {
                                    groupBy: '$completionPercentage',
                                    boundaries: [0, 25, 50, 75, 100],
                                    default: 'other',
                                    output: {
                                        count: { $sum: 1 },
                                        avgViews: { $avg: '$views' }
                                    }
                                }
                            }
                        ],
                        // Recent resumes
                        recentResumes: [
                            {
                                $match: {
                                    status: { $ne: 'deleted' }
                                }
                            },
                            { $sort: { createdAt: -1 } },
                            { $limit: 5 },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'user',
                                    foreignField: '_id',
                                    as: 'userInfo'
                                }
                            },
                            { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                    status: 1,
                                    template: 1,
                                    views: 1,
                                    downloads: 1,
                                    completionPercentage: 1,
                                    createdAt: 1,
                                    userName: 1,
                                    userEmail: 1,
                                    'userInfo.name': 1,
                                    'userInfo.email': 1
                                }
                            }
                        ]
                    }
                }
            ]);

            const result = stats[0];
            const total = result.overall[0]?.total || 0;
            const rangeData = result.rangeStats[0] || {
                count: 0,
                published: 0,
                views: 0,
                downloads: 0,
                avgCompletion: 0
            };

            return {
                total,
                range: {
                    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                    newResumes: rangeData.count,
                    publishedResumes: rangeData.published,
                    totalViews: rangeData.views,
                    totalDownloads: rangeData.downloads,
                    avgCompletion: Math.round(rangeData.avgCompletion || 0),
                    growthRate: total > 0 ? ((rangeData.count / total) * 100).toFixed(2) : 0
                },
                dailyCreations: result.dailyCreations.map(item => ({
                    date: item._id,
                    count: item.count,
                    views: item.views,
                    downloads: item.downloads
                })),
                byStatus: result.byStatus.reduce((acc, item) => {
                    acc[item._id] = {
                        count: item.count,
                        avgCompletion: Math.round(item.avgCompletion || 0)
                    };
                    return acc;
                }, {}),
                byTemplate: result.byTemplate.map(item => ({
                    template: item._id,
                    count: item.count,
                    avgViews: Math.round(item.avgViews || 0),
                    avgCompletion: Math.round(item.avgCompletion || 0)
                })),
                byCompletion: result.byCompletion.map(item => ({
                    range: `${item._id}-${item._id + 25}%`,
                    count: item.count,
                    avgViews: Math.round(item.avgViews || 0)
                })),
                recentResumes: result.recentResumes.map(resume => ({
                    id: resume._id,
                    title: resume.title,
                    status: resume.status,
                    template: resume.template,
                    views: resume.views,
                    downloads: resume.downloads,
                    completionPercentage: resume.completionPercentage,
                    createdAt: resume.createdAt,
                    user: {
                        name: resume.userInfo?.name || resume.userName,
                        email: resume.userInfo?.email || resume.userEmail
                    }
                }))
            };
        } catch (error) {
            console.error('Resume statistics error:', error);
            throw error;
        }
    }

    // Get admin statistics
    static async getAdminStatistics() {
        try {
            const stats = await Admin.aggregate([
                {
                    $facet: {
                        // Overall statistics
                        overall: [
                            { $count: 'total' }
                        ],
                        // By role
                        byRole: [
                            {
                                $group: {
                                    _id: '$role',
                                    count: { $sum: 1 },
                                    active: {
                                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                                    }
                                }
                            }
                        ],
                        // Recent logins
                        recentLogins: [
                            {
                                $match: {
                                    lastLogin: { $ne: null }
                                }
                            },
                            { $sort: { lastLogin: -1 } },
                            { $limit: 5 },
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    email: 1,
                                    role: 1,
                                    lastLogin: 1,
                                    lastLoginIp: 1,
                                    isActive: 1
                                }
                            }
                        ],
                        // Activity by admin
                        adminActivity: [
                            {
                                $lookup: {
                                    from: 'adminlogs',
                                    localField: '_id',
                                    foreignField: 'admin',
                                    as: 'logs'
                                }
                            },
                            {
                                $project: {
                                    name: 1,
                                    email: 1,
                                    role: 1,
                                    activityCount: { $size: '$logs' },
                                    lastActivity: { $max: '$logs.timestamp' }
                                }
                            },
                            { $sort: { activityCount: -1 } },
                            { $limit: 5 }
                        ]
                    }
                }
            ]);

            const result = stats[0];
            const total = result.overall[0]?.total || 0;

            const byRole = result.byRole.reduce((acc, item) => {
                acc[item._id] = {
                    total: item.count,
                    active: item.active,
                    inactive: item.count - item.active
                };
                return acc;
            }, {});

            const activeAdmins = Object.values(byRole).reduce((sum, role) => sum + role.active, 0);

            return {
                total,
                active: activeAdmins,
                inactive: total - activeAdmins,
                byRole,
                recentLogins: result.recentLogins.map(admin => ({
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    lastLogin: admin.lastLogin,
                    lastLoginIp: admin.lastLoginIp,
                    isActive: admin.isActive
                })),
                adminActivity: result.adminActivity.map(admin => ({
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    activityCount: admin.activityCount,
                    lastActivity: admin.lastActivity
                }))
            };
        } catch (error) {
            console.error('Admin statistics error:', error);
            throw error;
        }
    }

    // Get revenue statistics (if applicable)
    static async getRevenueStatistics(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            // This is a placeholder - implement based on your payment system
            // Example using a hypothetical Payment model

            return {
                total: 0,
                range: {
                    period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
                    revenue: 0,
                    transactions: 0,
                    avgTransaction: 0,
                    growthRate: 0
                },
                byPlan: {},
                byStatus: {},
                recentTransactions: []
            };
        } catch (error) {
            console.error('Revenue statistics error:', error);
            throw error;
        }
    }

    // Get activity statistics
    static async getActivityStatistics(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const stats = await AdminLog.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $facet: {
                        // Overall statistics
                        overall: [
                            {
                                $group: {
                                    _id: null,
                                    total: { $sum: 1 },
                                    success: {
                                        $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
                                    },
                                    failed: {
                                        $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
                                    }
                                }
                            }
                        ],
                        // Daily activity
                        dailyActivity: [
                            {
                                $group: {
                                    _id: {
                                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                                    },
                                    count: { $sum: 1 },
                                    success: {
                                        $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
                                    }
                                }
                            },
                            { $sort: { _id: 1 } }
                        ],
                        // By action type
                        byAction: [
                            {
                                $group: {
                                    _id: '$action',
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { count: -1 } },
                            { $limit: 10 }
                        ],
                        // By module
                        byModule: [
                            {
                                $group: {
                                    _id: '$module',
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { count: -1 } }
                        ],
                        // By admin
                        byAdmin: [
                            {
                                $group: {
                                    _id: '$admin',
                                    count: { $sum: 1 },
                                    success: {
                                        $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
                                    }
                                }
                            },
                            { $sort: { count: -1 } },
                            { $limit: 10 }
                        ],
                        // Recent activities
                        recentActivities: [
                            { $sort: { timestamp: -1 } },
                            { $limit: 10 },
                            {
                                $lookup: {
                                    from: 'admins',
                                    localField: 'admin',
                                    foreignField: '_id',
                                    as: 'adminInfo'
                                }
                            },
                            { $unwind: { path: '$adminInfo', preserveNullAndEmptyArrays: true } },
                            {
                                $project: {
                                    _id: 1,
                                    action: 1,
                                    module: 1,
                                    success: 1,
                                    timestamp: 1,
                                    ipAddress: 1,
                                    details: 1,
                                    errorMessage: 1,
                                    admin: {
                                        name: '$adminInfo.name',
                                        email: '$adminInfo.email',
                                        role: '$adminInfo.role'
                                    }
                                }
                            }
                        ]
                    }
                }
            ]);

            const result = stats[0];
            const overall = result.overall[0] || { total: 0, success: 0, failed: 0 };

            return {
                total: overall.total,
                success: overall.success,
                failed: overall.failed,
                successRate: overall.total > 0 ? ((overall.success / overall.total) * 100).toFixed(2) : 0,
                dailyActivity: result.dailyActivity.map(item => ({
                    date: item._id,
                    count: item.count,
                    success: item.success,
                    failed: item.count - item.success
                })),
                byAction: result.byAction.map(item => ({
                    action: item._id,
                    count: item.count
                })),
                byModule: result.byModule.reduce((acc, item) => {
                    acc[item._id || 'other'] = item.count;
                    return acc;
                }, {}),
                byAdmin: result.byAdmin.map(item => ({
                    adminId: item._id,
                    count: item.count,
                    success: item.success,
                    failed: item.count - item.success
                })),
                recentActivities: result.recentActivities.map(log => ({
                    id: log._id,
                    action: log.action,
                    module: log.module,
                    success: log.success,
                    timestamp: log.timestamp,
                    ipAddress: log.ipAddress,
                    details: log.details,
                    errorMessage: log.errorMessage,
                    admin: log.admin
                }))
            };
        } catch (error) {
            console.error('Activity statistics error:', error);
            throw error;
        }
    }

    // Get system statistics
    static async getSystemStatistics() {
        try {
            const [
                memoryUsage,
                databaseStats,
                uptime,
                diskUsage,
                recentErrors,
                queueStats
            ] = await Promise.all([
                this.getMemoryUsage(),
                this.getDatabaseStats(),
                this.getUptime(),
                this.getDiskUsage(),
                this.getRecentErrors(),
                this.getQueueStats()
            ]);

            // Calculate health score
            const healthScore = this.calculateHealthScore({
                memory: memoryUsage,
                database: databaseStats,
                errors: recentErrors.length
            });

            return {
                healthScore,
                status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
                memory: memoryUsage,
                database: databaseStats,
                uptime,
                disk: diskUsage,
                recentErrors,
                queue: queueStats,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('System statistics error:', error);
            throw error;
        }
    }

    // Get memory usage
    static getMemoryUsage() {
        const memory = process.memoryUsage();
        const heapUsedPercentage = (memory.heapUsed / memory.heapTotal) * 100;

        return {
            rss: this.formatBytes(memory.rss),
            heapTotal: this.formatBytes(memory.heapTotal),
            heapUsed: this.formatBytes(memory.heapUsed),
            heapUsedPercentage: Math.round(heapUsedPercentage),
            external: this.formatBytes(memory.external),
            arrayBuffers: this.formatBytes(memory.arrayBuffers),
            status: heapUsedPercentage > 90 ? 'critical' : heapUsedPercentage > 80 ? 'warning' : 'healthy'
        };
    }

    // Get database statistics
    static async getDatabaseStats() {
        try {
            const adminDb = mongoose.connection.db.admin();
            const serverInfo = await adminDb.serverInfo();
            const dbStats = await mongoose.connection.db.stats();
            const collections = await mongoose.connection.db.listCollections().toArray();

            return {
                type: 'MongoDB',
                version: serverInfo.version,
                host: mongoose.connection.host,
                port: mongoose.connection.port,
                name: mongoose.connection.name,
                collections: collections.length,
                documents: dbStats.objects,
                dataSize: this.formatBytes(dbStats.dataSize),
                storageSize: this.formatBytes(dbStats.storageSize),
                indexSize: this.formatBytes(dbStats.indexSize),
                status: 'connected',
                collectionsList: collections.map(coll => coll.name).slice(0, 10) // Top 10 collections
            };
        } catch (error) {
            return {
                type: 'MongoDB',
                status: 'disconnected',
                error: error.message
            };
        }
    }

    // Get uptime
    static getUptime() {
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
            startedAt: new Date(Date.now() - (uptime * 1000)),
            formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
        };
    }

    // Get disk usage
    static getDiskUsage() {
        try {
            const disk = require('diskusage');
            const path = require('path');
            const root = path.parse(process.cwd()).root;

            // This would need diskusage package
            return {
                total: 'N/A',
                free: 'N/A',
                used: 'N/A',
                usedPercentage: 0,
                status: 'unknown'
            };
        } catch (error) {
            return {
                total: 'N/A',
                free: 'N/A',
                used: 'N/A',
                usedPercentage: 0,
                status: 'unknown',
                error: 'Disk usage monitoring not available'
            };
        }
    }

    // Get recent errors
    static async getRecentErrors(limit = 10) {
        try {
            const errors = await AdminLog.find({
                success: false,
                timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
            })
                .sort({ timestamp: -1 })
                .limit(limit)
                .populate('admin', 'name email')
                .lean();

            return errors.map(log => ({
                id: log._id,
                action: log.action,
                module: log.module,
                admin: log.admin ? {
                    name: log.admin.name,
                    email: log.admin.email
                } : null,
                errorMessage: log.errorMessage,
                timestamp: log.timestamp,
                details: log.details
            }));
        } catch (error) {
            console.error('Recent errors error:', error);
            return [];
        }
    }

    // Get queue statistics
    static async getQueueStats() {
        // Implement based on your queue system (Bull, Agenda, etc.)
        return {
            enabled: false,
            totalJobs: 0,
            activeJobs: 0,
            waitingJobs: 0,
            completedJobs: 0,
            failedJobs: 0,
            delayedJobs: 0,
            status: 'inactive'
        };
    }

    // Calculate health score
    static calculateHealthScore(metrics) {
        let score = 100;

        // Deduct for high memory usage
        if (metrics.memory.heapUsedPercentage > 90) score -= 30;
        else if (metrics.memory.heapUsedPercentage > 80) score -= 20;
        else if (metrics.memory.heapUsedPercentage > 70) score -= 10;

        // Deduct for database issues
        if (metrics.database.status === 'disconnected') score -= 30;

        // Deduct for recent errors
        if (metrics.errors > 10) score -= 20;
        else if (metrics.errors > 5) score -= 10;
        else if (metrics.errors > 0) score -= 5;

        return Math.max(0, Math.min(100, score));
    }

    // Get top resumes
    static async getTopResumes(limit = 5) {
        try {
            const topResumes = await Resume.find({ status: { $ne: 'deleted' } })
                .sort({ views: -1 })
                .limit(limit)
                .populate('user', 'name email')
                .lean();

            return topResumes.map(resume => ({
                id: resume._id,
                title: resume.title,
                user: resume.user ? {
                    name: resume.user.name,
                    email: resume.user.email
                } : {
                    name: resume.userName,
                    email: resume.userEmail
                },
                views: resume.views,
                downloads: resume.downloads,
                completionPercentage: resume.completionPercentage,
                template: resume.template,
                createdAt: resume.createdAt
            }));
        } catch (error) {
            console.error('Top resumes error:', error);
            throw error;
        }
    }

    // Get recent activities
    static async getRecentActivities(limit = 10) {
        try {
            const activities = await AdminLog.find()
                .sort({ timestamp: -1 })
                .limit(limit)
                .populate('admin', 'name email role')
                .lean();

            return activities.map(activity => ({
                id: activity._id,
                admin: activity.admin ? {
                    name: activity.admin.name,
                    email: activity.admin.email,
                    role: activity.admin.role
                } : null,
                action: activity.action,
                module: activity.module,
                success: activity.success,
                timestamp: activity.timestamp,
                timeAgo: this.getTimeAgo(activity.timestamp),
                details: activity.details,
                errorMessage: activity.errorMessage
            }));
        } catch (error) {
            console.error('Recent activities error:', error);
            throw error;
        }
    }

    // Get user growth chart data
    static async getUserGrowthChart(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const registrations = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Fill missing dates with 0
            const allDates = this.getDateArray(startDate, endDate);
            const registrationMap = registrations.reduce((map, item) => {
                map[item._id] = item.count;
                return map;
            }, {});

            const data = allDates.map(date => ({
                date,
                count: registrationMap[date] || 0
            }));

            return {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'User Registrations',
                    data: data.map(d => d.count),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            };
        } catch (error) {
            console.error('User growth chart error:', error);
            throw error;
        }
    }

    // Get resume growth chart data
    static async getResumeGrowthChart(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const creations = await Resume.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: { $ne: 'deleted' }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        views: { $sum: '$views' },
                        downloads: { $sum: '$downloads' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            // Fill missing dates
            const allDates = this.getDateArray(startDate, endDate);
            const creationMap = creations.reduce((map, item) => {
                map[item._id] = item;
                return map;
            }, {});

            const data = allDates.map(date => ({
                date,
                count: creationMap[date]?.count || 0,
                views: creationMap[date]?.views || 0,
                downloads: creationMap[date]?.downloads || 0
            }));

            return {
                labels: data.map(d => d.date),
                datasets: [
                    {
                        label: 'Resumes Created',
                        data: data.map(d => d.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Views',
                        data: data.map(d => d.views),
                        backgroundColor: 'rgba(255, 206, 86, 0.2)',
                        borderColor: 'rgba(255, 206, 86, 1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            };
        } catch (error) {
            console.error('Resume growth chart error:', error);
            throw error;
        }
    }

    // Get traffic sources chart data
    static async getTrafficSourcesChart(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const sources = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$source',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 8 }
            ]);

            const colors = [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40', '#8AC926', '#1982C4'
            ];

            return {
                labels: sources.map(s => s._id || 'Direct'),
                datasets: [{
                    data: sources.map(s => s.count),
                    backgroundColor: colors.slice(0, sources.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            };
        } catch (error) {
            console.error('Traffic sources chart error:', error);
            throw error;
        }
    }

    // Get template usage chart data
    static async getTemplateUsageChart(dateRange) {
        try {
            const { startDate, endDate } = dateRange;

            const templates = await Resume.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        status: { $ne: 'deleted' }
                    }
                },
                {
                    $group: {
                        _id: '$template',
                        count: { $sum: 1 },
                        avgCompletion: { $avg: '$completionPercentage' },
                        avgViews: { $avg: '$views' }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 6 }
            ]);

            return {
                labels: templates.map(t => t._id),
                datasets: [
                    {
                        label: 'Usage Count',
                        data: templates.map(t => t.count),
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        borderColor: 'rgba(153, 102, 255, 1)',
                        borderWidth: 2
                    },
                    {
                        label: 'Avg Completion %',
                        data: templates.map(t => Math.round(t.avgCompletion || 0)),
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 2
                    }
                ]
            };
        } catch (error) {
            console.error('Template usage chart error:', error);
            throw error;
        }
    }

    // Get widgets data
    static async getWidgetsData(widgetIds = []) {
        try {
            const widgets = {};

            for (const widgetId of widgetIds) {
                switch (widgetId) {
                    case 'stats_summary':
                        widgets[widgetId] = await this.getStatsSummaryWidget();
                        break;

                    case 'user_growth':
                        widgets[widgetId] = await this.getUserGrowthWidget();
                        break;

                    case 'resume_analytics':
                        widgets[widgetId] = await this.getResumeAnalyticsWidget();
                        break;

                    case 'system_health':
                        widgets[widgetId] = await this.getSystemHealthWidget();
                        break;

                    case 'recent_activities':
                        widgets[widgetId] = await this.getRecentActivitiesWidget();
                        break;

                    case 'top_performers':
                        widgets[widgetId] = await this.getTopPerformersWidget();
                        break;

                    default:
                        widgets[widgetId] = { error: `Unknown widget: ${widgetId}` };
                }
            }

            return widgets;
        } catch (error) {
            console.error('Widgets data error:', error);
            throw error;
        }
    }

    // Get stats summary widget
    static async getStatsSummaryWidget() {
        try {
            const [
                userCount,
                resumeCount,
                todayUsers,
                todayResumes,
                activeAdmins
            ] = await Promise.all([
                User.countDocuments(),
                Resume.countDocuments({ status: { $ne: 'deleted' } }),
                User.countDocuments({
                    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
                }),
                Resume.countDocuments({
                    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
                    status: { $ne: 'deleted' }
                }),
                Admin.countDocuments({ isActive: true })
            ]);

            return {
                users: {
                    total: userCount,
                    today: todayUsers,
                    change: this.calculateDailyChange(todayUsers, userCount)
                },
                resumes: {
                    total: resumeCount,
                    today: todayResumes,
                    change: this.calculateDailyChange(todayResumes, resumeCount)
                },
                admins: {
                    total: activeAdmins,
                    today: 0,
                    change: 0
                },
                systemHealth: await this.getSystemHealthScore()
            };
        } catch (error) {
            console.error('Stats summary widget error:', error);
            throw error;
        }
    }

    // Get user growth widget
    static async getUserGrowthWidget(days = 7) {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(endDate.getDate() - days);

            const registrations = await User.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return {
                period: `${days} days`,
                total: registrations.reduce((sum, day) => sum + day.count, 0),
                dailyAverage: (registrations.reduce((sum, day) => sum + day.count, 0) / days).toFixed(1),
                data: registrations
            };
        } catch (error) {
            console.error('User growth widget error:', error);
            throw error;
        }
    }

    // Get resume analytics widget
    static async getResumeAnalyticsWidget() {
        try {
            const stats = await Resume.aggregate([
                {
                    $match: {
                        status: { $ne: 'deleted' }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
                        drafts: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' },
                        avgCompletion: { $avg: '$completionPercentage' }
                    }
                }
            ]);

            const result = stats[0] || {
                total: 0,
                published: 0,
                drafts: 0,
                totalViews: 0,
                totalDownloads: 0,
                avgCompletion: 0
            };

            return {
                total: result.total,
                published: result.published,
                drafts: result.drafts,
                views: result.totalViews,
                downloads: result.totalDownloads,
                avgCompletion: Math.round(result.avgCompletion),
                publishedPercentage: result.total > 0 ? Math.round((result.published / result.total) * 100) : 0
            };
        } catch (error) {
            console.error('Resume analytics widget error:', error);
            throw error;
        }
    }

    // Get system health widget
    static async getSystemHealthWidget() {
        try {
            const [memory, dbStats, recentErrors] = await Promise.all([
                this.getMemoryUsage(),
                this.getDatabaseStats(),
                this.getRecentErrors(5)
            ]);

            const healthScore = this.calculateHealthScore({
                memory,
                database: dbStats,
                errors: recentErrors.length
            });

            return {
                score: healthScore,
                status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical',
                metrics: {
                    memory: memory.heapUsedPercentage,
                    database: dbStats.status === 'connected' ? 100 : 0,
                    errors: recentErrors.length
                },
                recentErrors: recentErrors.slice(0, 3)
            };
        } catch (error) {
            console.error('System health widget error:', error);
            throw error;
        }
    }

    // Get recent activities widget
    static async getRecentActivitiesWidget(limit = 5) {
        try {
            const activities = await AdminLog.find()
                .sort({ timestamp: -1 })
                .limit(limit)
                .populate('admin', 'name')
                .lean();

            return activities.map(activity => ({
                id: activity._id,
                admin: activity.admin?.name || 'System',
                action: this.formatAction(activity.action),
                module: activity.module,
                success: activity.success,
                timestamp: activity.timestamp,
                timeAgo: this.getTimeAgo(activity.timestamp)
            }));
        } catch (error) {
            console.error('Recent activities widget error:', error);
            throw error;
        }
    }

    // Get top performers widget
    static async getTopPerformersWidget() {
        try {
            const [topResumes, topUsers] = await Promise.all([
                Resume.find({ status: 'published' })
                    .sort({ views: -1 })
                    .limit(3)
                    .populate('user', 'name')
                    .lean(),
                User.aggregate([
                    {
                        $lookup: {
                            from: 'resumes',
                            localField: '_id',
                            foreignField: 'user',
                            as: 'resumes'
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            email: 1,
                            resumeCount: { $size: '$resumes' },
                            lastLogin: 1
                        }
                    },
                    { $sort: { resumeCount: -1 } },
                    { $limit: 3 }
                ])
            ]);

            return {
                topResumes: topResumes.map(resume => ({
                    id: resume._id,
                    title: resume.title,
                    user: resume.user?.name || resume.userName,
                    views: resume.views,
                    downloads: resume.downloads
                })),
                topUsers: topUsers.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    resumeCount: user.resumeCount,
                    lastLogin: user.lastLogin
                }))
            };
        } catch (error) {
            console.error('Top performers widget error:', error);
            throw error;
        }
    }

    // Get system health score
    static async getSystemHealthScore() {
        const systemStats = await this.getSystemStatistics();
        return systemStats.healthScore;
    }

    // Calculate daily change percentage
    static calculateDailyChange(today, total) {
        if (total === 0) return 0;
        const average = total / 30; // Average per day (30 days)
        if (average === 0) return 0;
        return ((today - average) / average) * 100;
    }

    // Get date array between two dates
    static getDateArray(startDate, endDate) {
        const dates = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }

        return dates;
    }

    // Format bytes to human readable
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Get time ago string
    static getTimeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);

        if (seconds < 60) return 'just now';

        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;

        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;

        const weeks = Math.floor(days / 7);
        if (weeks < 4) return `${weeks}w ago`;

        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;

        const years = Math.floor(days / 365);
        return `${years}y ago`;
    }

    // Format action for display
    static formatAction(action) {
        const actionMap = {
            'login': 'Logged in',
            'logout': 'Logged out',
            'create': 'Created',
            'update': 'Updated',
            'delete': 'Deleted',
            'export': 'Exported',
            'import': 'Imported',
            'password_change': 'Changed password',
            'profile_update': 'Updated profile',
            'system_action': 'System action'
        };

        return actionMap[action] || action.replace(/_/g, ' ');
    }

    // Get analytics data for specific period
    static async getAnalytics(period = '7d', startDate, endDate) {
        try {
            let dateRange;

            if (startDate && endDate) {
                dateRange = {
                    startDate: new Date(startDate),
                    endDate: new Date(endDate)
                };
            } else {
                dateRange = this.getDateRange(period);
            }

            const analytics = await this.getDashboardStats(dateRange);

            return {
                period: dateRange,
                data: analytics,
                generated: new Date()
            };
        } catch (error) {
            console.error('Get analytics error:', error);
            throw error;
        }
    }

    // Get performance metrics
    static async getPerformanceMetrics() {
        try {
            // Database performance
            const dbPerformance = await this.getDatabasePerformance();

            // API performance (simulated)
            const apiPerformance = {
                avgResponseTime: '120ms',
                requestsPerMinute: 45,
                errorRate: '0.5%',
                uptime: '99.9%'
            };

            // Server performance
            const serverPerformance = {
                cpuUsage: '15%',
                memoryUsage: this.getMemoryUsage().heapUsedPercentage + '%',
                diskIO: '45 MB/s',
                networkIO: '120 KB/s'
            };

            return {
                database: dbPerformance,
                api: apiPerformance,
                server: serverPerformance,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Performance metrics error:', error);
            throw error;
        }
    }

    // Get database performance
    static async getDatabasePerformance() {
        try {
            const dbStats = await mongoose.connection.db.stats();
            const adminDb = mongoose.connection.db.admin();
            const serverStatus = await adminDb.serverStatus();

            return {
                operations: {
                    inserts: serverStatus.opcounters?.insert || 0,
                    queries: serverStatus.opcounters?.query || 0,
                    updates: serverStatus.opcounters?.update || 0,
                    deletes: serverStatus.opcounters?.delete || 0
                },
                connections: serverStatus.connections || {},
                network: serverStatus.network || {},
                memory: serverStatus.mem || {},
                assertions: serverStatus.asserts || {}
            };
        } catch (error) {
            console.error('Database performance error:', error);
            return { error: 'Unable to fetch database performance' };
        }
    }

    // Get system alerts
    static async getSystemAlerts() {
        try {
            const alerts = [];
            const now = new Date();

            // Check for system issues
            const systemStats = await this.getSystemStatistics();

            if (systemStats.healthScore < 60) {
                alerts.push({
                    id: 'system_health',
                    type: 'critical',
                    title: 'System Health Critical',
                    message: `System health score is ${systemStats.healthScore}. Immediate attention required.`,
                    timestamp: now
                });
            }

            // Check for high memory usage
            if (systemStats.memory.heapUsedPercentage > 85) {
                alerts.push({
                    id: 'high_memory',
                    type: 'warning',
                    title: 'High Memory Usage',
                    message: `Memory usage is at ${systemStats.memory.heapUsedPercentage}%. Consider optimizing.`,
                    timestamp: now
                });
            }

            // Check for recent errors
            if (systemStats.recentErrors.length > 5) {
                alerts.push({
                    id: 'recent_errors',
                    type: 'warning',
                    title: 'Multiple Errors Detected',
                    message: `${systemStats.recentErrors.length} errors in the last 24 hours.`,
                    timestamp: now
                });
            }

            // Check database connection
            if (systemStats.database.status === 'disconnected') {
                alerts.push({
                    id: 'db_disconnected',
                    type: 'critical',
                    title: 'Database Disconnected',
                    message: 'Database connection lost. System functionality impaired.',
                    timestamp: now
                });
            }

            // Check for backup status (if implemented)
            const backupStatus = await this.getBackupStatus();
            if (backupStatus && backupStatus.lastBackup) {
                const lastBackup = new Date(backupStatus.lastBackup.createdAt);
                const daysSinceBackup = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));

                if (daysSinceBackup > 7) {
                    alerts.push({
                        id: 'backup_overdue',
                        type: 'warning',
                        title: 'Backup Overdue',
                        message: `Last backup was ${daysSinceBackup} days ago. Schedule a new backup.`,
                        timestamp: now
                    });
                }
            }

            return alerts;
        } catch (error) {
            console.error('System alerts error:', error);
            return [];
        }
    }

    // Get backup status (placeholder)
    static async getBackupStatus() {
        // Implement backup status checking
        return null;
    }

    // Get dashboard layout for user
    static async getDashboardLayout(adminId) {
        try {
            // Default layout
            const defaultLayout = {
                widgets: [
                    { id: 'stats_summary', position: { x: 0, y: 0, w: 4, h: 2 } },
                    { id: 'user_growth', position: { x: 4, y: 0, w: 4, h: 2 } },
                    { id: 'resume_analytics', position: { x: 8, y: 0, w: 4, h: 2 } },
                    { id: 'system_health', position: { x: 0, y: 2, w: 6, h: 3 } },
                    { id: 'recent_activities', position: { x: 6, y: 2, w: 6, h: 3 } },
                    { id: 'top_performers', position: { x: 0, y: 5, w: 12, h: 2 } }
                ],
                settings: {
                    theme: 'light',
                    density: 'comfortable',
                    refreshInterval: 300 // seconds
                }
            };

            // In a real implementation, you would store and retrieve user's layout
            return defaultLayout;
        } catch (error) {
            console.error('Get dashboard layout error:', error);
            throw error;
        }
    }

    // Update dashboard layout
    static async updateDashboardLayout(adminId, layout) {
        try {
            // In a real implementation, you would save the layout for the user
            return {
                success: true,
                message: 'Dashboard layout updated successfully',
                layout
            };
        } catch (error) {
            console.error('Update dashboard layout error:', error);
            throw error;
        }
    }

    // Get notifications for dashboard
    static async getNotifications(adminId, limit = 10) {
        try {
            // This would query a notifications collection
            // For now, return sample notifications
            return [
                {
                    id: '1',
                    type: 'info',
                    title: 'System Update Available',
                    message: 'A new system update is available. Please schedule maintenance.',
                    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                    read: false
                },
                {
                    id: '2',
                    type: 'success',
                    title: 'Backup Completed',
                    message: 'Daily system backup completed successfully.',
                    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
                    read: true
                },
                {
                    id: '3',
                    type: 'warning',
                    title: 'High Traffic Alert',
                    message: 'Unusual traffic spike detected. Monitoring required.',
                    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
                    read: false
                }
            ];
        } catch (error) {
            console.error('Get notifications error:', error);
            return [];
        }
    }
}

module.exports = DashboardService;