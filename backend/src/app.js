// backend/src/app.js - FIXED VERSION (No duplicate declarations)
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import winston from 'winston';
import winstonDailyRotateFile from 'winston-daily-rotate-file';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import aiRoutes from './routes/aiRoutes.js';
import server from './server.js';
server.startServer().catch(console.error);

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// CONFIGURATION
// ======================
const PORT = parseInt(process.env.PORT) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.BACKEND_URL || `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;

// ======================
// WINSTON LOGGER
// ======================
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (NODE_ENV === 'development' ? 'debug' : 'info'),
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'ai-resume-builder' },
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
                    return `${timestamp} [${service}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''
                        }`;
                })
            ),
        }),
        new winstonDailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
        }),
        new winstonDailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            level: 'error',
        }),
    ],
});

// ======================
// EXPRESS APP SETUP
// ======================
const app = express();
const httpServer = createServer(app);

// ======================
// CORS CONFIGURATION
// ======================
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow all origins in development
        if (NODE_ENV === 'development') {
            return callback(null, true);
        }
        // In production, check against allowed origins
        const allowedOrigins = process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
            : [FRONTEND_URL];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-request-id',
        'x-client-type',
        'x-client-version',
        'x-client-platform',
        'x-client-id',
        'x-session-id',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Cache-Control',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    exposedHeaders: [
        'x-request-id',
        'x-client-type',
        'x-client-version',
        'X-Total-Count',
        'X-Page-Count',
        'x-rate-limit-limit',
        'x-rate-limit-remaining',
        'x-rate-limit-reset'
    ],
    maxAge: 86400,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ======================
// SOCKET.IO SETUP
// ======================
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: NODE_ENV === 'development' ? true : FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST'],
    },
    transports: ['polling', 'websocket'],
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    maxHttpBufferSize: parseInt(process.env.SOCKET_MAX_HTTP_BUFFER_SIZE) || 1e6,
});

// ======================
// SECURITY MIDDLEWARE
// ======================
const helmetConfig = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
            connectSrc: ["'self'", "ws:", "wss:", FRONTEND_URL, "https://accounts.google.com", "https://oauth2.googleapis.com"],
            frameSrc: ["'self'", "https://accounts.google.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            childSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
};

if (NODE_ENV === 'production') {
    app.use(helmet(helmetConfig));
} else {
    app.use(helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
    }));
}

// ======================
// REQUEST LOGGING
// ======================
const morganFormat = NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

// ======================
// RATE LIMITING
// ======================
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || (NODE_ENV === 'development' ? 1000 : 100),
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip} - Path: ${req.path}`);
        res.status(429).json({
            success: false,
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: 15 * 60,
            requestId: req.headers['x-request-id']
        });
    },
});

const authLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const adminLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.ADMIN_RATE_LIMIT_MAX) || (NODE_ENV === 'development' ? 1000 : 30),
    message: {
        success: false,
        error: 'Too many admin requests from this IP.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting
app.use('/api', (req, res, next) => {
    if (req.path.startsWith('/auth/') && req.method === 'POST') {
        return authLimiter(req, res, next);
    }
    return apiLimiter(req, res, next);
});
app.use('/admin', adminLimiter);
app.use('/api/admin', adminLimiter);

// ======================
// BODY PARSERS WITH ERROR HANDLING
// ======================
app.use(express.json({
    limit: process.env.MAX_FILE_SIZE || '10mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            res.status(400).json({
                success: false,
                error: 'Invalid JSON payload',
                message: e.message
            });
        }
    }
}));

app.use(express.urlencoded({
    extended: true,
    limit: process.env.MAX_FILE_SIZE || '10mb',
    parameterLimit: 1000,
}));

app.use(cookieParser());

// ======================
// COMPRESSION
// ======================
app.use(compression({
    level: 6,
    threshold: 1024,
}));

// ======================
// DATA SANITIZATION
// ======================
app.use(mongoSanitize({
    replaceWith: '_',
}));

app.use(hpp());

// ======================
// SESSION MANAGEMENT
// ======================
const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret-change-in-production';
const sessionConfig = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
    },
    name: 'ai-resume-builder.sid',
};

if (NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
    sessionConfig.cookie.sameSite = 'strict';
}

app.use(session(sessionConfig));

// ======================
// REQUEST ID MIDDLEWARE
// ======================
app.use((req, res, next) => {
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    res.setHeader('x-request-id', req.headers['x-request-id']);
    next();
});

// ======================
// DATABASE CONNECTION
// ======================
const connectAppDB = async () => {
    try {
        logger.info('🔗 Connecting to MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }
        const options = {
            maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 50,
            minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE) || 5,
            serverSelectionTimeoutMS: parseInt(process.env.MONGODB_TIMEOUT_MS) || 10000,
            socketTimeoutMS: 45000,
            retryWrites: true,
            w: 'majority',
        };
        await mongoose.connect(process.env.MONGODB_URI, options);
        logger.info('✅ MongoDB Connected Successfully', {
            database: mongoose.connection.name,
            host: mongoose.connection.host,
            readyState: mongoose.connection.readyState,
        });

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB Connection Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('✅ MongoDB reconnected');
        });

        return mongoose.connection;
    } catch (error) {
        logger.error('❌ MongoDB Connection Failed:', error);
        throw error;
    }
};

// ======================
// USER MODEL
// ======================
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: function () { return !this.isOAuth; },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    avatar: String,
    googleId: String,
    isOAuth: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'super_admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || (this.isOAuth && !this.password)) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (this.isOAuth && !this.password) {
        return false;
    }
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

// ======================
// AUTHENTICATION MIDDLEWARE
// ======================
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                requestId: req.headers['x-request-id']
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                requestId: req.headers['x-request-id']
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated',
                requestId: req.headers['x-request-id']
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
            requestId: req.headers['x-request-id']
        });
    }
};

const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Admin authentication required',
                requestId: req.headers['x-request-id']
            });
        }

        // Try admin secret first, then regular secret
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET);
        } catch (error) {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        }

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Admin not found',
                requestId: req.headers['x-request-id']
            });
        }

        if (!['admin', 'super_admin'].includes(user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Admin privileges required',
                requestId: req.headers['x-request-id']
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Admin account is deactivated',
                requestId: req.headers['x-request-id']
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired admin token',
            requestId: req.headers['x-request-id']
        });
    }
};

// ======================
// GOOGLE OAUTH SETUP
// ======================
let googleClient = null;
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    googleClient = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.NODE_ENV === 'production'
            ? `${API_BASE_URL}/api/auth/google/callback`
            : `${API_BASE_URL}/api/auth/google/callback`
    );
    logger.info('✅ Google OAuth client initialized');
} else {
    logger.warn('⚠️ Google OAuth not configured - missing CLIENT_ID or CLIENT_SECRET');
}

// ======================
// CORE ROUTES
// ======================
// Health check
app.get('/health', (req, res) => {
    const dbStatus = mongoose.connection?.readyState === 1 ? 'connected' : 'disconnected';
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'ai-resume-builder',
        version: process.env.API_VERSION || '2.0.0',
        environment: NODE_ENV,
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        database: dbStatus,
        memory: {
            heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        },
        requestId: req.headers['x-request-id']
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 AI Resume Builder API',
        version: process.env.API_VERSION || '2.0.0',
        environment: NODE_ENV,
        status: 'operational',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                google: 'GET /api/auth/google',
                googleCallback: 'GET /api/auth/google/callback',
                googleVerify: 'POST /api/auth/google/verify',
                me: 'GET /api/auth/me',
                logout: 'POST /api/auth/logout'
            },
            admin: {
                login: 'POST /api/admin/auth/login',
                dashboard: 'GET /api/admin/dashboard/stats',
                users: 'GET /api/admin/users'
            },
            health: 'GET /health'
        },
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
    });
});

// ======================
// USER AUTHENTICATION ROUTES
// ======================
// User registration
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    const requestId = req.headers['x-request-id'];

    logger.info(`📝 User registration attempt: ${email}`, { requestId });

    try {
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required',
                requestId
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters',
                requestId
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email',
                requestId
            });
        }

        // Create user
        const user = new User({
            name,
            email,
            password,
            isActive: true
        });
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '30d' }
        );

        // Prepare user response (without password)
        const userResponse = user.toObject();
        delete userResponse.password;

        logger.info(`✅ User registered successfully: ${email}`, { requestId });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                token,
                user: userResponse
            },
            requestId
        });
    } catch (error) {
        logger.error('❌ Registration error:', { error: error.message, requestId });
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists',
                requestId
            });
        }
        res.status(500).json({
            success: false,
            error: NODE_ENV === 'production' ? 'Registration failed' : error.message,
            requestId
        });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;
    const requestId = req.headers['x-request-id'];

    logger.info(`🔐 User login attempt: ${email}`, { requestId });

    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
                requestId
            });
        }

        // Find user with password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                requestId
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                error: 'Account is deactivated',
                requestId
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                requestId
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: rememberMe ? '30d' : '7d' }
        );

        // Prepare user response (without password)
        const userResponse = user.toObject();
        delete userResponse.password;

        logger.info(`✅ User login successful: ${email}`, { requestId });

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: userResponse
            },
            requestId
        });
    } catch (error) {
        logger.error('❌ Login error:', { error: error.message, requestId });
        res.status(500).json({
            success: false,
            error: NODE_ENV === 'production' ? 'Login failed' : error.message,
            requestId
        });
    }
});

// Get current user
app.get('/api/auth/me', authenticateUser, (req, res) => {
    const userResponse = req.user.toObject();
    delete userResponse.password;
    res.json({
        success: true,
        data: userResponse,
        requestId: req.headers['x-request-id']
    });
});

// User logout
app.post('/api/auth/logout', authenticateUser, (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully',
        requestId: req.headers['x-request-id']
    });
});

// ======================
// GOOGLE OAUTH ROUTES
// ======================
// Google OAuth redirect
app.get('/api/auth/google', (req, res) => {
    if (!googleClient) {
        return res.status(501).json({
            success: false,
            error: 'Google OAuth not configured',
            requestId: req.headers['x-request-id']
        });
    }

    const redirectUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent',
        redirect_uri: process.env.NODE_ENV === 'production'
            ? `${API_BASE_URL}/api/auth/google/callback`
            : `${API_BASE_URL}/api/auth/google/callback`
    });

    res.redirect(redirectUrl);
});

// Google OAuth callback
app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    const requestId = req.headers['x-request-id'];

    if (!googleClient) {
        return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
    }

    if (!code) {
        return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    try {
        // Exchange code for tokens
        const { tokens } = await googleClient.getToken({
            code,
            redirect_uri: process.env.NODE_ENV === 'production'
                ? `${API_BASE_URL}/api/auth/google/callback`
                : `${API_BASE_URL}/api/auth/google/callback`
        });

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (!user) {
            // Create new user
            user = new User({
                googleId,
                name: name || email.split('@')[0],
                email,
                avatar: picture || '',
                isOAuth: true,
                isVerified: true,
                isActive: true,
                lastLogin: new Date()
            });
            await user.save();
            logger.info(`✅ New Google user created: ${email}`, { requestId });
        } else {
            // Update existing user
            user.googleId = googleId;
            user.isOAuth = true;
            user.lastLogin = new Date();
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            await user.save();
            logger.info(`✅ Existing user updated with Google: ${email}`, { requestId });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                isOAuth: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Prepare user response
        const userResponse = user.toObject();
        delete userResponse.password;

        // Redirect to frontend with token
        const redirectUrl = `${FRONTEND_URL}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`;
        res.redirect(redirectUrl);
    } catch (error) {
        logger.error('❌ Google OAuth error:', { error: error.message, requestId });
        res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }
});

// Google token verification (for frontend Google Sign-In)
app.post('/api/auth/google/verify', async (req, res) => {
    const requestId = req.headers['x-request-id'];
    console.log('Google verify request received:', {
        body: req.body,
        headers: req.headers
    });

    if (!googleClient) {
        console.error('Google client not configured');
        return res.status(501).json({
            success: false,
            error: 'Google OAuth not configured',
            requestId
        });
    }

    // Accept either credential or access_token
    const credential = req.body.credential || req.body.access_token;
    if (!credential) {
        console.error('No credential provided');
        return res.status(400).json({
            success: false,
            error: 'Google token is required',
            requestId
        });
    }

    try {
        console.log('Verifying Google token...');
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        console.log('Google payload received:', {
            email: payload.email,
            name: payload.name,
            googleId: payload.sub
        });

        const { sub: googleId, email, name, picture } = payload;

        // Find or create user
        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        if (!user) {
            // Create new user
            user = new User({
                googleId,
                name: name || email.split('@')[0],
                email,
                avatar: picture || '',
                isOAuth: true,
                isVerified: true,
                isActive: true,
                lastLogin: new Date()
            });
            await user.save();
            logger.info(`✅ New Google user created via verify: ${email}`, { requestId });
            console.log('New user created:', email);
        } else {
            // Update existing user
            user.googleId = googleId;
            user.isOAuth = true;
            user.lastLogin = new Date();
            if (!user.avatar && picture) {
                user.avatar = picture;
            }
            await user.save();
            logger.info(`✅ Existing user updated via verify: ${email}`, { requestId });
            console.log('Existing user updated:', email);
        }

        // Generate JWT token
        const jwtToken = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                isOAuth: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Prepare user response
        const userResponse = user.toObject();
        delete userResponse.password;

        console.log('Google auth successful, sending response for:', email);
        const responseData = {
            success: true,
            message: 'Google authentication successful',
            data: {
                token: jwtToken,
                user: userResponse
            },
            requestId
        };
        console.log('Sending response:', responseData);
        res.json(responseData);
    } catch (error) {
        console.error('❌ Google verification error:', error);
        logger.error('Google token verification error:', {
            error: error.message,
            stack: error.stack,
            requestId
        });
        res.status(401).json({
            success: false,
            error: 'Google authentication failed: ' + error.message,
            requestId
        });
    }
});

// ======================
// RESUME API ROUTES
// ======================
// Resume Model
const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Resume title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Resume content is required'],
        validate: {
            validator: function (v) {
                return v.length >= 100; // At least 100 characters
            },
            message: 'Resume content must be at least 100 characters'
        }
    },
    fileName: String,
    fileSize: Number,
    fileType: String,
    fileUrl: String,
    thumbnailUrl: String,
    status: {
        type: String,
        enum: ['draft', 'processing', 'analyzed', 'published', 'archived'],
        default: 'draft'
    },
    analysisResult: {
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        atsScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        suggestions: [{
            category: String,
            priority: {
                type: String,
                enum: ['high', 'medium', 'low']
            },
            message: String,
            example: String
        }],
        strengths: [String],
        weaknesses: [String],
        keywords: {
            found: [String],
            missing: [String],
            recommended: [String]
        },
        metrics: {
            wordCount: Number,
            sectionCount: Number,
            readabilityScore: Number
        }
    },
    template: {
        type: String,
        default: 'modern'
    },
    tags: [String],
    isPublic: {
        type: Boolean,
        default: false
    },
    shareLink: String,
    views: {
        type: Number,
        default: 0
    },
    downloads: {
        type: Number,
        default: 0
    },
    lastAnalyzed: Date,
    analysisVersion: {
        type: String,
        default: '1.0'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ status: 1 });
resumeSchema.index({ 'analysisResult.score': -1 });
resumeSchema.index({ tags: 1 });

// Virtual for formatted date
resumeSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
});

// Virtual for analysis status
resumeSchema.virtual('analysisStatus').get(function () {
    if (this.status === 'analyzed' && this.analysisResult?.score) {
        if (this.analysisResult.score >= 80) return 'excellent';
        if (this.analysisResult.score >= 60) return 'good';
        return 'needs_improvement';
    }
    return 'pending';
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);

// ======================
// RESUME API ROUTES
// ======================
// Get user's resumes
app.get('/api/resumes', authenticateUser, async (req, res) => {
    const {
        page = 1,
        limit = 10,
        status,
        sort = 'createdAt',
        order = 'desc',
        search = '',
        tag = ''
    } = req.query;

    try {
        // Build query
        const query = { userId: req.user._id };
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        if (tag) {
            query.tags = { $in: [tag] };
        }

        // Calculate pagination
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get sort order
        const sortOrder = order === 'asc' ? 1 : -1;
        const sortObj = { [sort]: sortOrder };

        // Execute query with pagination
        const [resumes, total] = await Promise.all([
            Resume.find(query)
                .populate('userId', 'name email')
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Resume.countDocuments(query)
        ]);

        // Calculate pagination metadata
        const pages = Math.ceil(total / limitNum);
        const hasNext = pageNum < pages;
        const hasPrev = pageNum > 1;

        logger.info('Resumes fetched', {
            userId: req.user._id,
            count: resumes.length,
            total,
            page: pageNum
        });

        res.json({
            success: true,
            data: {
                resumes,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages,
                    hasNext,
                    hasPrev,
                    nextPage: hasNext ? pageNum + 1 : null,
                    prevPage: hasPrev ? pageNum - 1 : null
                }
            },
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to fetch resumes', {
            error: error.message,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes',
            requestId: req.headers['x-request-id']
        });
    }
});

// Get resume by ID
app.get('/api/resumes/:id', authenticateUser, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('userId', 'name email');

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                requestId: req.headers['x-request-id']
            });
        }

        // Increment views if public
        if (resume.isPublic) {
            resume.views += 1;
            await resume.save({ validateBeforeSave: false });
        }

        logger.info('Resume fetched', {
            resumeId: resume._id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });

        res.json({
            success: true,
            data: resume,
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to fetch resume', {
            error: error.message,
            resumeId: req.params.id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resume',
            requestId: req.headers['x-request-id']
        });
    }
});

// Create new resume
app.post('/api/resumes', authenticateUser, async (req, res) => {
    const { title, content, template = 'modern', tags = [] } = req.body;

    try {
        // Validate input
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                error: 'Title and content are required',
                requestId: req.headers['x-request-id']
            });
        }

        if (content.length < 100) {
            return res.status(400).json({
                success: false,
                error: 'Resume content must be at least 100 characters',
                requestId: req.headers['x-request-id']
            });
        }

        // Create resume
        const resume = new Resume({
            userId: req.user._id,
            title,
            content,
            template,
            tags: Array.isArray(tags) ? tags : [tags],
            status: 'draft'
        });

        await resume.save();

        logger.info('Resume created', {
            resumeId: resume._id,
            userId: req.user._id,
            title,
            requestId: req.headers['x-request-id']
        });

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: resume,
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to create resume', {
            error: error.message,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors,
                requestId: req.headers['x-request-id']
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create resume',
            requestId: req.headers['x-request-id']
        });
    }
});

// Update resume
app.put('/api/resumes/:id', authenticateUser, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                requestId: req.headers['x-request-id']
            });
        }

        // Update allowed fields
        const allowedUpdates = ['title', 'content', 'template', 'tags', 'status', 'isPublic'];
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                resume[key] = req.body[key];
            }
        });

        await resume.save();

        logger.info('Resume updated', {
            resumeId: resume._id,
            userId: req.user._id,
            updates: Object.keys(req.body),
            requestId: req.headers['x-request-id']
        });

        res.json({
            success: true,
            message: 'Resume updated successfully',
            data: resume,
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to update resume', {
            error: error.message,
            resumeId: req.params.id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        res.status(500).json({
            success: false,
            error: 'Failed to update resume',
            requestId: req.headers['x-request-id']
        });
    }
});

// Delete resume
app.delete('/api/resumes/:id', authenticateUser, async (req, res) => {
    try {
        const resume = await Resume.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                requestId: req.headers['x-request-id']
            });
        }

        logger.info('Resume deleted', {
            resumeId: resume._id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });

        res.json({
            success: true,
            message: 'Resume deleted successfully',
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to delete resume', {
            error: error.message,
            resumeId: req.params.id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        res.status(500).json({
            success: false,
            error: 'Failed to delete resume',
            requestId: req.headers['x-request-id']
        });
    }
});

// Analyze resume
app.post('/api/resumes/:id/analyze', authenticateUser, async (req, res) => {
    try {
        const resume = await Resume.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!resume) {
            return res.status(404).json({
                success: false,
                error: 'Resume not found',
                requestId: req.headers['x-request-id']
            });
        }

        // Update status to processing
        resume.status = 'processing';
        await resume.save();

        logger.info('Resume analysis started', {
            resumeId: resume._id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });

        // Send immediate response
        res.json({
            success: true,
            message: 'Resume analysis started',
            data: {
                resumeId: resume._id,
                status: 'processing',
                analysisId: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            },
            requestId: req.headers['x-request-id']
        });

        // Simulate analysis in background
        setTimeout(async () => {
            try {
                const analysisResult = {
                    score: Math.floor(Math.random() * 30) + 70,
                    atsScore: Math.floor(Math.random() * 20) + 80,
                    suggestions: [
                        {
                            category: 'content',
                            priority: 'high',
                            message: 'Add more quantifiable achievements',
                            example: 'Increased sales by 30% instead of "Increased sales"'
                        },
                        {
                            category: 'formatting',
                            priority: 'medium',
                            message: 'Improve section organization',
                            example: 'Use clear headings: Experience, Education, Skills'
                        }
                    ],
                    strengths: [
                        'Clear contact information',
                        'Good education section formatting',
                        'Proper date formatting'
                    ],
                    weaknesses: [
                        'Lacking quantifiable results',
                        'Too many generic descriptions',
                        'Missing certifications section'
                    ],
                    keywords: {
                        found: ['JavaScript', 'React', 'Node.js'],
                        missing: ['TypeScript', 'AWS', 'Docker'],
                        recommended: ['TypeScript', 'AWS', 'Docker', 'Git', 'CI/CD']
                    },
                    metrics: {
                        wordCount: resume.content.split(/\s+/).length,
                        sectionCount: 4,
                        readabilityScore: 75
                    }
                };

                resume.status = 'analyzed';
                resume.analysisResult = analysisResult;
                resume.lastAnalyzed = new Date();
                await resume.save();

                logger.info('Resume analysis completed', {
                    resumeId: resume._id,
                    userId: req.user._id,
                    score: analysisResult.score
                });
            } catch (analysisError) {
                logger.error('Background analysis failed', {
                    error: analysisError.message,
                    resumeId: resume._id,
                    userId: req.user._id
                });
            }
        }, 3000); // 3 second delay for simulation
    } catch (error) {
        logger.error('Failed to start resume analysis', {
            error: error.message,
            resumeId: req.params.id,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        res.status(500).json({
            success: false,
            error: 'Failed to start resume analysis',
            requestId: req.headers['x-request-id']
        });
    }
});

// Get resume stats
app.get('/api/resumes/stats', authenticateUser, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get total resumes
        const totalResumes = await Resume.countDocuments({ userId });

        // Get resumes by status
        const statusStats = await Resume.aggregate([
            { $match: { userId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Get average score
        const scoreStats = await Resume.aggregate([
            { $match: { userId, status: 'analyzed', 'analysisResult.score': { $exists: true } } },
            { $group: { _id: null, avgScore: { $avg: '$analysisResult.score' } } }
        ]);

        // Get recent activity
        const recentResumes = await Resume.find({ userId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('title status analysisResult.score updatedAt');

        // Calculate total storage (simulated)
        const storageStats = await Resume.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: { $ifNull: ['$fileSize', 1024] } } // Default 1KB per resume
                }
            }
        ]);

        const stats = {
            totalResumes,
            byStatus: statusStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {}),
            avgScore: scoreStats[0]?.avgScore ? Math.round(scoreStats[0].avgScore) : 0,
            storageUsed: storageStats[0]?.totalSize ?
                `${Math.round(storageStats[0].totalSize / 1024 / 1024)} MB` :
                '0 MB',
            recentActivity: recentResumes.map(resume => ({
                id: resume._id,
                title: resume.title,
                status: resume.status,
                score: resume.analysisResult?.score || 0,
                updatedAt: resume.updatedAt
            })),
            scoreDistribution: {
                excellent: await Resume.countDocuments({
                    userId,
                    status: 'analyzed',
                    'analysisResult.score': { $gte: 80 }
                }),
                good: await Resume.countDocuments({
                    userId,
                    status: 'analyzed',
                    'analysisResult.score': { $gte: 60, $lt: 80 }
                }),
                needsImprovement: await Resume.countDocuments({
                    userId,
                    status: 'analyzed',
                    'analysisResult.score': { $lt: 60 }
                })
            }
        };

        logger.info('Resume stats fetched', {
            userId,
            totalResumes,
            requestId: req.headers['x-request-id']
        });

        res.json({
            success: true,
            data: stats,
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to fetch resume stats', {
            error: error.message,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resume stats',
            requestId: req.headers['x-request-id']
        });
    }
});

// Get dashboard stats (for admin/overview)
app.get('/api/dashboard/stats', authenticateUser, async (req, res) => {
    try {
        const userId = req.user._id;

        // Get basic stats
        const totalResumes = await Resume.countDocuments({ userId });
        const analyzedResumes = await Resume.countDocuments({
            userId,
            status: 'analyzed'
        });
        const publishedResumes = await Resume.countDocuments({
            userId,
            isPublic: true
        });

        // Get average score
        const scoreResult = await Resume.aggregate([
            { $match: { userId, status: 'analyzed', 'analysisResult.score': { $exists: true } } },
            { $group: { _id: null, avgScore: { $avg: '$analysisResult.score' } } }
        ]);

        // Get storage usage (simulated)
        const storageResult = await Resume.aggregate([
            { $match: { userId } },
            {
                $group: {
                    _id: null,
                    totalSize: { $sum: { $ifNull: ['$fileSize', 1024] } }
                }
            }
        ]);

        // Get recent resumes
        const recentResumes = await Resume.find({ userId })
            .sort({ createdAt: -1 })
            .limit(3)
            .select('title status analysisResult.score createdAt')
            .lean();

        const stats = {
            overview: {
                totalResumes,
                analyzedResumes,
                publishedResumes,
                avgScore: scoreResult[0]?.avgScore ? Math.round(scoreResult[0].avgScore) : 0,
                storageUsed: storageResult[0]?.totalSize ?
                    `${Math.round(storageResult[0].totalSize / 1024 / 1024)} MB` :
                    '0 MB'
            },
            recentResumes: recentResumes.map(resume => ({
                id: resume._id,
                title: resume.title,
                status: resume.status,
                score: resume.analysisResult?.score || 0,
                createdAt: resume.createdAt
            })),
            quickActions: [
                { label: 'Create New Resume', icon: '📝', action: '/resumes/new' },
                { label: 'Analyze All', icon: '🔍', action: '/resumes/analyze' },
                { label: 'View Templates', icon: '🎨', action: '/templates' }
            ]
        };

        logger.info('Dashboard stats fetched', {
            userId,
            totalResumes,
            requestId: req.headers['x-request-id']
        });

        res.json({
            success: true,
            data: stats,
            requestId: req.headers['x-request-id']
        });
    } catch (error) {
        logger.error('Failed to fetch dashboard stats', {
            error: error.message,
            userId: req.user._id,
            requestId: req.headers['x-request-id']
        });
        // Return mock data for development
        if (NODE_ENV === 'development') {
            logger.debug('Development: Returning mock dashboard stats');
            return res.json({
                success: true,
                data: {
                    overview: {
                        totalResumes: 3,
                        analyzedResumes: 2,
                        publishedResumes: 1,
                        avgScore: 68,
                        storageUsed: '42 MB'
                    },
                    recentResumes: [
                        {
                            id: '1',
                            title: 'Senior Software Engineer Resume',
                            status: 'analyzed',
                            score: 85,
                            createdAt: new Date(Date.now() - 86400000).toISOString()
                        },
                        {
                            id: '2',
                            title: 'Frontend Developer 2024',
                            status: 'draft',
                            score: 0,
                            createdAt: new Date(Date.now() - 172800000).toISOString()
                        },
                        {
                            id: '3',
                            title: 'Full Stack Developer',
                            status: 'analyzed',
                            score: 72,
                            createdAt: new Date(Date.now() - 259200000).toISOString()
                        }
                    ],
                    quickActions: [
                        { label: 'Create New Resume', icon: '📝', action: '/resumes/new' },
                        { label: 'Analyze All', icon: '🔍', action: '/resumes/analyze' },
                        { label: 'View Templates', icon: '🎨', action: '/templates' }
                    ]
                },
                requestId: req.headers['x-request-id']
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats',
            requestId: req.headers['x-request-id']
        });
    }
});

// ======================
// ADMIN ROUTES
// ======================
// Admin login
app.post('/api/admin/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const requestId = req.headers['x-request-id'];

    logger.info(`🔐 Admin login attempt: ${email}`, { requestId });

    try {
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
                requestId
            });
        }

        // Check admin credentials
        const ADMIN_EMAIL = process.env.ADMIN_DEFAULT_EMAIL || 'admin@resume.ai';
        const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

        // In production, use bcrypt comparison
        let isValidPassword = false;
        if (email === ADMIN_EMAIL) {
            if (NODE_ENV === 'production') {
                // Hash the provided password and compare with stored hash
                const salt = await bcrypt.genSalt(12);
                const hashedInput = await bcrypt.hash(password, salt);
                // You should store hashed admin password in .env for production
                const storedHash = process.env.ADMIN_HASHED_PASSWORD;
                if (storedHash) {
                    isValidPassword = await bcrypt.compare(password, storedHash);
                } else {
                    // Fallback for development
                    isValidPassword = password === ADMIN_PASSWORD;
                }
            } else {
                // Development mode - direct comparison
                isValidPassword = password === ADMIN_PASSWORD;
            }
        }

        if (email === ADMIN_EMAIL && isValidPassword) {
            // Create or update admin user
            let adminUser = await User.findOne({ email: ADMIN_EMAIL });
            if (!adminUser) {
                adminUser = new User({
                    name: 'System Administrator',
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                    role: 'super_admin',
                    isActive: true,
                    isVerified: true,
                    lastLogin: new Date()
                });
                await adminUser.save();
            } else {
                adminUser.lastLogin = new Date();
                await adminUser.save();
            }

            // Generate admin JWT token
            const token = jwt.sign(
                {
                    userId: adminUser._id,
                    email: adminUser.email,
                    role: adminUser.role,
                    name: adminUser.name,
                    isAdmin: true
                },
                process.env.JWT_ADMIN_SECRET || process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_ADMIN_EXPIRE || '24h' }
            );

            // Prepare admin response
            const adminResponse = adminUser.toObject();
            delete adminResponse.password;

            logger.info(`✅ Admin login successful: ${email}`, { requestId });

            res.json({
                success: true,
                message: 'Admin login successful',
                data: {
                    token,
                    user: adminResponse
                },
                requestId
            });
        } else {
            logger.warn(`❌ Admin login failed: Invalid credentials for ${email}`, { requestId });
            res.status(401).json({
                success: false,
                error: 'Invalid admin credentials',
                requestId
            });
        }
    } catch (error) {
        logger.error('❌ Admin login error:', { error: error.message, requestId });
        res.status(500).json({
            success: false,
            error: NODE_ENV === 'production' ? 'Admin login failed' : error.message,
            requestId
        });
    }
});

// Admin auth status
app.get('/api/admin/auth/status', authenticateAdmin, (req, res) => {
    const userResponse = req.user.toObject();
    delete userResponse.password;
    res.json({
        success: true,
        authenticated: true,
        user: userResponse,
        requestId: req.headers['x-request-id']
    });
});

// Admin dashboard stats
app.get('/api/admin/dashboard/stats', authenticateAdmin, async (req, res) => {
    const { range = '7d' } = req.query;
    const requestId = req.headers['x-request-id'];

    try {
        // Get user count
        const totalUsers = await User.countDocuments({ isActive: true });

        // Mock data for development
        const stats = {
            totalUsers,
            totalResumes: Math.floor(Math.random() * 500) + 100,
            activeUsers: Math.floor(totalUsers * 0.3),
            systemHealth: 95 + Math.floor(Math.random() * 5),
            userGrowth: 12.5,
            resumeGrowth: 8.2,
            range
        };

        res.json({
            success: true,
            data: stats,
            requestId
        });
    } catch (error) {
        logger.error('❌ Admin stats error:', { error: error.message, requestId });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats',
            requestId
        });
    }
});

// Admin recent activity
app.get('/api/admin/dashboard/recent-activity', authenticateAdmin, (req, res) => {
    const { limit = 10 } = req.query;

    // Mock activity data
    const activities = [
        {
            id: 1,
            action: 'User registered',
            user: { name: 'John Doe' },
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'success',
            resource: 'user'
        },
        {
            id: 2,
            action: 'Resume analyzed',
            user: { name: 'Jane Smith' },
            timestamp: new Date(Date.now() - 600000).toISOString(),
            type: 'info',
            resource: 'resume'
        },
        {
            id: 3,
            action: 'System backup completed',
            user: { name: 'System' },
            timestamp: new Date(Date.now() - 1200000).toISOString(),
            type: 'success',
            resource: 'system'
        }
    ].slice(0, parseInt(limit));

    res.json({
        success: true,
        data: activities,
        requestId: req.headers['x-request-id']
    });
});

// Admin get users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
    const { page = 1, limit = 10, search = '', role = 'all', status = 'all' } = req.query;
    const requestId = req.headers['x-request-id'];

    try {
        // Build query
        const query = { isActive: status === 'active' ? true : status === 'inactive' ? false : { $exists: true } };
        if (role !== 'all') {
            query.role = role;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Get users with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            },
            requestId
        });
    } catch (error) {
        logger.error('❌ Admin users error:', { error: error.message, requestId });
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            requestId
        });
    }
});

// ======================
// AI ROUTES
// ======================
app.use('/api/ai', aiRoutes);

// ======================
// SOCKET.IO HANDLERS
// ======================
io.on('connection', (socket) => {
    const clientId = socket.id;
    logger.info(`🔌 Socket.IO connected: ${clientId}`);
    socket.data.connectedAt = new Date();
    socket.data.userAgent = socket.handshake.headers['user-agent'];

    // Resume analysis
    socket.on('resume:analyze', async (data) => {
        const jobId = `job-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        logger.info(`📄 Resume analysis requested via WebSocket: ${jobId}`, {
            clientId,
            userId: data.userId,
        });

        socket.emit('resume:analysis:started', {
            jobId,
            timestamp: new Date().toISOString(),
        });

        // Simulate analysis progress
        let progress = 0;
        const steps = [
            { name: 'uploading', progress: 10 },
            { name: 'parsing', progress: 25 },
            { name: 'extracting', progress: 45 },
            { name: 'analyzing', progress: 70 },
            { name: 'generating', progress: 90 },
            { name: 'complete', progress: 100 },
        ];

        const interval = setInterval(() => {
            const currentStep = steps.find(step => progress < step.progress) || steps[steps.length - 1];
            socket.emit('resume:analysis:progress', {
                jobId,
                progress,
                message: `Step: ${currentStep.name}`,
                currentStep: currentStep.name,
                timestamp: new Date().toISOString(),
            });

            progress += 5;

            if (progress >= 100) {
                clearInterval(interval);
                const analysisResult = {
                    jobId,
                    success: true,
                    data: {
                        score: Math.floor(Math.random() * 30) + 70,
                        suggestions: [
                            'Add more quantifiable achievements',
                            'Include specific technologies used in each role',
                            'Improve action verb usage',
                            'Add a professional summary at the top',
                        ],
                        strengths: [
                            'Clear section organization',
                            'Good education section',
                            'Proper contact information',
                        ],
                        weaknesses: [
                            'Lacking technical details',
                            'Short work experience descriptions',
                            'Missing quantifiable metrics',
                        ],
                        atsScore: Math.floor(Math.random() * 20) + 80,
                        keywords: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
                    },
                    timestamp: new Date().toISOString(),
                };
                socket.emit('resume:analysis:complete', analysisResult);
                logger.info(`✅ Resume analysis completed: ${jobId}`);
            }
        }, 500);
    });

    socket.on('disconnect', (reason) => {
        const duration = new Date() - socket.data.connectedAt;
        logger.info(`🔌 Socket.IO disconnected: ${clientId}`, {
            reason,
            duration: `${duration}ms`,
        });
    });
});

// ======================
// ERROR HANDLERS
// ======================
app.use('*', (req, res) => {
    logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
    });
});

app.use((err, req, res, next) => {
    const errorId = Math.random().toString(36).substring(2, 9);
    logger.error(`Error [${errorId}]:`, {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
    });

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: NODE_ENV === 'production' && statusCode === 500
            ? 'Internal Server Error'
            : err.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || errorId,
    });
});

// ======================
// APPLICATION INITIALIZATION
// ======================
const initializeApplication = async () => {
    try {
        // Create required directories
        await createRequiredDirectories();

        // Display startup banner
        displayStartupBanner();

        // Connect to database
        await connectAppDB();

        logger.info('✅ Application initialized successfully');

        return {
            app,
            httpServer,
            io,
            mongoose: mongoose.connection,
            logger
        };
    } catch (error) {
        logger.error('❌ Application initialization failed:', error);
        throw error;
    }
};

// Helper functions
const createRequiredDirectories = async () => {
    const directories = [
        'logs',
        'uploads',
        'uploads/resumes',
        'uploads/profiles',
        'uploads/temp',
    ];

    for (const dir of directories) {
        const dirPath = path.join(__dirname, '../', dir);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
            logger.debug(`Created directory: ${dir}`);
        }
    }
};

const displayStartupBanner = () => {
    const banner = `
    ╔══════════════════════════════════════════════════════════════╗
    ║ AI RESUME BUILDER - BACKEND ║
    ║ Version ${process.env.API_VERSION || '2.0.0'} ║
    ║ Environment: ${NODE_ENV.toUpperCase()} ║
    ╚══════════════════════════════════════════════════════════════╝
    `;
    console.log('\x1b[36m%s\x1b[0m', banner);

    logger.info('🚀 Starting AI Resume Builder Backend', {
        environment: NODE_ENV,
        port: PORT,
        host: HOST,
        frontend: FRONTEND_URL,
        nodeVersion: process.version,
        pid: process.pid,
        googleOAuth: process.env.GOOGLE_CLIENT_ID ? 'Enabled' : 'Disabled',
    });
};

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    initializeApplication().then(({ httpServer }) => {
        httpServer.listen(PORT, HOST, () => {
            logger.info(`✅ Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
            logger.info(`🌐 Frontend URL: ${FRONTEND_URL}`);
            logger.info(`🔗 Health check: http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}/health`);
            logger.info(`🔐 Google OAuth: ${process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}`);
        });
    }).catch((error) => {
        logger.error('💥 Failed to start server:', error);
        process.exit(1);
    });
}

// Export - Only export what's needed for server.js
export {
    initializeApplication,
    app,
    httpServer,
    io,
    logger,
    mongoose,
    User,
    authenticateUser,
    authenticateAdmin,
    googleClient
};