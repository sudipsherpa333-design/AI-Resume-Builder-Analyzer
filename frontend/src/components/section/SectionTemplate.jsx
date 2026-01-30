// src/components/builder/SectionTemplate.jsx - BASE TEMPLATE FOR ALL SECTIONS
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Save,
    Sparkles,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
    Loader2,
    CheckCircle,
    Clock,
    Info,
    Maximize2,
    Minimize2,
    Copy,
    Trash2,
    Plus,
    Upload,
    X,
    Brain,
    Target,
    ZoomIn,
    ZoomOut,
    RotateCcw
} from 'lucide-react';

const SectionTemplate = ({
    title,
    description,
    icon: Icon,
    children,
    onUpdate,
    onNext,
    onPrev,
    onAIEnhance,
    isMobile,
    aiCredits = 150,
    sectionConfig,
    data = {},
    isFullscreen = false,
    onToggleFullscreen,
    zoomLevel = 100,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    color = '#4f46e5',
    required = true,
    stats = {},
    sectionNumber = 1,
    totalSections = 10
}) => {
    const [localData, setLocalData] = useState(data);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isAIEnhancing, setIsAIEnhancing] = useState(false);

    // Initialize data
    useEffect(() => {
        if (Object.keys(data).length > 0) {
            setLocalData(data);
        }
    }, [data]);

    // Auto-save effect
    useEffect(() => {
        if (hasChanges && onUpdate) {
            const timeout = setTimeout(() => {
                handleAutoSave();
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [localData, hasChanges, onUpdate]);

    const handleInputChange = (field, value) => {
        setLocalData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const handleDataUpdate = (newData) => {
        setLocalData(newData);
        setHasChanges(true);
    };

    const handleAutoSave = async () => {
        if (!hasChanges || !onUpdate) return;

        setIsSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            onUpdate(localData);
            setLastSaved(new Date());
            setHasChanges(false);

            toast.success('Auto-saved!', {
                icon: '💾',
                duration: 1500,
            });
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Auto-save failed');
        } finally {
            setIsSaving(false);
        }
    };

    const handleManualSave = () => {
        if (!hasChanges || !onUpdate) {
            toast.error('No changes to save');
            return;
        }
        handleAutoSave();
    };

    const handleAIEnhanceClick = async () => {
        if (aiCredits <= 0) {
            toast.error('Insufficient AI credits!');
            return;
        }

        if (!onAIEnhance) {
            toast.error('AI enhancement not available for this section');
            return;
        }

        setIsAIEnhancing(true);
        try {
            await onAIEnhance();
            toast.success('AI enhancement applied!');
        } catch (error) {
            toast.error('AI enhancement failed');
        } finally {
            setIsAIEnhancing(false);
        }
    };

    const formatTime = (date) => {
        if (!date) return '';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getCompletionStatus = () => {
        if (!localData) return false;
        // Basic completion check - override in specific components
        return Object.keys(localData).length > 0;
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header - Shows only when not in fullscreen */}
            {!isFullscreen && (
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="p-3 rounded-xl"
                                style={{ backgroundColor: `${color}15` }}
                            >
                                <Icon className="w-6 h-6" style={{ color }} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="text-sm font-medium text-white px-3 py-1 rounded-full"
                                        style={{ backgroundColor: color }}
                                    >
                                        Section {sectionNumber} of {totalSections}
                                    </span>
                                    {required && (
                                        <span className="text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                                            Required
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                                <p className="text-gray-600">{description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Save Status */}
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                        <span className="text-sm font-medium text-gray-700">Saving...</span>
                                    </>
                                ) : hasChanges ? (
                                    <>
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        <span className="text-sm font-medium text-amber-600">Unsaved</span>
                                    </>
                                ) : lastSaved ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm font-medium text-gray-700">
                                            Saved {formatTime(lastSaved)}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Info className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-500">Auto-save enabled</span>
                                    </>
                                )}
                            </div>

                            {/* Save Button */}
                            <button
                                onClick={handleManualSave}
                                disabled={isSaving || !hasChanges}
                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${isSaving || !hasChanges
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="max-w-6xl mx-auto">
                    {/* AI Enhancement Banner */}
                    {onAIEnhance && aiCredits > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-800">AI Assistant Available</h4>
                                        <p className="text-sm text-gray-600">
                                            Enhance this section with AI ({aiCredits} credits remaining)
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleAIEnhanceClick}
                                    disabled={isAIEnhancing || aiCredits <= 0}
                                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isAIEnhancing || aiCredits <= 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                                        }`}
                                >
                                    {isAIEnhancing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Enhancing...
                                        </>
                                    ) : (
                                        <>
                                            <Brain className="w-4 h-4" />
                                            Enhance with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Content Area */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        {/* Section-specific content */}
                        {children ? (
                            children
                        ) : (
                            <div className="text-center py-12">
                                <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-700 mb-2">{title}</h3>
                                <p className="text-gray-500 mb-6">{description}</p>
                                <p className="text-sm text-gray-400">Content coming soon...</p>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={onPrev}
                                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                                >
                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                    Previous Section
                                </button>

                                <button
                                    onClick={onNext}
                                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                                >
                                    Next Section
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </button>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                                {/* Zoom Controls */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                                    <button
                                        onClick={onZoomOut}
                                        className="p-2 hover:bg-gray-200 rounded"
                                        title="Zoom Out"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm font-medium px-2">{zoomLevel}%</span>
                                    <button
                                        onClick={onZoomIn}
                                        className="p-2 hover:bg-gray-200 rounded"
                                        title="Zoom In"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={onResetZoom}
                                        className="p-2 hover:bg-gray-200 rounded"
                                        title="Reset Zoom"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Fullscreen Toggle */}
                                {onToggleFullscreen && (
                                    <button
                                        onClick={onToggleFullscreen}
                                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="w-4 h-4" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4" />
                                        )}
                                    </button>
                                )}

                                {/* Completion Status */}
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getCompletionStatus() ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span className="text-sm text-gray-600">
                                        {getCompletionStatus() ? 'Section Complete' : 'In Progress'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SectionTemplate;