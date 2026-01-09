const User = require('../../models/User');
const Resume = require('../../models/Resume');
const AdminLog = require('../models/AdminLog');

class UserController {
    // Get all users with pagination and filters
    static async getAllUsers(req, res) {
        try {
            const {
                page = 1,
                limit = 20,
                search = '',
                sortBy = 'createdAt',
                sortOrder = 'desc',
                isActive,
                verified
            } = req.query;

            // Build query
            const query = {};

            // Search filter
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            // Status filters
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }

            if (verified !== undefined) {
                query.isVerified = verified === 'true';
            }

            // Calculate pagination
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            // Execute query
            const [users, total] = await Promise.all([
                User.find(query)
                    .select('-password')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                User.countDocuments(query)
            ]);

            // Get resume counts for each user
            const userIds = users.map(user => user._id);
            const resumeCounts = await Resume.aggregate([
                { $match: { userId: { $in: userIds } } },
                { $group: { _id: '$userId', count: { $sum: 1 } } }
            ]);

            // Map resume counts to users
            const resumeCountMap = resumeCounts.reduce((map, item) => {
                map[item._id.toString()] = item.count;
                return map;
            }, {});

            const usersWithCounts = users.map(user => ({
                ...user,
                resumeCount: resumeCountMap[user._id.toString()] || 0
            }));

            res.json({
                success: true,
                data: {
                    users: usersWithCounts,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });

        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch users.'
            });
        }
    }

    // Get single user by ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found.'
                });
            }

            // Get user's resumes
            const resumes = await Resume.find({ userId: id })
                .select('title template views downloads createdAt')
                .sort({ createdAt: -1 })
                .limit(10);

            // Get resume stats
            const resumeStats = await Resume.aggregate([
                { $match: { userId: id } },
                {
                    $group: {
                        _id: null,
                        totalResumes: { $sum: 1 },
                        totalViews: { $sum: '$views' },
                        totalDownloads: { $sum: '$downloads' },
                        lastCreated: { $max: '$createdAt' }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    user,
                    resumes,
                    stats: resumeStats[0] || {
                        totalResumes: 0,
                        totalViews: 0,
                        totalDownloads: 0,
                        lastCreated: null
                    }
                }
            });

        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user.'
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

    // Bulk actions (activate/deactivate users)
    static async bulkAction(req, res) {
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
                action: `BULK_${action.toUpperCase()}`,
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
}

module.exports = UserController;