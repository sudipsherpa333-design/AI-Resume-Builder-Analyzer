// backend/server.js - UPDATED WITH ROUTE FIXES
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs/promises';
import cluster from 'cluster';
import os from 'os';
import http from 'http';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import passport from 'passport'; // Added for OAuth
import session from 'express-session'; // Added for OAuth
import MongoStore from 'connect-mongo'; // Added for session storage

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ======================
// CONFIGURATION
// ======================
dotenv.config({ path: join(__dirname, '.env') });

const PORT = parseInt(process.env.PORT) || 5001;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const ENABLE_CLUSTER = process.env.ENABLE_CLUSTER === 'true' && cluster.isPrimary;
const CPU_COUNT = parseInt(process.env.CPU_COUNT) || os.cpus().length;
const MAX_MEMORY_RSS = parseInt(process.env.MAX_MEMORY_RSS) || 1024; // MB

// Database Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-builder';
const MONGODB_OPTIONS = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
};

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || `http://localhost:${PORT}/api/auth/google/callback`;
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-session-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL?.split(',')[0] || 'http://localhost:5173';

// AI Configuration
const AI_ENABLED = process.env.AI_ENABLED !== 'false';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Socket.io specific config
const SOCKET_IO_CONFIG = {
    cors: {
        origin: process.env.CLIENT_URL?.split(',') || ["http://localhost:3000", "http://localhost:5173", FRONTEND_URL],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Socket-ID"]
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true
    }
};

const LOG_SEPARATOR = '═'.repeat(70);
const BANNER = `
╔══════════════════════════════════════════════════════════════════════╗
║               AI RESUME BUILDER & ANALYZER                           ║
║               Production Ready - v2.0.0                              ║
╚══════════════════════════════════════════════════════════════════════╝
`;

// ======================
// SERVER LOGGER (Enhanced)
// ======================
class ServerLogger {
    static colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m'
    };

    static log(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const pid = process.pid;
        const workerId = process.env.WORKER_ID || 'MASTER';

        const levels = {
            info: { color: this.colors.cyan, icon: 'ℹ️' },
            success: { color: this.colors.green, icon: '✅' },
            warning: { color: this.colors.yellow, icon: '⚠️' },
            error: { color: this.colors.red, icon: '❌' },
            debug: { color: this.colors.gray, icon: '🐛' },
            socket: { color: this.colors.magenta, icon: '🔌' },
            ai: { color: this.colors.blue, icon: '🤖' },
            db: { color: this.colors.magenta, icon: '🗄️' },
            auth: { color: this.colors.cyan, icon: '🔐' }
        };

        const levelConfig = levels[level] || levels.info;

        console.log(
            `${levelConfig.color}[${timestamp}] [${workerId}:${pid}] ${levelConfig.icon} ${message}${this.colors.reset}`,
            Object.keys(meta).length ? meta : ''
        );

        // Log to file in production
        if (NODE_ENV === 'production') {
            this.logToFile({ timestamp, workerId, pid, level, message, ...meta });
        }
    }

    static logToFile(logData) {
        const logDir = join(__dirname, 'logs');
        const logFile = join(logDir, `server-${new Date().toISOString().split('T')[0]}.log`);

        fs.mkdir(logDir, { recursive: true }).catch(() => { });
        const logEntry = JSON.stringify(logData) + '\n';
        fs.appendFile(logFile, logEntry).catch(() => { });
    }

    static info(message, meta = {}) { this.log('info', message, meta); }
    static success(message, meta = {}) { this.log('success', message, meta); }
    static warning(message, meta = {}) { this.log('warning', message, meta); }
    static error(message, meta = {}) { this.log('error', message, meta); }
    static debug(message, meta = {}) {
        if (NODE_ENV === 'development') {
            this.log('debug', message, meta);
        }
    }
    static socket(message, meta = {}) { this.log('socket', message, meta); }
    static ai(message, meta = {}) { this.log('ai', message, meta); }
    static db(message, meta = {}) { this.log('db', message, meta); }
    static auth(message, meta = {}) { this.log('auth', message, meta); }
}

// ======================
// PASSPORT/GOOGLE OAUTH SETUP
// ======================
async function setupPassportGoogleOAuth(app) {
    try {
        // Only setup if Google OAuth is configured
        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            ServerLogger.warning('Google OAuth not configured. Skipping OAuth setup.');
            ServerLogger.warning('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env to enable Google OAuth');
            return;
        }

        ServerLogger.auth('Setting up Google OAuth...', {
            clientId: GOOGLE_CLIENT_ID ? 'configured' : 'missing',
            callbackUrl: GOOGLE_CALLBACK_URL,
            frontendUrl: FRONTEND_URL
        });

        // Import Google OAuth Strategy
        const { default: GoogleStrategy } = await import('passport-google-oauth20');

        // Session configuration
        app.use(session({
            secret: SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: MONGODB_URI,
                ttl: 14 * 24 * 60 * 60, // 14 days
                autoRemove: 'native'
            }),
            cookie: {
                secure: NODE_ENV === 'production',
                httpOnly: true,
                maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
                sameSite: NODE_ENV === 'production' ? 'none' : 'lax'
            }
        }));

        // Initialize Passport
        app.use(passport.initialize());
        app.use(passport.session());

        // Serialize user
        passport.serializeUser((user, done) => {
            done(null, user.id);
        });

        // Deserialize user
        passport.deserializeUser(async (id, done) => {
            try {
                // Import User model
                const userModule = await import(join(__dirname, 'src', 'models', 'User.js'));
                const User = userModule.default;
                const user = await User.findById(id);
                done(null, user);
            } catch (error) {
                done(error, null);
            }
        });

        // Configure Google Strategy
        passport.use(new GoogleStrategy({
            clientID: GOOGLE_CLIENT_ID,
            clientSecret: GOOGLE_CLIENT_SECRET,
            callbackURL: GOOGLE_CALLBACK_URL,
            scope: ['profile', 'email'],
            passReqToCallback: true
        }, async (req, accessToken, refreshToken, profile, done) => {
            try {
                ServerLogger.auth('Google OAuth callback received', {
                    googleId: profile.id,
                    email: profile.emails?.[0]?.value,
                    displayName: profile.displayName
                });

                // Import User model
                const userModule = await import(join(__dirname, 'src', 'models', 'User.js'));
                const User = userModule.default;

                // Find or create user
                let user = await User.findOne({
                    $or: [
                        { googleId: profile.id },
                        { email: profile.emails?.[0]?.value }
                    ]
                });

                if (user) {
                    // Update existing user with Google data
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.avatar = profile.photos?.[0]?.value;
                        await user.save();
                        ServerLogger.auth('Updated existing user with Google OAuth', { userId: user._id });
                    }
                } else {
                    // Create new user
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails?.[0]?.value,
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value,
                        isEmailVerified: true,
                        authProvider: 'google'
                    });

                    await user.save();
                    ServerLogger.auth('Created new user via Google OAuth', { userId: user._id });
                }

                return done(null, user);
            } catch (error) {
                ServerLogger.error('Google OAuth callback error:', { error: error.message });
                return done(error, null);
            }
        }));

        ServerLogger.success('Google OAuth configured successfully');

    } catch (error) {
        ServerLogger.error('Failed to setup Google OAuth:', { error: error.message });
        // Don't throw error, continue without OAuth
    }
}

// ======================
// GOOGLE OAUTH ROUTES
// ======================
function createGoogleOAuthRoutes(app) {
    const router = express.Router();

    // Google OAuth login route
    router.get('/google', passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account'
    }));

    // Google OAuth callback route
    router.get('/google/callback',
        passport.authenticate('google', {
            failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
            session: true
        }),
        (req, res) => {
            try {
                // Successful authentication
                const user = req.user;

                // Generate JWT token for API access
                const jwtUtilsPath = join(__dirname, 'src', 'utils', 'jwtUtils.js');
                import(`file://${jwtUtilsPath}`)
                    .then(jwtUtils => {
                        if (jwtUtils && jwtUtils.generateToken) {
                            const token = jwtUtils.generateToken({
                                userId: user._id,
                                email: user.email,
                                name: user.name,
                                role: user.role || 'user'
                            });

                            // Redirect to frontend with token
                            res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&userId=${user._id}&email=${user.email}&name=${encodeURIComponent(user.name)}`);
                        } else {
                            // Fallback redirect
                            res.redirect(`${FRONTEND_URL}/auth/callback?success=true&userId=${user._id}`);
                        }
                    })
                    .catch(() => {
                        // Fallback redirect if JWT utils not available
                        res.redirect(`${FRONTEND_URL}/auth/callback?success=true&userId=${user._id}`);
                    });
            } catch (error) {
                ServerLogger.error('Google OAuth callback error:', { error: error.message });
                res.redirect(`${FRONTEND_URL}/login?error=callback_failed`);
            }
        }
    );

    // Get current user session
    router.get('/session', (req, res) => {
        if (req.isAuthenticated()) {
            res.json({
                success: true,
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    name: req.user.name,
                    avatar: req.user.avatar,
                    role: req.user.role || 'user'
                }
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Not authenticated'
            });
        }
    });

    // Logout route
    router.post('/logout', (req, res, next) => {
        req.logout((err) => {
            if (err) {
                return next(err);
            }
            res.json({ success: true, message: 'Logged out successfully' });
        });
    });

    // Check if OAuth is configured
    router.get('/config', (req, res) => {
        res.json({
            googleOAuth: {
                enabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
                clientIdConfigured: !!GOOGLE_CLIENT_ID,
                callbackUrl: GOOGLE_CALLBACK_URL
            },
            providers: ['google']
        });
    });

    return router;
}

// ======================
// FALLBACK ROUTES FUNCTION
// ======================
async function createFallbackResumeRoutes(app) {
    try {
        const router = express.Router();

        // Try to import Resume model
        let Resume;
        try {
            const resumeModule = await import(join(__dirname, 'src', 'models', 'Resume.js'));
            Resume = resumeModule.default;
        } catch (error) {
            ServerLogger.warning('Resume model not found for fallback routes');
            Resume = null;
        }

        // Mock auth middleware for fallback
        const mockAuth = (req, res, next) => {
            if (!req.headers.authorization && NODE_ENV === 'development') {
                req.user = { id: 'fallback_user_id' };
            }
            next();
        };

        // Apply mock auth for all fallback routes
        router.use(mockAuth);

        // Basic resume routes
        router.get('/', async (req, res) => {
            try {
                if (!Resume || !req.user?.id) {
                    return res.json({
                        success: true,
                        data: [],
                        message: 'Fallback route - returning empty array'
                    });
                }
                const resumes = await Resume.find({ user: req.user.id });
                res.json({ success: true, data: resumes });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.post('/', async (req, res) => {
            try {
                if (!Resume || !req.user?.id) {
                    return res.json({
                        success: true,
                        data: {
                            id: 'fallback_' + Date.now(),
                            title: req.body.title || 'Fallback Resume',
                            status: 'draft',
                            createdAt: new Date(),
                            updatedAt: new Date()
                        },
                        message: 'Fallback route - mock data created'
                    });
                }
                const resume = new Resume({
                    ...req.body,
                    user: req.user.id
                });
                await resume.save();
                res.json({ success: true, data: resume });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        router.get('/:id', async (req, res) => {
            try {
                if (!Resume) {
                    return res.json({
                        success: true,
                        data: {
                            id: req.params.id,
                            title: 'Sample Resume',
                            summary: 'This is a sample resume created by the fallback system',
                            experience: [],
                            education: [],
                            skills: [],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        }
                    });
                }
                const resume = await Resume.findById(req.params.id);
                if (!resume) {
                    return res.status(404).json({ success: false, error: 'Resume not found' });
                }
                res.json({ success: true, data: resume });
            } catch (error) {
                res.status(500).json({ success: false, error: error.message });
            }
        });

        app.use('/api/resumes', router);
        ServerLogger.success('Fallback resume routes created');
    } catch (error) {
        ServerLogger.error('Failed to create fallback routes:', { error: error.message });
    }
}

// ======================
// DATABASE CONNECTION
// ======================
class DatabaseManager {
    static async connect() {
        try {
            ServerLogger.db('Connecting to MongoDB...', {
                uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'),
                options: MONGODB_OPTIONS
            });

            await mongoose.connect(MONGODB_URI, MONGODB_OPTIONS);

            mongoose.connection.on('connected', () => {
                ServerLogger.success('MongoDB connected successfully', {
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                    name: mongoose.connection.name
                });
            });

            mongoose.connection.on('error', (err) => {
                ServerLogger.error('MongoDB connection error:', { error: err.message });
            });

            mongoose.connection.on('disconnected', () => {
                ServerLogger.warning('MongoDB disconnected');
            });

            process.on('SIGINT', async () => {
                await mongoose.connection.close();
                ServerLogger.info('MongoDB connection closed through app termination');
                process.exit(0);
            });

            return mongoose.connection;
        } catch (error) {
            ServerLogger.error('Failed to connect to MongoDB:', { error: error.message });
            throw error;
        }
    }

    static async disconnect() {
        try {
            await mongoose.disconnect();
            ServerLogger.success('MongoDB disconnected');
        } catch (error) {
            ServerLogger.error('Error disconnecting MongoDB:', { error: error.message });
        }
    }

    static getStatus() {
        return {
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name,
            models: Object.keys(mongoose.models)
        };
    }
}

// ======================
// SERVER PERFORMANCE MONITOR (Enhanced)
// ======================
class ServerPerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.memoryWarnings = 0;
        this.requestCount = 0;
        this.errorCount = 0;
        this.socketConnections = 0;
        this.socketEvents = 0;
        this.aiRequests = 0;
        this.aiErrors = 0;
        this.dbQueries = 0;
        this.dbErrors = 0;
        this.authRequests = 0;
        this.authErrors = 0;

        if (NODE_ENV === 'production') {
            this.startMonitoring();
        }
    }

    startMonitoring() {
        // Memory monitoring
        setInterval(() => {
            const memory = process.memoryUsage();
            const rssMB = Math.round(memory.rss / 1024 / 1024);

            if (rssMB > MAX_MEMORY_RSS * 0.9) {
                this.memoryWarnings++;
                ServerLogger.warning(`High memory usage: ${rssMB}MB`, {
                    heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
                    external: Math.round(memory.external / 1024 / 1024)
                });

                if (this.memoryWarnings > 10) {
                    ServerLogger.error('Critical memory pressure - consider restarting');
                }
            }
        }, 30000);

        // Uptime logging
        setInterval(() => {
            const uptime = process.uptime();
            ServerLogger.info(`System Status`, {
                uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
                requests: this.requestCount,
                errors: this.errorCount,
                socketConnections: this.socketConnections,
                socketEvents: this.socketEvents,
                aiRequests: this.aiRequests,
                aiErrors: this.aiErrors,
                dbQueries: this.dbQueries,
                dbErrors: this.dbErrors,
                authRequests: this.authRequests,
                authErrors: this.authErrors,
                memoryWarnings: this.memoryWarnings
            });
        }, 300000);
    }

    incrementRequest() { this.requestCount++; }
    incrementError() { this.errorCount++; }
    incrementSocketConnection() { this.socketConnections++; }
    decrementSocketConnection() { this.socketConnections = Math.max(0, this.socketConnections - 1); }
    incrementSocketEvent() { this.socketEvents++; }
    incrementAIRequest() { this.aiRequests++; }
    incrementAIError() { this.aiErrors++; }
    incrementDBQuery() { this.dbQueries++; }
    incrementDBError() { this.dbErrors++; }
    incrementAuthRequest() { this.authRequests++; }
    incrementAuthError() { this.authErrors++; }

    getStats() {
        return {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            requests: this.requestCount,
            errors: this.errorCount,
            memoryWarnings: this.memoryWarnings,
            socketConnections: this.socketConnections,
            socketEvents: this.socketEvents,
            aiRequests: this.aiRequests,
            aiErrors: this.aiErrors,
            dbQueries: this.dbQueries,
            dbErrors: this.dbErrors,
            authRequests: this.authRequests,
            authErrors: this.authErrors
        };
    }
}

// ======================
// CREATE EXPRESS APP (Enhanced)
// ======================
const createExpressApp = () => {
    const app = express();

    // Security & Performance Middleware
    app.use(helmet({
        contentSecurityPolicy: NODE_ENV === 'production',
        crossOriginEmbedderPolicy: NODE_ENV === 'production',
        crossOriginResourcePolicy: { policy: "cross-origin" }
    }));
    app.use(compression());

    // CORS Configuration - Updated to include FRONTEND_URL
    const allowedOrigins = process.env.CLIENT_URL?.split(',') || [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        FRONTEND_URL
    ].filter(Boolean);

    app.use(cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
                ServerLogger.warning('CORS Error:', { msg, origin });
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-User-ID', 'Accept', 'X-Requested-With']
    }));

    // Also add this for preflight requests
    app.options('*', cors());

    // Body parsing middleware
    app.use(express.json({
        limit: '10mb',
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        }
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '10mb',
        parameterLimit: 10000
    }));

    // Morgan logging
    if (NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined', {
            stream: {
                write: (message) => ServerLogger.info(message.trim())
            }
        }));
    }

    // Request logging middleware
    app.use((req, res, next) => {
        const startTime = Date.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        req.requestId = requestId;

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const logLevel = duration > 1000 ? 'warning' : 'info';

            ServerLogger[logLevel]('Request completed', {
                requestId,
                method: req.method,
                url: req.url,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip,
                userAgent: req.get('user-agent'),
                contentLength: res.get('content-length') || 0
            });
        });

        res.on('error', (err) => {
            ServerLogger.error('Response error', {
                requestId,
                error: err.message,
                url: req.url
            });
        });

        next();
    });

    // Add security headers
    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        next();
    });

    return app;
};

// ======================
// LOAD ROUTES FROM YOUR STRUCTURE
// ======================
const loadRoutes = async (app, performanceMonitor = null) => {
    try {
        ServerLogger.info('Loading application routes...');

        const routesPath = resolve(__dirname, 'src', 'routes');



        // Route configurations - UPDATED: Removed auth.js since we handle auth via OAuth
        const routeConfigs = [
            { file: 'userRoutes.js', path: '/api/users', name: 'User', required: true },
            { file: 'resumes.js', path: '/api/resumes', name: 'Resume', required: true },
            { file: 'templateRoutes.js', path: '/api/templates', name: 'Template', required: false },
            { file: 'aiRoutes.js', path: '/api/ai', name: 'AI', required: false },
            { file: 'adminRoutes.js', path: '/api/admin', name: 'Admin', required: false },
            { file: 'adminAuthRoutes.js', path: '/api/admin/auth', name: 'Admin Auth', required: false },
            { file: 'dashboardRoutes.js', path: '/api/dashboard', name: 'Dashboard', required: false }
        ];

        let resumeRoutesLoaded = false;

        for (const config of routeConfigs) {
            try {
                const filePath = join(routesPath, config.file);

                // Check if file exists
                try {
                    await fs.access(filePath);
                } catch {
                    if (config.required) {
                        ServerLogger.warning(`Required route file not found: ${config.file}`);

                        // If it's resumes route, create fallback
                        if (config.name === 'Resume' && !resumeRoutesLoaded) {
                            ServerLogger.warning('Creating fallback resume routes...');
                            await createFallbackResumeRoutes(app);
                            resumeRoutesLoaded = true;
                        }
                    } else {
                        ServerLogger.debug(`Optional route file not found: ${config.file}`);
                    }
                    continue;
                }

                // Special handling for resume routes - don't load both
                if (config.name === 'Resume' && resumeRoutesLoaded) {
                    ServerLogger.warning(`Skipping ${config.file} - resume routes already loaded`);
                    continue;
                }

                // Import the route module
                const routeModule = await import(`file://${filePath}`);

                if (routeModule.default) {
                    app.use(config.path, routeModule.default);
                    ServerLogger.success(`${config.name} routes loaded from ${config.file}`);

                    if (config.name === 'Resume') {
                        resumeRoutesLoaded = true;
                    }
                } else if (routeModule.router) {
                    app.use(config.path, routeModule.router);
                    ServerLogger.success(`${config.name} routes loaded from ${config.file}`);

                    if (config.name === 'Resume') {
                        resumeRoutesLoaded = true;
                    }
                } else {
                    ServerLogger.warning(`${config.file} loaded but no default export found`);
                }
            } catch (error) {
                ServerLogger.error(`Failed to load ${config.file}:`, {
                    error: error.message,
                    code: error.code
                });

                // If it's required resume route and failed, create fallback
                if (config.name === 'Resume' && config.required && !resumeRoutesLoaded) {
                    ServerLogger.warning('Creating fallback resume routes due to load error...');
                    await createFallbackResumeRoutes(app);
                    resumeRoutesLoaded = true;
                }
            }
        }

        // If no resume routes were loaded, create fallback
        if (!resumeRoutesLoaded) {
            ServerLogger.warning('No resume routes loaded, creating fallback...');
            await createFallbackResumeRoutes(app);
        }

        // Load AI module routes
        try {
            const aiModulePath = join(__dirname, 'src', 'ai', 'ai.routes.js');
            await fs.access(aiModulePath);
            const aiModuleRoutes = await import(`file://${aiModulePath}`);
            if (aiModuleRoutes.default) {
                app.use('/api/v2/ai', aiModuleRoutes.default);
                ServerLogger.success('AI module routes loaded');
            }
        } catch (error) {
            ServerLogger.debug('AI module routes not found or failed to load', { error: error.message });
        }

        // Load admin module routes
        try {
            const adminModulePath = join(__dirname, 'src', 'admin', 'routes', 'adminRoutes.js');
            await fs.access(adminModulePath);
            const adminModuleRoutes = await import(`file://${adminModulePath}`);
            if (adminModuleRoutes.default) {
                app.use('/api/admin/v2', adminModuleRoutes.default);
                ServerLogger.success('Admin module routes loaded');
            }
        } catch (error) {
            ServerLogger.debug('Admin module routes not found', { error: error.message });
        }

        // Load your auth routes from auth.js
        try {
            const authFilePath = join(routesPath, 'auth.js');
            await fs.access(authFilePath);
            const authModule = await import(`file://${authFilePath}`);
            if (authModule.default) {
                // ✅ ONLY place where /api/auth prefix is added
                app.use('/api/auth', authModule.default);
                ServerLogger.success('Auth routes loaded at /api/auth');
            }
        } catch (error) {
            ServerLogger.error('Auth routes not found');
        }

        ServerLogger.success('All routes loaded successfully');

    } catch (error) {
        ServerLogger.error('Failed to load routes:', { error: error.message });
        throw error;
    }
};

// ======================
// ADDITIONAL MIDDLEWARE TO HANDLE /auth ROUTES
// ======================
const setupAuthRouteMiddleware = (app) => {
    // Handle both /auth and /api/auth routes for Google OAuth
    app.use('/auth', (req, res, next) => {
        // If it's a Google OAuth route, redirect to /api/auth
        if (req.path === '/google' || req.path.startsWith('/google/')) {
            // Remove /auth prefix and add /api/auth prefix
            const newPath = `/api${req.path}`;
            ServerLogger.debug(`Redirecting ${req.path} to ${newPath}`);

            // Create new URL with query parameters
            const queryString = Object.keys(req.query).length
                ? '?' + new URLSearchParams(req.query).toString()
                : '';

            res.redirect(307, newPath + queryString);
        } else {
            next();
        }
    });
};

// ======================
// INITIALIZE SOCKET.IO
// ======================
const initializeSocketIOServer = async (httpServer, performanceMonitor = null) => {
    const socketIoModule = await import('socket.io');
    const { Server } = socketIoModule;
    const io = new Server(httpServer, SOCKET_IO_CONFIG);

    // Socket.io state management
    const socketState = {
        activeUsers: new Map(),
        activeResumes: new Map(),
        userSockets: new Map(),
        activeRooms: new Set()
    };

    // Import your socket service if available
    let socketService = null;
    try {
        const socketServicePath = join(__dirname, 'src', 'services', 'socketService.js');
        const serviceModule = await import(`file://${socketServicePath}`);
        socketService = serviceModule.default || serviceModule;
        ServerLogger.success('Socket service loaded from services/socketService.js');
    } catch (error) {
        ServerLogger.debug('Using built-in socket service', { error: error.message });
    }

    // Authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                socket.handshake.headers['authorization']?.replace('Bearer ', '');

            if (NODE_ENV === 'development' && !token) {
                socket.user = {
                    id: `dev_${Date.now()}`,
                    email: 'dev@example.com',
                    name: 'Developer',
                    role: 'user'
                };
                ServerLogger.socket('Development connection (no auth)', { socketId: socket.id });
                return next();
            }

            if (!token) {
                ServerLogger.warning('Socket connection attempt without token', {
                    ip: socket.handshake.address,
                    socketId: socket.id
                });
                return next(new Error('Authentication token required'));
            }

            // Verify token using your existing JWT utils
            try {
                const jwtUtilsPath = join(__dirname, 'src', 'utils', 'jwtUtils.js');
                const jwtUtils = await import(`file://${jwtUtilsPath}`);
                if (jwtUtils && jwtUtils.verifyToken) {
                    const decoded = jwtUtils.verifyToken(token);
                    socket.user = {
                        id: decoded.userId || decoded.id,
                        email: decoded.email,
                        name: decoded.name,
                        role: decoded.role || 'user'
                    };
                } else {
                    // Fallback to simple validation
                    socket.user = {
                        id: socket.handshake.auth.userId || `user_${Date.now()}`,
                        email: socket.handshake.auth.email || 'user@example.com',
                        name: socket.handshake.auth.name || 'User',
                        role: 'user'
                    };
                }
            } catch (jwtError) {
                ServerLogger.error('JWT verification failed', {
                    error: jwtError.message,
                    socketId: socket.id
                });
                return next(new Error('Invalid authentication token'));
            }

            ServerLogger.socket('Authenticated socket connection', {
                userId: socket.user.id,
                socketId: socket.id.substring(0, 10),
                role: socket.user.role
            });

            next();
        } catch (error) {
            ServerLogger.error('Socket authentication error', {
                error: error.message,
                socketId: socket.id
            });
            next(new Error('Authentication failed'));
        }
    });

    // Connection handler
    io.on('connection', (socket) => {
        const userId = socket.user?.id || 'anonymous';
        const clientIp = socket.handshake.address;
        const connectionTime = new Date();

        if (performanceMonitor) {
            performanceMonitor.incrementSocketConnection();
        }

        ServerLogger.success('🔌 Socket.io client connected', {
            socketId: socket.id.substring(0, 10),
            userId: userId.substring(0, 15),
            ip: clientIp,
            transport: socket.conn.transport.name,
            time: connectionTime.toISOString(),
            role: socket.user?.role
        });

        // Initialize user data
        const userData = {
            id: userId,
            socketId: socket.id,
            connectedAt: connectionTime,
            ip: clientIp,
            rooms: new Set(),
            lastActivity: connectionTime,
            userInfo: socket.user,
            online: true
        };

        socketState.activeUsers.set(socket.id, userData);

        // Track user's sockets
        if (!socketState.userSockets.has(userId)) {
            socketState.userSockets.set(userId, new Set());
        }
        socketState.userSockets.get(userId).add(socket.id);

        // Join user's personal room
        socket.join(`user:${userId}`);
        userData.rooms.add(`user:${userId}`);

        // If socket service exists, use its handlers
        if (socketService && typeof socketService.initializeSocket === 'function') {
            socketService.initializeSocket(socket, io, socketState);
            ServerLogger.debug('Using external socket service handlers');
        } else {
            // Use built-in handlers
            setupDefaultSocketHandlers(socket, io, socketState, performanceMonitor);
        }

        // Send initial connection confirmation
        socket.emit('connected', {
            success: true,
            socketId: socket.id,
            userId,
            serverTime: new Date().toISOString(),
            message: 'Connected to resume builder server',
            aiEnabled: AI_ENABLED,
            oauthEnabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
            services: {
                ai: true,
                collaboration: true,
                realtime: true,
                oauth: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
            }
        });
    });

    // Periodic cleanup
    setInterval(() => {
        cleanupInactiveSessions(socketState);
        broadcastDashboardStats(io, socketState);
    }, 60000);

    ServerLogger.success('Socket.io initialized successfully', {
        transports: SOCKET_IO_CONFIG.transports,
        corsOrigins: SOCKET_IO_CONFIG.cors.origin,
        aiEnabled: AI_ENABLED,
        oauthEnabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
    });

    return { io, socketState };
};

// Default socket handlers
const setupDefaultSocketHandlers = (socket, io, socketState, performanceMonitor) => {
    const userId = socket.user?.id || 'anonymous';

    // Resume collaboration events
    socket.on('resume:join', (data) => {
        const { resumeId } = data;
        if (!resumeId) return;

        socket.join(`resume:${resumeId}`);
        socketState.activeUsers.get(socket.id)?.rooms.add(`resume:${resumeId}`);

        // Track active resume
        if (!socketState.activeResumes.has(resumeId)) {
            socketState.activeResumes.set(resumeId, {
                id: resumeId,
                socketIds: new Set([socket.id]),
                lastActivity: new Date(),
                users: new Set([userId])
            });
        } else {
            const resume = socketState.activeResumes.get(resumeId);
            resume.socketIds.add(socket.id);
            resume.users.add(userId);
            resume.lastActivity = new Date();
        }

        socket.to(`resume:${resumeId}`).emit('resume:user-joined', {
            userId,
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });

        ServerLogger.socket('User joined resume session', {
            resumeId,
            userId,
            activeUsers: socketState.activeResumes.get(resumeId)?.users.size || 1
        });
    });

    socket.on('resume:update', (data) => {
        const { resumeId, content, section } = data;
        if (!resumeId) return;

        socket.to(`resume:${resumeId}`).emit('resume:updated', {
            resumeId,
            content,
            section,
            updatedBy: userId,
            timestamp: new Date().toISOString()
        });

        // Update last activity
        if (socketState.activeResumes.has(resumeId)) {
            socketState.activeResumes.get(resumeId).lastActivity = new Date();
        }
    });

    socket.on('resume:leave', (data) => {
        const { resumeId } = data;
        if (!resumeId) return;

        socket.leave(`resume:${resumeId}`);
        socketState.activeUsers.get(socket.id)?.rooms.delete(`resume:${resumeId}`);

        if (socketState.activeResumes.has(resumeId)) {
            const resume = socketState.activeResumes.get(resumeId);
            resume.socketIds.delete(socket.id);
            resume.users.delete(userId);

            if (resume.socketIds.size === 0) {
                socketState.activeResumes.delete(resumeId);
            }
        }

        socket.to(`resume:${resumeId}`).emit('resume:user-left', {
            userId,
            timestamp: new Date().toISOString()
        });
    });

    // AI analysis events
    socket.on('ai:analyze', async (data, callback) => {
        try {
            if (performanceMonitor) {
                performanceMonitor.incrementSocketEvent();
                performanceMonitor.incrementAIRequest();
            }

            const { resumeId, content, type = 'ats' } = data;

            ServerLogger.ai('AI analysis requested via socket', {
                userId,
                resumeId,
                type,
                contentLength: content?.length || 0
            });

            // Use your existing AI service
            try {
                const aiServicePath = join(__dirname, 'src', 'services', 'aiService.js');
                const aiServiceModule = await import(`file://${aiServicePath}`);
                if (aiServiceModule && (aiServiceModule.default || aiServiceModule.analyzeResume)) {
                    const service = aiServiceModule.default ? new aiServiceModule.default() : aiServiceModule;
                    const analyzeFunc = service.analyzeResume || aiServiceModule.analyzeResume;

                    if (typeof analyzeFunc === 'function') {
                        const result = await analyzeFunc.call(service || aiServiceModule, content, type);

                        if (typeof callback === 'function') {
                            callback({
                                success: true,
                                data: result,
                                timestamp: new Date().toISOString()
                            });
                        }

                        socket.to(`resume:${resumeId}`).emit('ai:analysis-complete', {
                            resumeId,
                            result,
                            requestedBy: userId,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        throw new Error('analyzeResume function not found in AI service');
                    }
                } else {
                    throw new Error('AI service not available');
                }
            } catch (serviceError) {
                ServerLogger.error('AI service error', { error: serviceError.message });
                throw serviceError;
            }

        } catch (error) {
            if (performanceMonitor) performanceMonitor.incrementAIError();

            ServerLogger.error('AI socket analysis failed', {
                error: error.message,
                userId,
                socketId: socket.id.substring(0, 10)
            });

            if (typeof callback === 'function') {
                callback({
                    success: false,
                    error: 'AI analysis failed',
                    message: error.message
                });
            }
        }
    });

    // Keep-alive ping
    socket.on('ping', (callback) => {
        socketState.activeUsers.get(socket.id).lastActivity = new Date();
        if (typeof callback === 'function') {
            callback({
                success: true,
                timestamp: new Date().toISOString(),
                serverTime: Date.now()
            });
        }
    });

    // Disconnect handler
    socket.on('disconnect', (reason) => {
        if (performanceMonitor) {
            performanceMonitor.decrementSocketConnection();
        }

        const userData = socketState.activeUsers.get(socket.id);
        if (userData) {
            // Leave all rooms
            userData.rooms.forEach(room => {
                socket.leave(room);
                if (room.startsWith('resume:')) {
                    const resumeId = room.replace('resume:', '');
                    socket.to(room).emit('resume:user-disconnected', {
                        userId: userData.id,
                        timestamp: new Date().toISOString()
                    });

                    if (socketState.activeResumes.has(resumeId)) {
                        const resume = socketState.activeResumes.get(resumeId);
                        resume.socketIds.delete(socket.id);
                        resume.users.delete(userData.id);

                        if (resume.socketIds.size === 0) {
                            socketState.activeResumes.delete(resumeId);
                        }
                    }
                }
            });

            // Remove from user sockets
            if (socketState.userSockets.has(userData.id)) {
                const userSockets = socketState.userSockets.get(userData.id);
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    socketState.userSockets.delete(userData.id);
                }
            }

            socketState.activeUsers.delete(socket.id);
        }

        ServerLogger.socket('Client disconnected', {
            socketId: socket.id.substring(0, 10),
            userId: userData?.id || 'unknown',
            reason,
            duration: userData ? `${(Date.now() - userData.connectedAt.getTime()) / 1000}s` : 'unknown'
        });
    });

    socket.on('error', (error) => {
        ServerLogger.error('Socket error', {
            socketId: socket.id.substring(0, 10),
            userId,
            error: error.message
        });
    });
};

// ======================
// SOCKET.IO UTILITIES
// ======================
const broadcastDashboardStats = (io, socketState) => {
    try {
        const now = Date.now();
        const onlineUsers = Array.from(socketState.activeUsers.values())
            .filter(user => (now - user.lastActivity.getTime()) < 30000);

        const activeResumes = Array.from(socketState.activeResumes.values())
            .filter(resume => (now - resume.lastActivity.getTime()) < 300000);

        const stats = {
            onlineUsers: onlineUsers.length,
            activeResumes: activeResumes.length,
            totalConnections: socketState.activeUsers.size,
            updatedAt: new Date().toISOString(),
            serverTime: now
        };

        io.to('dashboard').emit('dashboard:stats', stats);
    } catch (error) {
        ServerLogger.error('Failed to broadcast dashboard stats', { error: error.message });
    }
};

const cleanupInactiveSessions = (socketState) => {
    const now = Date.now();
    const userInactiveThreshold = 5 * 60 * 1000; // 5 minutes
    const resumeInactiveThreshold = 30 * 60 * 1000; // 30 minutes

    // Clean inactive users
    for (const [socketId, user] of socketState.activeUsers.entries()) {
        if ((now - user.lastActivity.getTime()) > userInactiveThreshold) {
            socketState.activeUsers.delete(socketId);
            ServerLogger.debug('Cleaned up inactive user', {
                socketId: socketId.substring(0, 10),
                userId: user.id.substring(0, 15),
                inactiveFor: `${(now - user.lastActivity.getTime()) / 60000}min`
            });
        }
    }

    // Clean inactive resumes
    for (const [resumeId, resume] of socketState.activeResumes.entries()) {
        if ((now - resume.lastActivity.getTime()) > resumeInactiveThreshold && resume.socketIds.size === 0) {
            socketState.activeResumes.delete(resumeId);
            ServerLogger.debug('Cleaned up inactive resume', {
                resumeId: resumeId.substring(0, 15),
                inactiveFor: `${(now - resume.lastActivity.getTime()) / 60000}min`
            });
        }
    }
};

// ======================
// ENVIRONMENT VALIDATION
// ======================
const validateServerEnvironment = () => {
    ServerLogger.info('Validating environment configuration...');

    const requiredVars = {
        'JWT_SECRET': 'JWT authentication secret',
        'MONGODB_URI': 'MongoDB connection string'
    };

    const recommendedVars = {
        'SESSION_SECRET': 'Session encryption secret',
        'OPENAI_API_KEY': 'OpenAI API key for AI features',
        'CLIENT_URL': 'Frontend application URL(s)',
        'FRONTEND_URL': 'Frontend URL for OAuth redirects'
    };

    const missing = [];
    const warnings = [];

    // Check required variables
    Object.entries(requiredVars).forEach(([key, description]) => {
        if (!process.env[key]) {
            missing.push({ key, description });
        }
    });

    // Check recommended variables
    Object.entries(recommendedVars).forEach(([key, description]) => {
        if (!process.env[key] && NODE_ENV === 'production') {
            warnings.push(`${key} is recommended for production: ${description}`);
        }
    });

    // Check OAuth variables
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        warnings.push('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for OAuth login.');
    }

    // Check security
    if (process.env.JWT_SECRET?.includes('change-this') || process.env.JWT_SECRET?.length < 32) {
        warnings.push('JWT_SECRET is weak or uses default value - CHANGE FOR PRODUCTION!');
    }

    if (SESSION_SECRET?.includes('your-session-secret') || SESSION_SECRET?.length < 32) {
        warnings.push('SESSION_SECRET is weak or uses default value - CHANGE FOR PRODUCTION!');
    }

    // Check Node version
    const nodeVersion = process.versions.node;
    const majorVersion = parseInt(nodeVersion.split('.')[0]);
    if (majorVersion < 16) {
        warnings.push(`Node.js v${nodeVersion} detected. Recommended: v18+`);
    }

    if (missing.length > 0) {
        ServerLogger.error('Missing required environment variables:');
        missing.forEach(({ key, description }) => {
            console.log(`   ❗ ${key}: ${description}`);
        });
        return false;
    }

    if (warnings.length > 0) {
        ServerLogger.warning('Configuration warnings:');
        warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    }

    ServerLogger.success('Environment validation passed');
    return true;
};

// ======================
// SERVER HEALTH CHECK (Enhanced)
// ======================
const checkServerHealth = async (socketState = null, performanceMonitor = null) => {
    const checks = {
        server: true,
        memory: false,
        uptime: false,
        database: mongoose.connection.readyState === 1,
        socket: socketState !== null,
        ai: AI_ENABLED,
        oauth: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
    };

    try {
        const memory = process.memoryUsage();
        const rssMB = memory.rss / 1024 / 1024;
        checks.memory = rssMB < MAX_MEMORY_RSS;
        checks.uptime = process.uptime() > 5;

        // Check MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            checks.database = false;
        }

        const socketStats = socketState ? {
            activeConnections: socketState.activeUsers.size,
            activeResumes: socketState.activeResumes.size,
            userSockets: socketState.userSockets.size
        } : null;

        const perfStats = performanceMonitor ? performanceMonitor.getStats() : null;

        const dbStats = DatabaseManager.getStatus();
        const dbStatus = dbStats.readyState === 1 ? 'connected' : 'disconnected';

        return {
            status: Object.values(checks).every(check => check) ? 'healthy' : 'degraded',
            checks,
            details: {
                memory: `${Math.round(rssMB)}MB / ${MAX_MEMORY_RSS}MB`,
                uptime: `${Math.floor(process.uptime())}s`,
                nodeVersion: process.version,
                environment: NODE_ENV,
                pid: process.pid,
                database: {
                    status: dbStatus,
                    host: dbStats.host,
                    name: dbStats.name,
                    models: dbStats.models.length
                },
                oauth: {
                    google: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
                    frontendUrl: FRONTEND_URL
                },
                ...(socketStats ? { sockets: socketStats } : {}),
                ...(perfStats ? { performance: perfStats } : {})
            },
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        ServerLogger.error('Health check failed', { error: error.message });
        return {
            status: 'unhealthy',
            checks,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
};

// ======================
// DISPLAY SERVER INFO
// ======================
const displayServerInfo = (port, host, workerId = null, hasSocket = false, aiEnabled = false) => {
    console.clear();
    console.log(ServerLogger.colors.magenta + BANNER + ServerLogger.colors.reset);
    console.log(LOG_SEPARATOR);

    const title = workerId ? `WORKER ${workerId}` : 'MASTER PROCESS';
    ServerLogger.success(`${title} STARTED`, {
        pid: process.pid,
        port,
        host: host === '0.0.0.0' ? 'localhost' : host,
        environment: NODE_ENV,
        cluster: ENABLE_CLUSTER ? 'enabled' : 'disabled'
    });

    console.log(LOG_SEPARATOR);

    const serverUrls = [
        { label: '🌐 Local URL', url: `http://localhost:${port}` },
        { label: '🏥 Health Check', url: `http://localhost:${port}/health` },
        { label: '🔌 WS Endpoint', url: `ws://localhost:${port}` },
        { label: '📊 Server Metrics', url: `http://localhost:${port}/api/metrics` },
        { label: '🤖 AI Status', url: `http://localhost:${port}/api/ai/status` },
        { label: '🔐 OAuth Status', url: `http://localhost:${port}/api/auth/config` },
        { label: '🔑 Google OAuth', url: `http://localhost:${port}/auth/google` }
    ];

    console.log('\n' + ServerLogger.colors.cyan + '🚀 QUICK ACCESS:' + ServerLogger.colors.reset);
    serverUrls.forEach(({ label, url }) => {
        console.log(`   ${label.padEnd(20)} ${url}`);
    });

    console.log('\n' + ServerLogger.colors.yellow + '⚙️  CONFIGURATION:' + ServerLogger.colors.reset);
    console.log(`   Environment:  ${NODE_ENV.toUpperCase().padEnd(12)} ${NODE_ENV === 'production' ? '🚀' : '🛠️'}`);
    console.log(`   Cluster Mode: ${(ENABLE_CLUSTER ? 'ENABLED' : 'DISABLED').padEnd(12)} ${ENABLE_CLUSTER ? `(${CPU_COUNT} workers)` : ''}`);
    console.log(`   Node Version: ${process.version.padEnd(12)}`);
    console.log(`   PID:          ${process.pid.toString().padEnd(12)}`);

    console.log('\n' + ServerLogger.colors.green + '✅ SERVICES:' + ServerLogger.colors.reset);
    console.log(`   Database:     ${'CONNECTED'.padEnd(12)} ✅`);
    console.log(`   Socket.IO:    ${hasSocket ? 'ENABLED'.padEnd(12) : 'DISABLED'.padEnd(12)} ${hasSocket ? '✅' : '❌'}`);
    console.log(`   AI Service:   ${aiEnabled ? 'ENABLED'.padEnd(12) : 'DISABLED'.padEnd(12)} ${aiEnabled ? (OPENAI_API_KEY ? '✅' : '⚠️ (mock)') : '❌'}`);
    console.log(`   Google OAuth: ${GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET ? 'ENABLED'.padEnd(12) : 'DISABLED'.padEnd(12)} ${GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET ? '✅' : '❌'}`);

    const memory = process.memoryUsage();
    console.log(`   Memory:       ${Math.round(memory.heapUsed / 1024 / 1024)}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB`);

    console.log('\n' + ServerLogger.colors.blue + '📁 PROJECT STRUCTURE:' + ServerLogger.colors.reset);
    console.log(`   • Controllers: ${resolve(__dirname, 'src', 'controllers')}`);
    console.log(`   • Models:      ${resolve(__dirname, 'src', 'models')}`);
    console.log(`   • Routes:      ${resolve(__dirname, 'src', 'routes')}`);
    console.log(`   • Services:    ${resolve(__dirname, 'src', 'services')}`);
    console.log(`   • AI Module:   ${resolve(__dirname, 'src', 'ai')}`);
    console.log(`   • Admin:       ${resolve(__dirname, 'src', 'admin')}`);

    console.log(LOG_SEPARATOR);
    console.log(ServerLogger.colors.green + '✅ Server is ready to handle requests' + ServerLogger.colors.reset + '\n');
};

// ======================
// GRACEFUL SHUTDOWN
// ======================
const setupServerGracefulShutdown = (server, performanceMonitor = null, socketIO = null, workerId = null) => {
    let isShuttingDown = false;

    const gracefulShutdown = async (signal, error = null) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        const workerPrefix = workerId ? `Worker ${workerId}: ` : '';
        ServerLogger.warning(`${workerPrefix}Initiating graceful shutdown (${signal})...`, {
            signal,
            error: error?.message,
            timestamp: new Date().toISOString()
        });

        if (error) {
            ServerLogger.error(`${workerPrefix}Shutdown triggered by error:`, {
                error: error.message,
                stack: error.stack
            });
        }

        const shutdownSteps = [
            {
                name: 'Close HTTP server',
                action: () => new Promise((resolve) => {
                    if (server && server.close) {
                        server.close(() => {
                            ServerLogger.success(`${workerPrefix}HTTP server closed`);
                            resolve();
                        });

                        setTimeout(() => {
                            ServerLogger.warning(`${workerPrefix}HTTP server force closed after timeout`);
                            resolve();
                        }, 10000);
                    } else {
                        resolve();
                    }
                })
            },
            {
                name: 'Close Socket.io connections',
                action: async () => {
                    if (socketIO && socketIO.io) {
                        try {
                            socketIO.io.disconnectSockets(true);
                            ServerLogger.success(`${workerPrefix}Socket.io connections closed`);
                        } catch (err) {
                            ServerLogger.error(`${workerPrefix}Error closing Socket.io:`, { error: err.message });
                        }
                    }
                }
            },
            {
                name: 'Disconnect from database',
                action: async () => {
                    try {
                        await DatabaseManager.disconnect();
                        ServerLogger.success(`${workerPrefix}Database disconnected`);
                    } catch (err) {
                        ServerLogger.error(`${workerPrefix}Error disconnecting database:`, { error: err.message });
                    }
                }
            },
            {
                name: 'Cleanup resources',
                action: async () => {
                    if (performanceMonitor) {
                        const stats = performanceMonitor.getStats();
                        ServerLogger.info(`${workerPrefix}Final statistics:`, stats);
                    }
                    ServerLogger.info(`${workerPrefix}Cleanup completed`);
                }
            }
        ];

        try {
            for (const step of shutdownSteps) {
                ServerLogger.info(`${workerPrefix}${step.name}...`);
                await step.action();
            }

            ServerLogger.success(`${workerPrefix}Shutdown completed successfully`);
            process.exit(error ? 1 : 0);

        } catch (shutdownError) {
            ServerLogger.error(`${workerPrefix}Error during shutdown:`, {
                error: shutdownError.message,
                stack: shutdownError.stack
            });
            process.exit(1);
        }

        setTimeout(() => {
            ServerLogger.error(`${workerPrefix}Force exiting after timeout`);
            process.exit(1);
        }, 15000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

    process.on('uncaughtException', (error) => {
        ServerLogger.error('Uncaught Exception:', {
            error: error.message,
            stack: error.stack
        });
        gracefulShutdown('UNCAUGHT_EXCEPTION', error);
    });

    process.on('unhandledRejection', (reason, promise) => {
        ServerLogger.error('Unhandled Rejection:', {
            reason: reason instanceof Error ? reason.message : reason,
            promise: promise
        });
        gracefulShutdown('UNHANDLED_REJECTION', reason instanceof Error ? reason : new Error(String(reason)));
    });
};

// ======================
// CREATE REQUIRED DIRECTORIES
// ======================
const createServerDirectories = async () => {
    const directories = [
        'logs',
        'logs/socket',
        'logs/ai',
        'logs/database',
        'logs/auth',
        'uploads/resumes',
        'uploads/profiles',
        'uploads/templates',
        'uploads/temp',
        'backups',
        'backups/database',
        'cache',
        'cache/ai',
        'cache/resumes',
        'temp',
        'temp/socket',
        'temp/uploads'
    ];

    for (const dir of directories) {
        const dirPath = join(__dirname, dir);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
            ServerLogger.debug(`Created directory: ${dir}`);
        }
    }
};

// ======================
// SETUP ADDITIONAL ROUTES
// ======================
const setupAdditionalRoutes = (app, performanceMonitor) => {
    // ======================
    // UNIVERSAL GOOGLE OAUTH REDIRECTS
    // ======================
    // Handle /api/google -> /api/auth/google redirect
    app.get('/api/google', (req, res) => {
        const { state, redirect_uri, prompt, scope, code_challenge, code_challenge_method } = req.query;

        ServerLogger.debug('Redirecting /api/google to /api/auth/google', {
            state: state ? 'present' : 'missing',
            redirect_uri: redirect_uri || 'not specified',
            clientIp: req.ip,
            referer: req.get('referer')
        });

        // Build redirect URL with all original parameters
        const params = new URLSearchParams();
        if (state) params.append('state', state);
        if (redirect_uri) params.append('redirect_uri', redirect_uri);
        if (prompt) params.append('prompt', prompt || 'select_account');
        if (scope) params.append('scope', scope);
        if (code_challenge) params.append('code_challenge', code_challenge);
        if (code_challenge_method) params.append('code_challenge_method', code_challenge_method);

        // Add Google OAuth default parameters if not present
        if (!scope) params.append('scope', 'profile email');
        if (!prompt) params.append('prompt', 'select_account');

        const queryString = params.toString();
        const redirectUrl = `/api/auth/google${queryString ? `?${queryString}` : ''}`;

        ServerLogger.debug(`Redirect URL: ${redirectUrl}`);
        res.redirect(307, redirectUrl);
    });

    // Handle /api/google/callback -> /api/auth/google/callback redirect
    app.get('/api/google/callback', (req, res) => {
        ServerLogger.debug('Redirecting /api/google/callback to /api/auth/google/callback', {
            queryParams: Object.keys(req.query).length,
            hasCode: !!req.query.code,
            hasState: !!req.query.state,
            hasError: !!req.query.error
        });

        const params = new URLSearchParams(req.query).toString();
        res.redirect(307, `/api/auth/google/callback${params ? `?${params}` : ''}`);
    });

    // Additional redirects for common variations
    app.get('/oauth/google', (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        res.redirect(307, `/api/auth/google${params ? `?${params}` : ''}`);
    });

    app.get('/oauth/google/callback', (req, res) => {
        const params = new URLSearchParams(req.query).toString();
        res.redirect(307, `/api/auth/google/callback${params ? `?${params}` : ''}`);
    });

    // ======================
    // EXISTING ROUTES (KEEP THESE)
    // ======================

    // Health check endpoint
    app.get('/health', async (req, res) => {
        try {
            const health = await checkServerHealth(app.get('socketState'), performanceMonitor);
            res.status(health.status === 'healthy' ? 200 : 503).json(health);
        } catch (error) {
            performanceMonitor?.incrementError();
            res.status(500).json({
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // API health check
    app.get('/api/health', async (req, res) => {
        try {
            const health = await checkServerHealth(app.get('socketState'), performanceMonitor);
            res.status(health.status === 'healthy' ? 200 : 503).json(health);
        } catch (error) {
            performanceMonitor?.incrementError();
            res.status(500).json({
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // OAuth test endpoint
    app.get('/api/auth/test', (req, res) => {
        res.json({
            success: true,
            oauth: {
                google: {
                    enabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
                    loginUrl: `/api/auth/google`,
                    callbackUrl: GOOGLE_CALLBACK_URL,
                    alternateUrls: [
                        '/api/google',
                        '/auth/google',
                        '/oauth/google'
                    ]
                }
            },
            frontendUrl: FRONTEND_URL
        });
    });

    // Server metrics
    app.get('/api/metrics', (req, res) => {
        if (NODE_ENV === 'production' && req.headers['x-api-key'] !== process.env.METRICS_API_KEY) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const stats = performanceMonitor?.getStats() || {};
        const socketState = app.get('socketState');

        res.json({
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                environment: NODE_ENV,
                pid: process.pid
            },
            performance: stats,
            sockets: socketState ? {
                activeUsers: socketState.activeUsers.size,
                activeResumes: socketState.activeResumes.size,
                userSockets: socketState.userSockets.size
            } : null,
            database: DatabaseManager.getStatus(),
            oauth: {
                googleEnabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
                authRequests: stats.authRequests || 0,
                authErrors: stats.authErrors || 0,
                redirects: {
                    '/api/google': '/api/auth/google',
                    '/api/google/callback': '/api/auth/google/callback'
                }
            },
            timestamp: new Date().toISOString()
        });
    });

    // AI status
    app.get('/api/ai/status', (req, res) => {
        res.json({
            enabled: AI_ENABLED,
            configured: !!OPENAI_API_KEY,
            services: {
                atsAnalysis: true,
                keywordExtraction: true,
                contentOptimization: true,
                realtimeSuggestions: true
            },
            endpoints: {
                analyze: '/api/ai/analyze',
                keywords: '/api/ai/keywords',
                optimize: '/api/ai/optimize',
                suggestions: '/api/ai/suggestions'
            },
            timestamp: new Date().toISOString()
        });
    });

    // Server info - Updated to show OAuth routes
    app.get('/api/server/info', (req, res) => {
        res.json({
            name: 'AI Resume Builder & Analyzer',
            version: '2.0.0',
            environment: NODE_ENV,
            services: {
                database: 'MongoDB',
                realtime: 'Socket.IO',
                ai: AI_ENABLED ? 'OpenAI' : 'Disabled',
                auth: 'JWT + Google OAuth',
                storage: 'File System'
            },
            features: [
                'Resume Building',
                'ATS Analysis',
                'AI Optimization',
                'Real-time Collaboration',
                'Template Management',
                'Admin Dashboard',
                'Google OAuth Login'
            ],
            oauth: {
                google: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
                frontendRedirect: FRONTEND_URL,
                primaryEndpoint: '/api/auth/google',
                alternateEndpoints: [
                    '/api/google',
                    '/auth/google',
                    '/oauth/google'
                ]
            },
            timestamp: new Date().toISOString()
        });
    });

    // Debug endpoint to show all available OAuth routes
    app.get('/api/auth/routes', (req, res) => {
        res.json({
            availableOAuthRoutes: [
                {
                    path: '/api/auth/google',
                    method: 'GET',
                    description: 'Primary Google OAuth login endpoint',
                    redirectsFrom: ['/api/google', '/auth/google', '/oauth/google']
                },
                {
                    path: '/api/auth/google/callback',
                    method: 'GET',
                    description: 'Google OAuth callback endpoint',
                    redirectsFrom: ['/api/google/callback', '/auth/google/callback', '/oauth/google/callback']
                },
                {
                    path: '/api/auth/config',
                    method: 'GET',
                    description: 'OAuth configuration endpoint'
                },
                {
                    path: '/api/auth/session',
                    method: 'GET',
                    description: 'Get current user session'
                },
                {
                    path: '/api/auth/logout',
                    method: 'POST',
                    description: 'Logout current user'
                }
            ]
        });
    });

    // 404 handler - Updated with better OAuth information
    app.use((req, res) => {
        // Special handling for Google OAuth 404s
        if (req.path.includes('google') && req.method === 'GET') {
            ServerLogger.warning('Google OAuth 404 - Possible misconfigured route', {
                path: req.path,
                originalUrl: req.originalUrl,
                query: req.query,
                referer: req.get('referer'),
                userAgent: req.get('user-agent')
            });
        }

        res.status(404).json({
            success: false,
            error: 'Not Found',
            message: `Cannot ${req.method} ${req.url}`,
            timestamp: new Date().toISOString(),
            availableEndpoints: [
                '/auth/google - Google OAuth login',
                '/api/google - Also redirects to /api/auth/google',
                '/api/auth/* - Authentication & OAuth',
                '/api/* - Application API',
                '/health - Health check',
                '/api/metrics - Server metrics',
                '/api/ai/status - AI service status',
                '/api/auth/routes - List all OAuth routes'
            ],
            oauthHelp: {
                note: 'If you are trying to use Google OAuth, use these endpoints:',
                endpoints: {
                    login: '/api/auth/google',
                    callback: '/api/auth/google/callback',
                    alternateLogin: '/api/google (redirects to /api/auth/google)'
                }
            }
        });
    });
};
// ======================
// START SERVER WORKER
// ======================
const startServerWorker = async (workerId = null) => {
    try {
        const performanceMonitor = new ServerPerformanceMonitor();

        if (!validateServerEnvironment()) {
            ServerLogger.error('Environment validation failed');
            process.exit(1);
        }

        await createServerDirectories();

        // Connect to database
        await DatabaseManager.connect();

        const app = createExpressApp();

        // Setup Passport Google OAuth
        await setupPassportGoogleOAuth(app);

        const httpServer = http.createServer(app);

        // Setup auth route middleware BEFORE loading other routes
        setupAuthRouteMiddleware(app);

        // Initialize Socket.IO
        const socketIO = await initializeSocketIOServer(httpServer, performanceMonitor);
        app.set('socketState', socketIO.socketState);

        // Load routes from your structure
        await loadRoutes(app, performanceMonitor);

        // Setup additional routes
        setupAdditionalRoutes(app, performanceMonitor);

        // Request tracking middleware (must be after routes)
        app.use((req, res, next) => {
            performanceMonitor.incrementRequest();

            // Track auth requests
            if (req.path.includes('/auth') || req.path.includes('/api/auth')) {
                performanceMonitor.incrementAuthRequest();
            }

            next();
        });

        // Start server
        const server = httpServer.listen(PORT, HOST, () => {
            displayServerInfo(PORT, HOST, workerId, true, AI_ENABLED);

            ServerLogger.success('Server startup completed', {
                port: PORT,
                host: HOST,
                worker: workerId,
                environment: NODE_ENV,
                cluster: ENABLE_CLUSTER ? 'enabled' : 'disabled',
                pid: process.pid,
                database: 'connected',
                socketIO: 'enabled',
                aiEnabled: AI_ENABLED,
                oauthEnabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
                frontendUrl: FRONTEND_URL,
                routesLoaded: true
            });
        });

        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                ServerLogger.error(`Port ${PORT} is already in use`, {
                    port: PORT,
                    solutions: [
                        `kill -9 $(lsof -t -i:${PORT})`,
                        `Use different port: PORT=${PORT + 1}`,
                        `Check: sudo netstat -tulpn | grep :${PORT}`
                    ]
                });
            } else {
                performanceMonitor.incrementError();
                ServerLogger.error('Server error:', {
                    error: error.message,
                    code: error.code
                });
            }
            process.exit(1);
        });

        setupServerGracefulShutdown(server, performanceMonitor, socketIO, workerId);

        return {
            server,
            app,
            httpServer,
            socketIO,
            performanceMonitor
        };

    } catch (error) {
        ServerLogger.error('Failed to start worker:', {
            error: error.message,
            stack: error.stack,
            workerId
        });
        process.exit(1);
    }
};

// ======================
// CLUSTER MODE
// ======================
const startClusterMode = async () => {
    if (!ENABLE_CLUSTER || !cluster.isPrimary) {
        return startServerWorker();
    }

    ServerLogger.info(`Starting cluster with ${CPU_COUNT} workers...`);

    // Fork workers
    for (let i = 0; i < CPU_COUNT; i++) {
        const worker = cluster.fork({ WORKER_ID: `worker-${i + 1}` });

        worker.on('message', (message) => {
            ServerLogger.info(`Worker ${worker.id} message:`, message);
        });
    }

    cluster.on('exit', (worker, code, signal) => {
        ServerLogger.error(`Worker ${worker.process.pid} died`, {
            code,
            signal,
            workerId: worker.id
        });

        // Restart worker after delay
        setTimeout(() => {
            ServerLogger.info(`Restarting worker ${worker.id}...`);
            cluster.fork({ WORKER_ID: `worker-restarted-${Date.now()}` });
        }, 5000);
    });

    cluster.on('online', (worker) => {
        ServerLogger.success(`Worker ${worker.process.pid} is online`, {
            workerId: worker.id
        });
    });
};

// ======================
// MAIN ENTRY POINT
// ======================
const serverMain = async () => {
    try {
        if (NODE_ENV !== 'test') {
            console.clear();
        }

        console.log(ServerLogger.colors.magenta + BANNER + ServerLogger.colors.reset);
        ServerLogger.info('🚀 Initializing AI Resume Builder & Analyzer Server', {
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid,
            cwd: process.cwd(),
            environment: NODE_ENV,
            aiEnabled: AI_ENABLED,
            oauthEnabled: !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
            clusterMode: ENABLE_CLUSTER
        });

        console.log(LOG_SEPARATOR);

        if (ENABLE_CLUSTER && cluster.isPrimary) {
            await startClusterMode();
        } else {
            const workerId = process.env.WORKER_ID || null;
            await startServerWorker(workerId);
        }

    } catch (error) {
        ServerLogger.error('💥 Fatal error in main process:', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

// ======================
// START APPLICATION
// ======================
if (import.meta.url === `file://${process.argv[1]}`) {
    serverMain().catch((error) => {
        console.error('💥 CRITICAL FAILURE:', error);
        process.exit(1);
    });
}

// ======================
// EXPORTS FOR TESTING
// ======================
export {
    validateServerEnvironment,
    checkServerHealth,
    displayServerInfo,
    setupServerGracefulShutdown,
    ServerPerformanceMonitor,
    ServerLogger,
    DatabaseManager,
    initializeSocketIOServer,
    startServerWorker,
    serverMain
};