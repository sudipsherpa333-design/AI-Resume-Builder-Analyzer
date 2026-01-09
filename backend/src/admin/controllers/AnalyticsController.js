const User = require('../../models/User');
const Resume = require('../../models/Resume');
const AdminLog = require('../models/AdminLog');

class AnalyticsController {
    // Get dashboard overview statistics
    static async getDashboardStats(req, res) {
        try {
            const [
                totalUsers,
                totalResumes,
                activeUsers,
                resumesToday,
                userGrowth,
                resumeTrends,
                recentActivities
            ] = await Promise.all([
                // Total users
                User.countDocuments(),

                // Total resumes
                Resume.countDocuments(),

                // Active users (logged in last 30 days)
                User.countDocuments({
                    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }),

                // Resumes created today
                Resume.countDocuments({
                    createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
                }),

                // User growth (last 30 days)
                User.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]),

                // Resume trends (last 30 days)
                Resume.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                            }
                        }
                    },
                    {
                        $group: {
                            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: 1 } }
                ]),

                // Recent admin activities
                AdminLog.find()
                    .sort({ timestamp: -1 })
                    .limit(10)
                    .populate('adminId', 'name email')
                    .lean()
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers,
                    totalResumes,
                    activeUsers,
                    resumesToday,
                    userGrowth: userGrowth.map(item => ({ date: item._id, count: item.count })),
                    resumeTrends: resumeTrends.map(item => ({ date: item._id, count: item.count })),
                    recentActivities: recentActivities.map(log => ({
                        action: log.action,
                        admin: log.adminId?.name || 'System',
                        resource: log.resource,
                        time: log.timestamp
                    }))
                }
            });

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics.'
            });
        }
    }

    // Get detailed analytics
    static async getAnalytics(req, res) {
        try {
            const { type = 'overview', startDate, endDate } = req.query;

            const dateFilter = {};
            if (startDate || endDate) {
                dateFilter.createdAt = {};
                if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
                if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
            }

            let analyticsData;

            switch (type) {
                case 'users':
                    analyticsData = await this.getUserAnalytics(dateFilter);
                    break;
                case 'resumes':
                    analyticsData = await this.getResumeAnalytics(dateFilter);
                    break;
                case 'templates':
                    analyticsData = await this.getTemplateAnalytics(dateFilter);
                    break;
                case 'overview':
                default:
                    analyticsData = await this.getOverviewAnalytics(dateFilter);
            }

            res.json({
                success: true,
                data: analyticsData
            });

        } catch (error) {
            console.error('Get analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch analytics.'
            });
        }
    }

    // Helper: Get overview analytics
    static async getOverviewAnalytics(dateFilter) {
        const [
            totalUsers,
            newUsers,
            totalResumes,
            newResumes,
            activeUsers,
            topTemplates,
            userActivity
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments(dateFilter),
            Resume.countDocuments(),
            Resume.countDocuments(dateFilter),
            User.countDocuments({
                lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            }),
            Resume.aggregate([
                { $group: { _id: '$template', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),
            User.aggregate([
                {
                    $group: {
                        _id: { $hour: '$lastLogin' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        return {
            totalUsers,
            newUsers,
            totalResumes,
            newResumes,
            activeUsers,
            topTemplates,
            userActivity
        };
    }

    // Helper: Get user analytics
    static async getUserAnalytics(dateFilter) {
        const [
            usersByDate,
            usersByTime,
            userLocations,
            userProfessions
        ] = await Promise.all([
            // Users by date
            User.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Users by time of day
            User.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { $hour: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Users by location
            User.aggregate([
                { $match: { ...dateFilter, location: { $exists: true, $ne: '' } } },
                {
                    $group: {
                        _id: '$location',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Users by profession
            User.aggregate([
                { $match: { ...dateFilter, profession: { $exists: true, $ne: '' } } },
                {
                    $group: {
                        _id: '$profession',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ])
        ]);

        return {
            usersByDate,
            usersByTime,
            userLocations,
            userProfessions
        };
    }

    // Helper: Get resume analytics
    static async getResumeAnalytics(dateFilter) {
        const [
            resumesByDate,
            viewsByResume,
            downloadsByResume,
            avgResumeStats
        ] = await Promise.all([
            // Resumes by date
            Resume.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Top resumes by views
            Resume.find(dateFilter)
                .sort({ views: -1 })
                .limit(10)
                .populate('userId', 'name email')
                .select('title views downloads template createdAt')
                .lean(),

            // Top resumes by downloads
            Resume.find(dateFilter)
                .sort({ downloads: -1 })
                .limit(10)
                .populate('userId', 'name email')
                .select('title views downloads template createdAt')
                .lean(),

            // Average resume statistics
            Resume.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        avgViews: { $avg: '$views' },
                        avgDownloads: { $avg: '$downloads' },
                        maxViews: { $max: '$views' },
                        maxDownloads: { $max: '$downloads' }
                    }
                }
            ])
        ]);

        return {
            resumesByDate,
            topByViews: viewsByResume,
            topByDownloads: downloadsByResume,
            averageStats: avgResumeStats[0] || {}
        };
    }

    // Helper: Get template analytics
    static async getTemplateAnalytics(dateFilter) {
        const [
            templateUsage,
            templatePopularity,
            templatePerformance
        ] = await Promise.all([
            // Template usage count
            Resume.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$template', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Template popularity over time
            Resume.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            template: '$template',
                            date: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ]),

            // Template performance (views/downloads)
            Resume.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$template',
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' },
                        avgViews: { $avg: '$views' },
                        avgDownloads: { $avg: '$downloads' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { totalViews: -1 } }
            ])
        ]);

        return {
            templateUsage,
            templatePopularity,
            templatePerformance
        };
    }
}

module.exports = AnalyticsController;