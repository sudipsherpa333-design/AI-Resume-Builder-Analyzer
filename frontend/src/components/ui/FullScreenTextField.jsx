// src/components/ui/FullScreenTextField.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
// In FullScreenTextField.jsx, update the imports:
import {
    X,
    Save,
    Download,
    Printer,
    Share2,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    RotateCcw,
    Type,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Quote,
    Code,
    Link,
    Image,
    Paperclip,
    AtSign,
    Hash,
    Heading1,
    Heading2,
    Heading3,
    // Remove Paragraph import
    Check,
    ChevronDown,
    Sparkles,
    Brain,
    Wand2,
    FileText,
    Copy,
    Upload,
    Settings,
    HelpCircle,
    ZoomIn,
    ZoomOut,
    Target,
    BarChart,
    Calendar,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
const FullScreenTextField = ({
    // Core props
    value = '',
    onChange,
    onSave,
    onClose,

    // AI features
    onAIEnhance,
    aiCredits = 0,

    // Configuration
    placeholder = 'Start typing here...',
    title = 'Full Screen Editor',
    sectionTitle = '',

    // State
    isSaving = false,
    maxLength = 10000,
    autoSave = true,
    autoFocus = true,

    // Export
    onExport,
    onPrint,
    onShare,

    // Customization
    showFormatting = true,
    showActions = true,
    showStats = true,
    showPreview = true,

    // Styles
    initialFontSize = 16,
    initialLineHeight = 1.6,

    ...props
}) => {
    // State management
    const [text, setText] = useState(value);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [characterCount, setCharacterCount] = useState(0);
    const [showLivePreview, setShowLivePreview] = useState(false);
    const [fontSize, setFontSize] = useState(initialFontSize);
    const [lineHeight, setLineHeight] = useState(initialLineHeight);
    const [textAlign, setTextAlign] = useState('left');
    const [currentFormat, setCurrentFormat] = useState('paragraph');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [showAITools, setShowAITools] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [cursorPosition, setCursorPosition] = useState(0);
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    // Refs
    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const previewRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);

    // Initialize text and counts
    useEffect(() => {
        setText(value);
        updateCounts(value);
    }, [value]);

    // Auto-focus
    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
            // Move cursor to end
            const len = text.length;
            textareaRef.current.setSelectionRange(len, len);
        }
    }, [autoFocus, text.length]);

    // Auto-save
    useEffect(() => {
        if (!autoSave) return;

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(() => {
            if (text !== value && text.trim().length > 0) {
                handleAutoSave();
            }
        }, 3000); // Auto-save every 3 seconds

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [text, value, autoSave]);

    // Handle fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Update counts
    const updateCounts = (content) => {
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        const characters = content.length;
        setWordCount(words);
        setCharacterCount(characters);
    };

    // Handle text change
    const handleTextChange = (e) => {
        const newText = e.target.value;
        if (newText.length <= maxLength) {
            setText(newText);
            updateCounts(newText);
            onChange?.(newText);

            // Update cursor position
            setCursorPosition(e.target.selectionStart);
            setSelection({
                start: e.target.selectionStart,
                end: e.target.selectionEnd
            });
        }
    };

    // Handle save
    const handleSave = () => {
        onSave?.(text);
        setLastSaved(new Date());
        toast.success('✅ Changes saved successfully!', {
            duration: 2000,
        });
    };

    // Handle auto-save
    const handleAutoSave = async () => {
        if (isAutoSaving) return;

        setIsAutoSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
            onSave?.(text);
            setLastSaved(new Date());

            // Show subtle auto-save indicator
            const indicator = document.createElement('div');
            indicator.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm animate-pulse';
            indicator.textContent = 'Auto-saved';
            indicator.style.zIndex = '99999';
            document.body.appendChild(indicator);

            setTimeout(() => {
                if (document.body.contains(indicator)) {
                    document.body.removeChild(indicator);
                }
            }, 1500);
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsAutoSaving(false);
        }
    };

    // Handle fullscreen toggle
    const handleFullscreen = () => {
        if (!isFullscreen) {
            if (editorRef.current?.requestFullscreen) {
                editorRef.current.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    // Formatting functions
    const applyFormat = (formatType) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = text.substring(start, end);
        let newText = text;
        let newCursorPos = end;

        switch (formatType) {
            case 'bold':
                newText = text.substring(0, start) + `**${selectedText}**` + text.substring(end);
                newCursorPos = end + 4;
                setCurrentFormat('bold');
                break;
            case 'italic':
                newText = text.substring(0, start) + `*${selectedText}*` + text.substring(end);
                newCursorPos = end + 2;
                setCurrentFormat('italic');
                break;
            case 'underline':
                newText = text.substring(0, start) + `<u>${selectedText}</u>` + text.substring(end);
                newCursorPos = end + 7;
                setCurrentFormat('underline');
                break;
            case 'heading1':
                if (selectedText) {
                    newText = text.substring(0, start) + `# ${selectedText}` + text.substring(end);
                    newCursorPos = end + 2;
                } else {
                    newText = text.substring(0, start) + '# ' + text.substring(start);
                    newCursorPos = start + 2;
                }
                setCurrentFormat('heading1');
                break;
            case 'heading2':
                if (selectedText) {
                    newText = text.substring(0, start) + `## ${selectedText}` + text.substring(end);
                    newCursorPos = end + 3;
                } else {
                    newText = text.substring(0, start) + '## ' + text.substring(start);
                    newCursorPos = start + 3;
                }
                setCurrentFormat('heading2');
                break;
            case 'heading3':
                if (selectedText) {
                    newText = text.substring(0, start) + `### ${selectedText}` + text.substring(end);
                    newCursorPos = end + 4;
                } else {
                    newText = text.substring(0, start) + '### ' + text.substring(start);
                    newCursorPos = start + 4;
                }
                setCurrentFormat('heading3');
                break;
            case 'paragraph':
                setCurrentFormat('paragraph');
                break;
            case 'list':
                const lines = selectedText.split('\n');
                const bulleted = lines.map(line => `• ${line}`).join('\n');
                newText = text.substring(0, start) + bulleted + text.substring(end);
                newCursorPos = end + (lines.length * 2);
                break;
            case 'numbered':
                const lines2 = selectedText.split('\n');
                const numbered = lines2.map((line, i) => `${i + 1}. ${line}`).join('\n');
                newText = text.substring(0, start) + numbered + text.substring(end);
                newCursorPos = end + (lines2.length * 3);
                break;
            case 'quote':
                const lines3 = selectedText.split('\n');
                const quoted = lines3.map(line => `> ${line}`).join('\n');
                newText = text.substring(0, start) + quoted + text.substring(end);
                newCursorPos = end + (lines3.length * 2);
                setCurrentFormat('quote');
                break;
            case 'code':
                newText = text.substring(0, start) + '```\n' + selectedText + '\n```' + text.substring(end);
                newCursorPos = end + 8;
                setCurrentFormat('code');
                break;
            case 'link':
                const url = prompt('Enter URL:', 'https://');
                if (url) {
                    newText = text.substring(0, start) + `[${selectedText}](${url})` + text.substring(end);
                    newCursorPos = end + url.length + 3;
                } else {
                    return;
                }
                break;
            default:
                return;
        }

        setText(newText);
        onChange?.(newText);
        updateCounts(newText);

        // Restore cursor position
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        }, 10);
    };

    // AI enhancement
    const handleAIEnhance = () => {
        if (aiCredits <= 0) {
            toast.error('💳 Insufficient AI credits!');
            return;
        }

        if (onAIEnhance) {
            onAIEnhance(text);
        } else {
            // Default AI enhancement
            toast.loading('🤖 Enhancing with AI...');
            setTimeout(() => {
                const enhanced = `✨ AI Enhanced Version:\n\n${text}\n\n---\nEnhanced with AI to improve clarity, impact, and professionalism.`;
                setText(enhanced);
                onChange?.(enhanced);
                toast.success('✨ Content enhanced with AI!');
            }, 2000);
        }
    };

    // Export functions
    const handleExport = (format) => {
        if (onExport) {
            onExport(format, text);
        } else {
            switch (format) {
                case 'txt':
                    downloadTextFile(text, 'text.txt');
                    break;
                case 'pdf':
                    toast.loading('📄 Generating PDF...');
                    setTimeout(() => {
                        toast.success('✅ PDF generated (simulated)');
                    }, 1500);
                    break;
                default:
                    downloadTextFile(text, 'document.txt');
            }
        }
    };

    const downloadTextFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('📥 File downloaded!');
    };

    // Clear text
    const handleClear = () => {
        if (text.trim().length > 0) {
            if (window.confirm('Are you sure you want to clear all text?')) {
                setText('');
                onChange?.('');
                updateCounts('');
                toast.success('Text cleared');
            }
        }
    };

    // Copy to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(text)
            .then(() => toast.success('📋 Copied to clipboard!'))
            .catch(() => toast.error('Failed to copy'));
    };

    // Formatting options
    const formattingOptions = [
        { id: 'heading1', label: 'Heading 1', icon: Heading1, shortcut: '#', color: 'text-gray-800' },
        { id: 'heading2', label: 'Heading 2', icon: Heading2, shortcut: '##', color: 'text-gray-700' },
        { id: 'heading3', label: 'Heading 3', icon: Heading3, shortcut: '###', color: 'text-gray-600' },
        { id: 'paragraph', label: 'Paragraph', icon: Paragraph, shortcut: 'P', color: 'text-gray-500' },
        { id: 'bold', label: 'Bold', icon: Bold, shortcut: '**B**', color: 'text-gray-800' },
        { id: 'italic', label: 'Italic', icon: Italic, shortcut: '*I*', color: 'text-gray-700' },
        { id: 'underline', label: 'Underline', icon: Underline, shortcut: '<U>', color: 'text-gray-600' },
        { id: 'list', label: 'Bullet List', icon: List, shortcut: '•', color: 'text-gray-500' },
        { id: 'numbered', label: 'Numbered List', icon: ListOrdered, shortcut: '1.', color: 'text-gray-500' },
        { id: 'quote', label: 'Quote', icon: Quote, shortcut: '>', color: 'text-gray-400' },
        { id: 'code', label: 'Code Block', icon: Code, shortcut: '```', color: 'text-gray-400' },
        { id: 'link', label: 'Link', icon: Link, shortcut: '[L]', color: 'text-blue-500' },
    ];

    // AI tools
    const aiTools = [
        { id: 'enhance', label: 'Enhance Text', icon: Sparkles, credits: 5, description: 'Improve clarity and impact' },
        { id: 'grammar', label: 'Fix Grammar', icon: CheckCircle, credits: 2, description: 'Correct grammar and spelling' },
        { id: 'shorten', label: 'Make Concise', icon: Minimize2, credits: 3, description: 'Reduce word count' },
        { id: 'expand', label: 'Expand Text', icon: Maximize2, credits: 3, description: 'Add more detail' },
        { id: 'professional', label: 'Professional Tone', icon: Briefcase, credits: 4, description: 'Make more professional' },
        { id: 'casual', label: 'Casual Tone', icon: Smile, credits: 4, description: 'Make more friendly' },
    ];

    // Render formatted preview
    const renderPreview = () => {
        const formatText = (content) => {
            let formatted = content;

            // Headers
            formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>');
            formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3 text-gray-800">$1</h2>');
            formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2 text-gray-700">$1</h3>');

            // Bold
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');

            // Italic
            formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>');

            // Underline
            formatted = formatted.replace(/<u>(.*?)<\/u>/g, '<u class="underline text-gray-800">$1</u>');

            // Lists
            formatted = formatted.replace(/^• (.*$)/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>');
            formatted = formatted.replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-gray-700">$1</li>');

            // Quotes
            formatted = formatted.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2">$1</blockquote>');

            // Code blocks
            formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm my-3"><code>$1</code></pre>');

            // Inline code
            formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-gray-800 px-1 py-0.5 rounded font-mono text-sm">$1</code>');

            // Links
            formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 hover:underline transition-colors">$1</a>');

            // Line breaks
            formatted = formatted.replace(/\n\n/g, '</p><p class="mb-4">');
            formatted = formatted.replace(/\n/g, '<br>');

            return `<div class="prose prose-lg max-w-none">${formatted}</div>`;
        };

        return (
            <div
                ref={previewRef}
                className="h-full overflow-auto p-6 bg-white"
                dangerouslySetInnerHTML={{ __html: formatText(text || placeholder) }}
            />
        );
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl/Cmd + E to export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                handleExport('txt');
            }
            // Ctrl/Cmd + F for fullscreen
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                handleFullscreen();
            }
            // Ctrl/Cmd + Space for AI enhance
            if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                e.preventDefault();
                handleAIEnhance();
            }
            // Ctrl/Cmd + Z to undo (browser default)
            // Ctrl/Cmd + Y to redo (browser default)
            // Ctrl/Cmd + B for bold
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                applyFormat('bold');
            }
            // Ctrl/Cmd + I for italic
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                applyFormat('italic');
            }
            // Ctrl/Cmd + U for underline
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
                e.preventDefault();
                applyFormat('underline');
            }
            // Escape to close
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [text, handleSave, handleExport, handleFullscreen, handleAIEnhance, onClose]);

    // Calculate reading time
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
            ref={editorRef}
        >
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close (Esc)"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                {title}
                                {sectionTitle && (
                                    <span className="ml-2 text-sm font-normal text-gray-500">
                                        ({sectionTitle})
                                    </span>
                                )}
                            </h2>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    {wordCount} words
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <Type className="w-3 h-3 mr-1" />
                                    {characterCount}/{maxLength} chars
                                </span>
                                <span>•</span>
                                <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {readingTime} min read
                                </span>
                                <span>•</span>
                                <span className={`flex items-center ${isAutoSaving ? 'text-amber-500' : 'text-green-500'}`}>
                                    {isAutoSaving ? (
                                        <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Auto-saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Format Selector */}
                        {showFormatting && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowFormatMenu(!showFormatMenu)}
                                    className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    <Type className="w-4 h-4 mr-2" />
                                    <span className="capitalize">{currentFormat}</span>
                                    <ChevronDown className="w-4 h-4 ml-2" />
                                </button>

                                <AnimatePresence>
                                    {showFormatMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowFormatMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2 max-h-96 overflow-y-auto"
                                            >
                                                {formattingOptions.map((option) => (
                                                    <button
                                                        key={option.id}
                                                        onClick={() => {
                                                            applyFormat(option.id);
                                                            setShowFormatMenu(false);
                                                        }}
                                                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <option.icon className={`w-4 h-4 mr-3 ${option.color}`} />
                                                            {option.label}
                                                        </div>
                                                        <span className="text-xs text-gray-400">{option.shortcut}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* AI Tools */}
                        <div className="relative">
                            <button
                                onClick={() => setShowAITools(!showAITools)}
                                disabled={aiCredits <= 0}
                                className={`flex items-center px-3 py-2 rounded-lg transition-colors ${aiCredits <= 0
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100'
                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                                    }`}
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                AI Tools
                                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                                    {aiCredits}
                                </span>
                            </button>

                            <AnimatePresence>
                                {showAITools && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowAITools(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 py-2"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <h4 className="font-medium text-gray-800">AI Text Tools</h4>
                                                <p className="text-xs text-gray-500 mt-1">Uses AI credits</p>
                                            </div>
                                            <div className="py-2">
                                                {aiTools.map((tool) => (
                                                    <button
                                                        key={tool.id}
                                                        onClick={() => {
                                                            if (aiCredits >= tool.credits) {
                                                                toast.loading(`Applying ${tool.label.toLowerCase()}...`);
                                                                setTimeout(() => {
                                                                    const enhanced = `✨ ${tool.label}:\n\n${text}\n\n---\nApplied ${tool.label.toLowerCase()}`;
                                                                    setText(enhanced);
                                                                    toast.success(`✅ ${tool.label} applied!`);
                                                                }, 1500);
                                                                setShowAITools(false);
                                                            } else {
                                                                toast.error(`Need ${tool.credits} credits for ${tool.label}`);
                                                            }
                                                        }}
                                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mr-3">
                                                                <tool.icon className="w-4 h-4 text-purple-600" />
                                                            </div>
                                                            <div className="text-left">
                                                                <div className="font-medium text-sm text-gray-900">{tool.label}</div>
                                                                <div className="text-xs text-gray-500">{tool.description}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Sparkles className="w-3 h-3 text-amber-500" />
                                                            <span className="font-medium text-amber-600">{tool.credits}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Preview Toggle */}
                        {showPreview && (
                            <button
                                onClick={() => setShowLivePreview(!showLivePreview)}
                                className={`p-2 rounded-lg transition-colors ${showLivePreview
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'hover:bg-gray-100 text-gray-600'
                                    }`}
                                title="Toggle Preview"
                            >
                                {showLivePreview ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        )}

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={handleFullscreen}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen (Ctrl+F)' : 'Fullscreen (Ctrl+F)'}
                        >
                            {isFullscreen ? (
                                <Minimize2 className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Maximize2 className="w-5 h-5 text-gray-600" />
                            )}
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save (Ctrl+S)"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Formatting Toolbar */}
            {showFormatting && !showLivePreview && (
                <div className="sticky top-16 z-30 bg-gray-50 border-b border-gray-200 px-4 py-2">
                    <div className="flex items-center space-x-1 overflow-x-auto">
                        {/* Text Alignment */}
                        <div className="flex items-center pr-2 border-r border-gray-300">
                            <button
                                onClick={() => setTextAlign('left')}
                                className={`p-2 rounded ${textAlign === 'left' ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-200 text-gray-600'}`}
                                title="Align Left"
                            >
                                <AlignLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTextAlign('center')}
                                className={`p-2 rounded ${textAlign === 'center' ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-200 text-gray-600'}`}
                                title="Align Center"
                            >
                                <AlignCenter className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setTextAlign('right')}
                                className={`p-2 rounded ${textAlign === 'right' ? 'bg-gray-200 text-gray-800' : 'hover:bg-gray-200 text-gray-600'}`}
                                title="Align Right"
                            >
                                <AlignRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Formatting Buttons */}
                        {formattingOptions.slice(4, 10).map((option) => (
                            <button
                                key={option.id}
                                onClick={() => applyFormat(option.id)}
                                className={`flex items-center px-3 py-2 rounded transition-colors whitespace-nowrap ${currentFormat === option.id
                                    ? 'bg-indigo-100 text-indigo-600'
                                    : 'hover:bg-gray-200 text-gray-700'
                                    }`}
                                title={`${option.label} (${option.shortcut})`}
                            >
                                <option.icon className="w-4 h-4 mr-2" />
                                <span className="text-sm">{option.label}</span>
                            </button>
                        ))}

                        {/* Font Size Controls */}
                        <div className="flex items-center pl-2 border-l border-gray-300">
                            <button
                                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                                className="p-2 hover:bg-gray-200 rounded text-gray-600"
                                title="Decrease Font Size"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <span className="mx-2 text-sm text-gray-600 min-w-[3rem] text-center">
                                {fontSize}px
                            </span>
                            <button
                                onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                                className="p-2 hover:bg-gray-200 rounded text-gray-600"
                                title="Increase Font Size"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Line Height Controls */}
                        <div className="flex items-center pl-2 border-l border-gray-300">
                            <button
                                onClick={() => setLineHeight(Math.max(1.2, lineHeight - 0.1))}
                                className="p-2 hover:bg-gray-200 rounded text-gray-600"
                                title="Decrease Line Height"
                            >
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <span className="mx-2 text-sm text-gray-600 min-w-[3rem] text-center">
                                {lineHeight.toFixed(1)}
                            </span>
                            <button
                                onClick={() => setLineHeight(Math.min(2.5, lineHeight + 0.1))}
                                className="p-2 hover:bg-gray-200 rounded text-gray-600"
                                title="Increase Line Height"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {showLivePreview ? (
                    // Preview Mode
                    <div className="h-full overflow-auto bg-gray-50">
                        {renderPreview()}
                    </div>
                ) : (
                    // Edit Mode
                    <div className="h-full flex">
                        {/* Text Editor - Left Panel */}
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1 p-6">
                                <textarea
                                    ref={textareaRef}
                                    value={text}
                                    onChange={handleTextChange}
                                    placeholder={placeholder}
                                    className="w-full h-full resize-none outline-none text-gray-800 bg-transparent font-sans"
                                    style={{
                                        fontSize: `${fontSize}px`,
                                        lineHeight: lineHeight,
                                        textAlign: textAlign
                                    }}
                                    maxLength={maxLength}
                                    spellCheck={true}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                />
                            </div>

                            {/* Character Counter */}
                            <div className="px-6 pb-4">
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>
                                        {characterCount} / {maxLength} characters
                                    </span>
                                    <div className="flex items-center space-x-4">
                                        <span>{wordCount} words</span>
                                        <span>•</span>
                                        <span>{readingTime} min read</span>
                                    </div>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(characterCount / maxLength) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview Sidebar - Right Panel */}
                        {showPreview && (
                            <div className="w-96 border-l border-gray-200 flex flex-col">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-700">Live Preview</h3>
                                    <p className="text-sm text-gray-500 mt-1">See how your text will appear</p>
                                </div>
                                <div className="flex-1 overflow-auto bg-gray-50">
                                    {renderPreview()}
                                </div>

                                {/* Stats Panel */}
                                {showStats && (
                                    <div className="border-t border-gray-200 p-4 bg-white">
                                        <h4 className="font-medium text-gray-700 mb-3">Text Statistics</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-indigo-600">{wordCount}</div>
                                                <div className="text-xs text-gray-500">Words</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">{characterCount}</div>
                                                <div className="text-xs text-gray-500">Characters</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-600">{readingTime}</div>
                                                <div className="text-xs text-gray-500">Minutes to read</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {maxLength - characterCount}
                                                </div>
                                                <div className="text-xs text-gray-500">Characters left</div>
                                            </div>
                                        </div>

                                        {/* Reading Level */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Readability</span>
                                                <span className="text-sm font-medium text-green-600">Good</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            {isAutoSaving ? (
                                <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin text-amber-500" />
                                    <span className="text-amber-500">Auto-saving...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                    <span>Auto-save enabled</span>
                                </>
                            )}
                        </div>
                        <span>•</span>
                        <span>Format: {currentFormat}</span>
                        <span>•</span>
                        <span>Font: {fontSize}px</span>
                        <span>•</span>
                        <span>Line: {lineHeight.toFixed(1)}</span>
                        <span>•</span>
                        <span>Align: {textAlign}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Quick Actions */}
                        <button
                            onClick={handleClear}
                            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Clear All Text"
                        >
                            <RotateCcw className="w-3 h-3 mr-2" />
                            Clear
                        </button>
                        <button
                            onClick={handleCopy}
                            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Copy to Clipboard"
                        >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy
                        </button>

                        {/* Export Options */}
                        <div className="relative">
                            <button
                                onClick={() => handleExport('txt')}
                                className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                            >
                                <Download className="w-3 h-3 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default FullScreenTextField;