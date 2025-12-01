import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FaTachometerAlt,
    FaUsers,
    FaFileAlt,
    FaChartBar,
    FaCog,
    FaBars,
    FaTimes,
    FaSignOutAlt
} from 'react-icons/fa';

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { user, logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: FaTachometerAlt },
        { name: 'Users', href: '/admin/users', icon: FaUsers },
        { name: 'Resumes', href: '/admin/resumes', icon: FaFileAlt },
        { name: 'Analytics', href: '/admin/analytics', icon: FaChartBar },
        { name: 'Settings', href: '/admin/settings', icon: FaCog },
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600">You don't have permission to access the admin panel.</p>
                    <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
                    <h1 className="text-white text-xl font-bold">Admin Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <FaTimes className="h-6 w-6" />
                    </button>
                </div>

                <nav className="mt-8 px-4">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.name}>
                                    <Link
                                        to={item.href}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                                                ? 'bg-indigo-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                            }`}
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <Icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <p className="text-xs text-gray-400">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <FaSignOutAlt className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="bg-white shadow-sm z-40">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-600"
                        >
                            <FaBars className="h-6 w-6" />
                        </button>

                        <div className="flex-1 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                {navigation.find(item => isActive(item.href))?.name || 'Admin Panel'}
                            </h2>

                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-600">
                                    Welcome, {user?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;