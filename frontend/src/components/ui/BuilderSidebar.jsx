// src/components/layout/BuilderSidebar.jsx - FIXED SIZE, NO SCROLL VERSION
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, X, Sparkles, CheckCircle,
    Home, Cloud, CloudOff, AlertCircle, Save, Eye, Download,
    User, FileText, Briefcase, GraduationCap, Code, Award,
    Globe, Users, FileCheck, Settings, HelpCircle, LogOut
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
    isOnline = true,
    onSave = null,
    onPreview = null,
    onExport = null
}) => {
    const navigate = useNavigate();
    const sidebarRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

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

    const isSectionComplete = (sectionId) => {
        return completedSections[sectionId] || false;
    };

    const handleSectionClick = (sectionId) => {
        onSectionChange(sectionId);
        if (isMobileOpen) onClose();
    };

    const handleExit = () => {
        navigate('/dashboard');
    };

    // Progress indicator with color based on completion
    const getProgressColor = () => {
        if (resumeProgress < 30) return 'from-red-500 to-orange-500';
        if (resumeProgress < 70) return 'from-amber-500 to-yellow-500';
        return 'from-green-500 to-emerald-500';
    };

    // Get section icon component
    const getSectionIcon = (sectionId) => {
        const section = sections?.find(s => s.id === sectionId);
        return section?.icon || FileText;
    };

    // Truncate text for collapsed sidebar
    const truncateText = (text, maxLength = 20) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Desktop sidebar - FIXED HEIGHT, NO SCROLL
    const renderDesktopSidebar = () => (
        <aside
            ref={sidebarRef}
            className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out fixed z-40 ${isOpen
                    ? 'w-72 shadow-lg'
                    : 'w-16 hover:w-72 group transition-all duration-300'
                }`}
            onMouseEnter={() => !isOpen && setIsHovered(true)}
            onMouseLeave={() => !isOpen && setIsHovered(false)}
            style={{
                height: '100vh',
                maxHeight: '100vh',
                overflow: 'hidden'
            }}
        >
            {/* Header - Fixed height */}
            <div className="p-5 border-b border-gray-200 flex-shrink-0" style={{ height: '140px' }}>
                <div className="flex items-center justify-between h-10">
                    {isOpen || isHovered ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
                                        ResumeCraft
                                    </h1>
                                    <p className="text-xs text-gray-500 truncate">Builder</p>
                                </div>
                            </div>
                            <button
                                onClick={onToggle}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                                title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                                aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                            >
                                <ChevronLeft className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? '' : 'rotate-180'}`} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors w-full flex justify-center"
                            title="Expand sidebar"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    )}
                </div>

                {(isOpen || isHovered) && (
                    <div className="mt-4 space-y-3">
                        <div>
                            <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                Current Resume
                            </h2>
                            <p className="text-sm font-semibold text-gray-800 truncate bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                                {truncateText(resumeTitle, 25)}
                            </p>
                        </div>

                        {/* Progress Bar - Fixed position */}
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-gray-700">Progress</span>
                                <span className="text-xs font-bold text-gray-900">{resumeProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500`}
                                    style={{ width: `${resumeProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions - Fixed height, always visible */}
            {(isOpen || isHovered) && (
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={onSave}
                            className="flex flex-col items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Save Resume"
                        >
                            <Save className="w-4 h-4 text-gray-600 mb-1" />
                            <span className="text-xs text-gray-700">Save</span>
                        </button>
                        <button
                            onClick={onPreview}
                            className="flex flex-col items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Preview"
                        >
                            <Eye className="w-4 h-4 text-gray-600 mb-1" />
                            <span className="text-xs text-gray-700">Preview</span>
                        </button>
                        <button
                            onClick={onExport}
                            className="flex flex-col items-center justify-center p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Export"
                        >
                            <Download className="w-4 h-4 text-gray-600 mb-1" />
                            <span className="text-xs text-gray-700">Export</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Sections List - FIXED HEIGHT, NO SCROLL */}
            <div
                className="flex-1 py-4"
                style={{
                    height: 'calc(100vh - 280px)', // Calculated height
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Online Status - Fixed at top of sections */}
                <div className="px-4 mb-3">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${isOnline ? 'bg-green-50' : 'bg-amber-50'}`}>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-amber-500'}`} />
                            <span className="text-xs font-medium text-gray-700">
                                {isOnline ? 'Online' : 'Offline'}
                            </span>
                        </div>
                        {isOnline ? (
                            <Cloud className="w-4 h-4 text-green-500" />
                        ) : (
                            <CloudOff className="w-4 h-4 text-amber-500" />
                        )}
                    </div>
                </div>

                {/* Sections Grid - Fixed layout, no scroll */}
                <div className="px-2" style={{ overflow: 'hidden', flex: 1 }}>
                    <div className="grid grid-cols-1 gap-1" style={{ height: '100%' }}>
                        {sections?.slice(0, 8).map((section) => { // Limit to 8 sections for fixed height
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            const isComplete = isSectionComplete(section.id);
                            const isRequired = section.required;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => handleSectionClick(section.id)}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-100 shadow-sm'
                                            : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    title={section.label}
                                    aria-label={section.label}
                                >
                                    <div className="relative flex-shrink-0">
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                                        {!isComplete && isRequired && (
                                            <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
                                        )}
                                    </div>

                                    {(isOpen || isHovered) && (
                                        <>
                                            <div className="flex-1 text-left min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium truncate">
                                                        {section.label}
                                                    </span>
                                                    {!isRequired && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                                                            Optional
                                                        </span>
                                                    )}
                                                </div>
                                                {section.description && (
                                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                                        {section.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center flex-shrink-0">
                                                {isComplete ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                                )}
                                            </div>
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0" style={{ height: '80px' }}>
                {(isOpen || isHovered) ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleExit}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Exit</span>
                            </button>
                            <div className="text-xs text-gray-500">
                                v1.0
                            </div>
                        </div>
                        <div className="text-xs text-gray-400 text-center">
                            {new Date().getFullYear()} • ResumeCraft AI
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={handleExit}
                        className="w-full flex justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Exit Builder"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                )}
            </div>
        </aside>
    );

    // Mobile sidebar overlay - Still scrollable on mobile
    const renderMobileSidebar = () => (
        <AnimatePresence>
            {isMobileOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Sidebar Drawer */}
                    <motion.aside
                        ref={sidebarRef}
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden flex flex-col shadow-2xl"
                        style={{ height: '100vh', maxHeight: '100vh' }}
                    >
                        {/* Mobile Header */}
                        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-gray-900">ResumeCraft</h1>
                                        <p className="text-xs text-gray-600">Resume Builder</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-label="Close sidebar"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                        Working on
                                    </h2>
                                    <p className="text-sm font-semibold text-gray-800 truncate bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
                                        {resumeTitle}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">Progress</span>
                                        <span className="text-sm font-bold text-gray-900">{resumeProgress}%</span>
                                    </div>
                                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full bg-gradient-to-r ${getProgressColor()} rounded-full`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${resumeProgress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Actions */}
                        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                            <div className="flex justify-between gap-2">
                                <button
                                    onClick={onSave}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    <Save className="w-4 h-4" />
                                    Save
                                </button>
                                <button
                                    onClick={onPreview}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview
                                </button>
                                <button
                                    onClick={onExport}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Mobile Sections List - Scrollable on mobile */}
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="space-y-1 px-3">
                                {sections?.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    const isComplete = isSectionComplete(section.id);
                                    const isRequired = section.required;

                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionClick(section.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${isActive
                                                    ? 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-100 shadow-sm'
                                                    : 'hover:bg-gray-50 text-gray-700'
                                                }`}
                                        >
                                            <div className="relative">
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                                                {!isComplete && isRequired && (
                                                    <AlertCircle className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{section.label}</span>
                                                    {!isRequired && (
                                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                            Optional
                                                        </span>
                                                    )}
                                                </div>
                                                {section.description && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {section.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                {isComplete ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Mobile Footer */}
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                            <button
                                onClick={handleExit}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors font-medium shadow-sm"
                            >
                                <Home className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                            <div className="mt-3 text-xs text-gray-500 text-center">
                                Tap outside to close • v1.0
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

            {/* Spacer for fixed sidebar */}
            <div
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'lg:ml-72' : 'lg:ml-16'
                    }`}
                style={{ minHeight: '100vh' }}
            />
        </>
    );
};

export default BuilderSidebar;