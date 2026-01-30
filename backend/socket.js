import { io } from 'socket.io-client';

class SocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
        this.userId = null;
        this.resumeId = null;
    }

    // Initialize socket connection
    initialize({ userId, resumeId = null, joinDashboard = true }) {
        if (this.socket) {
            this.disconnect();
        }

        this.userId = userId;
        this.resumeId = resumeId;

        const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

        console.log('🔌 Initializing socket connection...', {
            userId,
            resumeId,
            joinDashboard,
            url: SOCKET_URL
        });

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: this.reconnectDelay,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true,
            forceNew: false,
            multiplex: true
        });

        this.setupEventListeners();

        // Automatically join dashboard if specified
        if (joinDashboard && userId) {
            this.socket.once('connect', () => {
                this.joinDashboard(userId);
            });
        }

        // Join resume if specified
        if (resumeId && userId) {
            this.socket.once('connect', () => {
                this.joinResume(resumeId, userId);
            });
        }
    }

    // Setup event listeners
    setupEventListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.isConnected = true;
            this.reconnectAttempts = 0;

            this.emitToListeners('connected', {
                socketId: this.socket.id,
                userId: this.userId,
                resumeId: this.resumeId,
                timestamp: new Date().toISOString()
            });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected:', reason);
            this.isConnected = false;
            this.emitToListeners('disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error.message);
            this.isConnected = false;
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.log('⛔ Max connection attempts reached');
                this.emitToListeners('connection:failed', {
                    error: error.message,
                    attempts: this.reconnectAttempts
                });
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log(`🔄 Reconnected on attempt ${attemptNumber}`);
            this.isConnected = true;
            this.reconnectAttempts = 0;

            // Re-join rooms after reconnection
            if (this.userId) {
                this.joinDashboard(this.userId);
                if (this.resumeId) {
                    this.joinResume(this.resumeId, this.userId);
                }
            }

            this.emitToListeners('reconnected', { attemptNumber });
        });

        this.socket.on('reconnect_attempt', (attemptNumber) => {
            console.log(`🔁 Reconnection attempt ${attemptNumber}`);
        });

        this.socket.on('reconnect_error', (error) => {
            console.error('❌ Reconnection error:', error);
        });

        this.socket.on('reconnect_failed', () => {
            console.error('⛔ Reconnection failed');
            this.isConnected = false;
            this.emitToListeners('reconnect:failed');
        });

        // Server event handlers - matching your backend
        this.socket.on('dashboard-joined', (data) => {
            console.log('📊 Dashboard joined:', data);
            this.emitToListeners('dashboard:joined', data);
        });

        this.socket.on('live-resume-created', (data) => {
            console.log('📝 Live resume created:', data);
            this.emitToListeners('live:resume:created', data);
        });

        this.socket.on('resume-changed', (data) => {
            console.log('📤 Resume changed:', data.action, data.resumeId);
            this.emitToListeners('resume:changed', data);
        });

        this.socket.on('resume-updated', (data) => {
            this.emitToListeners('resume:updated', data);
        });

        this.socket.on('parse-progress', (data) => {
            this.emitToListeners('parse:progress', data);
        });

        this.socket.on('parse-complete', (data) => {
            this.emitToListeners('parse:complete', data);
        });

        this.socket.on('import-completed', (data) => {
            this.emitToListeners('import:completed', data);
        });

        this.socket.on('resume-joined', (data) => {
            this.emitToListeners('resume:joined', data);
        });

        this.socket.on('cursor-update', (data) => {
            this.emitToListeners('cursor:update', data);
        });

        this.socket.on('new-comment', (data) => {
            this.emitToListeners('comment:new', data);
        });

        this.socket.on('comment-added', (data) => {
            this.emitToListeners('comment:added', data);
        });

        this.socket.on('dashboard-stats', (data) => {
            this.emitToListeners('dashboard:stats', data);
        });

        this.socket.on('admin-notification', (data) => {
            this.emitToListeners('admin:notification', data);
        });

        this.socket.on('error', (data) => {
            console.error('Socket error:', data);
            this.emitToListeners('socket:error', data);
        });

        this.socket.on('pong', (data) => {
            this.emitToListeners('pong', data);
        });
    }

    // Join dashboard room
    joinDashboard(userId) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot join dashboard: Socket not connected');
            return false;
        }

        this.socket.emit('join-dashboard', { userId });
        return true;
    }

    // Join resume room
    joinResume(resumeId, userId, userName = 'User') {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot join resume: Socket not connected');
            return false;
        }

        this.socket.emit('join-resume', { resumeId, userId, userName });
        return true;
    }

    // Create live resume session
    createLiveResume(userId, userEmail, userName) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot create live resume: Socket not connected');
            return false;
        }

        this.socket.emit('create-live', { userId, userEmail, userName });
        return true;
    }

    // Update resume data
    updateResume(data) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot update resume: Socket not connected');
            return false;
        }

        this.socket.emit('resume-update', data);
        return true;
    }

    // Parse and fill imported file
    parseFile({ userId, fileName, fileType, fileSize }) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot parse file: Socket not connected');
            return false;
        }

        this.socket.emit('parse-fill', { userId, fileName, fileType, fileSize });
        return true;
    }

    // Send cursor position
    sendCursorMove({ resumeId, userId, userName, position, selection }) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot send cursor: Socket not connected');
            return false;
        }

        this.socket.emit('cursor-move', { resumeId, userId, userName, position, selection });
        return true;
    }

    // Add comment
    addComment({ resumeId, userId, userName, comment, section, selection }) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot add comment: Socket not connected');
            return false;
        }

        this.socket.emit('add-comment', { resumeId, userId, userName, comment, section, selection });
        return true;
    }

    // Leave resume room
    leaveResume(resumeId, userId) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot leave resume: Socket not connected');
            return false;
        }

        this.socket.emit('leave-resume', { resumeId, userId });
        return true;
    }

    // Track user activity
    trackActivity({ userId, activity, page, resumeId = null }) {
        if (!this.socket || !this.isConnected) {
            console.warn('⚠️ Cannot track activity: Socket not connected');
            return false;
        }

        this.socket.emit('user-activity', { userId, activity, page, resumeId });
        return true;
    }

    // Ping server
    ping() {
        if (!this.socket || !this.isConnected) {
            return false;
        }

        this.socket.emit('ping');
        return true;
    }

    // Subscribe to events
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            const eventListeners = this.listeners.get(event);
            if (eventListeners) {
                eventListeners.delete(callback);
                if (eventListeners.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }

    // Emit to listeners
    emitToListeners(event, data) {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in ${event} listener:`, error);
                }
            });
        }
    }

    // Get connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            socketId: this.socket?.id,
            userId: this.userId,
            resumeId: this.resumeId,
            reconnectAttempts: this.reconnectAttempts
        };
    }

    // Disconnect socket
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.isConnected = false;
            this.listeners.clear();
            this.userId = null;
            this.resumeId = null;
            console.log('🔌 Socket disconnected and cleaned up');
        }
    }

    // Reconnect manually
    reconnect() {
        if (this.socket) {
            this.socket.connect();
        }
    }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;