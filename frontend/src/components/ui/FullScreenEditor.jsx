// src/components/ui/FullScreenEditor.jsx - UPDATED WITH DEFAULT EXPORT
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import {
    X,
    Save,
    Bold,
    Italic,
    List,
    Link,
    Type,
    Maximize2,
    Minimize2,
    Keyboard,
    AlertCircle,
    Check
} from 'lucide-react';

// Since this is FullScreenEditor, not FullscreenModal, let's rename it correctly
const FullScreenEditor = ({
    isOpen,
    field,
    onSave,
    onClose,
    placeholder = 'Start typing...',
    maxLength = 5000,
    enableFormatting = true,
    enableSpellCheck = true,
    showWordCount = true,
    showCharacterCount = true
}) => {
    const [content, setContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isDirty, setIsDirty] = useState(false);
    const textareaRef = useRef(null);

    const countWords = useCallback((text) => {
        if (!text.trim()) return 0;
        return text.trim().split(/\s+/).length;
    }, []);

    // Memoize handleSave to avoid dependency issues
    const handleSave = useCallback(async () => {
        if (!isDirty) {
            onClose();
            return;
        }

        try {
            setIsSaving(true);
            await onSave(content);
            setIsDirty(false);
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    }, [isDirty, content, onSave, onClose]);

    // Initialize content when field changes
    useEffect(() => {
        if (field && isOpen) {
            setContent(field.value || '');
            setWordCount(countWords(field.value || ''));
            setIsDirty(false);

            // Focus the textarea after a short delay
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    // Move cursor to end
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = textareaRef.current.value.length;
                }
            }, 100);
        }
    }, [field, isOpen, countWords]);

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }

            // Escape to close without saving
            if (e.key === 'Escape') {
                if (isDirty) {
                    if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                        onClose();
                    }
                } else {
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isDirty, handleSave, onClose]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        if (maxLength && newValue.length > maxLength) return;

        setContent(newValue);
        setWordCount(countWords(newValue));
        setIsDirty(true);
    };

    const handleClose = () => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    const insertFormatting = (format) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        let newText = content;
        let newCursorPos = start;

        switch (format) {
            case 'bold':
                newText = content.substring(0, start) + `**${selectedText || 'bold text'}**` + content.substring(end);
                newCursorPos = start + (selectedText ? 2 : 10);
                break;
            case 'italic':
                newText = content.substring(0, start) + `*${selectedText || 'italic text'}*` + content.substring(end);
                newCursorPos = start + (selectedText ? 1 : 12);
                break;
            case 'bullet':
                const lines = selectedText.split('\n');
                const bulletedLines = lines.map(line => line.trim() ? `• ${line}` : '').join('\n');
                newText = content.substring(0, start) + bulletedLines + content.substring(end);
                newCursorPos = start + bulletedLines.length;
                break;
            case 'link':
                newText = content.substring(0, start) + `[${selectedText || 'link text'}](https://example.com)` + content.substring(end);
                newCursorPos = start + (selectedText ? selectedText.length + 3 : 13);
                break;
            default:
                break;
        }

        setContent(newText);
        setIsDirty(true);

        // Restore focus and cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = newCursorPos;
            textarea.selectionEnd = newCursorPos;
        }, 0);
    };

    const getFieldLabel = () => {
        if (!field) return 'Edit';

        const { sectionId, fieldId } = field;
        const labels = {
            personalInfo: {
                fullName: 'Full Name',
                email: 'Email',
                phone: 'Phone',
                location: 'Location',
                linkedin: 'LinkedIn Profile',
                github: 'GitHub Profile',
                website: 'Website',
                summary: 'Professional Summary'
            },
            summary: 'Professional Summary',
            experience: {
                description: 'Job Description'
            },
            education: {
                description: 'Education Details'
            },
            projects: {
                description: 'Project Description'
            }
        };

        if (labels[sectionId]) {
            if (typeof labels[sectionId] === 'object') {
                return labels[sectionId][fieldId] || `${fieldId} (${sectionId})`;
            }
            return labels[sectionId];
        }

        return `${fieldId} (${sectionId})`;
    };

    if (!isOpen || !field) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                        onClick={handleClose}
                    />

                    {/* Editor Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                        <Type size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            Edit {getFieldLabel()}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Full-screen editor for better focus
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Formatting Toolbar (Desktop only) */}
                                    {enableFormatting && (
                                        <div className="hidden md:flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
                                            <button
                                                onClick={() => insertFormatting('bold')}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Bold (Ctrl+B)"
                                            >
                                                <Bold size={16} />
                                            </button>
                                            <button
                                                onClick={() => insertFormatting('italic')}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Italic (Ctrl+I)"
                                            >
                                                <Italic size={16} />
                                            </button>
                                            <button
                                                onClick={() => insertFormatting('bullet')}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Bullet List"
                                            >
                                                <List size={16} />
                                            </button>
                                            <button
                                                onClick={() => insertFormatting('link')}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                                title="Insert Link"
                                            >
                                                <Link size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        {showWordCount && (
                                            <div className="hidden md:block">
                                                {wordCount} {wordCount === 1 ? 'word' : 'words'}
                                            </div>
                                        )}
                                        {showCharacterCount && maxLength && (
                                            <div className={`${content.length > maxLength * 0.9 ? 'text-yellow-600' : ''} ${content.length > maxLength * 0.95 ? 'text-red-600' : ''}`}>
                                                {content.length}/{maxLength}
                                            </div>
                                        )}
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={handleClose}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                        title="Close (Esc)"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 overflow-hidden p-1">
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    spellCheck={enableSpellCheck}
                                    className="w-full h-full p-6 text-gray-900 dark:text-white dark:bg-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 resize-none font-sans text-base leading-relaxed placeholder-gray-400 dark:placeholder-gray-500"
                                    style={{
                                        lineHeight: '1.6',
                                        minHeight: '100%'
                                    }}
                                />
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Keyboard size={16} />
                                        <span>
                                            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd> to save,
                                            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs ml-2">Esc</kbd> to cancel
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Mobile Formatting */}
                                    {enableFormatting && (
                                        <div className="md:hidden flex items-center gap-1">
                                            <button
                                                onClick={() => insertFormatting('bold')}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                                title="Bold"
                                            >
                                                <Bold size={16} />
                                            </button>
                                            <button
                                                onClick={() => insertFormatting('italic')}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                                                title="Italic"
                                            >
                                                <Italic size={16} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <button
                                        onClick={handleClose}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || !isDirty}
                                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${isDirty
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check size={16} />
                                                <span>Save Changes</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

FullScreenEditor.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    field: PropTypes.shape({
        sectionId: PropTypes.string.isRequired,
        fieldId: PropTypes.string.isRequired,
        value: PropTypes.string
    }),
    onSave: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    maxLength: PropTypes.number,
    enableFormatting: PropTypes.bool,
    enableSpellCheck: PropTypes.bool,
    showWordCount: PropTypes.bool,
    showCharacterCount: PropTypes.bool
};

FullScreenEditor.defaultProps = {
    placeholder: 'Start typing...',
    maxLength: 5000,
    enableFormatting: true,
    enableSpellCheck: true,
    showWordCount: true,
    showCharacterCount: true
};

// Make sure this is a default export
export default FullScreenEditor;