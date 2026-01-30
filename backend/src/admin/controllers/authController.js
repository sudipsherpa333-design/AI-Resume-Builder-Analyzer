import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../../models/Admin.js';
import { validationResult } from 'express-validator';

const authController = {
    // Admin Login
    login: async (req, res) => {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { email, password } = req.body;

            console.log('🔐 Admin login attempt:', email);

            // Check if admin exists
            const admin = await Admin.findOne({
                email: email.toLowerCase(),
                isDeleted: false
            });

            if (!admin) {
                console.log('❌ Admin not found:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Check if account is active
            if (!admin.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is disabled. Please contact super administrator.'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, admin.password);

            if (!isPasswordValid) {
                console.log('❌ Invalid password for:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                },
                process.env.JWT_ADMIN_SECRET,
                { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '24h' }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                { id: admin._id },
                process.env.JWT_ADMIN_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            // Update last login
            admin.lastLogin = new Date();
            admin.refreshToken = refreshToken;
            await admin.save();

            // Remove sensitive data from response
            const adminData = admin.toObject();
            delete adminData.password;
            delete adminData.refreshToken;

            console.log('✅ Admin login successful:', admin.email);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    admin: adminData,
                    token,
                    refreshToken,
                    expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
                    permissions: admin.permissions
                }
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Get Admin Profile
    getProfile: async (req, res) => {
        try {
            const admin = await Admin.findById(req.admin.id)
                .select('-password -refreshToken')
                .lean();

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.json({
                success: true,
                data: admin
            });

        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile'
            });
        }
    },

    // Update Admin Profile
    updateProfile: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { name, email, avatar } = req.body;
            const updateData = {};

            if (name) updateData.name = name;
            if (email) {
                // Check if email is already taken by another admin
                const existingAdmin = await Admin.findOne({
                    email: email.toLowerCase(),
                    _id: { $ne: req.admin.id }
                });

                if (existingAdmin) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email already in use'
                    });
                }
                updateData.email = email.toLowerCase();
            }
            if (avatar) updateData.avatar = avatar;

            const admin = await Admin.findByIdAndUpdate(
                req.admin.id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password -refreshToken');

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: admin
            });

        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update profile'
            });
        }
    },

    // Change Password
    changePassword: async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }

            const { currentPassword, newPassword } = req.body;

            // Get admin with password
            const admin = await Admin.findById(req.admin.id).select('+password');

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            // Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);

            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(newPassword, salt);

            // Invalidate all refresh tokens (optional security measure)
            admin.refreshToken = null;

            await admin.save();

            res.json({
                success: true,
                message: 'Password changed successfully'
            });

        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to change password'
            });
        }
    },

    // Admin Logout
    logout: async (req, res) => {
        try {
            // Clear refresh token
            await Admin.findByIdAndUpdate(req.admin.id, {
                refreshToken: null,
                lastLogout: new Date()
            });

            res.json({
                success: true,
                message: 'Logged out successfully'
            });

        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to logout'
            });
        }
    },

    // Verify Token
    verifyToken: async (req, res) => {
        try {
            const admin = await Admin.findById(req.admin.id)
                .select('-password -refreshToken')
                .lean();

            if (!admin) {
                return res.status(404).json({
                    success: false,
                    message: 'Admin not found'
                });
            }

            res.json({
                success: true,
                valid: true,
                data: admin
            });

        } catch (error) {
            console.error('Verify token error:', error);
            res.status(401).json({
                success: false,
                valid: false,
                message: 'Invalid token'
            });
        }
    },

    // Refresh Token
    refreshToken: async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_ADMIN_REFRESH_SECRET);

            // Find admin with this refresh token
            const admin = await Admin.findOne({
                _id: decoded.id,
                refreshToken: refreshToken,
                isActive: true,
                isDeleted: false
            });

            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Generate new access token
            const newToken = jwt.sign(
                {
                    id: admin._id,
                    email: admin.email,
                    role: admin.role,
                    permissions: admin.permissions
                },
                process.env.JWT_ADMIN_SECRET,
                { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '24h' }
            );

            res.json({
                success: true,
                token: newToken,
                expiresIn: 24 * 60 * 60 * 1000
            });

        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    },

    // Get Dashboard Statistics
    getDashboardStats: async (req, res) => {
        try {
            // This would typically fetch stats from database
            // For now, returning mock data
            res.json({
                success: true,
                data: {
                    totalUsers: 1250,
                    totalResumes: 3400,
                    activeSessions: 45,
                    todayLogins: 12,
                    storageUsed: '2.4 GB',
                    systemHealth: 'excellent'
                }
            });

        } catch (error) {
            console.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch dashboard statistics'
            });
        }
    }
};

export default authController;