// src/app.js - UPDATED VERSION
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { createServer } from 'http';
import { Server } from 'socket.io';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    pingTimeout: 60000,
    pingInterval: 25000
});

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';


// 1. CORS - Use inline config instead of import
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// 2. Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// 3. Logging
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));

// 4. Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// 5. Compression
app.use(compression());

// 6. Data Sanitization
app.use(mongoSanitize());
app.use(hpp());

// 7. Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// 8. Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.BACKEND_URL}/api/auth/google/callback`
    }, (accessToken, refreshToken, profile, done) => {
        // This is a placeholder - implement your user lookup/creation logic
        const user = {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            avatar: profile.photos[0]?.value,
            provider: 'google'
        };
        return done(null, user);
    }));
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});


export const connectDB = async () => {
    try {
        console.log('🔗 Connecting to MongoDB...');

        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 50,
            minPoolSize: 5,
            retryWrites: true,
            w: 'majority',
        };

        await mongoose.connect(process.env.MONGODB_URI, options);

        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose.connection.name}`);

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });

        return mongoose.connection;

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        throw error;
    }
};

export const createDefaultAdmin = async () => {
    try {
        console.log('👑 Checking default admin account...');

        // Try to import Admin model, create simple schema if not exists
        let Admin;
        try {
            // Dynamic import to avoid issues if file doesn't exist
            const adminModule = await import('./admin/models/Admin.js');
            Admin = adminModule.default || adminModule.Admin;
        } catch (error) {
            console.log('⚠️ Admin model not found, creating simple one...');
            // Create simple admin schema
            const adminSchema = new mongoose.Schema({
                name: String,
                email: { type: String, unique: true },
                password: String,
                role: { type: String, default: 'super_admin' },
                isActive: { type: Boolean, default: true },
                createdAt: { type: Date, default: Date.now }
            });
            Admin = mongoose.model('Admin', adminSchema);
        }

        const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'superadmin@resume.ai';
        const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (!existingAdmin) {
            // Simple password hashing (in production, use bcrypt)
            const hashedPassword = Buffer.from(adminPassword).toString('base64');

            const admin = new Admin({
                name: 'Super Administrator',
                email: adminEmail,
                password: hashedPassword,
                role: 'super_admin',
                isActive: true
            });

            await admin.save();
            console.log('✅ Default admin created');
            console.log(`📧 Email: ${adminEmail}`);
            console.log(`🔑 Password: ${adminPassword}`);
            console.log('⚠️ Change password after first login!');
        } else {
            console.log('✅ Admin account already exists');
        }

    } catch (error) {
        console.log('⚠️ Could not create admin:', error.message);
        console.log('💡 You can create admin manually through the admin panel');
    }
};

// ======================

const setupRoutes = async () => {
    try {
        console.log('🔄 Setting up routes...');

        // Import routes
        const mainRoutes = (await import('./routes/index.js')).default;
        const authRoutes = (await import('./routes/authRoutes.js')).default;
        const userRoutes = (await import('./routes/userRoutes.js')).default;
        const resumeRoutes = (await import('./routes/resumeRoutes.js')).default;

        // Mount routes
        app.use('/api', mainRoutes);

        // Basic routes (fallback if mainRoutes doesn't include them)
        app.get('/', (req, res) => {
            res.json({
                message: '🚀 AI Resume Builder API',
                version: '2.0.0',
                environment: NODE_ENV,
                endpoints: {
                    health: '/health',
                    api: '/api',
                    admin: '/admin',
                    docs: '/api/docs'
                }
            });
        });

        app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
                environment: NODE_ENV,
                version: '2.0.0'
            });
        });

        // Static files
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
        app.use('/admin', express.static(path.join(__dirname, '../admin-panel')));

        // Admin panel fallback
        app.get('/admin/*', (req, res) => {
            res.sendFile(path.join(__dirname, '../admin-panel', 'index.html'));
        });

        // 404 Handler
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.originalUrl}`,
                timestamp: new Date().toISOString(),
                availableEndpoints: {
                    home: '/',
                    health: '/health',
                    docs: '/api/docs',
                    admin: '/admin'
                }
            });
        });

        // Error Handler
        app.use((err, req, res, next) => {
            console.error('❌ Error:', err.message);

            res.status(err.statusCode || 500).json({
                success: false,
                error: err.message || 'Internal Server Error',
                timestamp: new Date().toISOString(),
                ...(NODE_ENV === 'development' && { stack: err.stack })
            });
        });

        console.log('✅ Routes setup completed');

    } catch (error) {
        console.error('❌ Error setting up routes:', error.message);
        throw error;
    }
};


io.on('connection', (socket) => {
    console.log(`🔌 Socket.IO connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`🔌 Socket.IO disconnected: ${socket.id}`);
    });

    socket.on('join', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });
});


export const initializeApp = async () => {
    try {
        console.log('🔄 Initializing application...');

        // Connect to database
        const mongooseConnection = await connectDB();

        // Create default admin
        await createDefaultAdmin();

        // Setup routes
        await setupRoutes();

        console.log('✅ Application initialized successfully');

        return { app, httpServer, io, mongooseConnection };

    } catch (error) {
        console.error('❌ Application initialization failed:', error.message);
        throw error;
    }
};

export { app, httpServer, io };