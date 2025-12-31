// src/components/ai/ContentGenerator.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import {
    Wand2, Sparkles, Brain, FileText, Briefcase,
    GraduationCap, Code, Award, Languages, Users,
    Target, Zap, Lightbulb, Clock, Copy, Check,
    RefreshCw, Settings, Filter, TrendingUp, BarChart,
    Eye, EyeOff, Download, Maximize2, Minimize2,
    MessageSquare, HelpCircle, Info, ThumbsUp,
    ThumbsDown, Volume2, VolumeX, Loader2, X,
    ChevronDown, ChevronUp, BookOpen, Cpu, Shield,
    Star, Smile, Frown, Meh, Clock as ClockIcon,
    Hash, Type, Bold, Italic, List, ListOrdered,
    AlignLeft, AlignCenter, AlignRight, Link,
    Image as ImageIcon, Paperclip, Send, User,
    CheckCircle, AlertCircle, ArrowRight, Plus,
    Minus, RotateCcw, Save, Trash2, Edit3
} from 'lucide-react';

// Content Preview Component
const ContentPreview = ({ content, onUse, onRegenerate, onEdit, type = 'paragraph' }) => {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        toast.success('Content copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFeedback = (type) => {
        setFeedback(type);
        toast.success(`Feedback submitted: ${type === 'like' ? '👍 Liked' : '👎 Disliked'}`);
    };

    const getTypeIcon = () => {
        const icons = {
            summary: FileText,
            experience: Briefcase,
            education: GraduationCap,
            skills: Code,
            projects: FileText,
            certifications: Award,
            languages: Languages,
            references: Users,
            paragraph: FileText,
            bullet: List,
            sentence: Type
        };
        return icons[type] || FileText;
    };

    const TypeIcon = getTypeIcon();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <TypeIcon size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">AI Generated Content</h3>
                            <p className="text-xs text-gray-600">
                                {type.charAt(0).toUpperCase() + type.slice(1)} • {content.split(/\s+/).length} words
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="p-2 hover:bg-white rounded-lg"
                        >
                            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={`${expanded ? 'max-h-96' : 'max-h-48'} overflow-y-auto transition-all duration-300`}>
                <div className="p-6">
                    <div className="prose prose-sm max-w-none">
                        {type === 'bullet' ? (
                            <ul className="space-y-2">
                                {content.split('\n').map((line, index) => (
                                    <li key={index} className="text-gray-700">{line}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{content}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopy}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                            onClick={() => handleFeedback('like')}
                            className={`p-1.5 rounded-lg ${feedback === 'like' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            title="Like this content"
                        >
                            <ThumbsUp size={14} />
                        </button>
                        <button
                            onClick={() => handleFeedback('dislike')}
                            className={`p-1.5 rounded-lg ${feedback === 'dislike' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                            title="Dislike this content"
                        >
                            <ThumbsDown size={14} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 flex items-center gap-2"
                        >
                            <Edit3 size={14} />
                            Edit
                        </button>
                        <button
                            onClick={onUse}
                            className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg flex items-center gap-2"
                        >
                            <Check size={14} />
                            Use This
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Tone Selector Component
const ToneSelector = ({ selectedTone, onSelectTone }) => {
    const tones = [
        {
            id: 'professional',
            label: 'Professional',
            description: 'Formal and business-appropriate',
            icon: Briefcase,
            color: 'blue'
        },
        {
            id: 'modern',
            label: 'Modern',
            description: 'Contemporary and engaging',
            icon: Sparkles,
            color: 'purple'
        },
        {
            id: 'technical',
            label: 'Technical',
            description: 'Detailed and expertise-focused',
            icon: Cpu,
            color: 'green'
        },
        {
            id: 'executive',
            label: 'Executive',
            description: 'Strategic and leadership-oriented',
            icon: TrendingUp,
            color: 'amber'
        },
        {
            id: 'creative',
            label: 'Creative',
            description: 'Innovative and expressive',
            icon: Wand2,
            color: 'pink'
        }
    ];

    const getColorClasses = (color, isSelected) => {
        const base = {
            blue: isSelected ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
            purple: isSelected ? 'bg-purple-100 text-purple-700 border-purple-300' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
            green: isSelected ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
            amber: isSelected ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
            pink: isSelected ? 'bg-pink-100 text-pink-700 border-pink-300' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
        };
        return base[color];
    };

    return (
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Select Tone</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {tones.map((tone) => {
                    const Icon = tone.icon;
                    return (
                        <button
                            key={tone.id}
                            onClick={() => onSelectTone(tone.id)}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-200 ${getColorClasses(tone.color, selectedTone === tone.id)}`}
                        >
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedTone === tone.id ? 'bg-white' : 'bg-gray-50'}`}>
                                <Icon size={24} />
                            </div>
                            <div className="text-center">
                                <div className="font-medium">{tone.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{tone.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Length Selector Component
const LengthSelector = ({ selectedLength, onSelectLength }) => {
    const lengths = [
        { id: 'short', label: 'Short', words: '50-100', description: 'Concise and to the point' },
        { id: 'medium', label: 'Medium', words: '100-200', description: 'Balanced and detailed' },
        { id: 'long', label: 'Long', words: '200-300', description: 'Comprehensive and thorough' },
        { id: 'bullet', label: 'Bullet Points', words: '5-10 points', description: 'List format for clarity' },
        { id: 'custom', label: 'Custom', words: 'Adjustable', description: 'Set your own parameters' }
    ];

    return (
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Select Length</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {lengths.map((length) => (
                    <button
                        key={length.id}
                        onClick={() => onSelectLength(length.id)}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-200 ${selectedLength === length.id ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    >
                        <div className="text-2xl font-bold">{length.words}</div>
                        <div className="text-center">
                            <div className="font-medium">{length.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{length.description}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// Prompt Input Component
const PromptInput = ({ value, onChange, onSubmit, loading, suggestions = [] }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSuggestionClick = (suggestion) => {
        onChange(suggestion);
        setShowSuggestions(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Describe what you want to generate. Be specific about the content, tone, and purpose..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none text-sm"
                    rows="4"
                    disabled={loading}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {value.length}/500
                    </span>
                </div>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb size={16} className="text-amber-600" />
                        <span className="text-sm font-medium text-gray-900">Prompt Suggestions</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm text-left transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Press Enter to generate, Shift+Enter for new line
                </div>
                <button
                    onClick={onSubmit}
                    disabled={!value.trim() || loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 size={16} />
                            Generate Content
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Main ContentGenerator Component
const ContentGenerator = ({
    section,
    currentContent,
    onGenerate,
    onApply,
    user,
    onClose
}) => {
    const { generateAIResponse } = useAuth();
    const { updateSection } = useResume();

    // State
    const [tone, setTone] = useState('professional');
    const [length, setLength] = useState('medium');
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiCredits, setAiCredits] = useState(user?.aiCredits || 50);
    const [history, setHistory] = useState([]);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [advancedOptions, setAdvancedOptions] = useState({
        includeKeywords: true,
        addMetrics: true,
        useActionVerbs: true,
        optimizeATS: true,
        targetJobTitle: '',
        targetIndustry: ''
    });

    // Section configurations
    const sectionConfigs = {
        summary: {
            title: 'Professional Summary',
            icon: FileText,
            defaultPrompt: 'Write a compelling professional summary for a resume',
            suggestions: [
                'Write a summary highlighting leadership experience',
                'Create a summary for a career change',
                'Generate a summary focusing on technical skills',
                'Write an executive-level summary'
            ]
        },
        experience: {
            title: 'Experience',
            icon: Briefcase,
            defaultPrompt: 'Generate impactful bullet points for work experience',
            suggestions: [
                'Write bullet points with quantifiable achievements',
                'Generate leadership experience bullet points',
                'Create project management experience points',
                'Write technical accomplishment bullet points'
            ]
        },
        skills: {
            title: 'Skills',
            icon: Code,
            defaultPrompt: 'Generate relevant skills for a resume',
            suggestions: [
                'List technical skills for software engineer',
                'Generate soft skills for management role',
                'Create industry-specific skills list',
                'Write skills for a career transition'
            ]
        },
        education: {
            title: 'Education',
            icon: GraduationCap,
            defaultPrompt: 'Write education section content',
            suggestions: [
                'Describe academic achievements',
                'Write about relevant coursework',
                'Generate honors and awards section',
                'Create education summary for recent graduate'
            ]
        },
        projects: {
            title: 'Projects',
            icon: FileText,
            defaultPrompt: 'Describe projects for a resume',
            suggestions: [
                'Write project descriptions with impact',
                'Generate technical project details',
                'Create leadership project examples',
                'Write about collaborative projects'
            ]
        }
    };

    const currentSection = sectionConfigs[section] || sectionConfigs.summary;
    const SectionIcon = currentSection.icon;

    // Initialize prompt based on section
    useEffect(() => {
        if (!prompt && currentContent) {
            setPrompt(`Improve this ${section} content: "${currentContent.substring(0, 100)}..."`);
        }
    }, [section, currentContent, prompt]);

    // Handle content generation
    const handleGenerate = async () => {
        if (!prompt.trim()) {
            toast.error('Please enter a prompt');
            return;
        }

        if (aiCredits <= 0) {
            toast.error('Insufficient AI credits. Please upgrade your plan.');
            return;
        }

        setIsGenerating(true);

        try {
            // Build complete prompt with options
            const fullPrompt = buildCompletePrompt(prompt, tone, length, advancedOptions);

            // Call AI API
            const response = await generateAIResponse(fullPrompt, section, {
                tone,
                length,
                advancedOptions,
                originalContent: currentContent
            });

            if (response.success) {
                // Deduct credit
                setAiCredits(prev => prev - 1);

                // Store generated content
                const newContent = {
                    id: Date.now(),
                    content: response.data,
                    prompt: fullPrompt,
                    tone,
                    length,
                    section,
                    timestamp: new Date(),
                    creditsUsed: 1
                };

                setGeneratedContent(response.data);
                setHistory(prev => [newContent, ...prev.slice(0, 4)]); // Keep last 5

                if (onGenerate) {
                    onGenerate(response.data);
                }

                toast.success('Content generated successfully!');
            } else {
                throw new Error(response.message || 'Failed to generate content');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(error.message || 'Failed to generate content');
        } finally {
            setIsGenerating(false);
        }
    };

    // Build complete prompt with all options
    const buildCompletePrompt = (basePrompt, tone, length, options) => {
        let fullPrompt = `${basePrompt}\n\n`;
        fullPrompt += `Tone: ${tone}\n`;
        fullPrompt += `Length: ${length}\n`;

        if (options.includeKeywords) fullPrompt += 'Include relevant keywords\n';
        if (options.addMetrics) fullPrompt += 'Add quantifiable metrics\n';
        if (options.useActionVerbs) fullPrompt += 'Use strong action verbs\n';
        if (options.optimizeATS) fullPrompt += 'Optimize for ATS\n';
        if (options.targetJobTitle) fullPrompt += `Target job title: ${options.targetJobTitle}\n`;
        if (options.targetIndustry) fullPrompt += `Target industry: ${options.targetIndustry}\n`;

        return fullPrompt;
    };

    // Handle apply content
    const handleApply = (content = generatedContent) => {
        if (!content.trim()) {
            toast.error('No content to apply');
            return;
        }

        if (onApply) {
            onApply(content);
            toast.success('Content applied to resume!');

            // Update section in resume context
            updateSection(section, { content, aiGenerated: true });
        }
    };

    // Handle use history item
    const handleUseHistory = (historyItem) => {
        setGeneratedContent(historyItem.content);
        setSelectedHistory(historyItem.id);
    };

    // Handle regenerate
    const handleRegenerate = () => {
        if (history.length > 0) {
            handleGenerate();
        }
    };

    // Handle edit prompt
    const handleEditPrompt = () => {
        // Focus on prompt input
        const input = document.querySelector('textarea');
        if (input) {
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                        <SectionIcon size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">AI Content Generator</h2>
                        <p className="text-gray-600">Generate optimized content for your {currentSection.title}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-gray-100 rounded-lg">
                        <div className="text-sm text-gray-600">AI Credits</div>
                        <div className="text-lg font-bold text-purple-600">{aiCredits}</div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tone Selector */}
                    <ToneSelector selectedTone={tone} onSelectTone={setTone} />

                    {/* Length Selector */}
                    <LengthSelector selectedLength={length} onSelectLength={setLength} />

                    {/* Advanced Options */}
                    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between mb-4"
                        >
                            <h3 className="font-semibold text-gray-900">Advanced Options</h3>
                            {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedOptions.includeKeywords}
                                                onChange={(e) => setAdvancedOptions(prev => ({
                                                    ...prev,
                                                    includeKeywords: e.target.checked
                                                }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Include Keywords</div>
                                                <div className="text-sm text-gray-600">Add relevant industry keywords</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedOptions.addMetrics}
                                                onChange={(e) => setAdvancedOptions(prev => ({
                                                    ...prev,
                                                    addMetrics: e.target.checked
                                                }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Add Metrics</div>
                                                <div className="text-sm text-gray-600">Include quantifiable achievements</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedOptions.useActionVerbs}
                                                onChange={(e) => setAdvancedOptions(prev => ({
                                                    ...prev,
                                                    useActionVerbs: e.target.checked
                                                }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Action Verbs</div>
                                                <div className="text-sm text-gray-600">Use strong action-oriented language</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedOptions.optimizeATS}
                                                onChange={(e) => setAdvancedOptions(prev => ({
                                                    ...prev,
                                                    optimizeATS: e.target.checked
                                                }))}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">ATS Optimization</div>
                                                <div className="text-sm text-gray-600">Optimize for applicant tracking systems</div>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Job Title
                                            </label>
                                            <input
                                                type="text"
                                                value={advancedOptions.targetJobTitle}
                                                onChange={(e) => setAdvancedOptions(prev => ({
                                                    ...prev,
                                                    targetJobTitle: e.target.value
                                                }))}
                                                placeholder="e.g., Senior Software Engineer"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Target Industry
                                            </label>
                                            <input
                                                type="text"
                                                value={advancedOptions.targetIndustry}
                                                onChange={(e) => setAdvancedOptions(prev => ({
                                                    ...prev,
                                                    targetIndustry: e.target.value
                                                }))}
                                                placeholder="e.g., Technology, Finance"
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Prompt Input */}
                    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Your Prompt</h3>
                        <PromptInput
                            value={prompt}
                            onChange={setPrompt}
                            onSubmit={handleGenerate}
                            loading={isGenerating}
                            suggestions={currentSection.suggestions}
                        />
                    </div>
                </div>

                {/* Right Column - Preview & History */}
                <div className="space-y-6">
                    {/* Generated Content Preview */}
                    {generatedContent && (
                        <ContentPreview
                            content={generatedContent}
                            type={section}
                            onUse={() => handleApply(generatedContent)}
                            onRegenerate={handleRegenerate}
                            onEdit={handleEditPrompt}
                        />
                    )}

                    {/* Generation History */}
                    {history.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock size={16} />
                                Generation History
                            </h3>
                            <div className="space-y-3">
                                {history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleUseHistory(item)}
                                        className={`w-full p-3 rounded-lg border text-left transition-all duration-200 ${selectedHistory === item.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {item.prompt.substring(0, 50)}...
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 truncate">
                                            {item.content.substring(0, 80)}...
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                                                {item.tone}
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                                                {item.length}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                        <h3 className="font-semibold text-amber-900 mb-4 flex items-center gap-2">
                            <Zap size={16} />
                            Quick Actions
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || aiCredits <= 0}
                                className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Wand2 size={16} />
                                Generate New Content
                            </button>
                            <button
                                onClick={() => handleApply(generatedContent)}
                                disabled={!generatedContent}
                                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Check size={16} />
                                Apply to Resume
                            </button>
                            <button
                                onClick={handleRegenerate}
                                disabled={isGenerating || aiCredits <= 0}
                                className="w-full px-4 py-3 bg-white border border-amber-300 text-amber-700 rounded-lg font-medium hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Regenerate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Brain size={14} />
                            <span>Powered by Advanced AI</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield size={14} />
                            <span>Your content is private</span>
                        </div>
                    </div>
                    <div>
                        {aiCredits <= 0 ? (
                            <span className="text-red-600 font-medium">No AI credits remaining</span>
                        ) : (
                            <span>{aiCredits} AI credits available</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Default props
ContentGenerator.defaultProps = {
    section: 'summary',
    currentContent: '',
    onGenerate: () => { },
    onApply: () => { },
    user: { aiCredits: 50 },
    onClose: null
};

export default ContentGenerator;