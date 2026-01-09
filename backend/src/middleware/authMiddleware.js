// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate regular users
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from Authorization header
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token in header, try cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');

    // Find user without password
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive'
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
        const user = await User.findById(decoded.id).select('-password');

        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        // Silently ignore token errors for optional auth
        console.log('Optional auth token error:', error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Admin middleware - checks if user is admin
 */
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
};

export default {
  authMiddleware,
  optionalAuth,
  adminMiddleware
};