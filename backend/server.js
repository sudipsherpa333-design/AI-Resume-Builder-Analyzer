// backend/server.js - COMPLETELY FIXED VERSION
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import cluster from 'cluster';
import os from 'os';
import { createRequire } from 'module';
import http from 'http';
import express from 'express';

const require = createRequire(import.meta.url);
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

// Socket.io specific config
const SOCKET_IO_CONFIG = {
    cors: {
        origin: process.env.CLIENT_URL?.split(',') || ["http://localhost:3000"],
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
║                 AI RESUME BUILDER + SOCKET.IO                        ║
║                 Real-time Collaboration Platform                     ║
╚══════════════════════════════════════════════════════════════════════╝
`;

// ======================
// SERVER LOGGER
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
            socket: { color: this.colors.magenta, icon: '🔌' }
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
}

// ======================
// SERVER PERFORMANCE MONITOR
// ======================
class ServerPerformanceMonitor {
    constructor() {
        this.startTime = Date.now();
        this.memoryWarnings = 0;
        this.requestCount = 0;
        this.errorCount = 0;
        this.socketConnections = 0;
        this.socketEvents = 0;

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
                memoryWarnings: this.memoryWarnings
            });
        }, 300000);
    }

    incrementRequest() { this.requestCount++; }
    incrementError() { this.errorCount++; }
    incrementSocketConnection() { this.socketConnections++; }
    decrementSocketConnection() { this.socketConnections = Math.max(0, this.socketConnections - 1); }
    incrementSocketEvent() { this.socketEvents++; }

    getStats() {
        return {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            requests: this.requestCount,
            errors: this.errorCount,
            memoryWarnings: this.memoryWarnings,
            socketConnections: this.socketConnections,
            socketEvents: this.socketEvents
        };
    }
}

// ======================
// SIMPLE EXPRESS SETUP FOR SOCKET.IO
// ======================
const createExpressApp = () => {
    const app = express();

    // Basic middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging
    app.use((req, res, next) => {
        const startTime = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                ServerLogger.warning('Slow request', {
                    method: req.method,
                    url: req.url,
                    duration: `${duration}ms`,
                    status: res.statusCode,
                    ip: req.ip
                });
            }
        });
        next();
    });

    return app;
};

// ======================
// SERVER SOCKET.IO INITIALIZATION (STANDALONE)
// ======================
const initializeSocketIOServer = (httpServer, performanceMonitor = null) => {
    const { Server } = require('socket.io');
    const io = new Server(httpServer, SOCKET_IO_CONFIG);

    // Socket.io state management
    const socketState = {
        activeUsers: new Map(),
        activeResumes: new Map(),
        userSockets: new Map(),
        activeRooms: new Set()
    };

    // Authentication middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token ||
                socket.handshake.headers['authorization']?.replace('Bearer ', '');

            if (NODE_ENV === 'development' && !token) {
                // Allow anonymous in development for testing
                socket.user = {
                    id: `dev_${Date.now()}`,
                    email: 'dev@example.com',
                    name: 'Developer'
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

            // TODO: Implement actual JWT verification
            const userId = socket.handshake.auth.userId || `user_${Date.now()}`;
            socket.user = {
                id: userId,
                email: socket.handshake.auth.email || `${userId}@example.com`,
                name: socket.handshake.auth.name || 'User'
            };

            ServerLogger.socket('Authenticated socket connection', {
                userId: socket.user.id,
                socketId: socket.id.substring(0, 10)
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
            time: connectionTime.toISOString()
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

        // ======================
        // EVENT HANDLERS (Same as before)
        // ======================

        // Join dashboard
        socket.on('join-dashboard', (data, callback) => {
            try {
                if (performanceMonitor) performanceMonitor.incrementSocketEvent();

                const { userName = socket.user?.name } = data || {};
                socket.join('dashboard');
                userData.rooms.add('dashboard');
                userData.userName = userName;
                userData.lastActivity = new Date();

                // Broadcast dashboard update
                broadcastDashboardStats(io, socketState);

                const response = {
                    success: true,
                    timestamp: new Date(),
                    message: 'Successfully joined dashboard',
                    userId,
                    socketId: socket.id
                };

                if (typeof callback === 'function') {
                    callback(response);
                }

                socket.emit('dashboard-joined', response);

                ServerLogger.socket('User joined dashboard', {
                    userId: userId.substring(0, 15),
                    userName,
                    socketId: socket.id.substring(0, 10)
                });
            } catch (error) {
                const errorResponse = {
                    success: false,
                    error: 'Failed to join dashboard',
                    details: error.message
                };

                if (typeof callback === 'function') {
                    callback(errorResponse);
                }
                socket.emit('error', errorResponse);

                ServerLogger.error('Dashboard join error', {
                    error: error.message,
                    userId,
                    socketId: socket.id
                });
            }
        });

        // Create live resume session
        socket.on('create-live-resume', (data, callback) => {
            try {
                if (performanceMonitor) performanceMonitor.incrementSocketEvent();

                const { userId: paramUserId, userName, template = 'default', title = 'Untitled Resume' } = data;
                const actualUserId = paramUserId || userId;
                const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

                const resumeSession = {
                    id: resumeId,
                    userId: actualUserId,
                    userName: userName || socket.user?.name || 'Anonymous',
                    userEmail: socket.user?.email,
                    title,
                    template,
                    status: 'draft',
                    createdAt: new Date(),
                    lastActivity: new Date(),
                    completeness: 0,
                    collaborators: new Map([[actualUserId, {
                        joinedAt: new Date(),
                        lastActivity: new Date(),
                        socketId: socket.id
                    }]]),
                    socketIds: new Set([socket.id]),
                    content: {
                        personal: {},
                        experience: [],
                        education: [],
                        skills: []
                    }
                };

                socketState.activeResumes.set(resumeId, resumeSession);
                socket.join(`resume:${resumeId}`);
                userData.rooms.add(`resume:${resumeId}`);

                // Notify dashboard
                io.to('dashboard').emit('resume-created', {
                    action: 'created',
                    resumeId,
                    userId: actualUserId,
                    userName: resumeSession.userName,
                    title,
                    timestamp: new Date(),
                    completeness: 0
                });

                const response = {
                    success: true,
                    resumeId,
                    status: 'draft',
                    message: 'Live resume session started',
                    timestamp: new Date(),
                    shareLink: `/resume/${resumeId}`
                };

                if (typeof callback === 'function') {
                    callback(response);
                }

                socket.emit('resume-created-success', response);

                // Update stats
                broadcastDashboardStats(io, socketState);

                ServerLogger.socket('Live resume created', {
                    resumeId: resumeId.substring(0, 15),
                    userId: actualUserId.substring(0, 15),
                    userName: resumeSession.userName,
                    template
                });
            } catch (error) {
                const errorResponse = {
                    success: false,
                    error: 'Failed to create resume',
                    details: error.message
                };

                if (typeof callback === 'function') {
                    callback(errorResponse);
                }
                socket.emit('error', errorResponse);

                ServerLogger.error('Create resume error', {
                    error: error.message,
                    userId,
                    socketId: socket.id
                });
            }
        });

        // Resume updates
        socket.on('resume-update', (data, callback) => {
            try {
                if (performanceMonitor) performanceMonitor.incrementSocketEvent();

                const { resumeId, content, completeness, section, action = 'update' } = data;
                const resume = socketState.activeResumes.get(resumeId);

                if (!resume) {
                    const errorMsg = 'Resume session not found';
                    if (typeof callback === 'function') {
                        callback({ success: false, error: errorMsg });
                    }
                    return socket.emit('error', { error: errorMsg });
                }

                // Update resume data
                resume.lastActivity = new Date();
                resume.completeness = completeness !== undefined ? completeness : resume.completeness;

                // Auto-update status based on completeness
                if (completeness !== undefined) {
                    if (completeness >= 95) resume.status = 'completed';
                    else if (completeness >= 70) resume.status = 'review';
                    else if (completeness >= 30) resume.status = 'in-progress';
                    else resume.status = 'draft';
                }

                // Update specific section content
                if (section && content) {
                    if (!resume.content[section]) {
                        resume.content[section] = content;
                    } else if (Array.isArray(resume.content[section])) {
                        resume.content[section] = content;
                    } else {
                        resume.content[section] = { ...resume.content[section], ...content };
                    }
                }

                // Update collaborator activity
                if (resume.collaborators.has(userId)) {
                    resume.collaborators.get(userId).lastActivity = new Date();
                }

                // Broadcast update to all collaborators except sender
                socket.to(`resume:${resumeId}`).emit('resume-updated', {
                    resumeId,
                    userId,
                    section,
                    content,
                    completeness: resume.completeness,
                    status: resume.status,
                    timestamp: new Date(),
                    updatedBy: userId,
                    action
                });

                // Notify dashboard
                io.to('dashboard').emit('resume-activity', {
                    resumeId,
                    userId,
                    userName: socket.user?.name,
                    action,
                    section,
                    completeness: resume.completeness,
                    timestamp: new Date()
                });

                const response = {
                    success: true,
                    resumeId,
                    status: resume.status,
                    completeness: resume.completeness,
                    timestamp: new Date()
                };

                if (typeof callback === 'function') {
                    callback(response);
                }

                ServerLogger.debug('Resume updated', {
                    resumeId: resumeId.substring(0, 15),
                    userId: userId.substring(0, 15),
                    section,
                    completeness: `${resume.completeness}%`,
                    status: resume.status
                });
            } catch (error) {
                const errorResponse = {
                    success: false,
                    error: 'Update failed',
                    details: error.message
                };

                if (typeof callback === 'function') {
                    callback(errorResponse);
                }
                socket.emit('error', errorResponse);

                ServerLogger.error('Resume update error', {
                    error: error.message,
                    resumeId: data.resumeId,
                    userId,
                    socketId: socket.id
                });
            }
        });

        // Join resume collaboration
        socket.on('join-resume', (data, callback) => {
            try {
                if (performanceMonitor) performanceMonitor.incrementSocketEvent();

                const { resumeId, userName = socket.user?.name } = data;
                const resume = socketState.activeResumes.get(resumeId);

                if (!resume) {
                    const errorMsg = 'Resume session not found or expired';
                    if (typeof callback === 'function') {
                        callback({ success: false, error: errorMsg });
                    }
                    return socket.emit('error', { error: errorMsg });
                }

                // Add collaborator
                resume.collaborators.set(userId, {
                    joinedAt: new Date(),
                    lastActivity: new Date(),
                    socketId: socket.id,
                    userName
                });

                resume.socketIds.add(socket.id);
                socket.join(`resume:${resumeId}`);
                userData.rooms.add(`resume:${resumeId}`);

                // Notify other collaborators
                socket.to(`resume:${resumeId}`).emit('collaborator-joined', {
                    resumeId,
                    userId,
                    userName,
                    timestamp: new Date(),
                    totalCollaborators: resume.collaborators.size
                });

                const response = {
                    success: true,
                    resumeId,
                    joinedAt: new Date(),
                    collaborators: Array.from(resume.collaborators.values()).map(c => ({
                        userId: c.userId || userId,
                        userName: c.userName,
                        joinedAt: c.joinedAt
                    })),
                    resumeData: {
                        title: resume.title,
                        status: resume.status,
                        completeness: resume.completeness,
                        createdAt: resume.createdAt,
                        content: resume.content
                    }
                };

                if (typeof callback === 'function') {
                    callback(response);
                }

                socket.emit('resume-joined', response);

                // Update dashboard stats
                broadcastDashboardStats(io, socketState);

                ServerLogger.socket('User joined resume collaboration', {
                    resumeId: resumeId.substring(0, 15),
                    userId: userId.substring(0, 15),
                    userName,
                    totalCollaborators: resume.collaborators.size
                });
            } catch (error) {
                const errorResponse = {
                    success: false,
                    error: 'Join failed',
                    details: error.message
                };

                if (typeof callback === 'function') {
                    callback(errorResponse);
                }
                socket.emit('error', errorResponse);

                ServerLogger.error('Join resume error', {
                    error: error.message,
                    resumeId: data.resumeId,
                    userId,
                    socketId: socket.id
                });
            }
        });

        // Real-time cursor sharing
        socket.on('cursor-position', (data) => {
            try {
                if (performanceMonitor) performanceMonitor.incrementSocketEvent();

                const { resumeId, position, selection } = data;
                socket.to(`resume:${resumeId}`).emit('cursor-update', {
                    userId,
                    userName: socket.user?.name,
                    position,
                    selection,
                    timestamp: new Date()
                });
            } catch (error) {
                ServerLogger.debug('Cursor position error', {
                    error: error.message,
                    resumeId: data.resumeId,
                    userId,
                    socketId: socket.id
                });
            }
        });

        // Chat message in resume
        socket.on('resume-chat', (data, callback) => {
            try {
                if (performanceMonitor) performanceMonitor.incrementSocketEvent();

                const { resumeId, message, type = 'message' } = data;
                const chatMessage = {
                    id: `chat_${Date.now()}`,
                    userId,
                    userName: socket.user?.name,
                    message,
                    type,
                    timestamp: new Date(),
                    socketId: socket.id
                };

                // Broadcast to all in the resume room
                io.to(`resume:${resumeId}`).emit('new-chat-message', chatMessage);

                if (typeof callback === 'function') {
                    callback({ success: true, messageId: chatMessage.id });
                }

                ServerLogger.socket('Resume chat message', {
                    resumeId: resumeId.substring(0, 15),
                    userId: userId.substring(0, 15),
                    message: message.substring(0, 50)
                });
            } catch (error) {
                if (typeof callback === 'function') {
                    callback({ success: false, error: error.message });
                }
                ServerLogger.error('Resume chat error', { error: error.message });
            }
        });

        // Ping for connection health
        socket.on('ping', (callback) => {
            userData.lastActivity = new Date();

            if (typeof callback === 'function') {
                callback({
                    pong: Date.now(),
                    serverTime: new Date().toISOString(),
                    uptime: process.uptime()
                });
            }
        });

        // Request current state
        socket.on('get-state', (data, callback) => {
            try {
                const { resumeId } = data;
                const resume = socketState.activeResumes.get(resumeId);

                if (!resume && typeof callback === 'function') {
                    return callback({ success: false, error: 'Resume not found' });
                }

                if (typeof callback === 'function') {
                    callback({
                        success: true,
                        resume: resume ? {
                            id: resume.id,
                            title: resume.title,
                            status: resume.status,
                            completeness: resume.completeness,
                            content: resume.content,
                            collaborators: Array.from(resume.collaborators.values()).map(c => ({
                                userId: c.userId,
                                userName: c.userName,
                                lastActivity: c.lastActivity
                            })),
                            createdAt: resume.createdAt,
                            lastActivity: resume.lastActivity
                        } : null,
                        userRooms: Array.from(userData.rooms),
                        onlineUsers: socketState.activeUsers.size,
                        activeResumes: socketState.activeResumes.size
                    });
                }
            } catch (error) {
                if (typeof callback === 'function') {
                    callback({ success: false, error: error.message });
                }
            }
        });

        // Disconnect handler
        socket.on('disconnect', (reason) => {
            const disconnectTime = new Date();
            const connectionDuration = disconnectTime - connectionTime;

            // Cleanup user data
            socketState.activeUsers.delete(socket.id);

            if (socketState.userSockets.has(userId)) {
                const userSockets = socketState.userSockets.get(userId);
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    socketState.userSockets.delete(userId);
                }
            }

            // Cleanup from resumes
            for (const [resumeId, resume] of socketState.activeResumes.entries()) {
                if (resume.socketIds.has(socket.id)) {
                    resume.socketIds.delete(socket.id);
                    resume.collaborators.delete(userId);

                    // Notify other collaborators
                    socket.to(`resume:${resumeId}`).emit('collaborator-left', {
                        resumeId,
                        userId,
                        userName: socket.user?.name,
                        timestamp: disconnectTime
                    });

                    // If no more collaborators, mark for cleanup
                    if (resume.socketIds.size === 0) {
                        setTimeout(() => {
                            if (socketState.activeResumes.get(resumeId)?.socketIds.size === 0) {
                                socketState.activeResumes.delete(resumeId);
                                ServerLogger.socket('Removed inactive resume', {
                                    resumeId: resumeId.substring(0, 15),
                                    duration: `${(disconnectTime - resume.createdAt) / 1000}s`
                                });
                            }
                        }, 300000); // 5 minutes
                    }
                }
            }

            // Update performance monitor
            if (performanceMonitor) {
                performanceMonitor.decrementSocketConnection();
            }

            // Update dashboard stats
            broadcastDashboardStats(io, socketState);

            ServerLogger.socket('Socket.io client disconnected', {
                socketId: socket.id.substring(0, 10),
                userId: userId.substring(0, 15),
                reason,
                duration: `${(connectionDuration / 1000).toFixed(1)}s`,
                rooms: Array.from(userData.rooms).length
            });
        });

        // Error handler
        socket.on('error', (error) => {
            ServerLogger.error('Socket.io client error', {
                socketId: socket.id.substring(0, 10),
                userId: userId.substring(0, 15),
                error: error.message || error
            });
        });

        // Send initial connection confirmation
        socket.emit('connected', {
            success: true,
            socketId: socket.id,
            userId,
            serverTime: new Date().toISOString(),
            message: 'Connected to resume builder server'
        });
    });

    // Periodic cleanup of inactive sessions
    setInterval(() => {
        cleanupInactiveSessions(socketState);
        broadcastDashboardStats(io, socketState);
    }, 60000);

    ServerLogger.success('Socket.io initialized successfully', {
        transports: SOCKET_IO_CONFIG.transports,
        corsOrigins: SOCKET_IO_CONFIG.cors.origin
    });

    return { io, socketState };
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

        io.to('dashboard').emit('dashboard-stats', stats);
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
        'MONGODB_URI': 'Database connection string',
        'JWT_SECRET': 'JWT authentication secret',
        'SESSION_SECRET': 'Session encryption secret'
    };

    const optionalVars = {
        'CLIENT_URL': 'Frontend URL for CORS (default: http://localhost:3000)',
        'SOCKET_PING_TIMEOUT': 'Socket.io ping timeout (default: 60000)',
        'SOCKET_PING_INTERVAL': 'Socket.io ping interval (default: 25000)'
    };

    const missing = [];
    const warnings = [];

    // Check required variables
    Object.entries(requiredVars).forEach(([key, description]) => {
        if (!process.env[key]) {
            missing.push({ key, description });
        } else if (key.includes('SECRET') && process.env[key].includes('change-this')) {
            warnings.push(`${key} is using default value - CHANGE IN PRODUCTION!`);
        }
    });

    // Check Node version
    const nodeVersion = process.versions.node;
    const majorVersion = parseInt(nodeVersion.split('.')[0]);
    if (majorVersion < 18) {
        missing.push({
            key: 'NODE_VERSION',
            description: `Node.js v${nodeVersion} detected. Minimum required: v18.0.0`
        });
    }

    if (missing.length > 0) {
        ServerLogger.error('Missing required environment variables:');
        missing.forEach(({ key, description }) => {
            console.log(`   ❗ ${key}: ${description}`);
        });
        return false;
    }

    if (warnings.length > 0) {
        ServerLogger.warning('Security warnings:');
        warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    }

    // Log optional variables status
    ServerLogger.debug('Optional environment variables:');
    Object.entries(optionalVars).forEach(([key, description]) => {
        if (process.env[key]) {
            ServerLogger.debug(`   ✓ ${key}: ${process.env[key]}`);
        }
    });

    ServerLogger.success('Environment validation passed');
    return true;
};

// ======================
// SERVER HEALTH CHECK
// ======================
const checkServerHealth = async (mongooseConnection = null, socketState = null) => {
    const checks = {
        server: true,
        memory: false,
        uptime: false,
        database: mongooseConnection ? false : true,
        socket: socketState !== null
    };

    try {
        // Database check
        if (mongooseConnection && mongooseConnection.readyState === 1) {
            checks.database = true;
        }

        // Memory check
        const memory = process.memoryUsage();
        const rssMB = memory.rss / 1024 / 1024;
        checks.memory = rssMB < MAX_MEMORY_RSS;

        // Uptime check
        checks.uptime = process.uptime() > 5;

        // Socket.io check
        if (socketState) {
            checks.socket = true;
        }

        // Add socket stats if available
        const socketStats = socketState ? {
            activeConnections: socketState.activeUsers.size,
            activeResumes: socketState.activeResumes.size,
            userSockets: socketState.userSockets.size
        } : null;

        return {
            status: Object.values(checks).every(check => check) ? 'healthy' : 'degraded',
            checks,
            details: {
                database: checks.database ? 'connected' : mongooseConnection ? 'disconnected' : 'not configured',
                memory: `${Math.round(rssMB)}MB / ${MAX_MEMORY_RSS}MB`,
                uptime: `${Math.floor(process.uptime())}s`,
                nodeVersion: process.version,
                environment: NODE_ENV,
                pid: process.pid,
                ...(socketStats ? { sockets: socketStats } : {})
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
const displayServerInfo = (port, host, workerId = null, hasSocket = false) => {
    console.clear();
    console.log(ServerLogger.colors.magenta + BANNER + ServerLogger.colors.reset);
    console.log(LOG_SEPARATOR);

    const title = workerId ? `WORKER ${workerId}` : 'MASTER PROCESS';
    ServerLogger.success(`${title} STARTED`, {
        pid: process.pid,
        port,
        host: host === '0.0.0.0' ? 'localhost' : host,
        socket: hasSocket ? 'enabled' : 'disabled'
    });

    console.log(LOG_SEPARATOR);

    const serverUrls = [
        { label: '🌐 Local URL', url: `http://localhost:${port}` },
        { label: '🔗 Network URL', url: `http://${host}:${port}` },
        { label: '🏥 Health Check', url: `http://localhost:${port}/health` },
        { label: '📊 Socket Stats', url: `http://localhost:${port}/api/socket/stats` },
        { label: '🔌 WS Endpoint', url: `ws://localhost:${port}` }
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

    if (hasSocket) {
        console.log(`   Socket.IO:    ${'ENABLED'.padEnd(12)} ✅`);
    }

    if (workerId) {
        console.log(`   Worker ID:    ${workerId.padEnd(12)}`);
    }

    const memory = process.memoryUsage();
    console.log(`   Memory:       ${Math.round(memory.heapUsed / 1024 / 1024)}MB / ${Math.round(memory.heapTotal / 1024 / 1024)}MB`);

    console.log(LOG_SEPARATOR);
    console.log(ServerLogger.colors.green + '✅ Server is ready to handle requests' + ServerLogger.colors.reset + '\n');
};

// ======================
// GRACEFUL SHUTDOWN
// ======================
const setupServerGracefulShutdown = (server, mongooseConnection = null, performanceMonitor = null, socketIO = null, workerId = null) => {
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

                        // Force close after 10 seconds
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
                            // Disconnect all socket clients
                            socketIO.io.disconnectSockets(true);
                            ServerLogger.success(`${workerPrefix}Socket.io connections closed`);
                        } catch (err) {
                            ServerLogger.error(`${workerPrefix}Error closing Socket.io:`, { error: err.message });
                        }
                    }
                }
            },
            {
                name: 'Close database connections',
                action: async () => {
                    if (mongooseConnection && mongooseConnection.close) {
                        try {
                            await mongooseConnection.close();
                            ServerLogger.success(`${workerPrefix}Database connections closed`);
                        } catch (err) {
                            ServerLogger.error(`${workerPrefix}Error closing database:`, { error: err.message });
                        }
                    }
                }
            },
            {
                name: 'Cleanup resources',
                action: async () => {
                    // Add any custom cleanup here
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

        // Force exit after 15 seconds
        setTimeout(() => {
            ServerLogger.error(`${workerPrefix}Force exiting after timeout`);
            process.exit(1);
        }, 15000);
    };

    // Handle signals
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

    // Handle uncaught errors
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
// CLUSTER MANAGEMENT
// ======================
const startClusterMaster = () => {
    console.clear();
    console.log(ServerLogger.colors.magenta + BANNER + ServerLogger.colors.reset);
    ServerLogger.info('Starting master process', {
        cpuCount: CPU_COUNT,
        pid: process.pid,
        nodeVersion: process.version
    });

    console.log(LOG_SEPARATOR);

    // Create worker processes
    for (let i = 0; i < CPU_COUNT; i++) {
        const workerId = i + 1;
        const workerEnv = { ...process.env, WORKER_ID: workerId };
        const worker = cluster.fork(workerEnv);

        worker.on('message', (message) => {
            if (message.type === 'stats') {
                ServerLogger.debug(`Worker ${workerId} stats`, message.data);
            }
        });
    }

    // Monitor workers
    cluster.on('exit', (worker, code, signal) => {
        const exitReason = signal || code;
        const workerId = worker.id;

        ServerLogger.warning(`Worker ${workerId} (PID: ${worker.process.pid}) died`, {
            reason: exitReason,
            code,
            signal,
            restarting: true
        });

        // Auto-restart worker after delay
        setTimeout(() => {
            const newWorker = cluster.fork({ ...process.env, WORKER_ID: workerId });
            ServerLogger.success(`Worker ${workerId} restarted`, {
                newPid: newWorker.process.pid,
                oldPid: worker.process.pid
            });
        }, 2000);
    });

    cluster.on('online', (worker) => {
        ServerLogger.success(`Worker ${worker.id} online`, { pid: worker.process.pid });
    });

    // Master shutdown
    const shutdownMaster = async () => {
        ServerLogger.warning('Master shutdown initiated');

        // Send shutdown signal to all workers
        for (const id in cluster.workers) {
            cluster.workers[id].process.kill('SIGTERM');
        }

        // Wait for workers to exit
        await new Promise(resolve => setTimeout(resolve, 5000));

        ServerLogger.success('Master shutdown complete');
        process.exit(0);
    };

    process.on('SIGINT', shutdownMaster);
    process.on('SIGTERM', shutdownMaster);
};

// ======================
// CREATE REQUIRED DIRECTORIES
// ======================
const createServerDirectories = async () => {
    const directories = [
        'logs',
        'logs/socket',
        'uploads/resumes',
        'uploads/profiles',
        'uploads/temp',
        'backups',
        'cache',
        'temp/socket'
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
// START WORKER PROCESS (STANDALONE SOCKET.IO SERVER)
// ======================
const startServerWorker = async (workerId = null) => {
    try {
        // Initialize performance monitor
        const performanceMonitor = new ServerPerformanceMonitor();

        // Validate environment
        if (!validateServerEnvironment()) {
            process.exit(1);
        }

        // Create required directories
        await createServerDirectories();

        // Create Express app and HTTP server
        const app = createExpressApp();
        const httpServer = http.createServer(app);

        // Initialize Socket.IO
        const { io, socketState } = initializeSocketIOServer(httpServer, performanceMonitor);

        // Add routes to Express app
        // Health endpoint
        app.get('/health', async (req, res) => {
            try {
                const health = await checkServerHealth(null, socketState);
                res.status(health.status === 'healthy' ? 200 : 503).json(health);
            } catch (error) {
                performanceMonitor.incrementError();
                res.status(500).json({
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Socket.io stats endpoint
        app.get('/api/socket/stats', (req, res) => {
            if (NODE_ENV === 'production' && req.headers['x-api-key'] !== process.env.METRICS_API_KEY) {
                return res.status(403).json({ error: 'Forbidden' });
            }

            const stats = {
                connections: io.engine?.clientsCount || 0,
                rooms: Array.from(io.sockets.adapter.rooms.keys()).length,
                socketState: {
                    activeUsers: socketState.activeUsers.size,
                    activeResumes: socketState.activeResumes.size,
                    userSockets: socketState.userSockets.size
                },
                updatedAt: new Date().toISOString(),
                serverInfo: {
                    pid: process.pid,
                    workerId: workerId || 'single',
                    uptime: process.uptime(),
                    memory: process.memoryUsage()
                }
            };

            res.json(stats);
        });

        // Root endpoint
        app.get('/', (req, res) => {
            res.json({
                service: 'AI Resume Builder Socket.IO Server',
                version: '1.0.0',
                status: 'running',
                endpoints: {
                    health: '/health',
                    socketStats: '/api/socket/stats',
                    socketIO: `ws://localhost:${PORT}`,
                    docs: '/api-docs'
                },
                timestamp: new Date().toISOString()
            });
        });

        // 404 handler
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Not Found',
                message: `Cannot ${req.method} ${req.url}`,
                timestamp: new Date().toISOString()
            });
        });

        // Error handler
        app.use((err, req, res, next) => {
            performanceMonitor.incrementError();
            ServerLogger.error('Express error:', {
                error: err.message,
                stack: err.stack,
                url: req.url,
                method: req.method
            });

            res.status(err.status || 500).json({
                success: false,
                error: err.name || 'Internal Server Error',
                message: err.message,
                timestamp: new Date().toISOString()
            });
        });

        // Performance monitoring middleware
        app.use((req, res, next) => {
            performanceMonitor.incrementRequest();
            next();
        });

        // Start server
        const server = httpServer.listen(PORT, HOST, () => {
            displayServerInfo(PORT, HOST, workerId, true);

            // Log startup complete
            ServerLogger.success('Socket.IO server startup completed', {
                port: PORT,
                host: HOST,
                worker: workerId,
                environment: NODE_ENV,
                cluster: ENABLE_CLUSTER ? 'enabled' : 'disabled',
                pid: process.pid
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

        // Setup graceful shutdown
        setupServerGracefulShutdown(server, null, performanceMonitor, { io }, workerId);

        return {
            server,
            app,
            httpServer,
            io,
            socketState,
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
// MAIN ENTRY POINT
// ======================
const serverMain = async () => {
    try {
        // Clear console and show banner
        if (NODE_ENV !== 'test') {
            console.clear();
        }

        console.log(ServerLogger.colors.magenta + BANNER + ServerLogger.colors.reset);
        ServerLogger.info('🚀 Initializing AI Resume Builder Socket.IO Server', {
            nodeVersion: process.version,
            platform: process.platform,
            pid: process.pid,
            cwd: process.cwd(),
            environment: NODE_ENV
        });

        console.log(LOG_SEPARATOR);

        // Check if running in cluster mode
        if (ENABLE_CLUSTER && cluster.isPrimary) {
            startClusterMaster();
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
    initializeSocketIOServer,
    startServerWorker,
    serverMain
};