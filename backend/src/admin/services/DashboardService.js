// src/admin/services/DashboardService.js - UPDATED VERSION
import User from '../../models/User.js';
import Resume from '../../models/Resume.js';
import Template from '../../models/Template.js';
import AILog from '../../models/AILog.js';
import AdminLog from '../models/AdminLog.js';
import mongoose from 'mongoose';
import {
    subDays,
    subHours,
    startOfDay,
    endOfDay,
    format,
    differenceInDays,
    subMonths
} from 'date-fns';

class DashboardService {
    /**
     * Get complete dashboard statistics (main endpoint)
     */
    static async getStats(range = '7d') {
        try {
            const days = this.getDaysFromRange(range);
            const dateFilter = this.getDateFilter(range);

            const [
                summary,
                timeline,
                topTemplates,
                topUsers,
                systemHealth,
                topResumes
            ] = await Promise.all([
                this.getSummaryStats(),
                this.getTimelineData(days),
                this.getTopTemplates(5),
                this.getTopUsers(5),
                this.getSystemHealth(),
                this.getTopResumes(3)
            ]);

            return {
                success: true,
                data: {
                    summary,
                    timeline,
                    topTemplates,
                    topUsers,
                    topResumes,
                    systemHealth,
                    _metadata: {
                        range,
                        days,
                        timestamp: new Date().toISOString()
                    }
                }
            };
        } catch (error) {
            console.error('[DashboardService] Stats error:', error);
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }

    /**
     * Get quick statistics for header/sidebar
     */
    static async getQuickStats() {
        try {
            const now = new Date();
            const todayStart = startOfDay(now);
            const yesterdayStart = startOfDay(subDays(now, 1));
            const yesterdayEnd = endOfDay(subDays(now, 1));
            const weekAgo = subDays(now, 7);

            const [
                todayUsers,
                todayResumes,
                yesterdayUsers,
                yesterdayResumes,
                weekAgoUsers,
                weekAgoResumes,
                pendingActions,
                systemHealthScore,
                activeSessions,
                conversionRate
            ] = await Promise.all([
                User.countDocuments({ createdAt: { $gte: todayStart } }),
                Resume.countDocuments({ createdAt: { $gte: todayStart } }),
                User.countDocuments({
                    createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
                }),
                Resume.countDocuments({
                    createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd }
                }),
                User.countDocuments({
                    createdAt: { $gte: weekAgo, $lte: yesterdayStart }
                }),
                Resume.countDocuments({
                    createdAt: { $gte: weekAgo, $lte: yesterdayStart }
                }),
                AdminLog.countDocuments({ status: 'pending' }),
                this.getSystemHealthScore(),
                User.countDocuments({ lastLogin: { $gte: subHours(new Date(), 24) } }),
                this.calculateConversionRate()
            ]);

            // Calculate growth percentages
            const userGrowth = yesterdayUsers > 0
                ? ((todayUsers - yesterdayUsers) / yesterdayUsers * 100).toFixed(1)
                : todayUsers > 0 ? 100 : 0;

            const resumeGrowth = yesterdayResumes > 0
                ? ((todayResumes - yesterdayResumes) / yesterdayResumes * 100).toFixed(1)
                : todayResumes > 0 ? 100 : 0;

            // Weekly growth
            const weeklyUserGrowth = weekAgoUsers > 0
                ? ((todayUsers + yesterdayUsers - weekAgoUsers) / weekAgoUsers * 100).toFixed(1)
                : 0;

            return {
                success: true,
                data: {
                    todayUsers,
                    todayResumes,
                    userGrowth: parseFloat(userGrowth),
                    resumeGrowth: parseFloat(resumeGrowth),
                    weeklyUserGrowth: parseFloat(weeklyUserGrowth),
                    pendingActions,
                    systemHealth: `${systemHealthScore}%`,
                    databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                    lastBackup: format(subDays(now, 1), 'MMM dd, HH:mm'),
                    uptime: process.uptime(),
                    activeSessions,
                    conversionRate: `${conversionRate}%`
                }
            };
        } catch (error) {
            console.error('[DashboardService] Quick stats error:', error);
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }

    /**
     * Get recent activities (new endpoint)
     */
    static async getRecentActivities(limit = 10) {
        try {
            const activities = await AdminLog.find()
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('admin', 'name email')
                .populate('user', 'name email')
                .lean();

            const formattedActivities = activities.map(activity => ({
                id: activity._id,
                user: activity.user ? {
                    name: activity.user.name,
                    email: activity.user.email
                } : { name: 'System', email: 'system@resumecraft.com' },
                admin: activity.admin ? {
                    name: activity.admin.name,
                    email: activity.admin.email
                } : null,
                action: this.formatAction(activity.action),
                details: activity.description,
                timestamp: activity.createdAt,
                resource: activity.resource,
                status: activity.status,
                icon: this.getActionIcon(activity.action),
                responseTime: activity.responseTime
            }));

            return {
                success: true,
                data: formattedActivities
            };
        } catch (error) {
            console.error('[DashboardService] Recent activities error:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

    /**
     * Get performance metrics (new endpoint)
     */
    static async getPerformanceMetrics() {
        try {
            // Database performance
            const dbStats = await mongoose.connection.db.stats();
            const dbLatency = await this.measureDatabaseLatency();

            // Recent request performance
            const recentLogs = await AdminLog.find()
                .sort({ createdAt: -1 })
                .limit(100)
                .select('responseTime status createdAt')
                .lean();

            const successfulRequests = recentLogs.filter(log => log.status === 'success');
            const avgResponseTime = successfulRequests.length > 0
                ? successfulRequests.reduce((sum, log) => sum + (log.responseTime || 0), 0) / successfulRequests.length
                : 0;

            const successRate = recentLogs.length > 0
                ? (successfulRequests.length / recentLogs.length * 100).toFixed(1)
                : 100;

            // Server memory usage
            const memoryUsage = process.memoryUsage();
            const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal * 100).toFixed(1);

            return {
                success: true,
                data: {
                    database: {
                        connections: mongoose.connection.readyState,
                        collections: Object.keys(mongoose.connection.collections).length,
                        avgResponseTime: dbLatency,
                        storageSize: `${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`,
                        indexSize: `${(dbStats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`,
                        dataSize: `${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`
                    },
                    api: {
                        requestsLastHour: recentLogs.length,
                        avgResponseTime: Math.round(avgResponseTime),
                        successRate: parseFloat(successRate),
                        errorRate: (100 - parseFloat(successRate)).toFixed(1),
                        slowRequests: recentLogs.filter(log => log.responseTime > 5000).length
                    },
                    server: {
                        cpuUsage: process.cpuUsage(),
                        memoryUsage: {
                            heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                            heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
                            percent: parseFloat(memoryPercent)
                        },
                        uptime: process.uptime(),
                        nodeVersion: process.version
                    },
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('[DashboardService] Performance metrics error:', error);
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }

    /**
     * Get system alerts (new endpoint)
     */
    static async getSystemAlerts() {
        try {
            const alerts = [];
            const now = new Date();

            // Check database connection
            if (mongoose.connection.readyState !== 1) {
                alerts.push({
                    id: 'db-connection',
                    type: 'error',
                    title: 'Database Connection Lost',
                    message: 'Unable to connect to MongoDB database',
                    priority: 'high',
                    time: 'Just now',
                    actions: ['restart', 'check_connection']
                });
            }

            // Check for slow queries
            const slowQueries = await AdminLog.countDocuments({
                createdAt: { $gte: subHours(now, 1) },
                responseTime: { $gt: 5000 }
            });

            if (slowQueries > 0) {
                alerts.push({
                    id: 'slow-queries',
                    type: 'warning',
                    title: 'Slow Queries Detected',
                    message: `${slowQueries} queries took longer than 5 seconds in the last hour`,
                    priority: 'medium',
                    time: '1 hour ago'
                });
            }

            // Check disk space (simulated)
            const storageUsed = await this.estimateStorage();
            if (storageUsed > 90) {
                alerts.push({
                    id: 'disk-space',
                    type: 'warning',
                    title: 'Low Disk Space',
                    message: `Database storage at ${storageUsed.toFixed(1)}% capacity`,
                    priority: 'medium',
                    time: '2 hours ago'
                });
            }

            // Check for failed logins
            const failedLogins = await AdminLog.countDocuments({
                createdAt: { $gte: subHours(now, 24) },
                action: 'login_failed',
                status: 'failed'
            });

            if (failedLogins > 10) {
                alerts.push({
                    id: 'failed-logins',
                    type: 'warning',
                    title: 'Multiple Failed Logins',
                    message: `${failedLogins} failed login attempts in last 24 hours`,
                    priority: 'medium',
                    time: '3 hours ago'
                });
            }

            // Add success alerts
            const lastBackup = await AdminLog.findOne({
                action: 'backup_complete',
                status: 'success'
            }).sort({ createdAt: -1 });

            if (lastBackup && differenceInDays(now, lastBackup.createdAt) < 2) {
                alerts.push({
                    id: 'backup-success',
                    type: 'success',
                    title: 'Backup Completed',
                    message: 'Daily database backup completed successfully',
                    priority: 'low',
                    time: format(lastBackup.createdAt, 'MMM dd, HH:mm')
                });
            }

            // System optimization alert
            const lastOptimization = await AdminLog.findOne({
                action: 'system_optimized',
                status: 'success'
            }).sort({ createdAt: -1 });

            if (lastOptimization) {
                alerts.push({
                    id: 'system-optimized',
                    type: 'info',
                    title: 'System Optimized',
                    message: 'Database indexes optimized automatically',
                    priority: 'low',
                    time: format(lastOptimization.createdAt, 'MMM dd, HH:mm')
                });
            }

            return {
                success: true,
                data: alerts
            };
        } catch (error) {
            console.error('[DashboardService] System alerts error:', error);
            return {
                success: false,
                message: error.message,
                data: []
            };
        }
    }

    /**
     * Get top performers across categories (new endpoint)
     */
    static async getTopPerformers() {
        try {
            const [templates, users, resumes] = await Promise.all([
                this.getTopTemplates(3),
                this.getTopUsers(3),
                this.getTopResumes(3)
            ]);

            return {
                success: true,
                data: {
                    templates,
                    users,
                    resumes
                }
            };
        } catch (error) {
            console.error('[DashboardService] Top performers error:', error);
            return {
                success: false,
                message: error.message,
                data: {
                    templates: [],
                    users: [],
                    resumes: []
                }
            };
        }
    }

    /**
     * Get summary statistics (updated)
     */
    static async getSummaryStats() {
        try {
            const [
                totalUsers,
                totalResumes,
                totalTemplates,
                totalAnalyses,
                activeUsers,
                activeSessions,
                todayUsers,
                todayResumes,
                conversionRate,
                verifiedUsers,
                premiumUsers,
                totalStorage
            ] = await Promise.all([
                User.countDocuments(),
                Resume.countDocuments(),
                Template.countDocuments({ isActive: true }),
                AILog.countDocuments(),
                User.countDocuments({ lastLogin: { $gte: subDays(new Date(), 7) } }),
                User.countDocuments({ lastLogin: { $gte: subHours(new Date(), 24) } }),
                User.countDocuments({ createdAt: { $gte: startOfDay(new Date()) } }),
                Resume.countDocuments({ createdAt: { $gte: startOfDay(new Date()) } }),
                this.calculateConversionRate(),
                User.countDocuments({ emailVerified: true }),
                User.countDocuments({ subscription: { $ne: 'free' } }),
                this.estimateStorage()
            ]);

            return {
                totalUsers,
                totalResumes,
                totalTemplates,
                totalAnalyses,
                activeUsers,
                activeSessions,
                todayUsers,
                todayResumes,
                conversionRate: parseFloat(conversionRate),
                avgResumesPerUser: totalUsers > 0 ? (totalResumes / totalUsers).toFixed(2) : 0,
                storageUsed: totalStorage,
                verifiedUsers,
                premiumUsers,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('[DashboardService] Summary stats error:', error);
            throw error;
        }
    }

    /**
     * Get timeline data for charts (updated)
     */
    static async getTimelineData(days) {
        try {
            const timeline = [];
            const now = new Date();

            for (let i = days - 1; i >= 0; i--) {
                const date = subDays(now, i);
                const start = startOfDay(date);
                const end = endOfDay(date);

                const [users, resumes, analyses, failedLogins, successfulLogins] = await Promise.all([
                    User.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    Resume.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    AILog.countDocuments({ createdAt: { $gte: start, $lte: end } }),
                    AdminLog.countDocuments({
                        createdAt: { $gte: start, $lte: end },
                        action: 'login_failed',
                        status: 'failed'
                    }),
                    AdminLog.countDocuments({
                        createdAt: { $gte: start, $lte: end },
                        action: 'login',
                        status: 'success'
                    })
                ]);

                timeline.push({
                    date: format(date, 'yyyy-MM-dd'),
                    displayDate: format(date, 'MMM dd'),
                    users,
                    resumes,
                    analyses,
                    conversions: users > 0 ? ((resumes / users) * 100).toFixed(1) : 0,
                    failedLogins,
                    successfulLogins,
                    totalLogins: failedLogins + successfulLogins
                });
            }

            return timeline;
        } catch (error) {
            console.error('[DashboardService] Timeline error:', error);
            throw error;
        }
    }

    /**
     * Get top performing templates
     */
    static async getTopTemplates(limit = 5) {
        try {
            const templates = await Template.aggregate([
                {
                    $match: { isActive: true }
                },
                {
                    $lookup: {
                        from: 'resumes',
                        localField: '_id',
                        foreignField: 'templateId',
                        as: 'resumes'
                    }
                },
                {
                    $addFields: {
                        usageCount: { $size: '$resumes' },
                        avgRating: { $avg: '$resumes.rating' },
                        lastUsed: { $max: '$resumes.createdAt' }
                    }
                },
                {
                    $sort: { usageCount: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        category: 1,
                        usageCount: 1,
                        avgRating: { $ifNull: ['$avgRating', 0] },
                        downloads: { $ifNull: ['$downloadCount', 0] },
                        lastUsed: 1,
                        status: 1,
                        createdAt: 1,
                        thumbnail: 1
                    }
                }
            ]);

            return templates;
        } catch (error) {
            console.error('[DashboardService] Top templates error:', error);
            throw error;
        }
    }

    /**
     * Get top users by resume count
     */
    static async getTopUsers(limit = 5) {
        try {
            const users = await User.aggregate([
                {
                    $lookup: {
                        from: 'resumes',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'resumes'
                    }
                },
                {
                    $addFields: {
                        resumeCount: { $size: '$resumes' },
                        lastActivity: '$lastLogin',
                        subscriptionTier: '$subscription.plan',
                        isVerified: '$emailVerified'
                    }
                },
                {
                    $match: {
                        resumeCount: { $gt: 0 }
                    }
                },
                {
                    $sort: { resumeCount: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        email: 1,
                        resumeCount: 1,
                        lastActivity: 1,
                        subscriptionTier: 1,
                        isVerified: 1,
                        createdAt: 1,
                        avatar: 1
                    }
                }
            ]);

            return users;
        } catch (error) {
            console.error('[DashboardService] Top users error:', error);
            throw error;
        }
    }

    /**
     * Get top resumes by views/downloads
     */
    static async getTopResumes(limit = 3) {
        try {
            const resumes = await Resume.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $addFields: {
                        userInfo: {
                            name: '$user.name',
                            email: '$user.email',
                            avatar: '$user.avatar'
                        }
                    }
                },
                {
                    $sort: { views: -1, downloads: -1 }
                },
                {
                    $limit: limit
                },
                {
                    $project: {
                        _id: 1,
                        title: 1,
                        userInfo: 1,
                        views: 1,
                        downloads: 1,
                        rating: 1,
                        createdAt: 1,
                        lastViewed: 1,
                        templateId: 1
                    }
                }
            ]);

            return resumes;
        } catch (error) {
            console.error('[DashboardService] Top resumes error:', error);
            return [];
        }
    }

    // ======================
    // HELPER METHODS
    // ======================

    static getDaysFromRange(range) {
        switch (range) {
            case '24h': return 1;
            case '7d': return 7;
            case '30d': return 30;
            case '90d': return 90;
            default: return 7;
        }
    }

    static getDateFilter(range) {
        const days = this.getDaysFromRange(range);
        return { $gte: subDays(new Date(), days) };
    }

    static async calculateConversionRate() {
        const [usersWithResumes, totalUsers] = await Promise.all([
            User.countDocuments({ resumeCount: { $gt: 0 } }),
            User.countDocuments()
        ]);

        return totalUsers > 0 ? (usersWithResumes / totalUsers * 100).toFixed(1) : 0;
    }

    static async estimateStorage() {
        try {
            const stats = await mongoose.connection.db.stats();
            const storageGB = stats.storageSize / 1024 / 1024 / 1024;
            return parseFloat(storageGB.toFixed(2));
        } catch (error) {
            return 0;
        }
    }

    static async getSystemHealth() {
        try {
            // Check database
            const dbHealthy = mongoose.connection.readyState === 1;

            // Check collections exist
            const collections = ['users', 'resumes', 'templates', 'ailogs', 'adminlogs'];
            const collectionChecks = await Promise.all(
                collections.map(col => mongoose.connection.db.listCollections({ name: col }).hasNext())
            );

            const collectionsHealthy = collectionChecks.every(Boolean);

            // Check recent errors
            const recentErrors = await AdminLog.countDocuments({
                createdAt: { $gte: subHours(new Date(), 1) },
                status: 'failed'
            });

            // Check response times
            const slowResponses = await AdminLog.countDocuments({
                createdAt: { $gte: subHours(new Date(), 1) },
                responseTime: { $gt: 5000 }
            });

            // Calculate health score (0-100)
            let score = 100;
            if (!dbHealthy) score -= 50;
            if (!collectionsHealthy) score -= 30;
            if (recentErrors > 10) score -= 20;
            if (slowResponses > 5) score -= 10;

            return {
                score: Math.max(0, score),
                checks: {
                    database: dbHealthy,
                    collections: collectionsHealthy,
                    recentErrors: recentErrors,
                    slowResponses: slowResponses
                },
                status: score >= 90 ? 'healthy' : score >= 70 ? 'warning' : 'critical',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                score: 0,
                checks: { database: false, collections: false, recentErrors: 0, slowResponses: 0 },
                status: 'critical',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    static async getSystemHealthScore() {
        const health = await this.getSystemHealth();
        return health.score;
    }

    static async measureDatabaseLatency() {
        const start = Date.now();
        try {
            await mongoose.connection.db.command({ ping: 1 });
            return Date.now() - start;
        } catch (error) {
            return -1;
        }
    }

    static formatAction(action) {
        const actions = {
            'login': 'Logged in',
            'logout': 'Logged out',
            'create': 'Created',
            'update': 'Updated',
            'delete': 'Deleted',
            'view': 'Viewed',
            'download': 'Downloaded',
            'export': 'Exported',
            'import': 'Imported',
            'login_failed': 'Login failed',
            'password_change': 'Changed password',
            'profile_update': 'Updated profile',
            'backup_complete': 'Backup completed',
            'system_optimized': 'System optimized',
            'user_created': 'User created',
            'resume_created': 'Resume created',
            'template_created': 'Template created'
        };
        return actions[action] || action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    static getActionIcon(action) {
        const icons = {
            'login': '🔑',
            'logout': '🚪',
            'create': '➕',
            'update': '✏️',
            'delete': '🗑️',
            'view': '👁️',
            'download': '⬇️',
            'export': '📤',
            'import': '📥',
            'login_failed': '❌',
            'password_change': '🔐',
            'profile_update': '👤',
            'backup_complete': '💾',
            'system_optimized': '⚡',
            'user_created': '👥',
            'resume_created': '📄',
            'template_created': '🎨'
        };
        return icons[action] || '📝';
    }

    /**
     * Get growth metrics by time range
     */
    static async getGrowthMetrics(range = '7d') {
        try {
            const days = this.getDaysFromRange(range);
            const now = new Date();
            const startDate = subDays(now, days);
            const endDate = now;

            const [newUsers, newResumes, activeUsers, userRetention] = await Promise.all([
                User.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
                Resume.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
                User.countDocuments({ lastLogin: { $gte: subDays(now, 7) } }),
                this.calculateUserRetention(startDate, endDate)
            ]);

            return {
                success: true,
                data: {
                    newUsers,
                    newResumes,
                    activeUsers,
                    userRetention: `${userRetention}%`,
                    period: `${days} days`,
                    startDate,
                    endDate
                }
            };
        } catch (error) {
            console.error('[DashboardService] Growth metrics error:', error);
            return {
                success: false,
                message: error.message,
                data: null
            };
        }
    }

    /**
     * Calculate user retention rate
     */
    static async calculateUserRetention(startDate, endDate) {
        try {
            const totalUsers = await User.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const returningUsers = await User.countDocuments({
                createdAt: { $gte: startDate, $lte: endDate },
                lastLogin: { $gte: subDays(new Date(), 30) }
            });

            return totalUsers > 0 ? ((returningUsers / totalUsers) * 100).toFixed(1) : 0;
        } catch (error) {
            console.error('[DashboardService] User retention error:', error);
            return 0;
        }
    }
}

export default DashboardService;