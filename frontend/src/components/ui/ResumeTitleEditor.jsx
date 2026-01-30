// src/components/modals/ResumeTitleEditor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Save, AlertCircle, FileText, Edit2, Hash } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ResumeTitleEditor = ({
    isOpen = false,
    onClose = () => { },
    currentTitle = '',
    onSave = () => { },
    isSaving = false,
    maxLength = 60,
    minLength = 3
}) => {
    const [title, setTitle] = useState(currentTitle || '');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize title when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(currentTitle || '');
            setError('');
            setIsSubmitting(false);
        }
    }, [isOpen, currentTitle]);

    // Handle Enter key to save
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSubmit();
            }

            if (e.key === 'Escape') {
                handleCancel();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, title, currentTitle]);

    const validateTitle = useCallback((titleToValidate) => {
        if (!titleToValidate.trim()) {
            return 'Resume title cannot be empty';
        }

        if (titleToValidate.trim().length < minLength) {
            return `Title must be at least ${minLength} characters`;
        }

        if (titleToValidate.length > maxLength) {
            return `Title cannot exceed ${maxLength} characters`;
        }

        // Check for special characters that might cause issues
        const invalidChars = /[<>:"/\\|?*]/;
        if (invalidChars.test(titleToValidate)) {
            return 'Title contains invalid characters: < > : " / \\ | ? *';
        }

        return '';
    }, [minLength, maxLength]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        // Clear error when user starts typing
        if (error && newTitle.trim().length >= minLength) {
            setError('');
        }
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();

        // Validate
        const validationError = validateTitle(trimmedTitle);
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            return;
        }

        // Check if title actually changed
        if (trimmedTitle === currentTitle) {
            toast.success('No changes detected');
            onClose();
            return;
        }

        try {
            setIsSubmitting(true);
            await onSave(trimmedTitle);
            // Success is handled by onSave
            onClose();
        } catch (error) {
            console.error('Failed to save title:', error);
            setError('Failed to save title. Please try again.');
            toast.error('Failed to save title');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (title.trim() !== currentTitle && title.trim() !== '') {
            if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const getCharacterColor = () => {
        const length = title.length;
        if (length > maxLength) return 'text-red-600';
        if (length > maxLength * 0.9) return 'text-yellow-600';
        if (length > maxLength * 0.75) return 'text-blue-600';
        return 'text-gray-500';
    };

    const getSuggestions = () => {
        const trimmedTitle = title.trim();
        if (!trimmedTitle || trimmedTitle.length >= minLength) return [];

        const suggestions = [];

        if (trimmedTitle.length === 0) {
            suggestions.push('Professional Resume');
            suggestions.push('My Resume');
            suggestions.push('Software Developer Resume');
            suggestions.push('Marketing Manager Resume');
        } else if (trimmedTitle.length < minLength) {
            suggestions.push(`${trimmedTitle} - Professional Profile`);
            suggestions.push(`${trimmedTitle}'s Resume`);
            suggestions.push(`Resume - ${trimmedTitle}`);
        }

        return suggestions;
    };

    const applySuggestion = (suggestion) => {
        setTitle(suggestion);
        setError('');
    };

    if (!isOpen) return null;

    const suggestions = getSuggestions();
    const isSaveDisabled = !title.trim() || title.trim() === currentTitle || title.trim().length < minLength;
    const isLoading = isSaving || isSubmitting;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]"
                        onClick={handleCancel}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[71] flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                            <Edit2 size={20} />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Edit Resume Title
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Give your resume a descriptive name
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleCancel}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                {/* Input Field */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} />
                                            Resume Name
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={handleTitleChange}
                                            placeholder="Enter a descriptive title for your resume..."
                                            className={`w-full px-4 py-3 border ${error ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                                            autoFocus
                                            maxLength={maxLength}
                                            disabled={isLoading}
                                        />
                                        <div className="absolute right-3 top-3">
                                            <div className={`text-sm ${getCharacterColor()} font-medium`}>
                                                {title.length}/{maxLength}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Message */}
                                    {error && (
                                        <div className="mt-2 flex items-start gap-2 text-red-600 dark:text-red-400 text-sm">
                                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    {/* Tips */}
                                    {!error && title.trim() && title.length < maxLength * 0.75 && (
                                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Hash size={12} className="inline mr-1" />
                                            Tip: Use keywords relevant to your profession or target job
                                        </div>
                                    )}
                                </div>

                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Suggestions
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            {suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => applySuggestion(suggestion)}
                                                    className="px-3 py-2 text-left text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Current vs New Comparison */}
                                {title.trim() && title.trim() !== currentTitle && !error && (
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Current → New</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 text-sm text-gray-500 dark:text-gray-400 line-through truncate">
                                                {currentTitle || 'Untitled Resume'}
                                            </div>
                                            <div className="text-gray-400">→</div>
                                            <div className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {title.trim()}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Requirements */}
                                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                                        Requirements
                                    </h3>
                                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                                        <li className={`flex items-center gap-2 ${title.length >= minLength ? 'opacity-50' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${title.length >= minLength ? 'bg-green-500' : 'bg-blue-500'}`} />
                                            At least {minLength} characters
                                        </li>
                                        <li className={`flex items-center gap-2 ${title.length <= maxLength ? 'opacity-50' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full ${title.length <= maxLength ? 'bg-green-500' : 'bg-blue-500'}`} />
                                            Maximum {maxLength} characters
                                        </li>
                                        <li className="flex items-center gap-2 opacity-50">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            No special characters: &lt; &gt; : " / \ | ? *
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> to save
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleCancel}
                                            disabled={isLoading}
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={isSaveDisabled || isLoading}
                                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isSaveDisabled || isLoading
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                                                }`}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} />
                                                    <span>Save Title</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

ResumeTitleEditor.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentTitle: PropTypes.string,
    onSave: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    maxLength: PropTypes.number,
    minLength: PropTypes.number
};

export default ResumeTitleEditor;