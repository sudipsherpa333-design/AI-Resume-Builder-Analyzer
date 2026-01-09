// src/middleware/adminAuth.js
import jwt from 'jsonwebtoken';
import Admin from '../admin/models/Admin.js';

/**
 * Middleware to authenticate admin users
 */
export const adminAuth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

        // Find admin
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found'
            });
        }

        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Admin account is inactive'
            });
        }

        // Attach admin to request
        req.admin = admin;
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
};

/**
 * Middleware to check if admin has specific permission
 */
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const [module, action] = permission.split('.');

        if (!req.admin.permissions ||
            !req.admin.permissions[module] ||
            !req.admin.permissions[module].includes(action)) {
            return res.status(403).json({
                success: false,
                error: `Permission denied: ${permission}`
            });
        }

        next();
    };
};

/**
 * Middleware to check if admin has specific role
 */
export const requireRole = (roles) => {
    const roleArray = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        if (!roleArray.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                error: `Role required: ${roleArray.join(' or ')}`
            });
        }

        next();
    };
};

/**
 * Super admin only middleware
 */
export const superAdminOnly = (req, res, next) => {
    if (!req.admin) {
        return res.status(401).json({
            success: false,
            error: 'Authentication required'
        });
    }

    if (req.admin.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            error: 'Super admin access required'
        });
    }

    next();
};

// Default export for backward compatibility
const adminAuthMiddleware = { adminAuth, requirePermission, requireRole, superAdminOnly };
export default adminAuthMiddleware;