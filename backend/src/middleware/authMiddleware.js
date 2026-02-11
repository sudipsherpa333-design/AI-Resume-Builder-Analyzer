const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

/**
 * Main authentication middleware
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookie
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from token
    const user = await User.findById(decoded.id || decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, user not found'
      });
    }

    // Check if user is active
    if (user.isSuspended || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is suspended or inactive'
      });
    }

    req.user = {
      id: user._id,
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isSuspended: user.isSuspended
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token expired'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }
};

// Alias for protect
const authMiddleware = protect;

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.id || decoded.userId).select('-password');
        if (user && !user.isSuspended && user.isActive) {
          req.user = {
            id: user._id,
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
          };
        }
      } catch (error) {
        // Silently fail for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

/**
 * Admin middleware
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized as admin'
    });
  }

  next();
};

/**
 * Super admin middleware
 */
const superAdminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized as super admin'
    });
  }

  next();
};

/**
 * Check if user has specific role
 */
const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Not authorized. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  authMiddleware,
  optionalAuth,
  adminMiddleware,
  superAdminMiddleware,
  hasRole
};