import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const profileDropdownRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
    };

    const toggleProfileDropdown = () => {
        setIsProfileDropdownOpen(!isProfileDropdownOpen);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const closeProfileDropdown = () => {
        setIsProfileDropdownOpen(false);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isActiveRoute = (path) => {
        return location.pathname === path;
    };

    // FIXED: Handle logo click - go to dashboard if authenticated, home if not
    const handleLogoClick = (e) => {
        if (isAuthenticated && location.pathname !== '/dashboard') {
            e.preventDefault();
            navigate('/dashboard');
        }
        // If not authenticated, let it go to home page naturally
    };

    // Navigation items for authenticated users
    const navItems = [
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: '📊',
            requiresAuth: true
        },
        {
            path: '/builder',
            label: 'Builder',
            icon: '🛠️',
            requiresAuth: true
        },
        {
            path: '/analyzer',
            label: 'Analyzer',
            icon: '🔍',
            requiresAuth: true
        },
        {
            path: '/templates',
            label: 'Templates',
            icon: '🎨',
            requiresAuth: true
        }
    ];

    // Public navigation items (only shown when not authenticated)
    const publicNavItems = [
        {
            path: '/',
            label: 'Home',
            icon: '🏠',
            requiresAuth: false
        },
        {
            path: '/features',
            label: 'Features',
            icon: '✨',
            requiresAuth: false
        },
        {
            path: '/pricing',
            label: 'Pricing',
            icon: '💰',
            requiresAuth: false
        }
    ];

    // Get navigation items based on authentication status
    const getNavItems = () => {
        if (isAuthenticated) {
            return navItems;
        }
        return publicNavItems;
    };

    const currentNavItems = getNavItems();

    // Styles
    const styles = {
        navbar: {
            background: isAuthenticated ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            padding: '1rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease',
            boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            backdropFilter: 'blur(10px)',
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        // FIXED: Logo with conditional navigation
        logo: {
            color: isAuthenticated ? 'white' : '#667eea',
            textDecoration: 'none',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
        },
        desktopNav: {
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
        },
        navItems: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        navItem: {
            color: isAuthenticated ? 'white' : '#4a5568',
            textDecoration: 'none',
            padding: '0.6rem 1.2rem',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: isAuthenticated ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            border: isAuthenticated ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        },
        activeNavItem: {
            background: isAuthenticated ? 'rgba(255, 255, 255, 0.2)' : '#f7fafc',
            border: isAuthenticated ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
            color: isAuthenticated ? 'white' : '#667eea',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        authButtons: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        loginBtn: {
            color: isAuthenticated ? 'white' : '#667eea',
            textDecoration: 'none',
            fontWeight: '500',
            padding: '0.6rem 1.2rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            border: `1px solid ${isAuthenticated ? 'rgba(255, 255, 255, 0.2)' : '#e2e8f0'}`,
        },
        registerBtn: {
            background: isAuthenticated ? 'white' : '#667eea',
            color: isAuthenticated ? '#667eea' : 'white',
            textDecoration: 'none',
            fontWeight: '600',
            padding: '0.6rem 1.5rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
        userSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            position: 'relative',
        },
        profileButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.9rem',
            fontWeight: '500',
        },
        userAvatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        },
        profileDropdown: {
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.1)',
            minWidth: '220px',
            overflow: 'hidden',
            zIndex: 1001,
            opacity: isProfileDropdownOpen ? 1 : 0,
            visibility: isProfileDropdownOpen ? 'visible' : 'hidden',
            transform: isProfileDropdownOpen ? 'translateY(0)' : 'translateY(-10px)',
            transition: 'all 0.3s ease',
        },
        dropdownHeader: {
            padding: '1.25rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
        },
        dropdownUserName: {
            fontWeight: '600',
            fontSize: '1rem',
            marginBottom: '0.25rem',
        },
        dropdownUserEmail: {
            fontSize: '0.85rem',
            opacity: 0.9,
        },
        dropdownMenu: {
            padding: '0.5rem 0',
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1.25rem',
            color: '#333',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem',
            fontWeight: '500',
            border: 'none',
            background: 'none',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
        },
        dropdownDivider: {
            height: '1px',
            background: 'rgba(0,0,0,0.1)',
            margin: '0.5rem 0',
        },
        mobileMenuButton: {
            display: 'none',
            background: isAuthenticated ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.1)',
            border: isAuthenticated ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(102, 126, 234, 0.2)',
            color: isAuthenticated ? 'white' : '#667eea',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '6px',
            transition: 'all 0.3s ease',
        },
        mobileNav: {
            position: 'fixed',
            top: 0,
            right: isMobileMenuOpen ? 0 : '-100%',
            width: '300px',
            height: '100vh',
            background: isAuthenticated ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
            padding: '6rem 2rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            transition: 'right 0.3s ease',
            zIndex: 1000,
            boxShadow: '-5px 0 25px rgba(0,0,0,0.2)',
            backdropFilter: 'blur(10px)',
        },
        mobileNavLink: {
            color: isAuthenticated ? 'white' : '#4a5568',
            textDecoration: 'none',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            background: isAuthenticated ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.05)',
            border: isAuthenticated ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(102, 126, 234, 0.1)',
        },
        mobileLogoutBtn: {
            color: isAuthenticated ? 'white' : '#4a5568',
            background: isAuthenticated ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.05)',
            border: isAuthenticated ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(102, 126, 234, 0.1)',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
        },
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: isMobileMenuOpen ? 'block' : 'none',
            zIndex: 999,
            backdropFilter: 'blur(2px)',
        },
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                {/* Logo - FIXED: Goes to Dashboard when authenticated */}
                {isAuthenticated ? (
                    // When authenticated, make it a button that goes to dashboard
                    <div
                        style={styles.logo}
                        onClick={() => navigate('/dashboard')}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'none';
                            e.target.style.opacity = '1';
                        }}
                    >
                        <span>📄</span>
                        ResumeCraft
                    </div>
                ) : (
                    // When not authenticated, normal link to home
                    <Link
                        to="/"
                        style={styles.logo}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'none';
                            e.target.style.opacity = '1';
                        }}
                    >
                        <span>📄</span>
                        ResumeCraft
                    </Link>
                )}

                {/* Desktop Navigation */}
                <div style={styles.desktopNav}>
                    {isAuthenticated ? (
                        <>
                            {/* Navigation Items - Dashboard, Builder, Analyzer, Templates */}
                            <div style={styles.navItems}>
                                {currentNavItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            ...styles.navItem,
                                            ...(isActiveRoute(item.path) && styles.activeNavItem)
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActiveRoute(item.path)) {
                                                e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                                                e.target.style.transform = 'translateY(-1px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActiveRoute(item.path)) {
                                                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                                e.target.style.transform = 'none';
                                            }
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Profile Section */}
                            <div style={styles.userSection} ref={profileDropdownRef}>
                                <button
                                    style={styles.profileButton}
                                    onClick={toggleProfileDropdown}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.transform = 'none';
                                    }}
                                >
                                    <div style={styles.userAvatar}>
                                        {getInitials(user?.name)}
                                    </div>
                                    <span>Hi, {user?.name ? user.name.split(' ')[0] : 'User'}</span>
                                    <span style={{
                                        transform: isProfileDropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s ease',
                                        fontSize: '0.8rem'
                                    }}>
                                        ▼
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                <div style={styles.profileDropdown}>
                                    <div style={styles.dropdownHeader}>
                                        <div style={styles.dropdownUserName}>
                                            {user?.name || 'User'}
                                        </div>
                                        <div style={styles.dropdownUserEmail}>
                                            {user?.email || 'user@example.com'}
                                        </div>
                                    </div>

                                    <div style={styles.dropdownMenu}>
                                        <Link
                                            to="/profile"
                                            style={styles.dropdownItem}
                                            onClick={closeProfileDropdown}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <span>👤</span> My Profile
                                        </Link>

                                        <Link
                                            to="/my-resumes"
                                            style={styles.dropdownItem}
                                            onClick={closeProfileDropdown}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(0,0,0,0.05)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <span>📑</span> My Resumes
                                        </Link>

                                        <div style={styles.dropdownDivider} />

                                        <button
                                            onClick={handleLogout}
                                            style={styles.dropdownItem}
                                            onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                        >
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Public Navigation Items */}
                            <div style={styles.navItems}>
                                {currentNavItems.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={{
                                            ...styles.navItem,
                                            ...(isActiveRoute(item.path) && styles.activeNavItem)
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActiveRoute(item.path)) {
                                                e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                                                e.target.style.transform = 'translateY(-1px)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActiveRoute(item.path)) {
                                                e.target.style.background = 'transparent';
                                                e.target.style.transform = 'none';
                                            }
                                        }}
                                    >
                                        <span>{item.icon}</span>
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            {/* Auth Buttons */}
                            <div style={styles.authButtons}>
                                <Link
                                    to="/login"
                                    style={styles.loginBtn}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                                        e.target.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                        e.target.style.transform = 'none';
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    style={styles.registerBtn}
                                    onMouseEnter={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'none';
                                        e.target.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        style={styles.mobileMenuButton}
                        onClick={toggleMobileMenu}
                        onMouseEnter={(e) => e.target.style.background =
                            isAuthenticated ? 'rgba(255, 255, 255, 0.2)' : 'rgba(102, 126, 234, 0.15)'
                        }
                        onMouseLeave={(e) => e.target.style.background =
                            isAuthenticated ? 'rgba(255, 255, 255, 0.1)' : 'rgba(102, 126, 234, 0.05)'
                        }
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div style={styles.mobileNav}>
                {isAuthenticated ? (
                    <>
                        {/* Mobile Profile Header */}
                        <div style={{
                            ...styles.profileButton,
                            marginBottom: '1rem',
                            background: 'rgba(255, 255, 255, 0.15)',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '0.5rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div style={styles.userAvatar}>
                                    {getInitials(user?.name)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>
                                        Welcome back
                                    </div>
                                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                        {user?.name || 'User'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Navigation Items */}
                        {currentNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={styles.mobileNavLink}
                                onClick={closeMobileMenu}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <span>{item.icon}</span> {item.label}
                            </Link>
                        ))}

                        <Link
                            to="/profile"
                            style={styles.mobileNavLink}
                            onClick={closeMobileMenu}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <span>👤</span> My Profile
                        </Link>

                        <Link
                            to="/my-resumes"
                            style={styles.mobileNavLink}
                            onClick={closeMobileMenu}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <span>📑</span> My Resumes
                        </Link>

                        <button
                            onClick={handleLogout}
                            style={styles.mobileLogoutBtn}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </>
                ) : (
                    <>
                        {/* Mobile Navigation Items for Public */}
                        {currentNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={styles.mobileNavLink}
                                onClick={closeMobileMenu}
                                onMouseEnter={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.1)'}
                                onMouseLeave={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.05)'}
                            >
                                <span>{item.icon}</span> {item.label}
                            </Link>
                        ))}

                        <Link
                            to="/login"
                            style={styles.mobileNavLink}
                            onClick={closeMobileMenu}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.05)'}
                        >
                            <span>🔑</span> Login
                        </Link>

                        <Link
                            to="/register"
                            style={{
                                ...styles.mobileNavLink,
                                background: '#667eea',
                                color: 'white',
                                fontWeight: '600',
                                justifyContent: 'center',
                                marginTop: '1rem',
                            }}
                            onClick={closeMobileMenu}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'none';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <span>🚀</span> Get Started
                        </Link>
                    </>
                )}
            </div>

            {/* Overlay for mobile menu */}
            <div style={styles.overlay} onClick={closeMobileMenu} />
        </nav>
    );
};

export default Navbar;