// frontend/src/admin/components/layout/TopNav.jsx
import React, { useState } from 'react';
import { Menu, X, Bell, Search, LogOut } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const TopNav = ({ sidebarOpen, setSidebarOpen, admin, isMobile }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const { adminLogout } = useAdmin();

    return (
        <nav className="fixed top-0 right-0 left-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 z-40">
            <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Left side - Menu toggle and search */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {!isMobile && (
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* Right side - User info and notifications */}
                    <div className="flex items-center space-x-4">
                        <button className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        <div className="flex items-center space-x-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {admin?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {admin?.role || 'Administrator'}
                                </p>
                            </div>

                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {admin?.name?.charAt(0) || 'A'}
                            </div>

                            <button
                                onClick={adminLogout}
                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNav;