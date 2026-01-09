const Admin = require('../models/Admin');

const roleHierarchy = {
    'super_admin': 4,
    'admin': 3,
    'moderator': 2,
    'viewer': 1
};

const canManageRole = (currentAdminRole, targetRole) => {
    const currentLevel = roleHierarchy[currentAdminRole] || 0;
    const targetLevel = roleHierarchy[targetRole] || 0;

    // Can only manage roles at lower hierarchy levels
    return currentLevel > targetLevel;
};

const checkRoleHierarchy = async (req, res, next) => {
    try {
        const currentAdmin = req.admin;
        const targetRole = req.body.role || req.params.role;

        if (!targetRole) {
            return next();
        }

        // Super admin can do anything
        if (currentAdmin.role === 'super_admin') {
            return next();
        }

        if (!canManageRole(currentAdmin.role, targetRole)) {
            return res.status(403).json({
                success: false,
                message: 'Cannot assign a role equal or higher than your own'
            });
        }

        next();
    } catch (error) {
        console.error('Role hierarchy check error:', error);
        res.status(500).json({
            success: false,
            message: 'Role check failed'
        });
    }
};

const checkSelfAction = (req, res, next) => {
    const currentAdminId = req.admin._id.toString();
    const targetAdminId = req.params.id;

    if (currentAdminId === targetAdminId) {
        return res.status(400).json({
            success: false,
            message: 'Cannot perform this action on yourself'
        });
    }

    next();
};

module.exports = {
    checkRoleHierarchy,
    canManageRole,
    checkSelfAction
};