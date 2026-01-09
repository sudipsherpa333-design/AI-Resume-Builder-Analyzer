// src/middleware/errorHandler.js
import logger from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('❌ Error:', {
        message: err.message,
        code: err.code || 'INTERNAL_ERROR',
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: err.timestamp || new Date().toISOString()
    });

    // Determine status code
    const statusCode = err.statusCode || 500;

    // Check if it's a 404 error from our notFoundHandler
    if (statusCode === 404) {
        // For API clients, return JSON
        if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/admin/api')) {
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: err.message,
                code: err.code || 'NOT_FOUND',
                timestamp: err.timestamp,
                path: req.originalUrl,
                method: req.method,
                suggestions: err.suggestions || []
            });
        }

        // For HTML requests (browsers), check if we should return HTML
        if (req.accepts('html') && !req.accepts('json')) {
            // You can render an HTML error page here
            return res.status(404).send(`
                <!DOCTYPE html>
                <html>
                <head><title>404 Not Found</title></head>
                <body>
                    <h1>404 - Page Not Found</h1>
                    <p>${err.message}</p>
                    <a href="/">Go Home</a>
                </body>
                </html>
            `);
        }
    }

    // For other errors, return appropriate response
    const response = {
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        timestamp: err.timestamp || new Date().toISOString()
    };

    // Add additional info for validation errors
    if (err.name === 'ValidationError') {
        response.errors = err.errors;
        response.code = 'VALIDATION_ERROR';
    }

    // Add code if present
    if (err.code) {
        response.code = err.code;
    }

    res.status(statusCode).json(response);
};

export default errorHandler;