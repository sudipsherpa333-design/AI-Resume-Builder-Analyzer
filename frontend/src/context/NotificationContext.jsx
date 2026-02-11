// frontend/src/context/NotificationContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Define notification types
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

// Create notification context
const NotificationContext = createContext({});

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Process notification queue
  const processQueue = useCallback(() => {
    if (isProcessing || notificationQueue.length === 0) {
      return;
    }

    setIsProcessing(true);
    const [nextNotification, ...remainingQueue] = notificationQueue;

    const showNotification = () => {
      let toastId;

      switch (nextNotification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        toastId = toast.success(nextNotification.message, {
          id: nextNotification.id,
          duration: nextNotification.duration || 4000,
          position: 'top-right',
          style: {
            background: '#10b981',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: '500',
          },
          icon: '🎉',
        });
        break;

      case NOTIFICATION_TYPES.ERROR:
        toastId = toast.error(nextNotification.message, {
          id: nextNotification.id,
          duration: nextNotification.duration || 5000,
          position: 'top-right',
          style: {
            background: '#ef4444',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: '500',
          },
          icon: '⚠️',
        });
        break;

      case NOTIFICATION_TYPES.WARNING:
        toastId = toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                            max-w-md w-full bg-yellow-50 dark:bg-yellow-900/20 shadow-lg rounded-lg pointer-events-auto 
                            flex ring-1 ring-black ring-opacity-5 border-l-4 border-yellow-400`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800 
                                            flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-200 text-lg">⚠️</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {nextNotification.title || 'Warning'}
                  </p>
                  <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-300">
                    {nextNotification.message}
                  </p>
                  {nextNotification.action && (
                    <button
                      onClick={() => {
                        nextNotification.action.onClick();
                        toast.dismiss(t.id);
                      }}
                      className="mt-2 text-sm font-medium text-yellow-700 dark:text-yellow-300 
                                                    hover:text-yellow-600 dark:hover:text-yellow-200"
                    >
                      {nextNotification.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-l border-yellow-200 dark:border-yellow-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 
                                        flex items-center justify-center text-sm font-medium text-yellow-600 
                                        dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300 
                                        focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                                    Close
              </button>
            </div>
          </div>
        ), {
          id: nextNotification.id,
          duration: nextNotification.duration || 5000,
        });
        break;

      case NOTIFICATION_TYPES.INFO:
        toastId = toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
                            max-w-md w-full bg-blue-50 dark:bg-blue-900/20 shadow-lg rounded-lg pointer-events-auto 
                            flex ring-1 ring-black ring-opacity-5 border-l-4 border-blue-400`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 
                                            flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-200 text-lg">ℹ️</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    {nextNotification.title || 'Information'}
                  </p>
                  <p className="mt-1 text-sm text-blue-600 dark:text-blue-300">
                    {nextNotification.message}
                  </p>
                  {nextNotification.action && (
                    <button
                      onClick={() => {
                        nextNotification.action.onClick();
                        toast.dismiss(t.id);
                      }}
                      className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300 
                                                    hover:text-blue-600 dark:hover:text-blue-200"
                    >
                      {nextNotification.action.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex border-l border-blue-200 dark:border-blue-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 
                                        flex items-center justify-center text-sm font-medium text-blue-600 
                                        dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                                    Close
              </button>
            </div>
          </div>
        ), {
          id: nextNotification.id,
          duration: nextNotification.duration || 4000,
        });
        break;

      case NOTIFICATION_TYPES.LOADING:
        toastId = toast.loading(nextNotification.message, {
          id: nextNotification.id,
          duration: Infinity,
          position: 'top-right',
          style: {
            background: '#3b82f6',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontWeight: '500',
          },
        });
        break;

      default:
        toastId = toast(nextNotification.message, {
          id: nextNotification.id,
          duration: 4000,
          position: 'top-right',
        });
      }

      // Add to notifications history
      setNotifications(prev => [
        {
          ...nextNotification,
          id: toastId,
          timestamp: new Date().toISOString(),
          isRead: false
        },
        ...prev.slice(0, 49) // Keep only last 50 notifications
      ]);

      // Remove from queue and continue processing
      setNotificationQueue(remainingQueue);
      setIsProcessing(false);

      // If there are more notifications in queue, process next one
      if (remainingQueue.length > 0) {
        setTimeout(processQueue, 500); // Delay between notifications
      }
    };

    // Add small delay to prevent notification stacking
    setTimeout(showNotification, 100);
  }, [notificationQueue, isProcessing]);

  // Process queue when it changes
  useEffect(() => {
    if (notificationQueue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [notificationQueue, isProcessing, processQueue]);

  // Show notification
  const showNotification = useCallback((type, message, options = {}) => {
    const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const notification = {
      id: notificationId,
      type,
      message,
      title: options.title,
      duration: options.duration,
      action: options.action,
      metadata: options.metadata || {},
      priority: options.priority || 0
    };

    // Add to queue based on priority
    setNotificationQueue(prev => {
      const newQueue = [...prev];
      if (options.priority > 0) {
        // Insert at beginning for high priority
        newQueue.unshift(notification);
      } else {
        // Add to end for normal priority
        newQueue.push(notification);
      }
      return newQueue;
    });

    return notificationId;
  }, []);

  // Success notification
  const success = useCallback((message, options = {}) => {
    return showNotification(NOTIFICATION_TYPES.SUCCESS, message, options);
  }, [showNotification]);

  // Error notification
  const error = useCallback((message, options = {}) => {
    return showNotification(NOTIFICATION_TYPES.ERROR, message, options);
  }, [showNotification]);

  // Warning notification
  const warning = useCallback((message, options = {}) => {
    return showNotification(NOTIFICATION_TYPES.WARNING, message, options);
  }, [showNotification]);

  // Info notification
  const info = useCallback((message, options = {}) => {
    return showNotification(NOTIFICATION_TYPES.INFO, message, options);
  }, [showNotification]);

  // Loading notification
  const loading = useCallback((message, options = {}) => {
    return showNotification(NOTIFICATION_TYPES.LOADING, message, options);
  }, [showNotification]);

  // Update notification (for loading states)
  const updateNotification = useCallback((id, options) => {
    if (options.type === NOTIFICATION_TYPES.LOADING) {
      toast.dismiss(id);
    }

    switch (options.type) {
    case NOTIFICATION_TYPES.SUCCESS:
      toast.success(options.message, {
        id,
        duration: options.duration || 4000,
      });
      break;
    case NOTIFICATION_TYPES.ERROR:
      toast.error(options.message, {
        id,
        duration: options.duration || 5000,
      });
      break;
    default:
      toast.dismiss(id);
      if (options.message) {
        toast(options.message, { id, duration: 4000 });
      }
    }

    // Update in notifications history
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? {
            ...notification,
            type: options.type,
            message: options.message,
            updatedAt: new Date().toISOString()
          }
          : notification
      )
    );
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((id) => {
    toast.dismiss(id);

    // Mark as read in notifications history
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true, dismissedAt: new Date().toISOString() }
          : notification
      )
    );
  }, []);

  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    toast.dismiss();

    // Mark all as read
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        isRead: true,
        dismissedAt: new Date().toISOString()
      }))
    );
  }, []);

  // Clear notifications history
  const clearHistory = useCallback(() => {
    setNotifications([]);
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        isRead: true
      }))
    );
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // API error handler
  const handleAPIError = useCallback((error, defaultMessage = 'An error occurred') => {
    let message = defaultMessage;

    if (error.response) {
      // Server responded with error
      const { data, status } = error.response;

      if (data && data.error) {
        message = data.error;
      } else if (data && data.message) {
        message = data.message;
      } else if (status === 401) {
        message = 'Session expired. Please login again.';
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        message = 'The requested resource was not found.';
      } else if (status === 429) {
        message = 'Too many requests. Please try again later.';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      // Request made but no response
      message = 'No response from server. Please check your connection.';
    } else {
      // Error in setting up request
      message = error.message || defaultMessage;
    }

    error(message, {
      title: 'Error',
      duration: 6000,
      priority: 1 // High priority for errors
    });

    return message;
  }, [error]);

  // Network status handler
  const handleNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine;

    if (!isOnline) {
      warning('You are currently offline. Some features may not work.', {
        title: 'Offline',
        duration: 10000,
        priority: 2
      });
    } else {
      success('Connection restored. You are back online.', {
        duration: 3000
      });
    }
  }, [warning, success]);

  // Set up network status listeners
  useEffect(() => {
    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    // Check initial network status
    if (!navigator.onLine) {
      handleNetworkStatus();
    }

    return () => {
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, [handleNetworkStatus]);

  // Auto-dismiss notifications after 30 minutes
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

      setNotifications(prev =>
        prev.filter(notification =>
          new Date(notification.timestamp) > thirtyMinutesAgo
        )
      );
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  // Context value
  const value = {
    // Notification methods
    success,
    error,
    warning,
    info,
    loading,
    updateNotification,
    dismissNotification,
    dismissAll,

    // Notifications history
    notifications,
    clearHistory,
    markAsRead,
    markAllAsRead,
    getUnreadCount,

    // Error handling
    handleAPIError,

    // Constants
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }

  return context;
};

// Helper HOC for withNotification
export const withNotification = (Component) => {
  return function WithNotificationComponent(props) {
    const notification = useNotification();
    return <Component {...props} notification={notification} />;
  };
};

export default NotificationContext;