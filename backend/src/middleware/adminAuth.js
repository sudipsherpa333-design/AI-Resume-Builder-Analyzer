// src/admin/middlewares/adminAuth.js - PRODUCTION VERSION
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import AdminLog from '../models/AdminLog.js';

/**
 * Authenticate admin using JWT token
 */
export const authenticateAdmin = async (req, res, next) => {
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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // Find admin
        const admin = await Admin.findOne({
            _id: decoded.adminId,
            isActive: true,
            deletedAt: null
        }).select('-password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }

        // Check if token is blacklisted
        if (admin.tokenBlacklist && admin.tokenBlacklist.includes(token)) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked.'
            });
        }

        // Attach admin to request
        req.admin = admin;
        req.token = token;

        // Log the request for sensitive endpoints
        if (shouldLogRequest(req.method, req.path)) {
            await AdminLog.create({
                adminId: admin._id,
                action: 'request',
                resource: req.path.split('/')[2] || 'unknown',
                method: req.method,
                description: `${req.method} ${req.path}`,
                ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
                userAgent: req.get('user-agent'),
                status: 'success'
            });
        }

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Check if user has specific role
 */
export const checkRole = (roles = []) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions. Required role: ' + roles.join(', ')
            });
        }

        next();
    };
};

/**
 * Check if user has specific permission
 */
export const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required.'
                });
            }

            // Super admin has all permissions
            if (req.admin.role === 'super_admin') {
                return next();
            }

            // Check specific permission
            const hasPermission = await checkAdminPermission(req.admin, permission);

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Permission denied: ${permission}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({
                success: false,
                message: 'Permission check failed.'
            });
        }
    };
};

/**
 * Helper function to check admin permissions
 */
const checkAdminPermission = async (admin, permission) => {
    try {
        // In a real app, this would check against a permissions database
        // For now, using a simplified permission structure
        const permissionMap = {
            'dashboard.view': ['super_admin', 'admin'],
            'dashboard.analytics': ['super_admin', 'admin'],
            'users.view': ['super_admin', 'admin'],
            'users.edit': ['super_admin', 'admin'],
            'users.delete': ['super_admin'],
            'users.export': ['super_admin', 'admin'],
            'resumes.view': ['super_admin', 'admin'],
            'resumes.edit': ['super_admin', 'admin'],
            'resumes.delete': ['super_admin'],
            'resumes.export': ['super_admin', 'admin'],
            'templates.view': ['super_admin', 'admin'],
            'templates.create': ['super_admin'],
            'templates.edit': ['super_admin'],
            'templates.delete': ['super_admin'],
            'analytics.view': ['super_admin', 'admin'],
            'analytics.export': ['super_admin'],
            'settings.view': ['super_admin', 'admin'],
            'settings.edit': ['super_admin'],
            'logs.view': ['super_admin'],
            'logs.export': ['super_admin']
        };

        const allowedRoles = permissionMap[permission] || [];
        return allowedRoles.includes(admin.role);
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
};

/**
 * Determine if request should be logged
 */
const shouldLogRequest = (method, path) => {
    const sensitiveMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const sensitivePaths = ['/users', '/resumes', '/templates', '/settings'];

    return sensitiveMethods.includes(method) ||
        sensitivePaths.some(p => path.includes(p));
};

/**
 * Rate limiting middleware for admin routes
 */
export const adminRateLimiter = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each admin to 100 requests per windowMs
    message: 'Too many requests from this admin, please try again later.'
};