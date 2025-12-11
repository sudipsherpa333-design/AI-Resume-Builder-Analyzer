// src/components/Navbar.jsx - Remove props or use useAuth inside
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Add this import

const Navbar = () => {
    // Remove props and get auth directly from context
    const { user, isAuthenticated, logout } = useAuth(); // Add this line

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

    // Public navigation items (shown when not authenticated)
    const publicNavItems = [
        {
            path: '/',
            label: 'Home',
            icon: '🏠',
            requiresAuth: false
        },
        {
            path: '#features',
            label: 'Features',
            icon: '✨',
            requiresAuth: false,
            isAnchor: true
        },
        {
            path: '#pricing',
            label: 'Pricing',
            icon: '💰',
            requiresAuth: false,
            isAnchor: true
        },
        {
            path: '#about',
            label: 'About',
            icon: 'ℹ️',
            requiresAuth: false,
            isAnchor: true
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

    // Handle anchor links
    const handleAnchorClick = (e, path) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            navigate('/');
            // Scroll to section after navigation
            setTimeout(() => {
                const element = document.querySelector(path);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.querySelector(path);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
        closeMobileMenu();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
            style={{
                background: isAuthenticated ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
                backdropFilter: 'blur(10px)',
            }}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to={isAuthenticated ? '/dashboard' : '/'}
                        className="flex items-center gap-2 text-xl font-bold"
                        style={{ color: isAuthenticated ? 'white' : '#667eea' }}
                    >
                        <span>📄</span>
                        ResumeCraft
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {currentNavItems.map((item) => (
                            item.isAnchor ? (
                                <a
                                    key={item.path}
                                    href={item.path}
                                    onClick={(e) => handleAnchorClick(e, item.path)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActiveRoute(item.path) ? 'bg-opacity-20 bg-white' : 'hover:bg-opacity-10 hover:bg-white'}`}
                                    style={{
                                        color: isAuthenticated ? 'white' : '#4a5568',
                                        backgroundColor: isActiveRoute(item.path) ? (isAuthenticated ? 'rgba(255,255,255,0.2)' : '#f7fafc') : 'transparent'
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </a>
                            ) : (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActiveRoute(item.path) ? 'bg-opacity-20 bg-white' : 'hover:bg-opacity-10 hover:bg-white'}`}
                                    style={{
                                        color: isAuthenticated ? 'white' : '#4a5568',
                                        backgroundColor: isActiveRoute(item.path) ? (isAuthenticated ? 'rgba(255,255,255,0.2)' : '#f7fafc') : 'transparent'
                                    }}
                                >
                                    <span>{item.icon}</span>
                                    {item.label}
                                </Link>
                            )
                        ))}

                        {isAuthenticated ? (
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
                                    style={{ color: 'white' }}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                        {getInitials(user?.name)}
                                    </div>
                                    <span className="hidden lg:inline">Hi, {user?.name ? user.name.split(' ')[0] : 'User'}</span>
                                    <span className={`transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {isProfileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                                            <div className="font-semibold">{user?.name || 'User'}</div>
                                            <div className="text-sm opacity-90">{user?.email || 'user@example.com'}</div>
                                        </div>
                                        <div className="py-2">
                                            <Link to="/profile" className="block px-4 py-3 hover:bg-gray-50 flex items-center gap-2">
                                                👤 Profile
                                            </Link>
                                            <Link to="/my-resumes" className="block px-4 py-3 hover:bg-gray-50 flex items-center gap-2">
                                                📑 My Resumes
                                            </Link>
                                            <div className="border-t my-2"></div>
                                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 flex items-center gap-2">
                                                🚪 Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="px-4 py-2 text-blue-600 hover:text-blue-700">
                                    Login
                                </Link>
                                <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className="md:hidden p-2 rounded-lg"
                        style={{
                            background: isAuthenticated ? 'rgba(255,255,255,0.1)' : 'rgba(102, 126, 234, 0.1)',
                            color: isAuthenticated ? 'white' : '#667eea'
                        }}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>
                <div className="p-4 border-b">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold">
                                {getInitials(user?.name)}
                            </div>
                            <div>
                                <div className="font-semibold">{user?.name || 'User'}</div>
                                <div className="text-sm text-gray-600">{user?.email || 'user@example.com'}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="font-bold text-blue-600">ResumeCraft</div>
                    )}
                </div>

                <div className="p-4 space-y-2">
                    {currentNavItems.map((item) => (
                        item.isAnchor ? (
                            <a
                                key={item.path}
                                href={item.path}
                                onClick={(e) => handleAnchorClick(e, item.path)}
                                className={`block px-4 py-3 rounded-lg ${isActiveRoute(item.path) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </a>
                        ) : (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeMobileMenu}
                                className={`block px-4 py-3 rounded-lg ${isActiveRoute(item.path) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                            >
                                <span className="mr-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        )
                    ))}

                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" onClick={closeMobileMenu} className="block px-4 py-3 hover:bg-gray-50">
                                👤 My Profile
                            </Link>
                            <Link to="/my-resumes" onClick={closeMobileMenu} className="block px-4 py-3 hover:bg-gray-50">
                                📑 My Resumes
                            </Link>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50">
                                🚪 Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={closeMobileMenu} className="block px-4 py-3 hover:bg-gray-50">
                                🔑 Login
                            </Link>
                            <Link to="/register" onClick={closeMobileMenu} className="block px-4 py-3 bg-blue-600 text-white rounded-lg text-center">
                                🚀 Get Started
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={closeMobileMenu}></div>
            )}
        </nav>
    );
};

export default Navbar;