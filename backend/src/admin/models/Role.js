const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: String,
    permissions: [{
        type: String,
        enum: [
            // Dashboard
            'dashboard.view',
            'dashboard.analytics',

            // Users
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.export',

            // Resumes
            'resumes.view',
            'resumes.create',
            'resumes.edit',
            'resumes.delete',
            'resumes.export',
            'resumes.import',

            // Admins
            'admins.view',
            'admins.create',
            'admins.edit',
            'admins.delete',
            'admins.roles',

            // Settings
            'settings.view',
            'settings.edit',
            'settings.system',

            // Logs
            'logs.view',
            'logs.clear',

            // Export/Import
            'export.all',
            'import.all'
        ]
    }],
    isDefault: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

// Add default roles on initialization
roleSchema.statics.initializeDefaultRoles = async function () {
    const defaultRoles = [
        {
            name: 'Super Admin',
            code: 'SUPER_ADMIN',
            description: 'Full system access',
            permissions: [
                'dashboard.view',
                'dashboard.analytics',
                'users.view',
                'users.create',
                'users.edit',
                'users.delete',
                'users.export',
                'resumes.view',
                'resumes.create',
                'resumes.edit',
                'resumes.delete',
                'resumes.export',
                'resumes.import',
                'admins.view',
                'admins.create',
                'admins.edit',
                'admins.delete',
                'admins.roles',
                'settings.view',
                'settings.edit',
                'settings.system',
                'logs.view',
                'logs.clear',
                'export.all',
                'import.all'
            ],
            isDefault: false,
            isActive: true
        },
        {
            name: 'Admin',
            code: 'ADMIN',
            description: 'Full content management access',
            permissions: [
                'dashboard.view',
                'users.view',
                'users.edit',
                'users.delete',
                'resumes.view',
                'resumes.edit',
                'resumes.delete',
                'settings.view',
                'settings.edit',
                'logs.view',
                'export.all'
            ],
            isDefault: false,
            isActive: true
        },
        {
            name: 'Moderator',
            code: 'MODERATOR',
            description: 'Content moderation access',
            permissions: [
                'dashboard.view',
                'users.view',
                'resumes.view',
                'resumes.edit',
                'logs.view'
            ],
            isDefault: false,
            isActive: true
        },
        {
            name: 'Viewer',
            code: 'VIEWER',
            description: 'Read-only access',
            permissions: [
                'dashboard.view',
                'users.view',
                'resumes.view',
                'logs.view'
            ],
            isDefault: true,
            isActive: true
        }
    ];

    for (const roleData of defaultRoles) {
        const existingRole = await this.findOne({ code: roleData.code });
        if (!existingRole) {
            await this.create(roleData);
            console.log(`Created default role: ${roleData.name}`);
        }
    }
};

module.exports = mongoose.model('Role', roleSchema);