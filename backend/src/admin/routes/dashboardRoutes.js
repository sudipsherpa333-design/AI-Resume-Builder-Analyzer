// backend/src/admin/routes/dashboardRoutes.js
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Test middleware (remove in production and add proper auth)
const testAuth = (req, res, next) => {
    // For testing only - accept all requests
    console.log(`📊 Dashboard request: ${req.method} ${req.url}`);
    next();
};

// Test endpoint - to verify routes are working
router.get('/test', testAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Dashboard API is working! 🎉',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /admin/dashboard/stats?range=7d',
            'GET /admin/dashboard/recent-activity?limit=5',
            'GET /admin/dashboard/top-users?limit=5',
            'GET /admin/dashboard/recent-resumes?limit=5'
        ]
    });
});

// GET /admin/dashboard/stats
router.get('/stats', testAuth, async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        console.log(`📈 Fetching dashboard stats for range: ${range}`);

        // Get models
        const User = mongoose.model('User');
        const Resume = mongoose.model('Resume');
        const Template = mongoose.model('Template');

        // Get counts from MongoDB
        const [
            totalUsers,
            totalResumes,
            totalTemplates,
            activeUsers,
            newUsersToday,
            verifiedUsers,
            inactiveUsers
        ] = await Promise.all([
            User.countDocuments(),
            Resume.countDocuments(),
            Template.countDocuments(),
            User.countDocuments({ isActive: true }),
            User.countDocuments({
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            User.countDocuments({ isVerified: true }),
            User.countDocuments({ isActive: false })
        ]);

        // Get timeline data
        const timeline = await getTimelineData(range);

        // Get performance metrics (mock for now)
        const performance = {
            uptime: 99.95,
            apiSuccessRate: 99.5,
            databaseLatency: 45,
            memoryUsage: 67.2,
            responseTime: 142,
            cpuUsage: 23.4
        };

        // Get analytics (mock for now)
        const analytics = {
            userGrowth: 12.5,
            resumeGrowth: 8.2,
            conversionRate: 3.2,
            retentionRate: 67.8,
            completionRate: 82.5,
            bounceRate: 24.3
        };

        // Get top templates
        const topTemplates = await Template.find()
            .sort({ usageCount: -1 })
            .limit(5)
            .select('name usageCount rating')
            .lean();

        res.json({
            success: true,
            data: {
                summary: {
                    totalUsers,
                    totalResumes,
                    totalTemplates,
                    totalAnalyses: Math.floor(totalResumes * 0.8), // Assuming 80% have analysis
                    activeUsers,
                    newToday: newUsersToday,
                    storageUsed: '2.4 GB',
                    databaseSize: '1.8 GB'
                },
                analytics,
                performance,
                timeline,
                topTemplates: topTemplates.map(t => ({
                    id: t._id,
                    name: t.name,
                    usage: t.usageCount || 0,
                    rating: t.rating || 4.5
                }))
            }
        });

    } catch (error) {
        console.error('❌ Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
});

// GET /admin/dashboard/recent-activity
router.get('/recent-activity', testAuth, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        console.log(`📋 Fetching recent activity, limit: ${limit}`);

        let ActivityLog;
        try {
            ActivityLog = mongoose.model('ActivityLog');
        } catch {
            // If ActivityLog model doesn't exist, return mock data
            console.log('⚠️ ActivityLog model not found, using mock data');
            return res.json({
                success: true,
                data: getMockActivities(parseInt(limit))
            });
        }

        const activities = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('user', 'name email')
            .lean();

        const formattedActivities = activities.map(activity => ({
            id: activity._id,
            user: activity.user ? {
                name: activity.user.name || 'System',
                email: activity.user.email || ''
            } : { name: 'System', email: '' },
            action: activity.action || 'Performed action',
            resource: activity.resourceType || 'system',
            timestamp: activity.createdAt,
            details: activity.details
        }));

        res.json({
            success: true,
            data: formattedActivities
        });

    } catch (error) {
        console.error('❌ Recent activities error:', error);
        res.json({
            success: true,
            data: getMockActivities(5) // Fallback to mock data
        });
    }
});

// GET /admin/dashboard/top-users
router.get('/top-users', testAuth, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        console.log(`👥 Fetching top users, limit: ${limit}`);

        const User = mongoose.model('User');
        const Resume = mongoose.model('Resume');

        const users = await User.find()
            .limit(parseInt(limit))
            .select('name email role isActive isVerified createdAt')
            .sort({ createdAt: -1 })
            .lean();

        // Add resume counts
        const usersWithCounts = await Promise.all(
            users.map(async (user) => {
                const resumeCount = await Resume.countDocuments({ user: user._id });
                return {
                    ...user,
                    resumeCount
                };
            })
        );

        // Sort by resume count
        usersWithCounts.sort((a, b) => b.resumeCount - a.resumeCount);

        res.json({
            success: true,
            data: usersWithCounts
        });

    } catch (error) {
        console.error('❌ Top users error:', error);
        res.json({
            success: true,
            data: getMockUsers(5) // Fallback to mock data
        });
    }
});

// GET /admin/dashboard/recent-resumes
router.get('/recent-resumes', testAuth, async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        console.log(`📄 Fetching recent resumes, limit: ${limit}`);

        const Resume = mongoose.model('Resume');
        const User = mongoose.model('User');

        const recentResumes = await Resume.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .populate('user', 'name email')
            .select('title user views downloads createdAt')
            .lean();

        const formattedResumes = recentResumes.map(resume => ({
            id: resume._id,
            title: resume.title || 'Untitled Resume',
            user: resume.user ? {
                name: resume.user.name || 'Unknown',
                email: resume.user.email || ''
            } : { name: 'Unknown', email: '' },
            views: resume.views || 0,
            downloads: resume.downloads || 0,
            createdAt: resume.createdAt
        }));

        res.json({
            success: true,
            data: formattedResumes
        });

    } catch (error) {
        console.error('❌ Recent resumes error:', error);
        res.json({
            success: true,
            data: getMockResumes(5) // Fallback to mock data
        });
    }
});

// Helper functions
async function getTimelineData(range) {
    try {
        const User = mongoose.model('User');
        const Resume = mongoose.model('Resume');

        const now = new Date();
        let days = 7;

        switch (range) {
            case '24h': days = 1; break;
            case '7d': days = 7; break;
            case '30d': days = 30; break;
            case '90d': days = 12; break; // 12 weeks
        }

        const timeline = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const [users, resumes] = await Promise.all([
                User.countDocuments({
                    createdAt: { $gte: startOfDay, $lt: endOfDay }
                }),
                Resume.countDocuments({
                    createdAt: { $gte: startOfDay, $lt: endOfDay }
                })
            ]);

            timeline.push({
                date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
                users,
                resumes
            });
        }

        return timeline;
    } catch (error) {
        console.error('Timeline data error:', error);
        return getMockTimelineData(range);
    }
}

function getMockTimelineData(range) {
    const now = new Date();
    const timeline = [];
    let days = 7;

    switch (range) {
        case '24h': days = 1; break;
        case '7d': days = 7; break;
        case '30d': days = 30; break;
        case '90d': days = 12; break;
    }

    for (let i = 0; i < days; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (days - i - 1));

        timeline.push({
            date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
            users: Math.floor(Math.random() * 20) + 5,
            resumes: Math.floor(Math.random() * 25) + 10
        });
    }

    return timeline;
}

function getMockActivities(limit) {
    const actions = [
        'created a resume',
        'updated profile',
        'downloaded template',
        'completed AI analysis',
        'shared resume',
        'deleted account',
        'subscribed to premium',
        'logged in',
        'logged out',
        'reset password'
    ];

    const resources = ['user', 'resume', 'template', 'system', 'payment'];
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];

    return Array.from({ length: limit }, (_, i) => ({
        id: i + 1,
        user: {
            name: names[i % names.length] || 'System',
            email: `${(names[i % names.length] || 'system').toLowerCase().replace(' ', '.')}@example.com`
        },
        action: actions[i % actions.length],
        resource: resources[i % resources.length],
        timestamp: new Date(Date.now() - i * 3600000).toISOString()
    }));
}

function getMockUsers(limit) {
    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];
    const roles = ['user', 'admin', 'moderator'];

    return Array.from({ length: limit }, (_, i) => ({
        _id: `user_${i + 1}`,
        name: names[i % names.length],
        email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
        role: roles[i % roles.length],
        isActive: i % 3 !== 0,
        isVerified: i % 2 === 0,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        resumeCount: Math.floor(Math.random() * 20) + 1
    }));
}

function getMockResumes(limit) {
    const titles = [
        'Senior Software Engineer',
        'Product Manager',
        'UX Designer',
        'Data Scientist',
        'DevOps Engineer',
        'Marketing Specialist',
        'Sales Executive',
        'Project Manager'
    ];

    const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];

    return Array.from({ length: limit }, (_, i) => ({
        id: `resume_${i + 1}`,
        title: titles[i % titles.length],
        user: {
            name: names[i % names.length]
        },
        views: Math.floor(Math.random() * 100) + 10,
        createdAt: new Date(Date.now() - i * 3600000).toISOString()
    }));
}

export default router;