import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, CheckCircle, AlertCircle, Clock,
  Cloud, RefreshCw, Upload, ChevronDown
} from 'lucide-react';

const SaveStatus = ({
  status = 'idle',
  lastSaved = null,
  onRetry = null,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  // Status configuration
  const statusConfig = {
    idle: {
      icon: Cloud,
      color: '#6b7280',
      bgColor: '#f9fafb',
      iconBg: '#f3f4f6',
      label: 'All changes saved',
      message: 'Your work is automatically saved',
      subtext: 'Auto-save enabled'
    },
    saving: {
      icon: Clock,
      color: '#d97706',
      bgColor: '#fffbeb',
      iconBg: '#fef3c7',
      label: 'Saving...',
      message: 'Saving your changes to cloud',
      subtext: 'Please wait',
      animated: true
    },
    saved: {
      icon: CheckCircle,
      color: '#059669',
      bgColor: '#ecfdf5',
      iconBg: '#d1fae5',
      label: 'Saved',
      message: 'All changes saved successfully',
      subtext: 'Ready to export',
      success: true
    },
    error: {
      icon: AlertCircle,
      color: '#dc2626',
      bgColor: '#fef2f2',
      iconBg: '#fee2e2',
      label: 'Save failed',
      message: 'Unable to save changes',
      subtext: 'Check your connection',
      error: true
    }
  };

  const config = statusConfig[status] || statusConfig.idle;
  const Icon = config.icon;

  // Simulate progress for saving state
  useEffect(() => {
    if (status === 'saving') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [status]);

  // Format time
  const formatTime = (date) => {
    if (!date) {
      return 'Never saved';
    }
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    if (hours < 24) {
      return `${hours}h ago`;
    }
    return new Date(date).toLocaleDateString();
  };

  const getTimeAgoText = (date) => {
    if (!date) {
      return 'Never saved';
    }
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) {
      return 'Just now';
    }
    if (minutes < 5) {
      return 'A few minutes ago';
    }
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    return formatTime(date);
  };

  return (
    <div style={{ position: 'relative' }} className={className}>
      {/* Main Status Button */}
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(!showDetails)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          backgroundColor: config.bgColor,
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
        whileTap={{ scale: 0.98 }}
        aria-label="Save status"
      >
        {/* Hover gradient */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              pointerEvents: 'none'
            }}
          />
        )}

        {/* Icon Container */}
        <motion.div
          animate={config.animated ? {
            rotate: 360,
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }
          } : {}}
          style={{
            position: 'relative',
            padding: '8px',
            backgroundColor: config.iconBg,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon
            size={18}
            style={{ color: config.color }}
          />

          {/* Success Badge */}
          {status === 'saved' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '12px',
                height: '12px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                border: '2px solid white'
              }}
            />
          )}
        </motion.div>

        {/* Text Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: 0,
          flex: 1
        }}>
          <motion.div
            key={status}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: config.color,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {config.label}
            </span>

            {/* Animated Dots */}
            {status === 'saving' && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ display: 'flex', gap: '4px' }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: config.color
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Subtext */}
          <motion.span
            key={lastSaved ? 'time' : 'default'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: '12px',
              color: '#6b7280',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {status === 'idle' ? getTimeAgoText(lastSaved) : config.subtext}
          </motion.span>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ color: '#9ca3af' }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      {/* Status Details Popup */}
      <AnimatePresence>
        {showDetails && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                zIndex: 40
              }}
            />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 300
              }}
              style={{
                position: 'absolute',
                top: '100%',
                marginTop: '12px',
                right: 0,
                width: '320px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e5e7eb',
                zIndex: 50,
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '20px',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: config.iconBg,
                    borderRadius: '12px'
                  }}>
                    <Icon size={20} style={{ color: config.color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#111827',
                      margin: 0
                    }}>
                      {config.label}
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      margin: '4px 0 0 0'
                    }}>
                      {config.message}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {status === 'saving' && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '8px'
                    }}>
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div style={{
                      height: '6px',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                          height: '100%',
                          backgroundColor: config.color,
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Last Saved */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: '#6b7280' }} />
                      <div>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#374151',
                          margin: 0
                        }}>
                                                    Last saved
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: '2px 0 0 0'
                        }}>
                          {lastSaved ? formatTime(lastSaved) : 'Never'}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#4b5563'
                    }}>
                      {getTimeAgoText(lastSaved)}
                    </span>
                  </div>

                  {/* Auto-save Status */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0369a1',
                        margin: 0
                      }}>
                                                Auto-save
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#0ea5e9',
                        margin: '2px 0 0 0'
                      }}>
                                                Saves every 2 seconds
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '24px',
                        backgroundColor: '#22c55e',
                        borderRadius: '12px',
                        position: 'relative'
                      }}>
                        <div style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '20px',
                          height: '20px',
                          backgroundColor: 'white',
                          borderRadius: '50%'
                        }} />
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#15803d'
                      }}>
                                                ON
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {status === 'error' && onRetry && (
                    <motion.button
                      onClick={() => {
                        onRetry();
                        setShowDetails(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <RefreshCw size={16} />
                                            Retry Save
                    </motion.button>
                  )}

                  {status === 'saved' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        padding: '12px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '12px',
                        border: '1px solid #bbf7d0',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <CheckCircle size={16} style={{ color: '#059669' }} />
                        <span style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#065f46'
                        }}>
                                                    Successfully saved!
                        </span>
                      </div>
                      <p style={{
                        fontSize: '12px',
                        color: '#047857',
                        margin: 0
                      }}>
                                                Your resume is ready to download or share
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                backgroundColor: '#f9fafb',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#6b7280' }}>Version 2.1.4</span>
                  <button style={{
                    color: '#4f46e5',
                    fontWeight: 500,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}>
                                        View history
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SaveStatus;