import rateLimit from 'express-rate-limit';

// AI API Rate Limiter
// Limits each IP to 50 requests per 15 minutes
const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 50 requests per window
    standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: '⚠️ Too many AI requests from this IP. Please try again later.'
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: '⚠️ Too many AI requests from this IP. Please try again later.'
        });
    }
});

export default aiRateLimiter;
