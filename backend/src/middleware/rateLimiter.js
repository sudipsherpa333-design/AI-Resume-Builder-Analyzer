// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.'
    }
});

/**
 * Admin endpoints rate limiter
 */
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        success: false,
        error: 'Too many admin requests, please try again later.'
    }
});

/**
 * AI endpoints rate limiter (to prevent abuse)
 */
export const aiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        success: false,
        error: 'AI request limit exceeded. Please try again later.'
    }
});

// Default export
const rateLimiters = {
    apiLimiter,
    authLimiter,
    adminLimiter,
    aiLimiter
};

export default rateLimiters;