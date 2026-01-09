const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true,
        enum: [
            'dashboard',
            'users',
            'resumes',
            'admins',
            'settings',
            'analytics',
            'logs',
            'exports',
            'system',
            'content',
            'reports',
            'notifications'
        ]
    },
    category: {
        type: String,
        enum: ['view', 'create', 'edit', 'delete', 'manage', 'export', 'import', 'system'],
        required: true
    },
    isSystem: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    dependsOn: [{
        type: String,
        ref: 'Permission'
    }],
    weight: {
        type: Number,
        default: 1,
        min: 1,
        max: 10
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
permissionSchema.index({ code: 1 }, { unique: true });
permissionSchema.index({ module: 1, category: 1 });
permissionSchema.index({ isActive: 1 });
permissionSchema.index({ weight: -1 });

// Virtual for full permission code
permissionSchema.virtual('fullCode').get(function () {
    return `${this.module}.${this.category}.${this.code.toLowerCase()}`;
});

// Static methods
permissionSchema.statics.initializeDefaultPermissions = async function () {
    const defaultPermissions = [
        // Dashboard permissions
        {
            name: 'View Dashboard',
            code: 'VIEW_DASHBOARD',
            description: 'View main dashboard with statistics',
            module: 'dashboard',
            category: 'view',
            isSystem: true,
            weight: 1
        },
        {
            name: 'View Analytics',
            code: 'VIEW_ANALYTICS',
            description: 'View detailed analytics and reports',
            module: 'dashboard',
            category: 'view',
            isSystem: true,
            weight: 2
        },

        // User permissions
        {
            name: 'View Users',
            code: 'VIEW_USERS',
            description: 'View user list and profiles',
            module: 'users',
            category: 'view',
            isSystem: true,
            weight: 1
        },
        {
            name: 'Create Users',
            code: 'CREATE_USERS',
            description: 'Create new user accounts',
            module: 'users',
            category: 'create',
            isSystem: true,
            weight: 3
        },
        {
            name: 'Edit Users',
            code: 'EDIT_USERS',
            description: 'Edit user information',
            module: 'users',
            category: 'edit',
            isSystem: true,
            weight: 3
        },
        {
            name: 'Delete Users',
            code: 'DELETE_USERS',
            description: 'Delete user accounts',
            module: 'users',
            category: 'delete',
            isSystem: true,
            weight: 5
        },
        {
            name: 'Manage Users',
            code: 'MANAGE_USERS',
            description: 'Full user management capabilities',
            module: 'users',
            category: 'manage',
            isSystem: true,
            weight: 10
        },

        // Resume permissions
        {
            name: 'View Resumes',
            code: 'VIEW_RESUMES',
            description: 'View resume list and details',
            module: 'resumes',
            category: 'view',
            isSystem: true,
            weight: 1
        },
        {
            name: 'Create Resumes',
            code: 'CREATE_RESUMES',
            description: 'Create new resumes',
            module: 'resumes',
            category: 'create',
            isSystem: true,
            weight: 3
        },
        {
            name: 'Edit Resumes',
            code: 'EDIT_RESUMES',
            description: 'Edit existing resumes',
            module: 'resumes',
            category: 'edit',
            isSystem: true,
            weight: 3
        },
        {
            name: 'Delete Resumes',
            code: 'DELETE_RESUMES',
            description: 'Delete resumes',
            module: 'resumes',
            category: 'delete',
            isSystem: true,
            weight: 5
        },
        {
            name: 'Manage Resumes',
            code: 'MANAGE_RESUMES',
            description: 'Full resume management capabilities',
            module: 'resumes',
            category: 'manage',
            isSystem: true,
            weight: 10
        },
        {
            name: 'Export Resumes',
            code: 'EXPORT_RESUMES',
            description: 'Export resumes to various formats',
            module: 'resumes',
            category: 'export',
            isSystem: true,
            weight: 4
        },

        // Admin permissions
        {
            name: 'View Admins',
            code: 'VIEW_ADMINS',
            description: 'View admin list and profiles',
            module: 'admins',
            category: 'view',
            isSystem: true,
            weight: 5
        },
        {
            name: 'Create Admins',
            code: 'CREATE_ADMINS',
            description: 'Create new admin accounts',
            module: 'admins',
            category: 'create',
            isSystem: true,
            weight: 8
        },
        {
            name: 'Edit Admins',
            code: 'EDIT_ADMINS',
            description: 'Edit admin information',
            module: 'admins',
            category: 'edit',
            isSystem: true,
            weight: 8
        },
        {
            name: 'Delete Admins',
            code: 'DELETE_ADMINS',
            description: 'Delete admin accounts',
            module: 'admins',
            category: 'delete',
            isSystem: true,
            weight: 10
        },
        {
            name: 'Manage Admins',
            code: 'MANAGE_ADMINS',
            description: 'Full admin management capabilities',
            module: 'admins',
            category: 'manage',
            isSystem: true,
            weight: 10
        },

        // Settings permissions
        {
            name: 'View Settings',
            code: 'VIEW_SETTINGS',
            description: 'View system settings',
            module: 'settings',
            category: 'view',
            isSystem: true,
            weight: 2
        },
        {
            name: 'Edit Settings',
            code: 'EDIT_SETTINGS',
            description: 'Edit system settings',
            module: 'settings',
            category: 'edit',
            isSystem: true,
            weight: 5
        },
        {
            name: 'Manage Settings',
            code: 'MANAGE_SETTINGS',
            description: 'Full settings management capabilities',
            module: 'settings',
            category: 'manage',
            isSystem: true,
            weight: 8
        },

        // Log permissions
        {
            name: 'View Logs',
            code: 'VIEW_LOGS',
            description: 'View system logs and audit trails',
            module: 'logs',
            category: 'view',
            isSystem: true,
            weight: 3
        },
        {
            name: 'Clear Logs',
            code: 'CLEAR_LOGS',
            description: 'Clear system logs',
            module: 'logs',
            category: 'delete',
            isSystem: true,
            weight: 7
        },
        {
            name: 'Export Logs',
            code: 'EXPORT_LOGS',
            description: 'Export logs to file',
            module: 'logs',
            category: 'export',
            isSystem: true,
            weight: 4
        },

        // Export permissions
        {
            name: 'Export All Data',
            code: 'EXPORT_ALL',
            description: 'Export all system data',
            module: 'exports',
            category: 'export',
            isSystem: true,
            weight: 6
        },

        // System permissions
        {
            name: 'System Maintenance',
            code: 'SYSTEM_MAINTENANCE',
            description: 'Perform system maintenance operations',
            module: 'system',
            category: 'system',
            isSystem: true,
            weight: 10
        },
        {
            name: 'Backup Management',
            code: 'MANAGE_BACKUPS',
            description: 'Create and restore system backups',
            module: 'system',
            category: 'manage',
            isSystem: true,
            weight: 9
        }
    ];

    for (const permData of defaultPermissions) {
        const existingPerm = await this.findOne({ code: permData.code });
        if (!existingPerm) {
            await this.create(permData);
            console.log(`Created default permission: ${permData.name}`);
        }
    }

    console.log('✅ Default permissions initialized');
};

// Instance methods
permissionSchema.methods.toResponse = function () {
    return {
        id: this._id,
        name: this.name,
        code: this.code,
        fullCode: this.fullCode,
        description: this.description,
        module: this.module,
        category: this.category,
        isSystem: this.isSystem,
        isActive: this.isActive,
        weight: this.weight,
        metadata: this.metadata,
        dependsOn: this.dependsOn,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

permissionSchema.methods.isDangerous = function () {
    const dangerousCategories = ['delete', 'system', 'manage'];
    const dangerousCodes = ['DELETE_ADMINS', 'SYSTEM_MAINTENANCE', 'CLEAR_LOGS'];

    return dangerousCategories.includes(this.category) ||
        dangerousCodes.includes(this.code) ||
        this.weight >= 8;
};

// Pre-save middleware
permissionSchema.pre('save', function (next) {
    // Ensure code is uppercase
    if (this.code) {
        this.code = this.code.toUpperCase().trim();
    }

    // Set default weight based on category
    if (!this.weight) {
        const categoryWeights = {
            view: 1,
            create: 3,
            edit: 3,
            export: 4,
            import: 4,
            delete: 5,
            manage: 8,
            system: 10
        };

        this.weight = categoryWeights[this.category] || 1;
    }

    next();
});

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;