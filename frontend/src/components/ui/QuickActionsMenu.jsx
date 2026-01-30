// src/pages/builder/components/QuickActionsMenu.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Eye,
    Download,
    Printer,
    Copy,
    Share2,
    Trash2,
    Palette,
    Zap,
    X,
    Sparkles,
    TrendingUp
} from 'lucide-react';

const QuickActionsMenu = ({
    isOpen,
    onClose,
    onSave,
    onPreview,
    onExportPDF,
    onPrint,
    onDuplicate,
    onShare,
    onDelete,
    onTemplateSelect,
    onAnalyze,
    isSaving,
    isExporting,
    isSharing,
    canDelete
}) => {
    const actions = [
        {
            id: 'save',
            label: 'Save Resume',
            icon: Save,
            onClick: onSave,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            loading: isSaving,
            shortcut: 'Ctrl+S'
        },
        {
            id: 'preview',
            label: 'Live Preview',
            icon: Eye,
            onClick: onPreview,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            shortcut: 'Ctrl+P'
        },
        {
            id: 'export',
            label: 'Export PDF',
            icon: Download,
            onClick: onExportPDF,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            loading: isExporting,
            shortcut: 'Ctrl+E'
        },
        {
            id: 'print',
            label: 'Print Resume',
            icon: Printer,
            onClick: onPrint,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50'
        },
        {
            id: 'duplicate',
            label: 'Duplicate',
            icon: Copy,
            onClick: onDuplicate,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            id: 'share',
            label: 'Share',
            icon: Share2,
            onClick: onShare,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            loading: isSharing
        },
        {
            id: 'template',
            label: 'Change Template',
            icon: Palette,
            onClick: onTemplateSelect,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50'
        },
        {
            id: 'analyze',
            label: 'AI Analysis',
            icon: Zap,
            onClick: onAnalyze,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            id: 'enhance',
            label: 'AI Enhance',
            icon: Sparkles,
            onClick: () => { },
            color: 'text-teal-600',
            bgColor: 'bg-teal-50'
        },
        {
            id: 'optimize',
            label: 'ATS Optimize',
            icon: TrendingUp,
            onClick: () => { },
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        }
    ];

    if (canDelete) {
        actions.push({
            id: 'delete',
            label: 'Delete Resume',
            icon: Trash2,
            onClick: onDelete,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        });
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-[55]"
                        onClick={onClose}
                    />

                    {/* Menu */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed bottom-24 right-8 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 z-[60] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-gray-900">Quick Actions</h3>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Actions Grid */}
                        <div className="p-4">
                            <div className="grid grid-cols-2 gap-3">
                                {actions.map((action) => (
                                    <motion.button
                                        key={action.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            action.onClick();
                                            onClose();
                                        }}
                                        disabled={action.loading}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${action.bgColor} hover:shadow-lg border border-transparent hover:border-opacity-20`}
                                    >
                                        <div className={`p-3 rounded-full mb-3 ${action.bgColor}`}>
                                            {action.loading ? (
                                                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <action.icon size={24} className={action.color} />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${action.color}`}>
                                            {action.label}
                                        </span>
                                        {action.shortcut && (
                                            <span className="text-xs text-gray-500 mt-1">
                                                {action.shortcut}
                                            </span>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">
                                Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">ESC</kbd> to close
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

QuickActionsMenu.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onPreview: PropTypes.func.isRequired,
    onExportPDF: PropTypes.func.isRequired,
    onPrint: PropTypes.func.isRequired,
    onDuplicate: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onTemplateSelect: PropTypes.func.isRequired,
    onAnalyze: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    isExporting: PropTypes.bool,
    isSharing: PropTypes.bool,
    canDelete: PropTypes.bool
};

QuickActionsMenu.defaultProps = {
    isSaving: false,
    isExporting: false,
    isSharing: false,
    canDelete: false
};

export default QuickActionsMenu;