const Admin = require('../models/Admin');
const Role = require('../models/Role');
const mongoose = require('mongoose');

class AdminService {
    // Create new admin
    static async createAdmin(data) {
        try {
            // Check if email exists
            const existingAdmin = await Admin.findOne({ email: data.email.toLowerCase() });
            if (existingAdmin) {
                throw new Error('Email already registered');
            }

            // Verify role exists and is valid
            if (data.role) {
                const roleExists = await Role.findOne({ code: data.role.toUpperCase() });
                if (!roleExists) {
                    throw new Error('Invalid role specified');
                }
            }

            const admin = new Admin({
                ...data,
                email: data.email.toLowerCase()
            });

            await admin.save();

            // Remove sensitive data
            admin.password = undefined;
            admin.twoFactorSecret = undefined;

            return admin;
        } catch (error) {
            throw error;
        }
    }

    // Get admin by ID
    static async getAdminById(id) {
        return await Admin.findById(id)
            .select('-password -twoFactorSecret -resetPasswordToken -resetPasswordExpires');
    }

    // Get all admins with pagination
    static async getAllAdmins(filters = {}, page = 1, limit = 20) {
        const query = {};

        // Apply filters
        if (filters.role) query.role = filters.role;
        if (filters.search) {
            query.$or = [
                { name: { $regex: filters.search, $options: 'i' } },
                { email: { $regex: filters.search, $options: 'i' } }
            ];
        }
        if (filters.isActive !== undefined) query.isActive = filters.isActive;

        const skip = (page - 1) * limit;

        const [admins, total] = await Promise.all([
            Admin.find(query)
                .select('-password -twoFactorSecret')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Admin.countDocuments(query)
        ]);

        return {
            admins,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    // Update admin
    static async updateAdmin(id, data, currentAdmin) {
        try {
            const admin = await Admin.findById(id);
            if (!admin) {
                throw new Error('Admin not found');
            }

            // Prevent email change to existing email
            if (data.email && data.email !== admin.email) {
                const emailExists = await Admin.findOne({
                    email: data.email.toLowerCase(),
                    _id: { $ne: id }
                });
                if (emailExists) {
                    throw new Error('Email already in use');
                }
                data.email = data.email.toLowerCase();
            }

            // Handle role change permission
            if (data.role && data.role !== admin.role) {
                if (currentAdmin.role !== 'super_admin') {
                    throw new Error('Only super admin can change roles');
                }

                // Verify new role exists
                const roleExists = await Role.findOne({ code: data.role.toUpperCase() });
                if (!roleExists) {
                    throw new Error('Invalid role specified');
                }
            }

            // Update admin
            Object.keys(data).forEach(key => {
                admin[key] = data[key];
            });

            await admin.save();

            // Remove sensitive data
            admin.password = undefined;
            admin.twoFactorSecret = undefined;

            return admin;
        } catch (error) {
            throw error;
        }
    }

    // Delete admin
    static async deleteAdmin(id, currentAdminId) {
        try {
            // Prevent deleting self
            if (id === currentAdminId) {
                throw new Error('Cannot delete your own account');
            }

            const admin = await Admin.findById(id);
            if (!admin) {
                throw new Error('Admin not found');
            }

            // Prevent deleting last super admin
            if (admin.role === 'super_admin') {
                const superAdminCount = await Admin.countDocuments({ role: 'super_admin' });
                if (superAdminCount <= 1) {
                    throw new Error('Cannot delete the last super admin');
                }
            }

            await Admin.findByIdAndDelete(id);

            return { message: 'Admin deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // Update admin status
    static async updateAdminStatus(id, isActive) {
        const admin = await Admin.findById(id);
        if (!admin) {
            throw new Error('Admin not found');
        }

        // Prevent deactivating last super admin
        if (admin.role === 'super_admin' && !isActive) {
            const activeSuperAdminCount = await Admin.countDocuments({
                role: 'super_admin',
                isActive: true
            });
            if (activeSuperAdminCount <= 1) {
                throw new Error('Cannot deactivate the last active super admin');
            }
        }

        admin.isActive = isActive;
        await admin.save();

        return admin;
    }

    // Get admin stats
    static async getAdminStats() {
        const stats = await Admin.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 },
                    active: {
                        $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    role: '$_id',
                    count: 1,
                    active: 1,
                    inactive: { $subtract: ['$count', '$active'] }
                }
            }
        ]);

        const total = await Admin.countDocuments();
        const active = await Admin.countDocuments({ isActive: true });

        return {
            total,
            active,
            inactive: total - active,
            byRole: stats
        };
    }
}

module.exports = AdminService;