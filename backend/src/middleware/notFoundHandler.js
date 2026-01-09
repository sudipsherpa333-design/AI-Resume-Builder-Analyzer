// src/middleware/notFoundHandler.js

/**
 * 404 Not Found Handler Middleware
 * 
 * This middleware catches all requests to routes that don't exist
 * and returns a consistent 404 error response.
 */

const notFoundHandler = (req, res, next) => {
    // Create error object
    const error = new Error(`Route not found - ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    error.code = 'ROUTE_NOT_FOUND';
    error.timestamp = new Date().toISOString();

    // Log the 404 error (but only in development or if enabled)
    if (process.env.NODE_ENV === 'development' || process.env.LOG_404_ERRORS === 'true') {
        console.warn(`🔍 404 Not Found: ${req.method} ${req.originalUrl}`);
        console.warn(`   IP: ${req.ip}`);
        console.warn(`   User-Agent: ${req.get('user-agent')}`);
    }

    // Pass error to error handler
    next(error);
};

/**
 * API-specific 404 handler for routes that start with /api or /admin/api
 * Returns JSON response instead of HTML
 */
const apiNotFoundHandler = (req, res, next) => {
    // Check if the request is for API routes
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/admin/api')) {
        const error = new Error(`API endpoint not found`);
        error.statusCode = 404;
        error.code = 'API_ENDPOINT_NOT_FOUND';
        error.path = req.originalUrl;
        error.method = req.method;
        error.timestamp = new Date().toISOString();

        // Return JSON response immediately
        return res.status(404).json({
            success: false,
            error: 'Endpoint not found',
            code: 'API_ENDPOINT_NOT_FOUND',
            message: `Cannot ${req.method} ${req.originalUrl}`,
            timestamp: error.timestamp,
            documentation: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/docs` : '/api/docs',
            suggestions: getRouteSuggestions(req.originalUrl)
        });
    }

    next(); // Pass to regular 404 handler
};

/**
 * Helper function to suggest similar routes
 */
const getRouteSuggestions = (requestedPath) => {
    const suggestions = [];
    const pathSegments = requestedPath.split('/').filter(segment => segment);

    // Common API endpoints suggestions
    const commonEndpoints = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/users/profile',
        '/api/resumes',
        '/api/health',
        '/api/docs',
        '/admin/api/auth/login',
        '/admin/api/dashboard/stats',
        '/admin/api/users'
    ];

    // Find similar endpoints (fuzzy match)
    commonEndpoints.forEach(endpoint => {
        if (endpoint.includes(pathSegments[1] || '')) {
            suggestions.push(endpoint);
        }
    });

    // Limit to 3 suggestions
    return suggestions.slice(0, 3);
};

/**
 * HTML 404 handler for non-API routes
 */
const htmlNotFoundHandler = (req, res) => {
    // Check if request accepts HTML
    const acceptsHtml = req.accepts('html');

    if (acceptsHtml) {
        return res.status(404).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>404 - Page Not Found</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                    }
                    
                    body {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                    }
                    
                    .error-container {
                        background: white;
                        border-radius: 20px;
                        padding: 40px;
                        margin: 40px 20px;
                        max-width: 600px;
                        width: 100%;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                    }
                    
                    .error-code {
                        font-size: 120px;
                        font-weight: bold;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin-bottom: 20px;
                    }
                    
                    .error-title {
                        font-size: 32px;
                        color: #333;
                        margin-bottom: 15px;
                    }
                    
                    .error-message {
                        color: #666;
                        margin-bottom: 30px;
                        line-height: 1.6;
                    }
                    
                    .path-info {
                        background: #f8f9fa;
                        border-radius: 10px;
                        padding: 15px;
                        margin: 20px 0;
                        text-align: left;
                        font-family: 'Courier New', monospace;
                        border-left: 4px solid #667eea;
                    }
                    
                    .suggestions {
                        text-align: left;
                        margin: 20px 0;
                    }
                    
                    .suggestions h3 {
                        color: #333;
                        margin-bottom: 10px;
                    }
                    
                    .suggestions ul {
                        list-style: none;
                        padding-left: 20px;
                    }
                    
                    .suggestions li {
                        padding: 8px 0;
                        color: #555;
                    }
                    
                    .suggestions li:before {
                        content: "→ ";
                        color: #667eea;
                        font-weight: bold;
                    }
                    
                    .actions {
                        display: flex;
                        gap: 15px;
                        justify-content: center;
                        margin-top: 30px;
                        flex-wrap: wrap;
                    }
                    
                    .btn {
                        padding: 12px 24px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: bold;
                        transition: all 0.3s;
                    }
                    
                    .btn-primary {
                        background: #667eea;
                        color: white;
                    }
                    
                    .btn-primary:hover {
                        background: #5a6fd8;
                        transform: translateY(-2px);
                    }
                    
                    .btn-secondary {
                        background: #f8f9fa;
                        color: #333;
                        border: 2px solid #ddd;
                    }
                    
                    .btn-secondary:hover {
                        background: #e9ecef;
                        transform: translateY(-2px);
                    }
                    
                    @media (max-width: 768px) {
                        .error-container {
                            padding: 20px;
                            margin: 20px;
                        }
                        
                        .error-code {
                            font-size: 80px;
                        }
                        
                        .actions {
                            flex-direction: column;
                        }
                        
                        .btn {
                            width: 100%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="error-container">
                    <div class="error-code">404</div>
                    <h1 class="error-title">Page Not Found</h1>
                    <p class="error-message">
                        The page you are looking for doesn't exist or has been moved.
                    </p>
                    
                    <div class="path-info">
                        <strong>Request:</strong> ${req.method} ${req.originalUrl}<br>
                        <strong>Time:</strong> ${new Date().toISOString()}<br>
                        <strong>IP:</strong> ${req.ip}
                    </div>
                    
                    ${getRouteSuggestions(req.originalUrl).length > 0 ? `
                    <div class="suggestions">
                        <h3>💡 Did you mean one of these?</h3>
                        <ul>
                            ${getRouteSuggestions(req.originalUrl).map(suggestion => `
                                <li><a href="${suggestion}">${suggestion}</a></li>
                            `).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    <div class="actions">
                        <a href="/" class="btn btn-primary">🏠 Go Home</a>
                        <a href="/api/docs" class="btn btn-secondary">📚 API Documentation</a>
                        <a href="/health" class="btn btn-secondary">🏥 Health Check</a>
                    </div>
                </div>
            </body>
            </html>
        `);
    }

    // Default JSON response for non-HTML requests
    return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
        code: 'NOT_FOUND'
    });
};

/**
 * Combined 404 handler that checks API routes first
 */
const combinedNotFoundHandler = (req, res, next) => {
    // First check if it's an API route
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/admin/api')) {
        apiNotFoundHandler(req, res, next);
    } else {
        // Check for HTML vs JSON response
        const acceptsJson = req.accepts('json');
        const acceptsHtml = req.accepts('html');

        if (acceptsJson || (!acceptsHtml && !acceptsJson)) {
            // Return JSON for API clients or when HTML not accepted
            return res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                timestamp: new Date().toISOString(),
                code: 'RESOURCE_NOT_FOUND',
                documentation: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/docs` : '/api/docs'
            });
        } else {
            // Return HTML for browser requests
            htmlNotFoundHandler(req, res);
        }
    }
};

/**
 * Development-only 404 handler with detailed logging
 */
const devNotFoundHandler = (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log('\n' + '═'.repeat(80));
        console.log('🔍 404 DEBUG INFORMATION');
        console.log('═'.repeat(80));
        console.log(`Path: ${req.method} ${req.originalUrl}`);
        console.log(`Time: ${new Date().toISOString()}`);
        console.log(`IP: ${req.ip}`);
        console.log(`User-Agent: ${req.get('user-agent')}`);
        console.log(`Accept: ${req.get('accept')}`);
        console.log(`Query Params:`, req.query);
        console.log(`Request Body:`, req.body);
        console.log(`Request Headers:`, req.headers);
        console.log('═'.repeat(80) + '\n');
    }

    // Pass to combined handler
    combinedNotFoundHandler(req, res, next);
};

/**
 * Static file 404 handler (for serving static files)
 */
const staticFileNotFoundHandler = (req, res, next) => {
    // Check if request is for static files
    if (req.originalUrl.startsWith('/uploads/') ||
        req.originalUrl.startsWith('/admin/') ||
        req.originalUrl.startsWith('/public/')) {

        const error = new Error(`Static file not found: ${req.originalUrl}`);
        error.statusCode = 404;
        error.code = 'STATIC_FILE_NOT_FOUND';

        // For static files, we want to return 404 without suggestions
        return res.status(404).json({
            success: false,
            error: 'File not found',
            message: `The requested file ${req.originalUrl} was not found`,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

/**
 * Custom 404 handler with configuration options
 */
const createNotFoundHandler = (options = {}) => {
    const {
        enableLogging = true,
        showSuggestions = true,
        returnHtml = true,
        apiPrefixes = ['/api', '/admin/api'],
        staticPaths = ['/uploads', '/admin', '/public']
    } = options;

    return (req, res, next) => {
        // Log 404 requests if enabled
        if (enableLogging && process.env.NODE_ENV !== 'test') {
            console.log(`[404] ${req.method} ${req.originalUrl} - ${req.ip}`);
        }

        // Check if it's an API request
        const isApiRequest = apiPrefixes.some(prefix => req.originalUrl.startsWith(prefix));
        const isStaticRequest = staticPaths.some(path => req.originalUrl.startsWith(path));

        if (isApiRequest) {
            // API response
            const response = {
                success: false,
                error: 'Endpoint not found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                timestamp: new Date().toISOString(),
                code: 'ENDPOINT_NOT_FOUND'
            };

            if (showSuggestions) {
                response.suggestions = getRouteSuggestions(req.originalUrl);
            }

            return res.status(404).json(response);

        } else if (isStaticRequest) {
            // Static file response
            return res.status(404).json({
                success: false,
                error: 'File not found',
                message: `The requested file ${req.originalUrl} was not found on the server`,
                timestamp: new Date().toISOString()
            });

        } else {
            // Regular 404
            if (returnHtml && req.accepts('html')) {
                return htmlNotFoundHandler(req, res);
            } else {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Cannot ${req.method} ${req.originalUrl}`,
                    timestamp: new Date().toISOString()
                });
            }
        }
    };
};

// Export all handlers
export {
    notFoundHandler,
    apiNotFoundHandler,
    htmlNotFoundHandler,
    combinedNotFoundHandler,
    devNotFoundHandler,
    staticFileNotFoundHandler,
    createNotFoundHandler
};

// Default export (recommended for most use cases)
export default devNotFoundHandler;