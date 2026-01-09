// src/components/layout/BuilderSidebar.jsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, X, Sparkles, User, FileText,
    Briefcase, GraduationCap, Code, Award, Globe, Users, FileCheck,
    CheckCircle, AlertCircle, Home, Database, Cloud, CloudOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BuilderSidebar = ({
    isOpen = true,
    isMobileOpen = false,
    onClose,
    onToggle,
    sections,
    activeSection,
    completedSections = {},
    onSectionChange,
    resumeTitle = 'Untitled Resume',
    resumeProgress = 0,
    isOnline = true
}) => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);

    // Close mobile sidebar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileOpen, onClose]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileOpen]);

    const getSectionIcon = (sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        return section?.icon || FileText;
    };

    const isSectionComplete = (sectionId) => {
        return completedSections[sectionId] || false;
    };

    const handleSectionClick = (sectionId) => {
        onSectionChange(sectionId);
    };

    const handleExit = () => {
        navigate('/dashboard');
    };

    // Desktop sidebar
    const renderDesktopSidebar = () => (
        <aside
            ref={sidebarRef}
            className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-72' : 'w-16'
                } fixed lg:relative z-40`}
        >
            {/* Header with logo and toggle */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {isOpen ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    ResumeCraft
                                </h1>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Collapse sidebar"
                                aria-label="Collapse sidebar"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onToggle}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors w-full flex justify-center"
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                </div>

                {isOpen && (
                    <div className="mt-4">
                        <h2 className="text-sm font-medium text-gray-500 mb-1">Current Resume</h2>
                        <p className="text-sm font-semibold text-gray-800 truncate">{resumeTitle}</p>

                        {/* Progress Bar */}
                        <div className="mt-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{resumeProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                    style={{ width: `${resumeProgress}%` }}
                                />
                            </div>
                        </div>

                        {/* Online Status */}
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
                            <span className="text-gray-600">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto p-2">
                <nav className="space-y-1">
                    {sections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeSection === section.id;
                        const isComplete = isSectionComplete(section.id);

                        return (
                            <button
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    } ${isOpen ? 'justify-start' : 'justify-center'}`}
                                title={section.label}
                                aria-label={section.label}
                            >
                                <div className="relative">
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                                    {!isComplete && section.required && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                    )}
                                </div>

                                {isOpen && (
                                    <>
                                        <div className="flex-1 text-left">
                                            <span className="text-sm font-medium">{section.label}</span>
                                            {section.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {section.description}
                                                </p>
                                            )}
                                        </div>
                                        {isComplete && (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                {isOpen ? (
                    <div className="space-y-2">
                        <button
                            onClick={handleExit}
                            className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Back to Dashboard
                        </button>
                        <div className="text-xs text-gray-500 text-center">
                            ResumeCraft AI © {new Date().getFullYear()}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleExit}
                        className="w-full flex justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Back to Dashboard"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    );

    // Mobile sidebar overlay
    const renderMobileSidebar = () => (
        <AnimatePresence>
            {isMobileOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                        onClick={onClose}
                    />

                    {/* Sidebar Drawer */}
                    <motion.aside
                        ref={sidebarRef}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden flex flex-col"
                    >
                        {/* Mobile Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        ResumeCraft
                                    </h1>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Close sidebar"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="mt-4">
                                <h2 className="text-sm font-medium text-gray-500 mb-1">Current Resume</h2>
                                <p className="text-sm font-semibold text-gray-800 truncate">{resumeTitle}</p>

                                {/* Progress Bar */}
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Progress</span>
                                        <span>{resumeProgress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                            style={{ width: `${resumeProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Sections List */}
                        <div className="flex-1 overflow-y-auto p-2">
                            <nav className="space-y-1">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    const isComplete = isSectionComplete(section.id);

                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionClick(section.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <div className="relative">
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                                                {!isComplete && section.required && (
                                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <span className="text-sm font-medium">{section.label}</span>
                                                {section.description && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {section.description}
                                                    </p>
                                                )}
                                            </div>
                                            {isComplete && (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Mobile Footer */}
                        <div className="p-4 border-t border-gray-200">
                            <button
                                onClick={handleExit}
                                className="w-full flex items-center gap-2 p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <Home className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                                ResumeCraft AI © {new Date().getFullYear()}
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );

    return (
        <>
            {renderDesktopSidebar()}
            {renderMobileSidebar()}
        </>
    );
};

export default BuilderSidebar;