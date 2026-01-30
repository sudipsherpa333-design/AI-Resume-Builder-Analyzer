// src/components/dashboard/DashboardSidebar.jsx - SIMPLE & SMOOTH VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Home,
    FileText,
    Star,
    Folder,
    Users,
    BarChart2,
    Target,
    BookOpen,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Plus,
    Database,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';

const DashboardSidebar = ({
    isCollapsed = false,
    onToggleCollapse,
    darkMode = false,
    onLogout,
    onCreateResume
}) => {
    const navigate = useNavigate();

    const menuItems = [
        {
            id: 'dashboard',
            icon: Home,
            label: 'Dashboard',
            active: window.location.pathname === '/dashboard',
            onClick: () => navigate('/dashboard')
        },
        {
            id: 'resumes',
            icon: FileText,
            label: 'Resumes',
            active: window.location.pathname.includes('/resumes'),
            onClick: () => navigate('/resumes')
        },
        {
            id: 'favorites',
            icon: Star,
            label: 'Favorites',
            active: window.location.pathname.includes('/favorites'),
            onClick: () => navigate('/favorites')
        },
        {
            id: 'folders',
            icon: Folder,
            label: 'Folders',
            active: window.location.pathname.includes('/folders'),
            onClick: () => navigate('/folders')
        },
        {
            id: 'shared',
            icon: Users,
            label: 'Shared',
            active: window.location.pathname.includes('/shared'),
            onClick: () => navigate('/shared')
        },
        {
            id: 'analytics',
            icon: BarChart2,
            label: 'Analytics',
            active: window.location.pathname.includes('/analytics'),
            onClick: () => navigate('/analytics')
        },
        {
            id: 'goals',
            icon: Target,
            label: 'Goals',
            active: window.location.pathname.includes('/goals'),
            onClick: () => navigate('/goals')
        },
        {
            id: 'templates',
            icon: BookOpen,
            label: 'Templates',
            active: window.location.pathname.includes('/templates'),
            onClick: () => navigate('/templates')
        },
        {
            id: 'settings',
            icon: Settings,
            label: 'Settings',
            active: window.location.pathname.includes('/settings'),
            onClick: () => navigate('/settings')
        },
    ];

    return (
        <motion.div
            className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 
                ${isCollapsed ? 'w-16' : 'w-64'}
                ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}`}
            initial={false}
            animate={{
                width: isCollapsed ? 64 : 256
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
        >
            <div className="h-full flex flex-col">
                {/* Sidebar Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    {!isCollapsed ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Database className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">ResumeCraft</span>
                            </div>
                            <button
                                onClick={onToggleCollapse}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Collapse sidebar"
                            >
                                <ChevronsLeft className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={onToggleCollapse}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                title="Expand sidebar"
                            >
                                <ChevronsRight className="w-4 h-4 text-gray-500" />
                            </button>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar Menu */}
                <div className="flex-1 p-4 overflow-y-auto">
                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={item.onClick}
                                className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-start p-3 gap-3'
                                    } rounded-lg transition-all duration-150 ${item.active
                                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <item.icon className="w-5 h-5" />
                                {!isCollapsed && (
                                    <span className="font-medium">{item.label}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Create Button */}
                    <div className="mt-8">
                        <button
                            onClick={onCreateResume}
                            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-center p-3 gap-2'
                                } bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md`}
                            title={isCollapsed ? 'Create New' : ''}
                        >
                            <Plus className="w-5 h-5" />
                            {!isCollapsed && (
                                <span className="font-semibold">New Resume</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'justify-center p-3 gap-3'
                            } text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
                        title={isCollapsed ? 'Logout' : ''}
                    >
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && (
                            <span className="font-medium">Logout</span>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardSidebar;