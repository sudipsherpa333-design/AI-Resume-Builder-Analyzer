import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUser,
    FaSignInAlt,
    FaRocket,
    FaBars,
    FaTimes,
    FaChevronDown,
    FaSignOutAlt,
    FaFileAlt,
    FaCog,
    FaHome,
    FaPlus,
    FaSearch,
    FaPalette
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const userMenuRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const dashboardNavItems = [
        { path: '/dashboard', icon: <FaHome />, label: 'Dashboard', badge: null },
        { path: '/builder', icon: <FaPlus />, label: 'New Resume', badge: 'New' },
        { path: '/analyzer', icon: <FaSearch />, label: 'Analyzer', badge: null },
        { path: '/builder/templates', icon: <FaPalette />, label: 'Templates', badge: '12+' },
    ];

    const publicNavItems = [
        { path: '/about', label: 'About' },
        { path: '/pricing', label: 'Pricing' },
        { path: '/contact', label: 'Contact' }
    ];

    const handleLogoClick = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/');
        }
    };

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate('/builder');
        } else {
            navigate('/register');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to home page
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
    };

    const getUserInitials = () => {
        if (user?.name) {
            const names = user.name.split(' ');
            return (names[0].charAt(0) + (names[1]?.charAt(0) || '')).toUpperCase();
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const getUserFirstName = () => {
        if (user?.name) {
            const firstName = user.name.split(' ')[0];
            return firstName.charAt(0).toUpperCase() + firstName.slice(1);
        }
        if (user?.email) {
            const emailPart = user.email.split('@')[0];
            const cleanedName = emailPart
                .replace(/[\d._-]+/g, ' ')
                .trim()
                .split(' ')[0];

            if (cleanedName) {
                return cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
            }
        }
        return 'User';
    };

    const toggleUserMenu = (e) => {
        e.stopPropagation();
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const toggleMobileMenu = (e) => {
        e.stopPropagation();
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <style>
                {`
                .navbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .navbar-container {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 1rem 1.5rem;
                    max-width: 100%;
                    margin: 0 auto;
                }

                @media (max-width: 768px) {
                    .navbar-container {
                        padding: 0.75rem 1rem;
                    }
                }

                /* Logo Styles */
                .logo-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 12px;
                    transition: background-color 0.2s;
                }

                .logo-container:hover {
                    background-color: #f3f4f6;
                }

                .animated-logo {
                    position: relative;
                    width: 42px;
                    height: 42px;
                }

                @media (max-width: 768px) {
                    .animated-logo {
                        width: 36px;
                        height: 36px;
                    }
                }

                .logo-main {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .logo-main {
                        font-size: 1rem;
                    }
                }

                .logo-text h1 {
                    font-size: 1.25rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .logo-text h1 {
                        font-size: 1.1rem;
                    }
                }

                .logo-text p {
                    font-size: 0.7rem;
                    color: #6b7280;
                    margin: 0;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .logo-text p {
                        font-size: 0.65rem;
                    }
                }

                /* Desktop Navigation */
                .desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                @media (max-width: 1024px) {
                    .desktop-nav {
                        display: none;
                    }
                }

                .nav-links {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 0.875rem;
                    border-radius: 8px;
                    color: #4b5563;
                    font-weight: 500;
                    transition: all 0.2s;
                    text-decoration: none;
                    position: relative;
                    font-size: 0.875rem;
                }

                .nav-link:hover {
                    background-color: #f3f4f6;
                    color: #1f2937;
                }

                .nav-link.active {
                    background-color: #eff6ff;
                    color: #3b82f6;
                }

                .nav-link.secondary {
                    border: 1px solid #e5e7eb;
                }

                .nav-badge {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    background: linear-gradient(135deg, #f59e0b, #f97316);
                    color: white;
                    font-size: 0.6rem;
                    padding: 0.1rem 0.4rem;
                    border-radius: 10px;
                    font-weight: 600;
                }

                /* User Profile */
                .user-profile {
                    position: relative;
                }

                .user-profile-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.4rem;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .user-profile-btn:hover {
                    border-color: #d1d5db;
                    background-color: #f9fafb;
                }

                .user-avatar {
                    position: relative;
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 0.8rem;
                }

                .avatar-badge {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    font-size: 0.45rem;
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }

                .user-name {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .user-status {
                    font-size: 0.7rem;
                    color: #10b981;
                }

                .dropdown-icon {
                    font-size: 0.7rem;
                    color: #9ca3af;
                    transition: transform 0.2s;
                }

                .rotate-180 {
                    transform: rotate(180deg);
                }

                /* User Dropdown */
                .user-dropdown {
                    position: absolute;
                    right: 0;
                    top: calc(100% + 0.5rem);
                    width: 260px;
                    background: white;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    z-index: 1001;
                }

                .dropdown-header {
                    padding: 1rem;
                    background: linear-gradient(135deg, #eff6ff, #f8fafc);
                    border-bottom: 1px solid #e5e7eb;
                }

                .dropdown-avatar {
                    width: 42px;
                    height: 42px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }

                .dropdown-user-info h4 {
                    margin: 0 0 0.2rem 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .dropdown-user-info p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .dropdown-links {
                    padding: 0.5rem;
                }

                .dropdown-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 0.6rem 0.75rem;
                    border-radius: 8px;
                    color: #4b5563;
                    text-decoration: none;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 0.8rem;
                    transition: all 0.2s;
                    position: relative;
                }

                .dropdown-link:hover {
                    background-color: #f3f4f6;
                    color: #1f2937;
                }

                .dropdown-link.logout {
                    color: #ef4444;
                }

                .dropdown-link.logout:hover {
                    background-color: #fef2f2;
                }

                .dropdown-badge {
                    margin-left: auto;
                    background: #f3f4f6;
                    color: #6b7280;
                    font-size: 0.65rem;
                    padding: 0.15rem 0.4rem;
                    border-radius: 8px;
                    font-weight: 600;
                }

                .dropdown-divider {
                    height: 1px;
                    background-color: #e5e7eb;
                    margin: 0.4rem 0.75rem;
                }

                /* Get Started Button */
                .get-started-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.875rem;
                }

                .get-started-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                /* Mobile Menu Toggle */
                .mobile-menu-toggle {
                    display: none;
                    padding: 0.5rem;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    color: #4b5563;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 1rem;
                }

                @media (max-width: 1024px) {
                    .mobile-menu-toggle {
                        display: block;
                    }
                }

                .mobile-menu-toggle:hover {
                    background-color: #f3f4f6;
                }

                /* Mobile Menu Overlay */
                .mobile-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 999;
                    overflow: hidden;
                }

                .mobile-menu {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 85%;
                    max-width: 360px;
                    height: 100vh;
                    background: white;
                    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
                    overflow-y: auto;
                }

                .mobile-menu-content {
                    padding: 1rem;
                    height: 100%;
                }

                .mobile-user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: linear-gradient(135deg, #eff6ff, #f8fafc);
                    border-radius: 10px;
                    margin-bottom: 1rem;
                }

                .mobile-user-avatar {
                    width: 42px;
                    height: 42px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .mobile-user-details h4 {
                    margin: 0 0 0.2rem 0;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #1f2937;
                }

                .mobile-user-details p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .mobile-nav-links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.4rem;
                }

                .mobile-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    color: #4b5563;
                    text-decoration: none;
                    background: none;
                    border: none;
                    font-size: 0.85rem;
                    transition: all 0.2s;
                    position: relative;
                }

                .mobile-nav-link:hover {
                    background-color: #f3f4f6;
                    color: #1f2937;
                }

                .mobile-nav-badge {
                    margin-left: auto;
                    background: linear-gradient(135deg, #f59e0b, #f97316);
                    color: white;
                    font-size: 0.65rem;
                    padding: 0.15rem 0.4rem;
                    border-radius: 8px;
                    font-weight: 600;
                }

                .mobile-nav-divider {
                    height: 1px;
                    background-color: #e5e7eb;
                    margin: 0.4rem 0;
                }

                .mobile-get-started-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                    padding: 0.75rem 1rem;
                    margin-top: 0.5rem;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.85rem;
                }

                .mobile-get-started-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                `}
            </style>

            <nav className="navbar">
                <div className="navbar-container">
                    <motion.button
                        onClick={handleLogoClick}
                        className="logo-container"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="animated-logo">
                            <div className="logo-main">
                                <FaFileAlt />
                            </div>
                        </div>
                        <div className="logo-text">
                            <h1>ResumeCraft</h1>
                            <p>AI Resume Builder</p>
                        </div>
                    </motion.button>

                    <div className="desktop-nav">
                        {isAuthenticated ? (
                            <>
                                {/* Show dashboard navigation when authenticated */}
                                {!location.pathname.startsWith('/builder') && (
                                    <div className="nav-links">
                                        {dashboardNavItems.map((item) => (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                            >
                                                {item.icon}
                                                <span>{item.label}</span>
                                                {item.badge && (
                                                    <span className="nav-badge">{item.badge}</span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* User Profile Menu - Only shown when authenticated */}
                                <div className="user-profile" ref={userMenuRef}>
                                    <motion.button
                                        onClick={toggleUserMenu}
                                        className="user-profile-btn"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="user-avatar">
                                            <span>{getUserInitials()}</span>
                                            <div className="avatar-badge">
                                                <FaFileAlt />
                                            </div>
                                        </div>
                                        <div className="user-info">
                                            <span className="user-name">Hi, {getUserFirstName()}!</span>
                                            <span className="user-status">Online</span>
                                        </div>
                                        <FaChevronDown className={`dropdown-icon ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </motion.button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                className="user-dropdown"
                                            >
                                                <div className="dropdown-header">
                                                    <div className="dropdown-avatar">
                                                        <span>{getUserInitials()}</span>
                                                    </div>
                                                    <div className="dropdown-user-info">
                                                        <h4>{user?.name || getUserFirstName()}</h4>
                                                        <p>{user?.email || 'user@example.com'}</p>
                                                    </div>
                                                </div>
                                                <div className="dropdown-links">
                                                    <Link
                                                        to="/dashboard"
                                                        className="dropdown-link"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <MdDashboard />
                                                        <span>Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        to="/profile"
                                                        className="dropdown-link"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <FaUser />
                                                        <span>My Profile</span>
                                                    </Link>
                                                    <Link
                                                        to="/resumes"
                                                        className="dropdown-link"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <FaFileAlt />
                                                        <span>My Resumes</span>
                                                        <span className="dropdown-badge">
                                                            {user?.resumeCount || 0}
                                                        </span>
                                                    </Link>
                                                    <Link
                                                        to="/settings"
                                                        className="dropdown-link"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <FaCog />
                                                        <span>Settings</span>
                                                    </Link>
                                                    <div className="dropdown-divider" />
                                                    <button
                                                        onClick={handleLogout}
                                                        className="dropdown-link logout"
                                                    >
                                                        <FaSignOutAlt />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* PUBLIC NAVIGATION - Only shown when NOT authenticated */}
                                <div className="nav-links">
                                    {publicNavItems.map((item) => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                        >
                                            <span>{item.label}</span>
                                        </Link>
                                    ))}
                                </div>

                                <Link
                                    to="/login"
                                    className="nav-link secondary"
                                >
                                    <FaSignInAlt />
                                    <span>Login</span>
                                </Link>
                                <motion.button
                                    onClick={handleGetStarted}
                                    className="get-started-btn"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FaRocket />
                                    <span>Get Started</span>
                                </motion.button>
                            </>
                        )}
                    </div>

                    <motion.button
                        onClick={toggleMobileMenu}
                        className="mobile-menu-toggle"
                        whileTap={{ scale: 0.95 }}
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </motion.button>
                </div>

                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            ref={mobileMenuRef}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mobile-menu-overlay"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mobile-menu">
                                <div className="mobile-menu-content">
                                    {isAuthenticated ? (
                                        <>
                                            {/* Mobile menu for authenticated users */}
                                            <div className="mobile-user-info">
                                                <div className="mobile-user-avatar">
                                                    <span>{getUserInitials()}</span>
                                                </div>
                                                <div className="mobile-user-details">
                                                    <h4>{user?.name || getUserFirstName()}</h4>
                                                    <p>{user?.email || 'user@example.com'}</p>
                                                </div>
                                            </div>

                                            <div className="mobile-nav-links">
                                                {/* Dashboard navigation in mobile */}
                                                {dashboardNavItems.map((item) => (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        className="mobile-nav-link"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {item.icon}
                                                        <span>{item.label}</span>
                                                        {item.badge && (
                                                            <span className="mobile-nav-badge">{item.badge}</span>
                                                        )}
                                                    </Link>
                                                ))}

                                                <div className="mobile-nav-divider" />

                                                <Link
                                                    to="/profile"
                                                    className="mobile-nav-link"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <FaUser />
                                                    <span>My Profile</span>
                                                </Link>
                                                <Link
                                                    to="/resumes"
                                                    className="mobile-nav-link"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <FaFileAlt />
                                                    <span>My Resumes</span>
                                                    <span className="mobile-nav-badge">
                                                        {user?.resumeCount || 0}
                                                    </span>
                                                </Link>
                                                <Link
                                                    to="/settings"
                                                    className="mobile-nav-link"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <FaCog />
                                                    <span>Settings</span>
                                                </Link>

                                                <div className="mobile-nav-divider" />

                                                <button
                                                    onClick={handleLogout}
                                                    className="mobile-nav-link logout"
                                                >
                                                    <FaSignOutAlt />
                                                    <span>Sign Out</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {/* Mobile menu for non-authenticated users */}
                                            {publicNavItems.map((item) => (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    className="mobile-nav-link"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    <span>{item.label}</span>
                                                </Link>
                                            ))}

                                            <Link
                                                to="/login"
                                                className="mobile-nav-link"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <FaSignInAlt />
                                                <span>Login</span>
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    handleGetStarted();
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className="mobile-get-started-btn"
                                            >
                                                <FaRocket />
                                                <span>Get Started Free</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
};

export default Navbar;