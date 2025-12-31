import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sun, Moon, Palette, Monitor,
    Settings, Sparkles
} from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

// Theme Provider Component
export const ThemeProvider = ({ children, defaultTheme = 'light' }) => {
    const [theme, setTheme] = useState(() => {
        // Try to get from localStorage first
        const savedTheme = localStorage.getItem('resume-builder-theme');
        return savedTheme || defaultTheme;
    });

    // Apply theme to document
    useEffect(() => {
        // Remove all theme classes
        document.documentElement.classList.remove('light-theme', 'dark-theme', 'blue-theme', 'system-theme');

        // Add current theme class
        document.documentElement.classList.add(`${theme}-theme`);

        // Set data-theme attribute
        document.documentElement.setAttribute('data-theme', theme);

        // Store in localStorage
        localStorage.setItem('resume-builder-theme', theme);
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

            const handleChange = (e) => {
                if (e.matches) {
                    document.documentElement.classList.add('dark-theme');
                    document.documentElement.classList.remove('light-theme');
                } else {
                    document.documentElement.classList.add('light-theme');
                    document.documentElement.classList.remove('dark-theme');
                }
            };

            // Set initial state
            handleChange(mediaQuery);

            // Listen for changes
            mediaQuery.addEventListener('change', handleChange);

            // Cleanup
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const value = {
        theme,
        setTheme,
        toggleTheme: () => {
            const themes = ['light', 'dark', 'blue', 'system'];
            const currentIndex = themes.indexOf(theme);
            const nextIndex = (currentIndex + 1) % themes.length;
            setTheme(themes[nextIndex]);
        }
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook to use theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Main ThemeToggle Component
const ThemeToggle = ({
    size = 'medium',
    className = '',
    showPreview = false,
    standalone = false
}) => {
    const { theme, setTheme, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Theme configurations
    const themes = [
        {
            id: 'light',
            icon: Sun,
            label: 'Light',
            color: '#f59e0b',
            bg: '#fef3c7',
            border: '#fbbf24',
            gradient: 'linear-gradient(135deg, #fef3c7, #fde68a)'
        },
        {
            id: 'dark',
            icon: Moon,
            label: 'Dark',
            color: '#818cf8',
            bg: '#1e1b4b',
            border: '#4f46e5',
            gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)'
        },
        {
            id: 'blue',
            icon: Palette,
            label: 'Blue',
            color: '#3b82f6',
            bg: '#dbeafe',
            border: '#93c5fd',
            gradient: 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
        },
        {
            id: 'system',
            icon: Monitor,
            label: 'System',
            color: '#6b7280',
            bg: '#f3f4f6',
            border: '#d1d5db',
            gradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
        }
    ];

    const currentThemeConfig = themes.find(t => t.id === theme) || themes[0];
    const CurrentIcon = currentThemeConfig.icon;

    // Size configurations
    const sizeConfig = {
        small: {
            button: '36px',
            icon: 16,
            popup: '240px',
            fontSize: '12px'
        },
        medium: {
            button: '44px',
            icon: 18,
            popup: '280px',
            fontSize: '14px'
        },
        large: {
            button: '52px',
            icon: 20,
            popup: '320px',
            fontSize: '16px'
        }
    };

    const { button: buttonSize, icon: iconSize, popup: popupWidth, fontSize } = sizeConfig[size];

    const handleThemeChange = (themeId) => {
        setIsAnimating(true);
        setTheme(themeId);
        setTimeout(() => {
            setIsAnimating(false);
            setIsOpen(false);
        }, 400);
    };

    const handleQuickToggle = () => {
        toggleTheme();
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 400);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.theme-toggle-container')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    // Standalone mode - just the toggle without context
    if (standalone) {
        return (
            <button
                onClick={handleQuickToggle}
                style={{
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: '12px',
                    backgroundColor: currentThemeConfig.bg,
                    border: `1px solid ${currentThemeConfig.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: 'none'
                }}
                aria-label={`Switch theme (current: ${theme})`}
            >
                <CurrentIcon
                    size={iconSize}
                    style={{ color: currentThemeConfig.color }}
                />
            </button>
        );
    }

    return (
        <div
            className={`theme-toggle-container ${className}`}
            style={{
                position: 'relative',
                display: 'inline-block',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
        >
            {/* Main Toggle Button */}
            <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <motion.button
                    onClick={handleQuickToggle}
                    style={{
                        width: buttonSize,
                        height: buttonSize,
                        borderRadius: '12px',
                        backgroundColor: currentThemeConfig.bg,
                        border: `1px solid ${currentThemeConfig.border}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        outline: 'none'
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Switch theme (current: ${theme})`}
                    aria-expanded={isOpen}
                >
                    {/* Animation Background */}
                    {isAnimating && (
                        <motion.div
                            animate={{
                                rotate: 360,
                                scale: [1, 1.5, 1]
                            }}
                            transition={{ duration: 0.4 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                background: `linear-gradient(135deg, ${currentThemeConfig.bg}, ${currentThemeConfig.color}20)`
                            }}
                        />
                    )}

                    {/* Hover Effect */}
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.2)'
                            }}
                        />
                    )}

                    {/* Icon */}
                    <motion.div
                        key={theme}
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{
                            type: "spring",
                            damping: 15,
                            stiffness: 200
                        }}
                        style={{ position: 'relative', zIndex: 10 }}
                    >
                        <CurrentIcon
                            size={iconSize}
                            style={{ color: currentThemeConfig.color }}
                        />
                    </motion.div>
                </motion.button>

                {/* Settings Button */}
                <motion.button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    animate={{
                        scale: isOpen ? 0.9 : 1,
                        rotate: isOpen ? 180 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'absolute',
                        bottom: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 20,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        outline: 'none'
                    }}
                    aria-label="Theme options"
                    aria-expanded={isOpen}
                >
                    <Settings
                        size={12}
                        style={{
                            color: isOpen ? '#4f46e5' : '#6b7280'
                        }}
                    />
                </motion.button>
            </div>

            {/* Theme Selector Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                zIndex: 40
                            }}
                        />

                        {/* Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                damping: 25,
                                stiffness: 300
                            }}
                            style={{
                                position: 'absolute',
                                top: '100%',
                                marginTop: '12px',
                                right: 0,
                                width: popupWidth,
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                                border: '1px solid #e5e7eb',
                                zIndex: 50,
                                overflow: 'hidden',
                                backdropFilter: 'blur(20px)',
                                background: 'rgba(255, 255, 255, 0.95)'
                            }}
                            role="menu"
                            aria-label="Theme selection menu"
                        >
                            {/* Header */}
                            <div style={{
                                padding: '16px',
                                borderBottom: '1px solid #f3f4f6'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            padding: '8px',
                                            background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
                                            borderRadius: '10px'
                                        }}>
                                            <Sparkles size={16} style={{ color: '#4f46e5' }} />
                                        </div>
                                        <div>
                                            <h4 style={{
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: '#111827',
                                                margin: 0
                                            }}>
                                                Theme
                                            </h4>
                                            <p style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                margin: '2px 0 0 0'
                                            }}>
                                                Choose your visual style
                                            </p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ rotate: 90 }}
                                        onClick={() => setIsOpen(false)}
                                        style={{
                                            padding: '6px',
                                            color: '#9ca3af',
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            outline: 'none'
                                        }}
                                        aria-label="Close theme menu"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path
                                                d="M12 4L4 12M4 4L12 12"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Theme Options */}
                            <div style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {themes.map((themeItem) => {
                                        const Icon = themeItem.icon;
                                        const isActive = themeItem.id === theme;

                                        return (
                                            <motion.button
                                                key={themeItem.id}
                                                onClick={() => handleThemeChange(themeItem.id)}
                                                whileHover={{ x: 4 }}
                                                whileTap={{ scale: 0.98 }}
                                                style={{
                                                    width: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '12px',
                                                    borderRadius: '12px',
                                                    border: isActive ? `1px solid ${themeItem.border}` : '1px solid transparent',
                                                    backgroundColor: isActive ? themeItem.bg : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    outline: 'none'
                                                }}
                                                aria-checked={isActive}
                                                aria-label={`Select ${themeItem.label} theme`}
                                            >
                                                {/* Icon */}
                                                <motion.div
                                                    animate={isActive ? {
                                                        rotate: [0, 360],
                                                        transition: { duration: 0.5 }
                                                    } : {}}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        backgroundColor: isActive ? 'white' : '#f9fafb',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Icon
                                                        size={16}
                                                        style={{
                                                            color: isActive ? themeItem.color : '#6b7280'
                                                        }}
                                                    />
                                                </motion.div>

                                                {/* Theme Info */}
                                                <div style={{
                                                    flex: 1,
                                                    textAlign: 'left',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between'
                                                }}>
                                                    <div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            fontWeight: isActive ? 600 : 500,
                                                            color: isActive ? '#111827' : '#374151'
                                                        }}>
                                                            {themeItem.label}
                                                        </div>
                                                    </div>

                                                    {/* Active Indicator */}
                                                    {isActive && (
                                                        <motion.div
                                                            layoutId="activeTheme"
                                                            style={{
                                                                width: '8px',
                                                                height: '8px',
                                                                borderRadius: '50%',
                                                                backgroundColor: themeItem.color
                                                            }}
                                                            aria-hidden="true"
                                                        />
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Preview Section - Optional */}
                                {showPreview && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '12px'
                                        }}>
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                color: '#374151'
                                            }}>
                                                Preview
                                            </span>
                                            <span style={{
                                                fontSize: '12px',
                                                color: '#6b7280'
                                            }}>
                                                {currentThemeConfig.label}
                                            </span>
                                        </div>

                                        {/* Preview Cards */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                height: '64px',
                                                background: currentThemeConfig.gradient,
                                                borderRadius: '8px',
                                                border: `1px solid ${currentThemeConfig.border}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '6px',
                                                        backgroundColor: `${currentThemeConfig.color}40`,
                                                        borderRadius: '3px',
                                                        margin: '0 auto 4px auto'
                                                    }}></div>
                                                    <div style={{
                                                        width: '16px',
                                                        height: '4px',
                                                        backgroundColor: `${currentThemeConfig.color}20`,
                                                        borderRadius: '2px',
                                                        margin: '0 auto'
                                                    }}></div>
                                                </div>
                                            </div>

                                            <div style={{
                                                height: '64px',
                                                backgroundColor: currentThemeConfig.color,
                                                borderRadius: '8px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    color: 'white'
                                                }}>
                                                    Button
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ThemeToggle;
export { ThemeProvider, useTheme };