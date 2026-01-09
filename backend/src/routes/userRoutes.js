import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple middleware (replace with your actual middleware)
const protect = (req, res, next) => {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No token provided'
        });
    }

    // Simple token verification (replace with actual JWT verification)
    if (token === 'demo-jwt-token' || token.startsWith('eyJ')) {
        req.user = {
            id: 'demo-user-id',
            email: 'user@example.com',
            name: 'Demo User',
            stats: { resumeCount: 3 }
        };
        next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

const admin = (req, res, next) => {
    // Check if user is admin
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
};

const validateRequest = (req, res, next) => {
    // Simple validation (in real app, use express-validator)
    const errors = [];

    // Check for required fields based on route
    if (req.method === 'PUT' && req.path.includes('/profile')) {
        if (req.body.name && req.body.name.length < 2) {
            errors.push('Name must be at least 2 characters');
        }
    }

    if (req.method === 'PUT' && req.path.includes('/change-password')) {
        if (!req.body.currentPassword) {
            errors.push('Current password is required');
        }
        if (!req.body.newPassword || req.body.newPassword.length < 6) {
            errors.push('New password must be at least 6 characters');
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

// Controller functions
const getUserProfile = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user.id,
                    name: req.user.name,
                    email: req.user.email,
                    avatar: req.user.avatar || null,
                    role: req.user.role || 'user',
                    preferences: req.user.preferences || {},
                    profile: req.user.profile || {},
                    stats: req.user.stats || {}
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        // Update user profile logic here
        const updatedUser = {
            ...req.user,
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate current password (demo - replace with actual validation)
        if (currentPassword !== 'password123') {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password logic here

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error changing password'
        });
    }
};

const updateUserPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;

        // Update preferences logic here

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                preferences: preferences || {}
            }
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating preferences'
        });
    }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/avatars');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

const uploadAvatar = [
    upload.single('avatar'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload an image file'
                });
            }

            const avatarUrl = `/uploads/avatars/${req.file.filename}`;

            // Update user avatar in database here

            res.json({
                success: true,
                message: 'Avatar uploaded successfully',
                data: {
                    avatarUrl
                }
            });
        } catch (error) {
            console.error('Upload avatar error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error uploading avatar'
            });
        }
    }
];

const getUserStats = async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                stats: {
                    resumeCount: req.user.stats?.resumeCount || 0,
                    templatesUsed: 2,
                    aiAnalyses: 5,
                    lastLogin: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error getting stats'
        });
    }
};

const deleteAccount = async (req, res) => {
    try {
        // Delete account logic here

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting account'
        });
    }
};

// All routes are protected
router.use(protect);

// User profile routes
router.route('/profile')
    .get(getUserProfile)
    .put([
        body('name')
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),
        body('phone')
            .optional()
            .isMobilePhone()
            .withMessage('Please provide a valid phone number'),
        body('profile.title')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Title must be less than 100 characters'),
        body('profile.bio')
            .optional()
            .isLength({ max: 500 })
            .withMessage('Bio must be less than 500 characters'),
        body('profile.website')
            .optional()
            .isURL()
            .withMessage('Please provide a valid website URL'),
        body('profile.location')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Location must be less than 100 characters'),
        body('profile.company')
            .optional()
            .isLength({ max: 100 })
            .withMessage('Company must be less than 100 characters')
    ], validateRequest, updateUserProfile);

// Password management
router.put('/change-password', [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
], validateRequest, changePassword);

// User preferences
router.put('/preferences', [
    body('preferences.emailNotifications')
        .optional()
        .isBoolean()
        .withMessage('Email notifications must be a boolean value'),
    body('preferences.twoFactorEnabled')
        .optional()
        .isBoolean()
        .withMessage('Two-factor authentication must be a boolean value'),
    body('preferences.language')
        .optional()
        .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko'])
        .withMessage('Please select a valid language'),
    body('preferences.timezone')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Timezone must be less than 50 characters')
], validateRequest, updateUserPreferences);

// Avatar upload
router.post('/avatar', uploadAvatar);

// User statistics
router.get('/stats', getUserStats);

// Account management
router.delete('/account', deleteAccount);

// Admin only routes - Use admin middleware
router.get('/admin/users', admin, async (req, res) => {
    try {
        // Demo users data
        const users = [
            {
                id: 'user-1',
                name: 'John Doe',
                email: 'john@example.com',
                role: 'user',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'user-2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                role: 'admin',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ];

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users,
                stats: {
                    totalUsers: 2,
                    activeUsers: 2,
                    adminCount: 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Additional admin routes
router.get('/admin/stats', admin, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Admin statistics retrieved',
            data: {
                totalUsers: 2,
                activeUsers: 2,
                suspendedUsers: 0,
                newUsersThisWeek: 1,
                dateRange: {
                    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    end: new Date().toISOString()
                }
            }
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

export default router;