// src/components/ui/FloatingActionButtons.jsx - COMPLETE WORKING VERSION
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    FileDown,
    Download,
    Save,
    Eye,
    BarChart,
    Sparkles,
    X,
    Maximize2,
    Edit2,
    Layout,
    Printer,
    Share2,
    Copy,
    Trash2,
    Settings,
    File,
    MessageSquare,
    Zap,
    Check,
    AlertCircle,
    HelpCircle,
    ExternalLink,
    Menu,
    ChevronRight
} from 'lucide-react';

const FloatingActionButtons = ({
    buttons = [],
    onAction,
    isSaving = false,
    isExporting = false,
    isAnalyzing = false,
    showExportMenu = false,
    onToggleExportMenu,
    onExportPDF,
    onExportDOCX,
    onExportJSON,
    // New props for additional actions
    onEditTitle,
    onTemplateChange,
    onPrint,
    onShare,
    onDuplicate,
    onDelete,
    onFullscreen,
    onSettings
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null); // 'export', 'more', 'ai', null

    // Default buttons if none provided
    const defaultButtons = [
        { id: 'ai', icon: Sparkles, label: 'AI Assistant', color: 'from-purple-600 to-pink-600', action: 'toggleAI' },
        { id: 'export', icon: Download, label: 'Export', color: 'from-blue-600 to-cyan-600', action: 'export' },
        { id: 'save', icon: Save, label: 'Save', color: 'from-green-600 to-emerald-600', action: 'save' },
        { id: 'preview', icon: Eye, label: 'Preview', color: 'from-indigo-600 to-violet-600', action: 'preview' },
        { id: 'analyze', icon: BarChart, label: 'Analyze', color: 'from-orange-600 to-red-600', action: 'analyze' }
    ];

    const displayButtons = buttons.length > 0 ? buttons : defaultButtons;

    // Close all menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            const fabContainer = document.querySelector('.fab-container');
            if (fabContainer && !fabContainer.contains(event.target)) {
                setActiveMenu(null);
                setIsExpanded(false);
            }
        };

        if (activeMenu || isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenu, isExpanded]);

    const handleMainButtonClick = useCallback(() => {
        setIsExpanded(prev => !prev);
        if (activeMenu) setActiveMenu(null);
    }, [activeMenu]);

    const handleAction = useCallback((action) => {
        switch (action) {
            case 'toggleAI':
            case 'save':
            case 'preview':
            case 'analyze':
                onAction?.(action);
                break;
            case 'export':
                setActiveMenu(prev => prev === 'export' ? null : 'export');
                onToggleExportMenu?.();
                break;
            default:
                onAction?.(action);
        }

        if (action !== 'export') {
            setIsExpanded(false);
            setActiveMenu(null);
        }
    }, [onAction, onToggleExportMenu]);

    const handleExportClick = useCallback((type) => {
        switch (type) {
            case 'pdf':
                onExportPDF?.();
                break;
            case 'json':
                onExportJSON?.();
                break;
            case 'docx':
                onExportDOCX?.();
                break;
        }
        setActiveMenu(null);
        setIsExpanded(false);
    }, [onExportPDF, onExportJSON, onExportDOCX]);

    const handleMoreAction = useCallback((action) => {
        switch (action) {
            case 'fullscreen':
                onFullscreen?.();
                break;
            case 'editTitle':
                onEditTitle?.();
                break;
            case 'template':
                onTemplateChange?.();
                break;
            case 'print':
                onPrint?.();
                break;
            case 'share':
                onShare?.();
                break;
            case 'duplicate':
                onDuplicate?.();
                break;
            case 'delete':
                onDelete?.();
                break;
            case 'settings':
                onSettings?.();
                break;
        }
        setActiveMenu(null);
        setIsExpanded(false);
    }, [onFullscreen, onEditTitle, onTemplateChange, onPrint, onShare, onDuplicate, onDelete, onSettings]);

    const renderButtonIcon = (button, isLoading = false) => {
        if (isLoading && button.id === 'save') {
            return (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            );
        }
        if (isLoading && button.id === 'export') {
            return (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            );
        }
        if (isLoading && button.id === 'analyze') {
            return (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            );
        }
        const Icon = button.icon;
        return <Icon size={24} />;
    };

    // Render Export Menu
    const renderExportMenu = () => (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
            <div className="py-2">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Export Resume</h3>
                        <button
                            onClick={() => setActiveMenu(null)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose your preferred format</p>
                </div>

                <div className="py-1">
                    <button
                        onClick={() => handleExportClick('pdf')}
                        disabled={isExporting}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FileDown size={18} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">PDF Document</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Best for printing & sharing</div>
                        </div>
                        {isExporting && (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        )}
                    </button>

                    <button
                        onClick={() => handleExportClick('docx')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <File size={18} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">Word Document</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Editable .docx format</div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </button>

                    <button
                        onClick={() => handleExportClick('json')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <File size={18} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">JSON Data</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Raw data backup</div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </button>
                </div>

                <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <AlertCircle size={12} />
                        <span>Exports include all sections and formatting</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // Render More Actions Menu
    const renderMoreMenu = () => (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-24 right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
        >
            <div className="py-2">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">More Actions</h3>
                        <button
                            onClick={() => setActiveMenu(null)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="py-1">
                    <button
                        onClick={() => handleMoreAction('editTitle')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Edit2 size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Edit Resume Title</span>
                    </button>

                    <button
                        onClick={() => handleMoreAction('template')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Layout size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change Template</span>
                    </button>

                    <button
                        onClick={() => handleMoreAction('fullscreen')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Maximize2 size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fullscreen Mode</span>
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                    <button
                        onClick={() => handleMoreAction('print')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Printer size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Print Resume</span>
                    </button>

                    <button
                        onClick={() => handleMoreAction('share')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Share2 size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Share Resume</span>
                    </button>

                    <button
                        onClick={() => handleMoreAction('duplicate')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Copy size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duplicate Resume</span>
                    </button>

                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                    <button
                        onClick={() => handleMoreAction('settings')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <Settings size={18} className="text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                    </button>

                    <button
                        onClick={() => handleMoreAction('delete')}
                        className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                    >
                        <Trash2 size={18} />
                        <span className="text-sm font-medium">Delete Resume</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="fab-container fixed bottom-6 right-6 z-50">
            {/* Export Menu */}
            <AnimatePresence>
                {activeMenu === 'export' && renderExportMenu()}
            </AnimatePresence>

            {/* More Actions Menu */}
            <AnimatePresence>
                {activeMenu === 'more' && renderMoreMenu()}
            </AnimatePresence>

            {/* Floating Buttons */}
            <div className="flex flex-col items-end gap-3">
                {/* Secondary Buttons - Only show when expanded */}
                <AnimatePresence>
                    {isExpanded && displayButtons.map((button, index) => {
                        const isLoading =
                            (button.id === 'save' && isSaving) ||
                            (button.id === 'export' && isExporting) ||
                            (button.id === 'analyze' && isAnalyzing);

                        return (
                            <motion.div
                                key={button.id}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center gap-2"
                            >
                                {/* Tooltip */}
                                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                    {button.label}
                                </div>

                                {/* Button */}
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAction(button.action)}
                                    disabled={isLoading}
                                    className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center ${button.color} text-white hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                                    aria-label={button.label}
                                >
                                    {renderButtonIcon(button, isLoading)}

                                    {/* Active indicator for export */}
                                    {button.action === 'export' && activeMenu === 'export' && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* More Actions Button - Only show when expanded */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ delay: displayButtons.length * 0.05 }}
                            className="flex items-center gap-2"
                        >
                            {/* Tooltip */}
                            <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                                More Actions
                            </div>

                            {/* More Actions Button */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveMenu(prev => prev === 'more' ? null : 'more')}
                                className={`relative w-14 h-14 rounded-full shadow-xl flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-white hover:shadow-2xl transition-all duration-300 ${activeMenu === 'more' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                aria-label="More actions"
                            >
                                <Menu size={24} />
                                {activeMenu === 'more' && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                )}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Toggle Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMainButtonClick}
                    className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center"
                    aria-label={isExpanded ? "Close menu" : "Open menu"}
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 45 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isExpanded ? (
                            <X size={28} />
                        ) : (
                            <Plus size={28} />
                        )}
                    </motion.div>

                    {/* Notification badge */}
                    {(isSaving || isExporting || isAnalyzing) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    )}
                </motion.button>
            </div>

            {/* Status Indicators */}
            {(isSaving || isExporting || isAnalyzing) && (
                <div className="fixed bottom-24 left-6 z-50">
                    <AnimatePresence>
                        {isSaving && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm text-green-700 flex items-center gap-2 shadow-lg"
                            >
                                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                                Auto-saving changes...
                            </motion.div>
                        )}
                        {isExporting && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-blue-50 border border-blue-200 rounded-full px-4 py-2 text-sm text-blue-700 flex items-center gap-2 shadow-lg mt-2"
                            >
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                Exporting resume...
                            </motion.div>
                        )}
                        {isAnalyzing && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="bg-amber-50 border border-amber-200 rounded-full px-4 py-2 text-sm text-amber-700 flex items-center gap-2 shadow-lg mt-2"
                            >
                                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                Analyzing resume...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default FloatingActionButtons;