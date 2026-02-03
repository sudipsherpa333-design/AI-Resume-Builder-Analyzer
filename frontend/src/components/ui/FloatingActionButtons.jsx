// ------------------- FloatingActionButtons.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Eye,
    Download,
    Save,
    Share2,
    Printer,
    Sparkles,
    Bot,
    X,
    CheckCircle,
    AlertCircle,
    Loader2,
    Clock,
    ArrowUp,
    Maximize2,
    FileText,
    Smartphone,
    Monitor,
    Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FloatingActionButtons = ({
    onSave,
    onSaveAndExit,
    onExport,
    onPreview,
    onShare,
    onPrint,
    isSaving,
    hasUnsavedChanges,
    lastSaved,
    isMobile,
    onAIEnhance,
    isAnalyzing
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSaveStatus, setShowSaveStatus] = useState(false);
    const [showPreviewOptions, setShowPreviewOptions] = useState(false);

    useEffect(() => {
        if (showSaveStatus) {
            const timer = setTimeout(() => {
                setShowSaveStatus(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSaveStatus]);

    const handleSaveClick = () => {
        onSave();
        setShowSaveStatus(true);
    };

    const mainButtons = [
        {
            icon: Sparkles,
            label: 'AI Enhance',
            color: 'from-blue-500 to-cyan-500',
            action: onAIEnhance,
            disabled: isAnalyzing,
            badge: isAnalyzing ? 'processing' : null
        },
        {
            icon: Plus,
            label: 'Add Section',
            color: 'from-emerald-500 to-teal-500',
            action: () => {
                toast.success('AI will suggest the best section to add');
                // This would trigger AI section recommendation
            },
            disabled: false
        },
        {
            icon: Eye,
            label: 'Preview',
            color: 'from-purple-500 to-pink-500',
            action: () => setShowPreviewOptions(true),
            disabled: false
        },
        {
            icon: Download,
            label: 'Export',
            color: 'from-amber-500 to-orange-500',
            action: onExport,
            disabled: false
        }
    ];

    const secondaryButtons = [
        { icon: Save, label: 'Save', action: handleSaveClick, disabled: isSaving },
        { icon: Share2, label: 'Share', action: onShare, disabled: false },
        { icon: Printer, label: 'Print', action: onPrint, disabled: false },
        {
            icon: Bot, label: 'AI Assistant', action: () => {
                toast('Opening AI Assistant...');
                // This would open the AI assistant modal
            }, disabled: false
        }
    ];

    const previewOptions = [
        { icon: Smartphone, label: 'Mobile View', action: () => { onPreview(); setShowPreviewOptions(false); } },
        { icon: Monitor, label: 'Desktop View', action: () => { onPreview(); setShowPreviewOptions(false); } },
        { icon: Maximize2, label: 'Full Screen', action: () => { onPreview(); setShowPreviewOptions(false); } }
    ];

    return (
        <>
            <div className={`fixed ${isMobile ? 'bottom-6 right-6' : 'bottom-8 right-8'} z-50 flex flex-col items-end gap-3`}>
                <AnimatePresence>
                    {showSaveStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mb-3"
                        >
                            <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200 flex items-center gap-3">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        <div>
                                            <p className="font-medium text-gray-900">AI Saving...</p>
                                            <p className="text-sm text-gray-600">Running analysis</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">AI Saved!</p>
                                            <p className="text-sm text-gray-600">
                                                {lastSaved ? `Analyzed ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'AI analysis complete'}
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="space-y-3 mb-3"
                        >
                            {secondaryButtons.map((button, index) => (
                                <motion.button
                                    key={button.label}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={button.action}
                                    disabled={button.disabled}
                                    className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <button.icon className="w-5 h-5 text-gray-700" />
                                    <span className="font-medium text-gray-900 whitespace-nowrap">{button.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showPreviewOptions && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="mb-3"
                        >
                            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                                <div className="p-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">AI Preview</h3>
                                        <button onClick={() => setShowPreviewOptions(false)} className="p-1 hover:bg-gray-100 rounded">
                                            <X className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-2">
                                    {previewOptions.map((option) => (
                                        <button
                                            key={option.label}
                                            onClick={option.action}
                                            className="w-full px-4 py-3 rounded-lg hover:bg-gray-100 flex items-center gap-3"
                                        >
                                            <option.icon className="w-5 h-5 text-gray-700" />
                                            <span className="font-medium text-gray-900">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col gap-3">
                    {mainButtons.map((button, index) => (
                        <motion.button
                            key={button.label}
                            initial={false}
                            animate={{
                                scale: isExpanded ? 1 : 0.9,
                                opacity: isExpanded ? 1 : index === 0 ? 1 : 0,
                                y: isExpanded ? 0 : index * -20
                            }}
                            onClick={button.action}
                            disabled={button.disabled}
                            className={`relative bg-gradient-to-r ${button.color} text-white p-4 rounded-full shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center`}
                            style={{ width: isExpanded ? 'auto' : '56px', height: '56px' }}
                        >
                            {button.disabled && button.badge === 'processing' ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <button.icon className="w-6 h-6" />
                            )}

                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    className="ml-3 mr-2 font-medium whitespace-nowrap"
                                >
                                    {button.label}
                                </motion.span>
                            )}

                            {button.badge && (
                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                </span>
                            )}
                        </motion.button>
                    ))}
                </div>

                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-3 bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-all"
                    whileTap={{ scale: 0.95 }}
                >
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <ArrowUp className="w-6 h-6 text-gray-700" />
                    </motion.div>
                </motion.button>
            </div>

            <AnimatePresence>
                {hasUnsavedChanges && !isSaving && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed ${isMobile ? 'bottom-24 left-4 right-4' : 'bottom-8 left-8'} z-40`}
                    >
                        <div className="bg-amber-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">AI detected unsaved changes</p>
                                    <p className="text-sm opacity-90">Save for AI analysis</p>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveClick}
                                className="px-4 py-2 bg-white text-amber-600 font-medium rounded-lg hover:bg-amber-50 transition-colors"
                            >
                                Save Now
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FloatingActionButtons;