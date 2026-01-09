// frontend/src/admin/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Users,
    FileText,
    BarChart3,
    Settings,
    LayoutTemplate,
    Server,
    FileArchive,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isMobile }) => {
    const navItems = [
        { path: '/admin/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { path: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Users' },
        { path: '/admin/resumes', icon: <FileText className="w-5 h-5" />, label: 'Resumes' },
        { path: '/admin/templates', icon: <LayoutTemplate className="w-5 h-5" />, label: 'Templates' },
        { path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
        { path: '/admin/system', icon: <Server className="w-5 h-5" />, label: 'System' },
        { path: '/admin/logs', icon: <FileArchive className="w-5 h-5" />, label: 'Logs' },
        { path: '/admin/settings', icon: <Settings className="w-5 h-5" />, label: 'Settings' },
    ];

    return (
        <div className={`h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 flex flex-col`}>
            {/* Logo */}
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
                {isOpen ? (
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">A</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Admin</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Panel</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
                        <span className="text-white font-bold text-sm">A</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin/dashboard'}
                        onClick={() => isMobile && onClose()}
                        className={({ isActive }) =>
                            `flex items-center ${isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'} rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                            }`
                        }
                    >
                        {item.icon}
                        {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse/Expand Button */}
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <button
                    onClick={() => {
                        if (!isOpen && isMobile) {
                            onClose();
                        }
                    }}
                    className="w-full flex items-center justify-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                    title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isOpen ? (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="ml-2 text-sm">Collapse</span>
                        </>
                    ) : (
                        <ChevronRight className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;