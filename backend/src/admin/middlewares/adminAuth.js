const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const LogService = require('../services/LogService');

const authenticateAdmin = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

        // Find admin
        const admin = await Admin.findById(decoded.id).select('-password -twoFactorSecret');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
        }

        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check if password was changed after token was issued
        if (admin.passwordChangedAt && decoded.iat * 1000 < admin.passwordChangedAt.getTime()) {
            return res.status(401).json({
                success: false,
                message: 'Password was changed. Please login again.'
            });
        }

        // Attach admin to request
        req.admin = admin;
        req.adminId = admin._id;

        // Log access
        await LogService.createActionLog(admin._id, 'api_access', {
            endpoint: req.originalUrl,
            method: req.method,
            ip: req.ip
        });

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

const checkRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (typeof roles === 'string') {
            roles = [roles];
        }

        // Super admin bypasses all checks
        if (req.admin.role === 'super_admin') {
            return next();
        }

        if (roles.length && !roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

const checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Super admin bypasses permission checks
            if (req.admin.role === 'super_admin') {
                return next();
            }

            // Check if admin has the required permission
            if (!req.admin.permissions || !req.admin.permissions.includes(requiredPermission)) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied: ${requiredPermission}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Permission check failed'
            });
        }
    };
};

module.exports = {
    authenticateAdmin,
    checkRole,
    checkPermission
};