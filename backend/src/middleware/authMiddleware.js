// src/middleware/authMiddleware.js - UPDATED & FIXED VERSION
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware to authenticate regular users
 * FIXED: Now handles both JWT formats (with 'userId' and 'id' claims)
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Try to get token from Authorization header
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token in header, try cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // Also check for token in query string (for some APIs)
    if (!token && req.query?.token) {
      token = req.query.token;
    }

    console.log('🔐 [AuthMiddleware] Token check:', {
      hasHeaderToken: !!req.header('Authorization'),
      hasCookieToken: !!req.cookies?.token,
      hasQueryToken: !!req.query?.token,
      tokenPresent: !!token
    });

    if (!token) {
      console.log('❌ [AuthMiddleware] No token provided');
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

    console.log('✅ [AuthMiddleware] Token decoded:', {
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      expiresIn: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'unknown'
    });

    // Handle both token formats: userId (new) and id (old)
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      console.log('❌ [AuthMiddleware] Token missing user ID');
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Find user without password
    const user = await User.findById(userId);

    if (!user) {
      console.log('❌ [AuthMiddleware] User not found for ID:', userId);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      console.log('❌ [AuthMiddleware] User account inactive:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
    }

    if (user.isSuspended) {
      console.log('❌ [AuthMiddleware] User account suspended:', user.email);
      return res.status(401).json({
        success: false,
        message: 'Account is suspended'
      });
    }

    console.log('✅ [AuthMiddleware] User authenticated:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();

  } catch (error) {
    console.error('❌ [AuthMiddleware] Error:', error.message);
    console.error('Token verification error details:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token not yet valid'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Alias for authMiddleware for backward compatibility
 */
export const protect = authMiddleware;

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token && req.query?.token) {
      token = req.query.token;
    }

    console.log('🔍 [OptionalAuth] Checking token:', !!token);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');

        // Handle both token formats
        const userId = decoded.userId || decoded.id;

        if (userId) {
          const user = await User.findById(userId);

          if (user && user.isActive && !user.isSuspended) {
            req.user = user;
            req.token = token;
            console.log('✅ [OptionalAuth] User attached:', user.email);
          } else {
            console.log('⚠️ [OptionalAuth] User not active or found');
          }
        }
      } catch (error) {
        // Silently ignore token errors for optional auth
        console.log('⚠️ [OptionalAuth] Token error (ignored):', error.message);
      }
    }

    next();
  } catch (error) {
    console.error('❌ [OptionalAuth] Error:', error);
    next();
  }
};

/**
 * Admin middleware - checks if user is admin
 */
export const adminMiddleware = (req, res, next) => {
  console.log('👑 [AdminMiddleware] Checking admin access');

  if (!req.user) {
    console.log('❌ [AdminMiddleware] No user in request');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  console.log('🔍 [AdminMiddleware] User role:', req.user.role);

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    console.log('❌ [AdminMiddleware] User is not admin:', req.user.email);
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  console.log('✅ [AdminMiddleware] Admin access granted:', req.user.email);
  next();
};

/**
 * Super admin middleware - checks if user is super admin
 */
export const superAdminMiddleware = (req, res, next) => {
  console.log('👑 [SuperAdminMiddleware] Checking super admin access');

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'super_admin') {
    console.log('❌ [SuperAdminMiddleware] User is not super admin:', req.user.email);
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  console.log('✅ [SuperAdminMiddleware] Super admin access granted:', req.user.email);
  next();
};

/**
 * Check if user has specific role
 */
export const hasRole = (...roles) => {
  return (req, res, next) => {
    console.log(`🔍 [hasRole] Checking roles: ${roles.join(', ')}`);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`❌ [hasRole] User role '${req.user.role}' not in required roles: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    console.log(`✅ [hasRole] Role check passed: ${req.user.role}`);
    next();
  };
};

/**
 * Rate limiting middleware for auth endpoints
 */
export const rateLimitAuth = (limit = 5, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamp] of requests.entries()) {
      if (timestamp < windowStart) {
        requests.delete(key);
      }
    }

    // Count requests for this IP
    const ipRequests = Array.from(requests.entries())
      .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
      .length;

    console.log(`📊 [RateLimit] IP ${ip} has ${ipRequests} requests in last ${windowMs / 60000}min`);

    if (ipRequests >= limit) {
      console.log(`⏳ [RateLimit] Rate limit exceeded for IP ${ip}`);
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Record this request
    requests.set(`${ip}-${now}`, now);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - ipRequests - 1);
    res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

    next();
  };
};

/**
 * CSRF protection middleware (for forms and non-API requests)
 */
export const csrfProtection = (req, res, next) => {
  // Skip for API requests and GET requests
  if (req.method === 'GET' || req.path.startsWith('/api/')) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || csrfToken !== sessionToken) {
    console.warn('⚠️ [CSRF] Invalid or missing CSRF token');
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }

  next();
};

/**
 * Log all authenticated requests (for debugging)
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const userEmail = req.user ? req.user.email : 'guest';

    console.log(`📝 [Request] ${req.method} ${req.path} - ${res.statusCode} - ${userEmail} - ${duration}ms`);
  });

  next();
};

// Default export for backward compatibility
export default {
  authMiddleware,
  protect,
  optionalAuth,
  adminMiddleware,
  superAdminMiddleware,
  hasRole,
  rateLimitAuth,
  csrfProtection,
  requestLogger
};