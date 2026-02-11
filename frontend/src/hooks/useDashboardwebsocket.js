// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for managing WebSocket connections with auto-reconnect, heartbeat, and error handling
 * @param {string} userId - Current user ID for authentication
 * @param {Object} options - Configuration options
 * @param {Function} options.onStatsUpdate - Callback for dashboard stats updates
 * @param {Function} options.onNotification - Callback for real-time notifications
 * @param {Function} options.onResumeUpdate - Callback for resume updates
 * @param {number} options.reconnectInterval - Reconnect interval in ms (default: 5000)
 * @param {number} options.heartbeatInterval - Heartbeat interval in ms (default: 30000)
 * @param {number} options.maxReconnectAttempts - Max reconnect attempts (default: 10)
 */
export const useWebSocket = (userId, options = {}) => {
  const {
    onStatsUpdate,
    onNotification,
    onResumeUpdate,
    reconnectInterval = 5000,
    heartbeatInterval = 30000,
    maxReconnectAttempts = 10,
  } = options;

  // Refs
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const isMountedRef = useRef(true);

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
  const [latency, setLatency] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  // Get WebSocket URL
  const getWebSocketUrl = useCallback(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    const wsUrl = backendUrl.replace(/^http/, 'ws');

    // Add userId to query params for easier debugging
    return `${wsUrl}/ws?userId=${userId || 'anonymous'}&clientId=${Date.now()}`;
  }, [userId]);

  // Send heartbeat
  const sendHeartbeat = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const heartbeatId = Date.now();
      socketRef.current.send(JSON.stringify({
        type: 'heartbeat',
        id: heartbeatId,
        timestamp: Date.now(),
      }));

      // Store heartbeat time for latency calculation
      window.__lastHeartbeat = heartbeatId;
    }
  }, []);

  // Calculate latency
  const calculateLatency = useCallback((heartbeatId) => {
    if (window.__lastHeartbeat === heartbeatId) {
      const now = Date.now();
      const sentAt = parseInt(heartbeatId, 10);
      const calculatedLatency = now - sentAt;
      setLatency(calculatedLatency);
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      setLastMessageTime(Date.now());
      setMessageCount(prev => prev + 1);

      // Handle different message types
      switch (data.type) {
      case 'heartbeat_ack':
        calculateLatency(data.id);
        break;

      case 'dashboard-stats':
        onStatsUpdate?.(data);
        break;

      case 'notification':
        onNotification?.(data);
        if (data.showToast !== false) {
          toast[data.severity || 'success'](data.message, {
            duration: data.duration || 4000,
          });
        }
        break;

      case 'resume-update':
        onResumeUpdate?.(data);
        break;

      case 'user-presence':
        // Handle user presence updates
        break;

      case 'error':
        console.error('WebSocket error from server:', data.message);
        setError(data.message);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [onStatsUpdate, onNotification, onResumeUpdate, calculateLatency]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Clean up any existing connection
    disconnect();

    try {
      setConnectionStatus('connecting');
      setError(null);

      const wsUrl = getWebSocketUrl();
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      // Connection opened
      socket.onopen = () => {
        if (!isMountedRef.current) {
          socket.close();
          return;
        }

        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Send authentication
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        socket.send(JSON.stringify({
          type: 'auth',
          userId,
          token,
          clientInfo: {
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }
        }));

        // Start heartbeat
        heartbeatTimerRef.current = setInterval(sendHeartbeat, heartbeatInterval);
        sendHeartbeat(); // Send initial heartbeat
      };

      // Connection closed
      socket.onclose = (event) => {
        if (!isMountedRef.current) {
          return;
        }

        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Clean up heartbeat
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }

        // Attempt reconnect if not a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
          scheduleReconnect();
        }
      };

      // Connection error
      socket.onerror = (error) => {
        if (!isMountedRef.current) {
          return;
        }

        console.error('❌ WebSocket error:', error);
        setError('Connection failed');
        setConnectionStatus('error');
      };

      // Handle messages
      socket.onmessage = handleMessage;

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      setError(error.message);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  }, [userId, getWebSocketUrl, handleMessage, sendHeartbeat, heartbeatInterval]);

  // Schedule reconnect
  const scheduleReconnect = useCallback(() => {
    if (!isMountedRef.current) {
      return;
    }
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      setError('Unable to connect. Please refresh the page.');
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1), 30000);

    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current} in ${delay}ms`);

    reconnectTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        connect();
      }
    }, delay);
  }, [connect, reconnectInterval, maxReconnectAttempts]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    // Clear timers
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    // Close socket
    if (socketRef.current) {
      socketRef.current.close(1000, 'Client disconnected');
      socketRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttemptsRef.current = 0;
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((type, data = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type,
        ...data,
        timestamp: Date.now(),
        userId,
      };
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, [userId]);

  // Reconnect manually
  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // Subscribe to specific channel
  const subscribe = useCallback((channel, params = {}) => {
    return sendMessage('subscribe', { channel, ...params });
  }, [sendMessage]);

  // Unsubscribe from channel
  const unsubscribe = useCallback((channel) => {
    return sendMessage('unsubscribe', { channel });
  }, [sendMessage]);

  // Update user presence
  const updatePresence = useCallback((status = 'online', activity = null) => {
    return sendMessage('presence', { status, activity });
  }, [sendMessage]);

  // Effect for initial connection
  useEffect(() => {
    isMountedRef.current = true;

    if (userId) {
      connect();
    }

    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [userId, connect, disconnect]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network back online');
      if (!isConnected && userId) {
        reconnect();
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
      setError('Network connection lost');
      setConnectionStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, userId, reconnect]);

  // Debug logging
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log(`WebSocket Status: ${connectionStatus}, Connected: ${isConnected}, Latency: ${latency}ms`);
    }
  }, [connectionStatus, isConnected, latency]);

  // Return hook API
  return useMemo(() => ({
    // State
    isConnected,
    error,
    connectionStatus,
    latency,
    lastMessageTime,
    messageCount,
    reconnectAttempts: reconnectAttemptsRef.current,

    // Actions
    connect,
    disconnect,
    reconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    updatePresence,

    // Derived state
    isConnecting: connectionStatus === 'connecting',
    isError: connectionStatus === 'error',
    isDisconnected: connectionStatus === 'disconnected',

    // Helper functions
    getStatus: () => connectionStatus,
    getLatency: () => latency,
    getMessageCount: () => messageCount,

    // Debug info
    _debug: {
      socket: socketRef.current,
      url: getWebSocketUrl(),
    },
  }), [
    isConnected,
    error,
    connectionStatus,
    latency,
    lastMessageTime,
    messageCount,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    updatePresence,
    getWebSocketUrl,
  ]);
};

/**
 * Hook for subscribing to specific dashboard events
 */
export const useDashboardWebSocket = (userId, options = {}) => {
  const [stats, setStats] = useState({
    onlineUsers: 0,
    activeSessions: 0,
    activeResumes: 0,
    recentActivity: [],
  });

  const [notifications, setNotifications] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleStatsUpdate = useCallback((data) => {
    setStats(prev => ({
      ...prev,
      ...data,
      updatedAt: Date.now(),
    }));
  }, []);

  const handleNotification = useCallback((data) => {
    setNotifications(prev => {
      const newNotification = {
        id: data.id || Date.now(),
        type: data.type || 'info',
        message: data.message,
        timestamp: data.timestamp || Date.now(),
        read: false,
        ...data,
      };

      // Keep only last 50 notifications
      return [newNotification, ...prev.slice(0, 49)];
    });
  }, []);

  const ws = useWebSocket(userId, {
    onStatsUpdate: handleStatsUpdate,
    onNotification: handleNotification,
    ...options,
  });

  // Subscribe to dashboard channel
  useEffect(() => {
    if (ws.isConnected && !isSubscribed) {
      const subscribed = ws.subscribe('dashboard', {
        topics: ['stats', 'notifications', 'presence'],
      });
      setIsSubscribed(subscribed);
    }
  }, [ws.isConnected, ws.subscribe, isSubscribed]);

  // Unsubscribe on cleanup
  useEffect(() => {
    return () => {
      if (isSubscribed) {
        ws.unsubscribe('dashboard');
      }
    };
  }, [isSubscribed, ws.unsubscribe]);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  }, []);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notif => !notif.read);
  }, [notifications]);

  return {
    // WebSocket state
    ...ws,

    // Dashboard specific state
    stats,
    notifications,
    unreadNotifications: getUnreadNotifications(),
    isSubscribed,

    // Dashboard actions
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshStats: () => ws.sendMessage('refresh-stats'),

    // Helper functions
    getActiveUsers: () => stats.onlineUsers,
    getRecentActivity: (limit = 10) => stats.recentActivity.slice(0, limit),
  };
};

/**
 * Hook for resume-specific WebSocket events
 */
export const useResumeWebSocket = (userId, resumeId, options = {}) => {
  const [resumeUpdates, setResumeUpdates] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleResumeUpdate = useCallback((data) => {
    setResumeUpdates(prev => {
      const update = {
        id: data.updateId || Date.now(),
        type: data.updateType || 'update',
        userId: data.userId,
        timestamp: data.timestamp || Date.now(),
        changes: data.changes || {},
        ...data,
      };

      return [update, ...prev.slice(0, 49)];
    });
  }, []);

  const ws = useWebSocket(userId, {
    onResumeUpdate: handleResumeUpdate,
    ...options,
  });

  // Subscribe to resume channel
  useEffect(() => {
    if (ws.isConnected && resumeId && !isSubscribed) {
      const subscribed = ws.subscribe(`resume:${resumeId}`, {
        includeCollaborators: true,
        includeHistory: true,
      });
      setIsSubscribed(subscribed);
    }
  }, [ws.isConnected, ws.subscribe, resumeId, isSubscribed]);

  // Unsubscribe on cleanup
  useEffect(() => {
    return () => {
      if (isSubscribed) {
        ws.unsubscribe(`resume:${resumeId}`);
      }
    };
  }, [isSubscribed, ws.unsubscribe, resumeId]);

  const sendResumeUpdate = useCallback((changes, metadata = {}) => {
    return ws.sendMessage('resume-update', {
      resumeId,
      changes,
      metadata,
    });
  }, [ws.sendMessage, resumeId]);

  const inviteCollaborator = useCallback((email, role = 'editor') => {
    return ws.sendMessage('invite-collaborator', {
      resumeId,
      email,
      role,
    });
  }, [ws.sendMessage, resumeId]);

  const removeCollaborator = useCallback((userId) => {
    return ws.sendMessage('remove-collaborator', {
      resumeId,
      userId,
    });
  }, [ws.sendMessage, resumeId]);

  return {
    // WebSocket state
    ...ws,

    // Resume specific state
    resumeUpdates,
    collaborators,
    isSubscribed,

    // Resume actions
    sendResumeUpdate,
    inviteCollaborator,
    removeCollaborator,

    // Helper functions
    getRecentUpdates: (limit = 20) => resumeUpdates.slice(0, limit),
    getCollaboratorCount: () => collaborators.length,
  };
};

/**
 * Mock WebSocket implementation for development/testing
 */
export const useMockWebSocket = (userId, options = {}) => {
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(50);
  const [messageCount, setMessageCount] = useState(0);

  const mockStatsInterval = useRef(null);

  // Simulate incoming messages
  useEffect(() => {
    if (import.meta.env.DEV && options.useMock) {
      // Simulate stats updates
      mockStatsInterval.current = setInterval(() => {
        options.onStatsUpdate?.({
          onlineUsers: Math.floor(Math.random() * 100) + 50,
          activeSessions: Math.floor(Math.random() * 20) + 10,
          activeResumes: Math.floor(Math.random() * 15) + 5,
          recentActivity: [],
        });

        // Simulate occasional notifications
        if (Math.random() > 0.8) {
          options.onNotification?.({
            type: 'info',
            message: 'Mock notification from dev server',
            timestamp: Date.now(),
          });
        }

        setMessageCount(prev => prev + 1);
        setLatency(Math.floor(Math.random() * 100) + 20);
      }, 10000);

      return () => {
        if (mockStatsInterval.current) {
          clearInterval(mockStatsInterval.current);
        }
      };
    }
  }, [options.useMock, options.onStatsUpdate, options.onNotification]);

  const sendMessage = useCallback(() => {
    return true;
  }, []);

  const subscribe = useCallback(() => {
    return true;
  }, []);

  const unsubscribe = useCallback(() => {
    return true;
  }, []);

  const reconnect = useCallback(() => {
    setIsConnected(true);
    setError(null);
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    error,
    connectionStatus: 'connected',
    latency,
    lastMessageTime: Date.now(),
    messageCount,
    reconnectAttempts: 0,

    connect: reconnect,
    disconnect,
    reconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    updatePresence: () => true,

    isConnecting: false,
    isError: false,
    isDisconnected: false,
  };
};

// Export default hook with environment detection
export default function useWebSocketHook(userId, options = {}) {
  // Use mock in development if specified or if backend URL is not set
  const useMock = import.meta.env.DEV &&
        (!import.meta.env.VITE_BACKEND_URL || options.useMock !== false);

  if (useMock) {
    return useMockWebSocket(userId, { ...options, useMock: true });
  }

  return useWebSocket(userId, options);
}