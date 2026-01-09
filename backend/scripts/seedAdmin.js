#!/usr/bin/env node

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/admin/models/Admin');
const Role = require('../src/admin/models/Role');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('📦 Connected to MongoDB');

        // Initialize default roles
        await Role.initializeDefaultRoles();
        console.log('✅ Default roles initialized');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('⚠️  Admin already exists');
            process.exit(0);
        }

        // Get super admin role
        const superAdminRole = await Role.findOne({ code: 'SUPER_ADMIN' });

        if (!superAdminRole) {
            throw new Error('Super admin role not found');
        }

        // Create super admin
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash('Admin@123', salt);

        const superAdmin = new Admin({
            email: 'admin@example.com',
            password: hashedPassword,
            name: 'Super Administrator',
            role: 'super_admin',
            permissions: superAdminRole.permissions,
            isActive: true
        });

        await superAdmin.save();

        console.log('✅ Super admin created successfully');
        console.log('📧 Email: admin@example.com');
        console.log('🔑 Password: Admin@123');
        console.log('⚠️  Please change the password after first login!');

        // Create a regular admin for testing
        const adminRole = await Role.findOne({ code: 'ADMIN' });

        const regularAdmin = new Admin({
            email: 'moderator@example.com',
            password: hashedPassword, // Same password for demo
            name: 'System Moderator',
            role: 'admin',
            permissions: adminRole.permissions,
            isActive: true
        });

        await regularAdmin.save();

        console.log('\n✅ Test moderator created');
        console.log('📧 Email: moderator@example.com');
        console.log('🔑 Password: Admin@123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();