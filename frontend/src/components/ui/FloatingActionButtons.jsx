// src/components/ui/FloatingActionButtons.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Save,
    Download,
    Share2,
    Printer,
    Settings,
    HelpCircle,
    Maximize2,
    Minimize2,
    Brain,
    Wand2,
    Sparkles,
    Plus,
    Eye,
    EyeOff,
    Menu,
    X,
    Check,
    Zap,
    FileText,
    Copy,
    Upload,
    RefreshCw,
    Type,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Link,
    Image,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Minus,
    Briefcase,
    Smile
} from 'lucide-react';

const FloatingActionButtons = ({
    // Core actions
    onSave,
    onExport,
    onShare,
    onPrint,
    onFullscreen,
    onAIEnhance,
    onPreview,

    // Menu actions
    onSettings,
    onHelp,
    onAddSection,

    // State
    isFullscreen = false,
    showPreview = false,
    saveStatus = 'idle',
    user,

    // Positioning
    position = 'bottom-right',
    compact = false,

    // Data
    resumeData = {},

    // AI Features
    onAIAction,
    aiFeatures = [],
    exportOptions = {},

    // NEW PROPS for AI Assistant
    onOpenAIAssistant,
    isAIAssistantOpen = false,

    // Text formatting
    onTextFormat,
    onInsertElement,

    // Zoom controls
    onZoomIn,
    onZoomOut,
    onResetZoom,
    zoomLevel = 100,

    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredButton, setHoveredButton] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showAIMenu, setShowAIMenu] = useState(false);
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showTextTools, setShowTextTools] = useState(false);
    const [showInsertTools, setShowInsertTools] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Helper functions
    const getSaveLabel = (status) => {
        switch (status) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved';
            case 'error': return 'Error';
            default: return 'Save';
        }
    };

    const getSaveColor = (status) => {
        switch (status) {
            case 'saving': return 'from-amber-500 to-orange-500';
            case 'saved': return 'from-green-500 to-emerald-600';
            case 'error': return 'from-red-500 to-rose-600';
            default: return 'from-blue-600 to-cyan-600';
        }
    };

    // Default handlers
    const handleDefaultSave = () => {
        toast.success('Resume saved successfully!', {
            icon: '💾',
            duration: 3000
        });
    };

    const handleDefaultFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleDefaultShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'My Resume',
                    text: 'Check out my professional resume!',
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch (err) {
            console.error('Share failed:', err);
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDefaultPrint = () => {
        window.print();
    };

    const handleDefaultHelp = () => {
        toast('📚 Opening help documentation...', {
            duration: 3000,
            icon: '❓'
        });
    };

    const handleDefaultAddSection = () => {
        toast('➕ Add new section to your resume', {
            duration: 3000,
            icon: '📝'
        });
    };

    // AI Assistant handler
    const handleAIAssistant = () => {
        if (onOpenAIAssistant) {
            onOpenAIAssistant(!isAIAssistantOpen);
            toast.success(isAIAssistantOpen ? 'AI Assistant closed' : 'AI Assistant opened!', {
                icon: '🤖',
                duration: 2000
            });
        } else {
            toast('🤖 Opening AI Assistant...', {
                duration: 2000,
                icon: '⚡'
            });
        }
        setShowAIMenu(false);
    };

    // AI Action handler
    const handleAIAction = async (action, data) => {
        try {
            if (onAIAction) {
                await onAIAction(action, data);
            } else {
                toast(`🤖 Processing ${action.replace('-', ' ')}...`, {
                    duration: 2000
                });

                setTimeout(() => {
                    toast.success(`✅ ${action.replace('-', ' ')} completed successfully!`, {
                        duration: 3000,
                        icon: '✨'
                    });
                }, 1500);
            }
            setShowAIMenu(false);
        } catch (error) {
            toast.error(`Failed to process ${action.replace('-', ' ')}`, {
                duration: 3000,
                icon: '❌'
            });
        }
    };

    // Export handler
    const handleExport = async (format) => {
        try {
            if (onExport) {
                await onExport(format);
            } else {
                toast(`📥 Exporting as ${format.toUpperCase()}...`, {
                    duration: 2000
                });

                setTimeout(() => {
                    toast.success(`✅ Resume exported as ${format.toUpperCase()}!`, {
                        duration: 3000,
                        icon: '📄'
                    });
                }, 1500);
            }
            setShowExportMenu(false);
        } catch (error) {
            toast.error(`Failed to export as ${format}`, {
                duration: 3000,
                icon: '❌'
            });
        }
    };

    // Text formatting handler
    const handleTextFormat = (format) => {
        if (onTextFormat) {
            onTextFormat(format);
        } else {
            toast(`Applied ${format} formatting`, {
                duration: 2000
            });
        }
        setShowTextTools(false);
    };

    // Element insertion handler
    const handleInsertElement = (element) => {
        if (onInsertElement) {
            onInsertElement(element);
        } else {
            toast(`Inserted ${element}`, {
                duration: 2000
            });
        }
        setShowInsertTools(false);
    };

    // Default button groups
    const defaultButtonGroups = [
        {
            id: 'ai',
            label: isAIAssistantOpen ? 'Close AI' : 'AI Assistant',
            icon: Brain,
            color: 'from-purple-600 to-pink-600',
            onClick: handleAIAssistant,
            badge: user?.aiCredits || 0,
            hasMenu: true,
            isActive: isAIAssistantOpen,
            tooltip: 'AI Assistant (Ctrl+Space)'
        },
        {
            id: 'preview',
            label: showPreview ? 'Hide Preview' : 'Show Preview',
            icon: showPreview ? EyeOff : Eye,
            color: 'from-blue-600 to-cyan-600',
            onClick: onPreview || (() => toast.success('Preview toggled')),
            tooltip: 'Toggle Preview'
        },
        {
            id: 'save',
            label: getSaveLabel(saveStatus),
            icon: saveStatus === 'saving' ? RefreshCw : Save,
            color: getSaveColor(saveStatus),
            onClick: onSave || handleDefaultSave,
            disabled: saveStatus === 'saving',
            tooltip: 'Save Resume (Ctrl+S)'
        },
        {
            id: 'export',
            label: 'Export',
            icon: Download,
            color: 'from-indigo-600 to-blue-600',
            onClick: () => setShowExportMenu(!showExportMenu),
            hasMenu: true,
            tooltip: 'Export Options'
        },
        {
            id: 'fullscreen',
            label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
            icon: isFullscreen ? Minimize2 : Maximize2,
            color: 'from-gray-600 to-gray-800',
            onClick: onFullscreen || handleDefaultFullscreen,
            tooltip: isFullscreen ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)'
        }
    ];

    // Text formatting buttons
    const textFormatButtons = [
        { id: 'bold', icon: Bold, label: 'Bold', shortcut: 'Ctrl+B', onClick: () => handleTextFormat('bold') },
        { id: 'italic', icon: Italic, label: 'Italic', shortcut: 'Ctrl+I', onClick: () => handleTextFormat('italic') },
        { id: 'underline', icon: Underline, label: 'Underline', shortcut: 'Ctrl+U', onClick: () => handleTextFormat('underline') },
        { id: 'align-left', icon: AlignLeft, label: 'Align Left', onClick: () => handleTextFormat('align-left') },
        { id: 'align-center', icon: AlignCenter, label: 'Align Center', onClick: () => handleTextFormat('align-center') },
        { id: 'align-right', icon: AlignRight, label: 'Align Right', onClick: () => handleTextFormat('align-right') },
        { id: 'bullet-list', icon: List, label: 'Bullet List', shortcut: 'Ctrl+Shift+L', onClick: () => handleTextFormat('bullet-list') },
        { id: 'numbered-list', icon: ListOrdered, label: 'Numbered List', shortcut: 'Ctrl+Shift+N', onClick: () => handleTextFormat('numbered-list') },
    ];

    // Insert element buttons
    const insertButtons = [
        { id: 'link', icon: Link, label: 'Link', shortcut: 'Ctrl+K', onClick: () => handleInsertElement('link') },
        { id: 'image', icon: Image, label: 'Image', onClick: () => handleInsertElement('image') },
        { id: 'table', icon: Type, label: 'Table', onClick: () => handleInsertElement('table') },
        { id: 'divider', icon: Minus, label: 'Divider', onClick: () => handleInsertElement('divider') },
        { id: 'code', icon: Copy, label: 'Code Block', onClick: () => handleInsertElement('code') },
    ];

    // Additional buttons
    const additionalButtons = [
        {
            id: 'text-tools',
            label: 'Text Tools',
            icon: Type,
            color: 'from-blue-500 to-cyan-500',
            onClick: () => setShowTextTools(!showTextTools),
            hasMenu: true
        },
        {
            id: 'insert',
            label: 'Insert',
            icon: Plus,
            color: 'from-green-500 to-emerald-500',
            onClick: () => setShowInsertTools(!showInsertTools),
            hasMenu: true
        },
        {
            id: 'zoom-in',
            label: 'Zoom In',
            icon: ZoomIn,
            color: 'from-gray-500 to-gray-700',
            onClick: onZoomIn || (() => toast.success('Zoomed in')),
            disabled: zoomLevel >= 150
        },
        {
            id: 'zoom-out',
            label: 'Zoom Out',
            icon: ZoomOut,
            color: 'from-gray-500 to-gray-700',
            onClick: onZoomOut || (() => toast.success('Zoomed out')),
            disabled: zoomLevel <= 50
        },
        {
            id: 'reset-zoom',
            label: 'Reset Zoom',
            icon: RotateCcw,
            color: 'from-gray-600 to-gray-800',
            onClick: onResetZoom || (() => toast.success('Zoom reset'))
        },
        {
            id: 'share',
            label: 'Share',
            icon: Share2,
            color: 'from-green-600 to-emerald-600',
            onClick: onShare || handleDefaultShare,
            tooltip: 'Share Resume'
        },
        {
            id: 'print',
            label: 'Print',
            icon: Printer,
            color: 'from-amber-600 to-orange-600',
            onClick: onPrint || handleDefaultPrint,
            tooltip: 'Print Resume'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            color: 'from-gray-600 to-gray-800',
            onClick: () => setShowSettingsMenu(!showSettingsMenu),
            hasMenu: true,
            tooltip: 'Settings'
        },
        {
            id: 'help',
            label: 'Help',
            icon: HelpCircle,
            color: 'from-blue-500 to-cyan-500',
            onClick: onHelp || handleDefaultHelp,
            tooltip: 'Help & Documentation'
        },
        {
            id: 'add-section',
            label: 'Add Section',
            icon: Plus,
            color: 'from-purple-500 to-pink-500',
            onClick: onAddSection || handleDefaultAddSection,
            tooltip: 'Add New Section'
        }
    ];

    // AI Features menu options
    const aiFeaturesList = [
        {
            id: 'open-assistant',
            label: 'Open AI Assistant',
            icon: Brain,
            description: 'Open full AI Assistant panel',
            credits: 0,
            color: 'from-purple-100 to-purple-200',
            onClick: handleAIAssistant
        },
        {
            id: 'enhance-all',
            label: 'Enhance Entire Resume',
            icon: Sparkles,
            description: 'AI will optimize all sections',
            credits: 3,
            color: 'from-pink-100 to-pink-200',
            onClick: () => handleAIAction('enhance-all', resumeData)
        },
        {
            id: 'ats-check',
            label: 'ATS Score Check',
            icon: Check,
            description: 'Check ATS compatibility',
            credits: 1,
            color: 'from-blue-100 to-blue-200',
            onClick: () => handleAIAction('ats-check', resumeData)
        },
        {
            id: 'grammar-check',
            label: 'Grammar & Spelling',
            icon: FileText,
            description: 'Fix grammar and spelling errors',
            credits: 1,
            color: 'from-green-100 to-green-200',
            onClick: () => handleAIAction('grammar-check', resumeData)
        },
        {
            id: 'rewrite',
            label: 'Rewrite with AI',
            icon: Wand2,
            description: 'Complete resume rewrite',
            credits: 5,
            color: 'from-orange-100 to-orange-200',
            onClick: () => handleAIAction('rewrite', resumeData)
        },
        {
            id: 'generate-cover',
            label: 'Generate Cover Letter',
            icon: Copy,
            description: 'Create matching cover letter',
            credits: 4,
            color: 'from-indigo-100 to-indigo-200',
            onClick: () => handleAIAction('cover-letter', resumeData)
        }
    ];

    // Export options
    const exportOptionsList = [
        {
            id: 'pdf',
            label: 'PDF Document',
            format: 'pdf',
            icon: FileText,
            description: 'High-quality PDF for printing',
            color: 'from-red-100 to-red-200',
            onClick: () => handleExport('pdf')
        },
        {
            id: 'docx',
            label: 'Word Document',
            format: 'docx',
            icon: FileText,
            description: 'Editable Word document',
            color: 'from-blue-100 to-blue-200',
            onClick: () => handleExport('docx')
        },
        {
            id: 'txt',
            label: 'Plain Text',
            format: 'txt',
            icon: FileText,
            description: 'Simple text format',
            color: 'from-gray-100 to-gray-200',
            onClick: () => handleExport('txt')
        },
        {
            id: 'json',
            label: 'JSON Data',
            format: 'json',
            icon: FileText,
            description: 'Raw data for backup',
            color: 'from-green-100 to-green-200',
            onClick: () => handleExport('json')
        },
        {
            id: 'image',
            label: 'PNG Image',
            format: 'png',
            icon: FileText,
            description: 'Screenshot as image',
            color: 'from-purple-100 to-purple-200',
            onClick: () => handleExport('png')
        }
    ];

    // Settings options
    const settingsOptions = [
        {
            id: 'auto-save',
            label: 'Auto Save',
            icon: Save,
            description: 'Automatically save changes',
            checked: true,
            color: 'from-green-100 to-green-200',
            onChange: () => toast.success('Auto save toggled')
        },
        {
            id: 'spell-check',
            label: 'Spell Check',
            icon: Check,
            description: 'Enable spell checking',
            checked: true,
            color: 'from-blue-100 to-blue-200',
            onChange: () => toast.success('Spell check toggled')
        },
        {
            id: 'ai-suggestions',
            label: 'AI Suggestions',
            icon: Brain,
            description: 'Show AI improvement suggestions',
            checked: true,
            color: 'from-purple-100 to-purple-200',
            onChange: () => toast.success('AI suggestions toggled')
        },
        {
            id: 'dark-mode',
            label: 'Dark Mode',
            icon: Eye,
            description: 'Switch to dark theme',
            checked: false,
            color: 'from-gray-100 to-gray-200',
            onChange: () => toast.success('Dark mode toggled')
        }
    ];

    const MainButton = ({ group }) => {
        const Icon = group.icon;
        return (
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={group.onClick}
                disabled={group.disabled}
                className={`w-14 h-14 bg-gradient-to-r ${group.color} text-white rounded-full shadow-2xl flex items-center justify-center relative transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${group.isActive ? 'ring-4 ring-purple-300 ring-opacity-50' : ''}`}
                onMouseEnter={() => setHoveredButton(group.id)}
                onMouseLeave={() => setHoveredButton(null)}
                title={group.tooltip || group.label}
            >
                {saveStatus === 'saving' && group.id === 'save' ? (
                    <RefreshCw size={24} className="animate-spin" />
                ) : (
                    <Icon size={24} />
                )}

                {/* Badge for AI credits */}
                {group.badge > 0 && group.id === 'ai' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-purple-600 text-purple-700 text-xs rounded-full flex items-center justify-center font-bold">
                        {group.badge}
                    </div>
                )}

                {/* Error indicator for save */}
                {group.id === 'save' && saveStatus === 'error' && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        !
                    </div>
                )}

                {/* Active indicator for AI Assistant */}
                {group.id === 'ai' && group.isActive && (
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
            </motion.button>
        );
    };

    // Menu Component
    const MenuComponent = ({ title, items, onClose, columns = 1 }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-[300px] max-w-[350px] max-h-[500px] overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            <div className={`grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            item.onClick?.();
                            item.onChange?.();
                            onClose();
                        }}
                        disabled={item.disabled}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group ${item.id === 'open-assistant' ? 'border-2 border-purple-200 bg-purple-50 hover:bg-purple-100' : ''} ${item.color ? `bg-gradient-to-r ${item.color}` : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-lg ${item.color ? 'bg-transparent' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                            <item.icon size={18} className={`${item.id === 'open-assistant' ? 'text-purple-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="text-left flex-1">
                            <div className="font-medium text-sm text-gray-900">{item.label}</div>
                            {item.description && (
                                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            )}
                            {item.shortcut && (
                                <div className="text-xs text-gray-400 mt-0.5">{item.shortcut}</div>
                            )}
                        </div>
                        {item.credits > 0 && (
                            <div className="flex items-center gap-1 text-xs">
                                <Zap size={10} className="text-amber-500" />
                                <span className="font-medium text-amber-600">{item.credits}</span>
                            </div>
                        )}
                        {item.checked !== undefined && (
                            <div className={`w-5 h-5 rounded-full ${item.checked ? 'bg-green-500' : 'bg-gray-300'} flex items-center justify-center`}>
                                {item.checked && <Check size={12} className="text-white" />}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </motion.div>
    );

    const getPositionClasses = () => {
        const positions = {
            'bottom-right': 'bottom-4 right-4',
            'bottom-left': 'bottom-4 left-4',
            'top-right': 'top-4 right-4',
            'top-left': 'top-4 left-4',
            'center-right': 'top-1/2 right-4 transform -translate-y-1/2',
            'center-left': 'top-1/2 left-4 transform -translate-y-1/2'
        };
        return positions[position] || 'bottom-4 right-4';
    };

    // Mobile/Compact View
    if (compact || isMobile) {
        return (
            <div className={`fixed ${getPositionClasses()} z-50 flex flex-col gap-3`}>
                {/* Main Buttons */}
                {defaultButtonGroups.map((group) => (
                    <MainButton key={group.id} group={group} />
                ))}

                {/* Menu Toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>
                {/* Expanded Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 min-w-[260px] max-h-[400px] overflow-y-auto"
                        >
                            {additionalButtons.map((group, index) => {
                                const Icon = group.icon;
                                return (
                                    <motion.button
                                        key={group.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => {
                                            if (group.hasMenu) {
                                                if (group.id === 'text-tools') setShowTextTools(true);
                                                else if (group.id === 'insert') setShowInsertTools(true);
                                                else if (group.id === 'export') setShowExportMenu(true);
                                                else if (group.id === 'settings') setShowSettingsMenu(true);
                                            } else {
                                                group.onClick?.();
                                            }
                                            setIsOpen(false);
                                        }}
                                        disabled={group.disabled}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${group.color} flex items-center justify-center`}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <div className="font-medium text-sm">{group.label}</div>
                                            {group.tooltip && (
                                                <div className="text-xs text-gray-500">{group.tooltip}</div>
                                            )}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sub-menus */}
                <AnimatePresence>
                    {showAIMenu && (
                        <MenuComponent
                            title="AI Assistant"
                            items={aiFeaturesList}
                            onClose={() => setShowAIMenu(false)}
                        />
                    )}
                    {showExportMenu && (
                        <MenuComponent
                            title="Export Resume"
                            items={exportOptionsList}
                            onClose={() => setShowExportMenu(false)}
                        />
                    )}
                    {showSettingsMenu && (
                        <MenuComponent
                            title="Settings"
                            items={settingsOptions}
                            onClose={() => setShowSettingsMenu(false)}
                        />
                    )}
                    {showTextTools && (
                        <MenuComponent
                            title="Text Formatting"
                            items={textFormatButtons}
                            onClose={() => setShowTextTools(false)}
                            columns={2}
                        />
                    )}
                    {showInsertTools && (
                        <MenuComponent
                            title="Insert Elements"
                            items={insertButtons}
                            onClose={() => setShowInsertTools(false)}
                            columns={2}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Desktop Layout
    return (
        <div className={`fixed ${getPositionClasses()} z-50 flex flex-col gap-3`}>
            {/* Tooltip Container */}
            <AnimatePresence>
                {hoveredButton && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute right-20 top-1/2 transform -translate-y-1/2"
                    >
                        <div className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-lg">
                            {defaultButtonGroups.find(g => g.id === hoveredButton)?.label}
                            {hoveredButton === 'ai' && user?.aiCredits && (
                                <div className="text-xs text-gray-300 mt-1 flex items-center gap-1">
                                    <Zap size={10} className="text-amber-400" />
                                    {user.aiCredits} credits available
                                </div>
                            )}
                        </div>
                        <div className="absolute right-[-6px] top-1/2 transform -translate-y-1/2">
                            <div className="w-3 h-3 bg-gray-900 rotate-45" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Buttons */}
            {defaultButtonGroups.map((group, index) => (
                <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                >
                    <MainButton group={group} />

                    {/* Sub-menus */}
                    <AnimatePresence>
                        {group.id === 'ai' && showAIMenu && (
                            <MenuComponent
                                title="AI Assistant"
                                items={aiFeaturesList}
                                onClose={() => setShowAIMenu(false)}
                            />
                        )}
                        {group.id === 'export' && showExportMenu && (
                            <MenuComponent
                                title="Export Resume"
                                items={exportOptionsList}
                                onClose={() => setShowExportMenu(false)}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}

            {/* Additional Menu Toggle */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: defaultButtonGroups.length * 0.1 }}
                className="relative"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-full shadow-2xl flex items-center justify-center"
                    onMouseEnter={() => setHoveredButton('more')}
                    onMouseLeave={() => setHoveredButton(null)}
                    title="More Actions"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.button>

                {/* Additional Buttons Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 min-w-[240px]"
                        >
                            <div className="grid grid-cols-2 gap-2">
                                {additionalButtons.map((group, index) => {
                                    const Icon = group.icon;
                                    return (
                                        <motion.button
                                            key={group.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            onClick={() => {
                                                if (group.hasMenu) {
                                                    if (group.id === 'text-tools') setShowTextTools(true);
                                                    else if (group.id === 'insert') setShowInsertTools(true);
                                                    else if (group.id === 'settings') setShowSettingsMenu(true);
                                                } else {
                                                    group.onClick?.();
                                                }
                                                setIsOpen(false);
                                            }}
                                            disabled={group.disabled}
                                            className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={group.tooltip || group.label}
                                        >
                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${group.color} flex items-center justify-center mb-2`}>
                                                <Icon size={18} className="text-white" />
                                            </div>
                                            <div className="text-xs font-medium text-center">{group.label}</div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Sub-menus for additional buttons */}
            <AnimatePresence>
                {showTextTools && (
                    <MenuComponent
                        title="Text Formatting"
                        items={textFormatButtons}
                        onClose={() => setShowTextTools(false)}
                        columns={2}
                    />
                )}
                {showInsertTools && (
                    <MenuComponent
                        title="Insert Elements"
                        items={insertButtons}
                        onClose={() => setShowInsertTools(false)}
                        columns={2}
                    />
                )}
                {showSettingsMenu && (
                    <MenuComponent
                        title="Settings"
                        items={settingsOptions}
                        onClose={() => setShowSettingsMenu(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingActionButtons;