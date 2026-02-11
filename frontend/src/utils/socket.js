// src/utils/socket.js - UPDATED VERSION
import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this._isConnected = false; // Internal connection state
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.resumeId = null;
    this.userId = null;
  }

  // ✅ Fixed: Proper connection check method
  isConnected() {
    return this._isConnected && this.socket && this.socket.connected;
  }

  initialize(options = {}) {
    const {
      userId,
      userName = 'Anonymous',
      userEmail = '',
      autoConnect = true,
      joinDashboard = false,
      joinBuilder = false
    } = options;

    try {
      // Create socket connection
      this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        query: {
          userId,
          userName,
          userEmail,
          joinDashboard,
          joinBuilder,
          timestamp: Date.now()
        }
      });

      // Setup event listeners
      this.setupEventListeners();

      if (autoConnect) {
        this.connect();
      }

      return this;
    } catch (error) {
      console.error('Socket initialization failed:', error);
      this.emitMockEvents();
      return this;
    }
  }

  setupEventListeners() {
    if (!this.socket) {
      return;
    }

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this._isConnected = true;
      this.reconnectAttempts = 0;
      this.emitEvent('connected', { socketId: this.socket.id, connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this._isConnected = false;
      this.emitEvent('disconnected', { reason });

      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emitEvent('connection_error', { error: error.message });
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnect attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
      this.emitEvent('reconnect_attempt', { attempt: attemptNumber });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected successfully');
      this._isConnected = true;
      this.emitEvent('reconnected', { attempt: attemptNumber });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed');
      this._isConnected = false;
      this.emitEvent('reconnect_failed');
    });

    // Application events
    this.socket.on('dashboard:stats', (data) => {
      this.emitEvent('dashboard:stats', data);
    });

    this.socket.on('resume:changed', (data) => {
      this.emitEvent('resume:changed', data);
    });

    this.socket.on('builder:stats', (data) => {
      this.emitEvent('builder:stats', data);
    });

    this.socket.on('builder:activity', (data) => {
      this.emitEvent('builder:activity', data);
    });

    this.socket.on('builder:collaboration:invite', (data) => {
      this.emitEvent('builder:collaboration:invite', data);
    });

    this.socket.on('builder:connection:quality', (data) => {
      this.emitEvent('builder:connection:quality', data);
    });

    // ✅ NEW: Resume collaboration events
    this.socket.on('resume:updated', (data) => {
      this.emitEvent('resume-updated', data);
    });

    this.socket.on('collaborators:updated', (data) => {
      this.emitEvent('collaborators-updated', data);
    });
  }

  connect(authData = null) {
    if (authData) {
      this.userId = authData.userId;
      this.resumeId = authData.resumeId;
    }

    if (this.socket && !this._isConnected) {
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this._isConnected = false;
      this.resumeId = null;
      this.userId = null;
    }
  }

  reconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected()) {
      this.socket.emit(event, data);
    } else {
      console.warn(`Socket not connected, cannot emit: ${event}`, data);
    }
  }

  // ✅ NEW: Resume-specific emit method
  emitResumeUpdate(section, data, user) {
    if (!this.isConnected() || !user || !this.resumeId) {
      console.warn('Cannot emit resume update:', {
        connected: this.isConnected(),
        hasUser: !!user,
        resumeId: this.resumeId
      });
      return false;
    }

    const updateData = {
      section,
      data,
      resumeId: this.resumeId,
      userId: user.id,
      userName: user.name || 'Anonymous',
      timestamp: new Date().toISOString()
    };

    this.emit('resume-update', updateData);
    return true;
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  off(event, callback) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  // Mock methods for when socket is not available
  emitMockEvents() {
    console.log('⚠️ Using mock socket connection');
    setTimeout(() => {
      this.emitEvent('connected', { socketId: 'mock-socket-id', connected: true });
    }, 500);

    // Simulate periodic stats updates
    setInterval(() => {
      this.emitEvent('dashboard:stats', {
        onlineUsers: Math.floor(Math.random() * 50) + 10,
        activeSessions: Math.floor(Math.random() * 20) + 5,
        resumesCreatedToday: Math.floor(Math.random() * 100) + 20
      });
    }, 30000);
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected(),
      socketId: this.socket?.id,
      resumeId: this.resumeId,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  trackActivity(data) {
    this.emit('activity:track', {
      ...data,
      timestamp: new Date().toISOString()
    });
    return true;
  }

  joinDashboard() {
    this.emit('dashboard:join', { timestamp: new Date().toISOString() });
    return true;
  }

  // Builder specific methods
  emitBuilderStart(data) {
    this.emit('builder:resume:create_start', data);
  }

  emitBuilderSuccess(data) {
    this.emit('builder:resume:create_success', data);
  }

  emitBuilderError(data) {
    this.emit('builder:resume:create_error', data);
  }

  requestBuilderHelp() {
    this.emit('builder:request:help', {
      timestamp: new Date().toISOString()
    });
  }
}

// Create singleton instance
const socketManager = new SocketManager();

// Export both the instance and the class
export default socketManager;
export { SocketManager };