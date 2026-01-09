// frontend/src/admin/components/layout/AdminLayout.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopNav from './TopNav.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
// IMPORTANT: Use default import if LoadingSpinner has default export
// Use default import
import LoadingSpinner from '../ui/LoadingSpinner.jsx';
const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { admin, loading, isAuthenticated } = useAdmin();
    const location = useLocation();
    const navigate = useNavigate();

    // Detect mobile/desktop
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]);

    // Handle sidebar state based on screen size
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    // Redirect to admin login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated && !location.pathname.includes('/admin/login')) {
            navigate('/admin/login', {
                replace: true,
                state: { from: location.pathname }
            });
        }
    }, [loading, isAuthenticated, location.pathname, navigate]);

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <LoadingSpinner size="lg" text="Loading Admin Panel..." />
            </div>
        );
    }

    // Don't render layout for login page
    if (location.pathname === '/admin/login') {
        return <Outlet />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-grid-gray-100 dark:bg-grid-gray-800/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />

            <TopNav
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                admin={admin}
                isMobile={isMobile}
            />

            <div className="flex pt-16 relative">
                {/* Sidebar Overlay for mobile */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <div className={`fixed lg:relative z-40 transition-all duration-300 ease-in-out ${sidebarOpen
                    ? 'translate-x-0'
                    : '-translate-x-full lg:translate-x-0 lg:w-20'
                    }`}>
                    <Sidebar
                        isOpen={sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                        isMobile={isMobile}
                    />
                </div>

                {/* Main Content */}
                <main className={`flex-1 transition-all duration-300 min-h-[calc(100vh-4rem)] ${sidebarOpen
                    ? 'lg:ml-64'
                    : 'lg:ml-20'
                    }`}>
                    <div className="p-4 lg:p-6 max-w-full">
                        {/* Page Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                {getPageTitle(location.pathname)}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {getPageDescription(location.pathname)}
                            </p>
                        </div>

                        {/* Content Container */}
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30 overflow-hidden">
                            <div className="p-4 lg:p-6">
                                <Outlet />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                            <p>ResumeCraft Admin Panel v2.0 • {new Date().getFullYear()}</p>
                            <p className="mt-1 text-xs">
                                Last login: {admin?.lastLogin
                                    ? new Date(admin.lastLogin).toLocaleString()
                                    : 'N/A'}
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Quick Actions FAB */}
            {!isMobile && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
                        title="Scroll to top"
                    >
                        ↑
                    </button>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:scale-105"
                        title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                    >
                        {sidebarOpen ? '←' : '→'}
                    </button>
                </div>
            )}
        </div>
    );
};

// Helper function to get page title based on route
const getPageTitle = (pathname) => {
    const routes = {
        '/admin/dashboard': 'Dashboard',
        '/admin/resumes': 'Resume Management',
        '/admin/users': 'User Management',
        '/admin/templates': 'Template Management',
        '/admin/analytics': 'Analytics & Reports',
        '/admin/settings': 'System Settings',
        '/admin/logs': 'System Logs',
        '/admin/system': 'System Health',
    };

    return routes[pathname] || 'Admin Panel';
};

// Helper function to get page description
const getPageDescription = (pathname) => {
    const descriptions = {
        '/admin/dashboard': 'Overview of system performance and statistics',
        '/admin/resumes': 'Manage and analyze user resumes',
        '/admin/users': 'View and manage user accounts',
        '/admin/templates': 'Customize and manage resume templates',
        '/admin/analytics': 'Detailed analytics and reporting',
        '/admin/settings': 'Configure system settings and preferences',
        '/admin/logs': 'Monitor system activity and logs',
        '/admin/system': 'Check system health and performance',
    };

    return descriptions[pathname] || 'Admin panel for ResumeCraft platform';
};

export default AdminLayout;