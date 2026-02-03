// backend/src/services/socketService.js
import { Server } from 'socket.io';
import { createServer } from 'http';
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/socket.log' })
    ]
});

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
        this.resumeStats = new Map();
        this.collaborationSessions = new Map();
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        this.setupEventHandlers();
        logger.info('✅ Socket.io server initialized');
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`🔗 New client connected: ${socket.id}`);

            // User authentication
            socket.on('authenticate', (userData) => {
                this.handleAuthentication(socket, userData);
            });

            // Resume collaboration
            socket.on('join-resume', (resumeId) => {
                this.handleJoinResume(socket, resumeId);
            });

            socket.on('leave-resume', (resumeId) => {
                this.handleLeaveResume(socket, resumeId);
            });

            // Real-time editing
            socket.on('resume-update', (data) => {
                this.handleResumeUpdate(socket, data);
            });

            socket.on('cursor-move', (data) => {
                this.handleCursorMove(socket, data);
            });

            // AI progress tracking
            socket.on('ai-progress', (data) => {
                this.handleAIProgress(socket, data);
            });

            // Statistics tracking
            socket.on('resume-stats', (data) => {
                this.handleResumeStats(socket, data);
            });

            // Chat/messaging
            socket.on('send-message', (data) => {
                this.handleSendMessage(socket, data);
            });

            // Live preview updates
            socket.on('preview-update', (data) => {
                this.handlePreviewUpdate(socket, data);
            });

            // Get stats endpoint
            socket.on('get-stats', () => {
                this.sendStats(socket);
            });

            // Disconnect handling
            socket.on('disconnect', () => {
                this.handleDisconnect(socket);
            });
        });
    }

    handleAuthentication(socket, userData) {
        const { userId, username } = userData;
        this.connectedUsers.set(socket.id, {
            userId,
            username,
            socketId: socket.id,
            connectedAt: new Date(),
            activeResume: null
        });

        socket.emit('authenticated', {
            success: true,
            socketId: socket.id,
            message: 'Authenticated successfully'
        });

        logger.info(`🔐 User authenticated: ${username} (${userId})`);
    }

    handleJoinResume(socket, resumeId) {
        const user = this.connectedUsers.get(socket.id);
        if (!user) {
            socket.emit('error', { message: 'Not authenticated' });
            return;
        }

        // Leave previous resume room
        if (user.activeResume) {
            socket.leave(user.activeResume);
        }

        // Join new resume room
        socket.join(resumeId);
        user.activeResume = resumeId;

        // Initialize collaboration session if not exists
        if (!this.collaborationSessions.has(resumeId)) {
            this.collaborationSessions.set(resumeId, {
                resumeId,
                users: new Set(),
                lastUpdate: null,
                version: 1
            });
        }

        const session = this.collaborationSessions.get(resumeId);
        session.users.add(socket.id);

        // Notify other users
        socket.to(resumeId).emit('user-joined', {
            userId: user.userId,
            username: user.username,
            timestamp: new Date().toISOString()
        });

        // Send current collaborators to new user
        const collaborators = Array.from(session.users)
            .map(socketId => this.connectedUsers.get(socketId))
            .filter(u => u && u.socketId !== socket.id);

        socket.emit('collaborators-list', {
            collaborators: collaborators.map(u => ({
                userId: u.userId,
                username: u.username
            }))
        });

        logger.info(`👥 User ${user.username} joined resume: ${resumeId}`);
    }

    handleLeaveResume(socket, resumeId) {
        const user = this.connectedUsers.get(socket.id);
        if (!user) return;

        socket.leave(resumeId);
        user.activeResume = null;

        const session = this.collaborationSessions.get(resumeId);
        if (session) {
            session.users.delete(socket.id);

            // Notify other users
            socket.to(resumeId).emit('user-left', {
                userId: user.userId,
                username: user.username,
                timestamp: new Date().toISOString()
            });

            // Clean up empty session
            if (session.users.size === 0) {
                this.collaborationSessions.delete(resumeId);
            }
        }

        logger.info(`🚪 User ${user.username} left resume: ${resumeId}`);
    }

    handleResumeUpdate(socket, data) {
        const { resumeId, updates, version } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user || user.activeResume !== resumeId) return;

        const session = this.collaborationSessions.get(resumeId);
        if (session) {
            session.lastUpdate = new Date();
            session.version = version;

            // Broadcast to other users in the room
            socket.to(resumeId).emit('resume-updated', {
                updates,
                version,
                userId: user.userId,
                username: user.username,
                timestamp: new Date().toISOString()
            });
        }
    }

    handleCursorMove(socket, data) {
        const { resumeId, position, selection } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user || user.activeResume !== resumeId) return;

        // Broadcast cursor position to other users
        socket.to(resumeId).emit('cursor-moved', {
            userId: user.userId,
            username: user.username,
            position,
            selection,
            timestamp: new Date().toISOString()
        });
    }

    handleAIProgress(socket, data) {
        const { resumeId, progress, status, message } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user) return;

        // Update AI progress tracking
        const stats = this.resumeStats.get(resumeId) || {
            aiEnhancements: 0,
            lastEnhanced: null,
            totalTime: 0
        };

        if (status === 'completed') {
            stats.aiEnhancements++;
            stats.lastEnhanced = new Date();
        }

        this.resumeStats.set(resumeId, stats);

        // Broadcast AI progress to all users in the resume room
        this.io.to(resumeId).emit('ai-progress-update', {
            resumeId,
            progress,
            status,
            message,
            userId: user.userId,
            timestamp: new Date().toISOString()
        });
    }

    handleResumeStats(socket, data) {
        const { resumeId, action } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user) return;

        const stats = this.resumeStats.get(resumeId) || {
            views: 0,
            saves: 0,
            exports: 0,
            shares: 0,
            aiEnhancements: 0,
            lastUpdated: new Date()
        };

        switch (action) {
            case 'view':
                stats.views++;
                break;
            case 'save':
                stats.saves++;
                break;
            case 'export':
                stats.exports++;
                break;
            case 'share':
                stats.shares++;
                break;
        }

        stats.lastUpdated = new Date();
        this.resumeStats.set(resumeId, stats);

        // Broadcast stats update
        this.io.to(resumeId).emit('stats-updated', {
            resumeId,
            stats,
            userId: user.userId,
            timestamp: new Date().toISOString()
        });
    }

    handleSendMessage(socket, data) {
        const { resumeId, message } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user || user.activeResume !== resumeId) return;

        // Broadcast message to all users in the room
        this.io.to(resumeId).emit('new-message', {
            userId: user.userId,
            username: user.username,
            message,
            timestamp: new Date().toISOString()
        });
    }

    handlePreviewUpdate(socket, data) {
        const { resumeId, previewHtml } = data;
        const user = this.connectedUsers.get(socket.id);
        if (!user || user.activeResume !== resumeId) return;

        // Broadcast preview update to other users
        socket.to(resumeId).emit('preview-updated', {
            previewHtml,
            userId: user.userId,
            timestamp: new Date().toISOString()
        });
    }

    sendStats(socket) {
        const stats = {
            connectedUsers: this.connectedUsers.size,
            activeSessions: this.collaborationSessions.size,
            resumeStats: Array.from(this.resumeStats.entries()).map(([resumeId, stats]) => ({
                resumeId,
                ...stats
            })),
            timestamp: new Date().toISOString()
        };

        socket.emit('stats-response', stats);
    }

    handleDisconnect(socket) {
        const user = this.connectedUsers.get(socket.id);
        if (user) {
            // Leave any active resume room
            if (user.activeResume) {
                this.handleLeaveResume(socket, user.activeResume);
            }

            this.connectedUsers.delete(socket.id);
            logger.info(`🔌 Client disconnected: ${user.username} (${socket.id})`);
        } else {
            logger.info(`🔌 Anonymous client disconnected: ${socket.id}`);
        }
    }

    // Public API methods
    getStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            activeSessions: this.collaborationSessions.size,
            resumeStats: Array.from(this.resumeStats.entries()).map(([resumeId, stats]) => ({
                resumeId,
                ...stats
            })),
            timestamp: new Date().toISOString()
        };
    }

    broadcastToResume(resumeId, event, data) {
        this.io.to(resumeId).emit(event, data);
    }

    notifyUser(userId, event, data) {
        const user = Array.from(this.connectedUsers.values()).find(u => u.userId === userId);
        if (user) {
            this.io.to(user.socketId).emit(event, data);
        }
    }
}

export default new SocketService();