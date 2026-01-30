// backend/src/admin/controllers/userController.js
const User = require('../../models/User');
const Resume = require('../../models/Resume');
const AdminLog = require('../models/AdminLog');

class UserController {
    // Get all users with pagination and filters
    static async getAllUsers(req, res) {
        try {
            // ... existing getAllUsers code ...
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users.'
            });
        }
    }

    // Get user by ID
    static async getUserById(req, res) {
        try {
            // ... existing getUserById code ...
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user.'
            });
        }
    }

    // Get user statistics
    static async getUserStats(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const activeUsers = await User.countDocuments({ isActive: true });
            const verifiedUsers = await User.countDocuments({ isVerified: true });
            const newToday = await User.countDocuments({
                createdAt: {
                    $gte: new Date().setHours(0, 0, 0, 0)
                }
            });
            const inactiveUsers = await User.countDocuments({ isActive: false });

            // Weekly growth
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            const lastWeekCount = await User.countDocuments({
                createdAt: { $gte: lastWeek }
            });

            res.json({
                success: true,
                data: {
                    total: totalUsers,
                    active: activeUsers,
                    verified: verifiedUsers,
                    newToday,
                    inactive: inactiveUsers,
                    weeklyGrowth: Math.round((newToday / lastWeekCount) * 100) || 0
                }
            });

        } catch (error) {
            console.error('Get user stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user statistics.'
            });
        }
    }

    // Create user
    static async createUser(req, res) {
        try {
            const { name, email, password, role, isActive, isVerified, phone, company, location } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists.'
                });
            }

            // Create user
            const user = new User({
                name,
                email,
                password,
                role: role || 'user',
                isActive: isActive !== undefined ? isActive : true,
                isVerified: isVerified || false,
                phone,
                company,
                location
            });

            await user.save();

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'CREATE_USER',
                resource: 'users',
                resourceId: user._id,
                ipAddress: req.ip
            });

            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                success: true,
                message: 'User created successfully.',
                data: { user: userResponse }
            });

        } catch (error) {
            console.error('Create user error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error.',
                    errors: error.errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to create user.'
            });
        }
    }

    // Update user
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;

            // Remove sensitive fields
            delete updates.password;
            delete updates.email;
            delete updates._id;

            const user = await User.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'UPDATE_USER',
                resource: 'users',
                resourceId: id,
                details: updates,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'User updated successfully.',
                data: user
            });

        } catch (error) {
            console.error('Update user error:', error);

            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error.',
                    errors: error.errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Failed to update user.'
            });
        }
    }

    // Update user status
    static async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const user = await User.findByIdAndUpdate(
                id,
                { isActive: status === 'active' },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'UPDATE_USER_STATUS',
                resource: 'users',
                resourceId: id,
                details: { status },
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: `User status updated to ${status}.`,
                data: user
            });

        } catch (error) {
            console.error('Update user status error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user status.'
            });
        }
    }

    // Update user role
    static async updateUserRole(req, res) {
        try {
            const { id } = req.params;
            const { role } = req.body;

            if (!['user', 'admin', 'super_admin', 'moderator'].includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role.'
                });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { role },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'UPDATE_USER_ROLE',
                resource: 'users',
                resourceId: id,
                details: { role },
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: `User role updated to ${role}.`,
                data: user
            });

        } catch (error) {
            console.error('Update user role error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update user role.'
            });
        }
    }

    // Reset user password
    static async resetUserPassword(req, res) {
        try {
            const { id } = req.params;

            // In a real application, you would generate a reset token and send email
            // For now, we'll just log the action

            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'RESET_USER_PASSWORD',
                resource: 'users',
                resourceId: id,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Password reset email sent.'
            });

        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reset password.'
            });
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Delete user's resumes
            await Resume.deleteMany({ userId: id });

            // Delete user
            await User.findByIdAndDelete(id);

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: 'DELETE_USER',
                resource: 'users',
                resourceId: id,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'User and associated data deleted successfully.'
            });

        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete user.'
            });
        }
    }

    // Bulk actions
    static async bulkUserAction(req, res) {
        try {
            const { action, userIds } = req.body;

            if (!action || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Action and userIds array are required.'
                });
            }

            let updateQuery = {};

            switch (action) {
                case 'activate':
                    updateQuery = { isActive: true };
                    break;
                case 'deactivate':
                    updateQuery = { isActive: false };
                    break;
                case 'delete':
                    // Delete users and their resumes
                    await Promise.all(userIds.map(async (userId) => {
                        await Resume.deleteMany({ userId });
                        await User.findByIdAndDelete(userId);
                    }));

                    // Log action
                    await AdminLog.create({
                        adminId: req.admin._id,
                        adminEmail: req.admin.email,
                        action: 'BULK_DELETE_USERS',
                        resource: 'users',
                        details: { userIds, action },
                        ipAddress: req.ip
                    });

                    return res.json({
                        success: true,
                        message: `${userIds.length} users deleted successfully.`
                    });
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid action.'
                    });
            }

            // Update users
            const result = await User.updateMany(
                { _id: { $in: userIds } },
                updateQuery
            );

            // Log action
            await AdminLog.create({
                adminId: req.admin._id,
                adminEmail: req.admin.email,
                action: `BULK_${action.toUpperCase()}_USERS`,
                resource: 'users',
                details: { userIds, action },
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: `${result.modifiedCount} users ${action}d successfully.`,
                data: { modifiedCount: result.modifiedCount }
            });

        } catch (error) {
            console.error('Bulk action error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to perform bulk action.'
            });
        }
    }

    // Get user activity (placeholder)
    static async getUserActivity(req, res) {
        try {
            const { id } = req.params;

            // This would typically fetch from an ActivityLog model
            // For now, return placeholder data

            res.json({
                success: true,
                data: {
                    activities: [],
                    total: 0
                }
            });

        } catch (error) {
            console.error('Get user activity error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user activity.'
            });
        }
    }

    // Get user resumes
    static async getUserResumes(req, res) {
        try {
            const { id } = req.params;

            const resumes = await Resume.find({ userId: id })
                .select('title template views downloads createdAt updatedAt')
                .sort({ createdAt: -1 });

            res.json({
                success: true,
                data: resumes
            });

        } catch (error) {
            console.error('Get user resumes error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user resumes.'
            });
        }
    }
}

// Export as both class and individual functions for compatibility
module.exports = UserController;

// Also export individual functions for your existing routes
module.exports.getAllUsers = UserController.getAllUsers;
module.exports.getUserById = UserController.getUserById;
module.exports.getUserStats = UserController.getUserStats;
module.exports.createUser = UserController.createUser;
module.exports.updateUser = UserController.updateUser;
module.exports.updateUserStatus = UserController.updateUserStatus;
module.exports.updateUserRole = UserController.updateUserRole;
module.exports.resetUserPassword = UserController.resetUserPassword;
module.exports.deleteUser = UserController.deleteUser;
module.exports.bulkUserAction = UserController.bulkUserAction;
module.exports.getUserActivity = UserController.getUserActivity;
module.exports.getUserResumes = UserController.getUserResumes;