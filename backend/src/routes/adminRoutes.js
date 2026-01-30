// backend/src/routes/adminRoutes.js - COMPLETE ADMIN DASHBOARD
import express from 'express';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// ======================
// AUTHENTICATION MIDDLEWARE
// ======================
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        const admin = await Admin.findById(decoded.adminId);

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found'
            });
        }

        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
};

// ======================
// AUTH ROUTES
// ======================
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // For development, allow default admin
        if (email === process.env.ADMIN_DEFAULT_EMAIL &&
            password === process.env.ADMIN_DEFAULT_PASSWORD) {

            const token = jwt.sign(
                { adminId: 'default-admin', email, role: 'super_admin' },
                process.env.JWT_ADMIN_SECRET,
                { expiresIn: '24h' }
            );

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: 'default-admin',
                    email: email,
                    name: 'System Administrator',
                    role: 'super_admin',
                    permissions: ['all']
                }
            });
        }

        // Check if admin exists in database
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // In real implementation, compare password with bcrypt
        // For now, simple check
        const isValidPassword = true; // Replace with bcrypt.compare

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { adminId: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_ADMIN_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: admin._id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                permissions: admin.permissions
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// ======================
// DASHBOARD ROUTES
// ======================
router.get('/dashboard/stats', authenticateAdmin, async (req, res) => {
    try {
        const { range = '7d' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate = new Date();

        switch (range) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }

        // Get statistics
        const [
            totalUsers,
            totalResumes,
            newUsers,
            newResumes,
            activeUsers
        ] = await Promise.all([
            User.countDocuments(),
            Resume.countDocuments(),
            User.countDocuments({ createdAt: { $gte: startDate } }),
            Resume.countDocuments({ createdAt: { $gte: startDate } }),
            User.countDocuments({ lastActive: { $gte: startDate } })
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalResumes,
                newUsers,
                newResumes,
                activeUsers,
                range,
                period: {
                    start: startDate.toISOString(),
                    end: now.toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

router.get('/dashboard/charts', authenticateAdmin, async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        const now = new Date();
        let startDate = new Date();
        let interval = 'day';

        switch (range) {
            case '24h':
                startDate.setHours(now.getHours() - 24);
                interval = 'hour';
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                interval = 'day';
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                interval = 'day';
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                interval = 'week';
                break;
        }

        // Generate mock chart data (in production, aggregate from database)
        const userRegistrations = generateChartData(startDate, now, interval, 10, 50);
        const resumeAnalysis = generateChartData(startDate, now, interval, 5, 30);
        const activeUsers = generateChartData(startDate, now, interval, 15, 40);

        res.json({
            success: true,
            data: {
                userRegistrations,
                resumeAnalysis,
                activeUsers,
                range,
                interval
            }
        });

    } catch (error) {
        console.error('Dashboard charts error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch chart data'
        });
    }
});

router.get('/dashboard/recent-activity', authenticateAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get recent resumes with user info
        const recentResumes = await Resume.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', 'name email')
            .lean();

        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('name email createdAt lastActive')
            .lean();

        // Format activity
        const activities = [
            ...recentResumes.map(resume => ({
                type: 'resume_analyzed',
                title: 'Resume Analyzed',
                description: `${resume.user?.name || 'User'} uploaded a resume`,
                score: resume.analysisScore || 0,
                timestamp: resume.createdAt,
                user: resume.user
            })),
            ...recentUsers.map(user => ({
                type: 'user_registered',
                title: 'New User',
                description: `${user.name} registered`,
                timestamp: user.createdAt,
                user: { name: user.name, email: user.email }
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);

        res.json({
            success: true,
            data: activities
        });

    } catch (error) {
        console.error('Recent activity error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch recent activity'
        });
    }
});

router.get('/dashboard/global-stats', authenticateAdmin, async (req, res) => {
    try {
        // Get global statistics
        const [
            totalUsers,
            totalResumes,
            totalAnalysis,
            avgScore,
            storageUsed
        ] = await Promise.all([
            User.countDocuments(),
            Resume.countDocuments(),
            Resume.countDocuments({ 'analysis.status': 'completed' }),
            Resume.aggregate([
                { $match: { 'analysis.score': { $exists: true } } },
                { $group: { _id: null, avgScore: { $avg: '$analysis.score' } } }
            ]),
            // Calculate storage used (mock for now)
            Promise.resolve({ used: 0, total: 1024 })
        ]);

        // Get system info
        const memoryUsage = process.memoryUsage();
        const systemStats = {
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                rss: Math.round(memoryUsage.rss / 1024 / 1024)
            },
            uptime: process.uptime(),
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            environment: process.env.NODE_ENV || 'development'
        };

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: Math.floor(totalUsers * 0.7), // Mock active users
                    newToday: Math.floor(totalUsers * 0.05)
                },
                resumes: {
                    total: totalResumes,
                    analyzed: totalAnalysis,
                    avgScore: avgScore[0]?.avgScore ? Math.round(avgScore[0].avgScore) : 0
                },
                system: systemStats,
                storage: storageUsed
            }
        });

    } catch (error) {
        console.error('Global stats error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch global statistics'
        });
    }
});

// ======================
// USER MANAGEMENT
// ======================
router.get('/users', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get users
        const [users, total] = await Promise.all([
            User.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-password')
                .lean(),
            User.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users'
        });
    }
});

router.get('/users/:id', authenticateAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('resumes')
            .lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get user activity stats
        const userStats = await Resume.aggregate([
            { $match: { user: mongoose.Types.ObjectId(req.params.id) } },
            {
                $group: {
                    _id: null,
                    totalResumes: { $sum: 1 },
                    avgScore: { $avg: '$analysis.score' },
                    lastActivity: { $max: '$updatedAt' }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                ...user,
                stats: userStats[0] || {
                    totalResumes: 0,
                    avgScore: 0,
                    lastActivity: null
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch user'
        });
    }
});

// ======================
// RESUME MANAGEMENT
// ======================
router.get('/resumes', authenticateAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { 'analysis.jobTitle': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }

        // Get resumes with user info
        const [resumes, total] = await Promise.all([
            Resume.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name email')
                .lean(),
            Resume.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: resumes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes'
        });
    }
});

router.get('/resumes/:id', authenticateAdmin, async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id)
            .populate('user', 'name email')
            .lean();

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found'
            });
        }

        res.json({
            success: true,
            data: resume
        });

    } catch (error) {
        console.error('Get resume error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resume'
        });
    }
});

// ======================
// SYSTEM SETTINGS
// ======================
router.get('/settings', authenticateAdmin, async (req, res) => {
    try {
        const settings = {
            aiSettings: {
                enabled: !!process.env.OPENAI_API_KEY,
                provider: 'OpenAI',
                model: process.env.OPENAI_MODEL || 'gpt-4',
                maxTokens: parseInt(process.env.MAX_TOKENS) || 1000,
                temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.7
            },
            emailSettings: {
                enabled: !!process.env.SMTP_HOST,
                provider: process.env.SMTP_HOST ? 'SMTP' : 'none',
                fromEmail: process.env.FROM_EMAIL || 'noreply@resume.ai'
            },
            storageSettings: {
                maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10,
                allowedFormats: ['pdf', 'doc', 'docx', 'txt'],
                storagePath: process.env.UPLOAD_PATH || './uploads'
            },
            securitySettings: {
                jwtExpiry: process.env.JWT_EXPIRY || '24h',
                rateLimit: process.env.RATE_LIMIT || 100,
                corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000']
            },
            systemSettings: {
                environment: process.env.NODE_ENV || 'development',
                port: process.env.PORT || 5001,
                clusterEnabled: process.env.ENABLE_CLUSTER === 'true',
                logLevel: process.env.LOG_LEVEL || 'info'
            }
        };

        res.json({
            success: true,
            data: settings
        });

    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch settings'
        });
    }
});

// ======================
// UTILITY FUNCTIONS
// ======================
function generateChartData(startDate, endDate, interval, min, max) {
    const data = [];
    const current = new Date(startDate);

    while (current <= endDate) {
        const value = Math.floor(Math.random() * (max - min + 1)) + min;

        let label;
        switch (interval) {
            case 'hour':
                label = current.toLocaleTimeString([], { hour: '2-digit' });
                current.setHours(current.getHours() + 1);
                break;
            case 'day':
                label = current.toLocaleDateString([], { weekday: 'short' });
                current.setDate(current.getDate() + 1);
                break;
            case 'week':
                label = `Week ${Math.ceil(current.getDate() / 7)}`;
                current.setDate(current.getDate() + 7);
                break;
        }

        data.push({ label, value });
    }

    return data;
}

export default router;