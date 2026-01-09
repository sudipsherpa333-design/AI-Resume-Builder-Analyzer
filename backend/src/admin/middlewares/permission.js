const Admin = require('../models/Admin');
const Role = require('../models/Role');

class PermissionMiddleware {
    // Check if admin has specific permission
    static checkPermission(requiredPermission) {
        return async (req, res, next) => {
            try {
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                // Super admin bypasses all permission checks
                if (req.admin.role === 'super_admin') {
                    return next();
                }

                // Check if admin has the specific permission
                const admin = await Admin.findById(req.admin._id).select('permissions role');

                if (!admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }

                // Check permissions array
                if (admin.permissions && admin.permissions.includes(requiredPermission)) {
                    return next();
                }

                // Check role permissions
                const role = await Role.findOne({ code: admin.role });
                if (role && role.permissions && role.permissions.includes(requiredPermission)) {
                    return next();
                }

                // Permission denied
                return res.status(403).json({
                    success: false,
                    message: `Permission denied. Required: ${requiredPermission}`,
                    requiredPermission,
                    adminPermissions: admin.permissions || []
                });
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Permission check failed'
                });
            }
        };
    }

    // Check multiple permissions (any of them)
    static checkAnyPermission(requiredPermissions = []) {
        return async (req, res, next) => {
            try {
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                // Super admin bypasses all permission checks
                if (req.admin.role === 'super_admin') {
                    return next();
                }

                const admin = await Admin.findById(req.admin._id).select('permissions role');

                if (!admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }

                // Check if admin has any of the required permissions
                const hasAnyPermission = requiredPermissions.some(permission => {
                    if (admin.permissions && admin.permissions.includes(permission)) {
                        return true;
                    }
                    return false;
                });

                if (hasAnyPermission) {
                    return next();
                }

                // Check role permissions
                const role = await Role.findOne({ code: admin.role });
                if (role && role.permissions) {
                    const hasRolePermission = requiredPermissions.some(permission =>
                        role.permissions.includes(permission)
                    );

                    if (hasRolePermission) {
                        return next();
                    }
                }

                // No permissions found
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions',
                    requiredPermissions,
                    adminPermissions: admin.permissions || []
                });
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Permission check failed'
                });
            }
        };
    }

    // Check all permissions (must have all)
    static checkAllPermissions(requiredPermissions = []) {
        return async (req, res, next) => {
            try {
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                // Super admin bypasses all permission checks
                if (req.admin.role === 'super_admin') {
                    return next();
                }

                const admin = await Admin.findById(req.admin._id).select('permissions role');

                if (!admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Admin not found'
                    });
                }

                // Check if admin has all required permissions
                const hasAllPermissions = requiredPermissions.every(permission => {
                    if (admin.permissions && admin.permissions.includes(permission)) {
                        return true;
                    }
                    return false;
                });

                if (hasAllPermissions) {
                    return next();
                }

                // Check role permissions
                const role = await Role.findOne({ code: admin.role });
                if (role && role.permissions) {
                    const hasAllRolePermissions = requiredPermissions.every(permission =>
                        role.permissions.includes(permission)
                    );

                    if (hasAllRolePermissions) {
                        return next();
                    }
                }

                // Missing some permissions
                return res.status(403).json({
                    success: false,
                    message: 'Missing required permissions',
                    requiredPermissions,
                    adminPermissions: admin.permissions || []
                });
            } catch (error) {
                console.error('Permission check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Permission check failed'
                });
            }
        };
    }

    // Check ownership or permission
    static checkOwnershipOrPermission(modelName, idParam = 'id', requiredPermission) {
        return async (req, res, next) => {
            try {
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                // Super admin bypasses all checks
                if (req.admin.role === 'super_admin') {
                    return next();
                }

                const itemId = req.params[idParam];

                if (!itemId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Item ID is required'
                    });
                }

                // Check ownership
                let isOwner = false;

                switch (modelName.toLowerCase()) {
                    case 'admin':
                        isOwner = req.admin._id.toString() === itemId;
                        break;
                    case 'resume':
                        // This would need to check if the admin created or owns the resume
                        // Implementation depends on your Resume model structure
                        break;
                    default:
                        // For other models, implement as needed
                        break;
                }

                if (isOwner) {
                    return next();
                }

                // If not owner, check permission
                return PermissionMiddleware.checkPermission(requiredPermission)(req, res, next);
            } catch (error) {
                console.error('Ownership check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Ownership check failed'
                });
            }
        };
    }

    // Check if admin can manage users (based on role hierarchy)
    static canManageUsers() {
        return async (req, res, next) => {
            try {
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                // Super admin can manage all users
                if (req.admin.role === 'super_admin') {
                    return next();
                }

                // Admin can manage moderators and viewers
                if (req.admin.role === 'admin') {
                    const targetRole = req.body.role || req.params.role;
                    if (targetRole && ['super_admin', 'admin'].includes(targetRole)) {
                        return res.status(403).json({
                            success: false,
                            message: 'Cannot manage users with equal or higher role'
                        });
                    }
                    return next();
                }

                // Moderators and viewers cannot manage users
                return res.status(403).json({
                    success: false,
                    message: 'Insufficient permissions to manage users'
                });
            } catch (error) {
                console.error('User management check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'User management check failed'
                });
            }
        };
    }

    // Check module access
    static checkModuleAccess(moduleName) {
        return async (req, res, next) => {
            try {
                if (!req.admin) {
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required'
                    });
                }

                // Super admin has access to all modules
                if (req.admin.role === 'super_admin') {
                    return next();
                }

                // Define module permissions mapping
                const modulePermissions = {
                    dashboard: ['dashboard.view'],
                    users: ['users.view', 'users.manage'],
                    resumes: ['resumes.view', 'resumes.manage'],
                    settings: ['settings.view', 'settings.edit'],
                    analytics: ['dashboard.analytics'],
                    logs: ['logs.view'],
                    exports: ['export.all', 'resumes.export', 'users.export']
                };

                const requiredPerms = modulePermissions[moduleName];

                if (!requiredPerms) {
                    return next(); // No specific permissions required for this module
                }

                // Check if admin has any of the required module permissions
                const admin = await Admin.findById(req.admin._id).select('permissions role');
                const role = await Role.findOne({ code: admin.role });

                const hasAccess = requiredPerms.some(permission => {
                    if (admin.permissions && admin.permissions.includes(permission)) {
                        return true;
                    }
                    if (role && role.permissions && role.permissions.includes(permission)) {
                        return true;
                    }
                    return false;
                });

                if (hasAccess) {
                    return next();
                }

                return res.status(403).json({
                    success: false,
                    message: `Access denied to ${moduleName} module`,
                    requiredModule: moduleName
                });
            } catch (error) {
                console.error('Module access check error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Module access check failed'
                });
            }
        };
    }
}

module.exports = PermissionMiddleware;