// src/components/ai/AIAssistant.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import {
    Brain, MessageSquare, Sparkles, Target, Zap,
    Lightbulb, TrendingUp, BarChart, CheckCircle, XCircle,
    AlertCircle, Copy, Check, Maximize2, Minimize2,
    RefreshCw, ChevronRight, Bot, User, Send,
    BookOpen, Cpu, Shield, Star, Loader2, FileText, Briefcase,
    GraduationCap, Code, Award, Users, Search, X, Pin, PinOff,
    ChevronLeft // Added for hide/show toggle
} from 'lucide-react';

// OpenAI API integration
const openAIClient = {
    async generateResponse(prompt, context, options = {}) {
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    context,
                    options: {
                        model: options.model || 'gpt-4',
                        max_tokens: options.max_tokens || 1000,
                        temperature: options.temperature || 0.7,
                        ...options
                    }
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('OpenAI API error:', error);
            throw error;
        }
    },

    async analyzeResume(resumeData) {
        const prompt = `Analyze this resume for ATS compatibility and provide detailed feedback:

${JSON.stringify(resumeData, null, 2)}

Please provide analysis in the following format:
1. ATS Compatibility Score (0-100)
2. Keyword Analysis
3. Formatting Issues
4. Content Suggestions
5. Overall Recommendations`;

        return this.generateResponse(prompt, resumeData, {
            temperature: 0.3,
            max_tokens: 1500
        });
    },

    async enhanceSection(section, content, targetRole = null) {
        const prompt = targetRole
            ? `Enhance the following ${section} section for a ${targetRole} position:\n\n${content}\n\nMake it more professional, impactful, and ATS-friendly. Include quantifiable achievements where possible.`
            : `Enhance the following ${section} section:\n\n${content}\n\nMake it more professional, impactful, and ATS-friendly.`;

        return this.generateResponse(prompt, content, {
            temperature: 0.6,
            max_tokens: 800
        });
    },

    async generateKeywords(industry, experienceLevel) {
        const prompt = `Generate 20 relevant keywords for a ${experienceLevel} professional in the ${industry} industry. Include technical skills, soft skills, and industry-specific terms.`;

        return this.generateResponse(prompt, { industry, experienceLevel }, {
            temperature: 0.5,
            max_tokens: 500
        });
    },

    async critiqueResume(resumeData) {
        const prompt = `Provide constructive criticism for this resume. Be specific about what works well and what needs improvement:\n\n${JSON.stringify(resumeData, null, 2)}`;

        return this.generateResponse(prompt, resumeData, {
            temperature: 0.4,
            max_tokens: 1200
        });
    }
};

// AI Feature Card Component
const AIFeatureCard = ({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
    disabled = false,
    loading = false,
    credits = 1,
    color = 'purple',
    badge = null
}) => {
    const colorClasses = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        amber: 'from-amber-500 to-orange-500',
        red: 'from-red-500 to-rose-500',
        indigo: 'from-indigo-500 to-violet-500',
        pink: 'from-pink-500 to-rose-500'
    };

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={disabled ? null : onAction}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

            {badge && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                        {badge}
                    </span>
                </div>
            )}

            <div className="relative z-10 flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
                    <Icon size={24} className={`text-${color}-600`} />
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <div className="flex items-center gap-1 text-sm">
                            <Zap size={12} className="text-amber-500" />
                            <span className="font-medium text-amber-600">{credits}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{description}</p>
                    <button
                        disabled={disabled || loading}
                        className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${disabled
                            ? 'bg-gray-100 text-gray-400'
                            : `bg-gradient-to-r ${colorClasses[color]} text-white hover:shadow-lg`}`}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {actionText}
                                <ChevronRight size={14} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// Chat Message Component
const ChatMessage = ({ message, isAI, timestamp, thinking = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isAI
            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
            : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
            {isAI ? <Bot size={20} className="text-white" /> : <User size={20} className="text-white" />}
        </div>
        <div className={`flex-1 max-w-[85%] ${isAI ? '' : 'text-right'}`}>
            <div className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${isAI
                ? 'bg-white border border-gray-200 text-gray-900'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'}`}>
                {thinking ? (
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                    </div>
                ) : (
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{message}</div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    </motion.div>
);

// ATS Score Meter Component
const ATSScoreMeter = ({ score = 85, improvements = [], onImprove = () => { } }) => {
    const [expanded, setExpanded] = useState(false);

    const getScoreColor = (score) => {
        if (score >= 90) return 'from-green-500 to-emerald-500';
        if (score >= 80) return 'from-blue-500 to-cyan-500';
        if (score >= 70) return 'from-amber-500 to-orange-500';
        return 'from-red-500 to-rose-500';
    };

    const getScoreLabel = (score) => {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Good';
        if (score >= 70) return 'Fair';
        return 'Needs Work';
    };

    return (
        <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <Target size={20} className="text-purple-600" />
                        ATS Compatibility Score
                    </h3>
                    <p className="text-sm text-gray-600">How well your resume performs with Applicant Tracking Systems</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${getScoreColor(score)} bg-clip-text text-transparent`}>
                        {score}%
                    </div>
                    <ChevronRight
                        size={20}
                        className={`text-gray-400 cursor-pointer transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
                        onClick={() => setExpanded(!expanded)}
                    />
                </div>
            </div>

            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-3">
                    <span>Poor</span>
                    <span className="font-medium">{getScoreLabel(score)}</span>
                    <span>Excellent</span>
                </div>
                <div className="h-4 bg-gradient-to-r from-red-200 via-amber-200 to-green-200 rounded-full overflow-hidden shadow-inner">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${getScoreColor(score)} rounded-full relative`}
                    >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && improvements.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                                <Lightbulb size={16} className="text-amber-500" />
                                AI Recommendations
                            </h4>
                            <div className="space-y-3">
                                {improvements.map((improvement, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ x: 4 }}
                                        className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-200"
                                        onClick={() => onImprove(improvement)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-gray-900">{improvement.title}</div>
                                                <div className="text-xs text-gray-600 mt-1">{improvement.description}</div>
                                            </div>
                                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
                                                {improvement.impact}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// AI Chat Interface Component
const AIChatInterface = ({ onSendMessage, messages = [], loading = false, mode = 'chat' }) => {
    const [input, setInput] = useState('');
    const [aiModes] = useState([
        { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'purple' },
        { id: 'analyze', label: 'Analyze', icon: BarChart, color: 'blue' },
        { id: 'enhance', label: 'Enhance', icon: Sparkles, color: 'pink' },
        { id: 'critique', label: 'Critique', icon: Target, color: 'amber' },
    ]);
    const [activeMode, setActiveMode] = useState(mode);
    const chatContainerRef = useRef(null);

    const handleSend = () => {
        if (input.trim()) {
            onSendMessage(input.trim(), activeMode);
            setInput('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const modePrompts = {
        chat: [
            "Improve my summary section",
            "Generate bullet points for my experience",
            "Suggest skills for a software engineer",
            "Optimize for ATS compatibility",
            "Check grammar and spelling"
        ],
        analyze: [
            "Analyze my resume for weaknesses",
            "Check ATS compatibility score",
            "Review keyword optimization",
            "Analyze content structure",
            "Check readability score"
        ],
        enhance: [
            "Enhance my professional summary",
            "Improve action verbs in experience",
            "Add quantifiable achievements",
            "Optimize skills section",
            "Enhance overall impact"
        ],
        critique: [
            "Critique my resume objectively",
            "Identify top 3 improvements",
            "Compare with industry standards",
            "Suggest format improvements",
            "Review content relevance"
        ]
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="flex flex-col h-[600px] bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 via-blue-50 to-pink-50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">AI Resume Assistant</h3>
                        <p className="text-xs text-gray-600">Switch modes for different AI assistance</p>
                    </div>
                </div>

                <div className="flex gap-1">
                    {aiModes.map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${activeMode === mode.id
                                ? `bg-gradient-to-r ${mode.color === 'purple' ? 'from-purple-600 to-pink-600' :
                                    mode.color === 'blue' ? 'from-blue-600 to-cyan-600' :
                                        mode.color === 'pink' ? 'from-pink-600 to-rose-600' :
                                            'from-amber-600 to-orange-600'} text-white shadow-sm`
                                : 'text-gray-600 hover:text-gray-900 hover:bg-white'}`}
                        >
                            <mode.icon size={14} />
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6"
            >
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-6">
                            <Bot size={32} className="text-purple-600" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-3">How can I help you today?</h4>
                        <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
                            I'm your AI resume assistant. I can analyze, enhance, critique, and chat about your resume to help you land more interviews.
                        </p>

                        <div className="space-y-3 max-w-md mx-auto">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Try asking:</h5>
                            <div className="grid grid-cols-1 gap-2">
                                {modePrompts[activeMode].map((prompt, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setInput(prompt);
                                            setTimeout(() => handleSend(), 100);
                                        }}
                                        className="px-4 py-3 bg-white border border-gray-200 hover:border-purple-300 text-gray-700 rounded-xl text-sm transition-all duration-200 text-left hover:shadow-sm"
                                    >
                                        {prompt}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-4">
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium">
                                {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} Mode
                            </span>
                        </div>
                        {messages.map((msg, index) => (
                            <ChatMessage
                                key={index}
                                message={msg.content}
                                isAI={msg.role === 'ai'}
                                timestamp={msg.timestamp}
                                thinking={msg.thinking}
                            />
                        ))}
                    </>
                )}

                {loading && (
                    <ChatMessage
                        message=""
                        isAI={true}
                        timestamp={new Date()}
                        thinking={true}
                    />
                )}
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2 mb-3">
                    <button
                        onClick={() => {
                            if (messages.length > 0 && messages[messages.length - 1].role === 'ai') {
                                navigator.clipboard.writeText(messages[messages.length - 1].content);
                                toast.success('Copied to clipboard!');
                            }
                        }}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                        <Copy size={12} className="inline mr-1" />
                        Copy Last Response
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors">
                        <RefreshCw size={12} className="inline mr-1" />
                        Regenerate
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={`Ask AI to ${activeMode} your resume...`}
                            className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none shadow-sm"
                            rows="2"
                        />
                        <div className="absolute right-2 bottom-2 flex gap-1">
                            <button
                                onClick={() => setInput('')}
                                className="p-1.5 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main AI Assistant Component
const AIAssistant = ({
    isVisible = true,
    onClose = () => { },
    activeSection = 'summary',
    resumeData = {},
    onEnhance = () => { },
    user = {},
    isMobile = false,
    position = 'right',
    aiCredits = 50,
    onCreditsUpdate = () => { },
    onToggleFullscreen = () => { },
    onPin = () => { },
    isPinned = false,
    // NEW PROPS for toggle functionality
    onToggle = () => { },
    isOpen = false
}) => {
    const { generateAIResponse } = useAuth();
    const { enhanceWithAI } = useResume();

    const [activeTab, setActiveTab] = useState('chat');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [currentCredits, setCurrentCredits] = useState(aiCredits);
    const [analysisScores, setAnalysisScores] = useState({
        ats: 85,
        clarity: 85,
        impact: 78,
        relevance: 92,
        originality: 76,
        structure: 88
    });
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [improvements, setImprovements] = useState([]);

    // NEW: Handle internal visibility state
    const [internalIsVisible, setInternalIsVisible] = useState(isVisible);

    // Sync with external visibility changes
    useEffect(() => {
        setInternalIsVisible(isVisible);
    }, [isVisible]);

    // Handle toggle from button click
    const handleToggle = useCallback(() => {
        if (onToggle) {
            onToggle();
        } else {
            setInternalIsVisible(prev => !prev);
            if (onClose && !internalIsVisible) {
                onClose();
            }
        }
    }, [onToggle, onClose, internalIsVisible]);

    const aiFeatures = [
        {
            id: 'enhance-summary',
            icon: FileText,
            title: 'Enhance Summary',
            description: 'AI will rewrite your professional summary to be more impactful and keyword-rich',
            actionText: 'Enhance Now',
            credits: 2,
            color: 'purple',
            action: async () => {
                const enhanced = await openAIClient.enhanceSection(
                    'summary',
                    resumeData.summary || 'Professional summary section'
                );
                return { enhancedText: enhanced };
            }
        },
        {
            id: 'optimize-experience',
            icon: Briefcase,
            title: 'Optimize Experience',
            description: 'Improve your experience section with quantifiable achievements and action verbs',
            actionText: 'Optimize Now',
            credits: 3,
            color: 'blue',
            action: async () => {
                const experienceText = resumeData.experience?.map(exp =>
                    `${exp.position} at ${exp.company}: ${exp.description}`
                ).join('\n\n') || 'Experience section';

                const enhanced = await openAIClient.enhanceSection('experience', experienceText);
                return { enhancedText: enhanced };
            }
        },
        {
            id: 'generate-skills',
            icon: Code,
            title: 'Generate Skills',
            description: 'Get AI-recommended skills based on your experience and target industry',
            actionText: 'Generate Now',
            credits: 1,
            color: 'green',
            action: async () => {
                const skills = await openAIClient.generateKeywords(
                    user.industry || 'technology',
                    user.experienceLevel || 'mid-level'
                );
                return { skills: skills.split('\n').filter(s => s.trim()) };
            }
        },
        {
            id: 'ats-check',
            icon: Target,
            title: 'ATS Check',
            description: 'Analyze your resume for ATS compatibility and get improvement suggestions',
            actionText: 'Check Now',
            credits: 2,
            color: 'amber',
            action: async () => {
                const analysis = await openAIClient.analyzeResume(resumeData);

                // Parse score from analysis
                const scoreMatch = analysis.match(/ATS Compatibility Score.*?(\d+)/);
                const score = scoreMatch ? parseInt(scoreMatch[1]) : 85;

                // Extract improvements
                const extractedImprovements = extractImprovementsFromAnalysis(analysis);

                return { analysis, score, improvements: extractedImprovements };
            }
        },
        {
            id: 'resume-rewrite',
            icon: RefreshCw,
            title: 'Complete Rewrite',
            description: 'AI will completely rewrite your resume for maximum impact',
            actionText: 'Rewrite Now',
            credits: 5,
            color: 'red',
            badge: 'PRO',
            action: async () => {
                const prompt = `Completely rewrite this resume for maximum impact and ATS optimization:\n\n${JSON.stringify(resumeData, null, 2)}`;
                const rewritten = await openAIClient.generateResponse(prompt, resumeData, {
                    temperature: 0.6,
                    max_tokens: 2000
                });
                return { rewrittenResume: rewritten };
            }
        }
    ];

    const extractImprovementsFromAnalysis = (analysis) => {
        const improvements = [];

        // Extract suggestions from analysis
        if (analysis.includes('keyword')) {
            improvements.push({
                title: 'Add More Keywords',
                description: 'Increase keyword density for better ATS matching',
                impact: '+5%'
            });
        }

        if (analysis.includes('quantifiable') || analysis.includes('metrics')) {
            improvements.push({
                title: 'Add Quantifiable Results',
                description: 'Include measurable achievements with numbers',
                impact: '+7%'
            });
        }

        if (analysis.includes('format') || analysis.includes('structure')) {
            improvements.push({
                title: 'Improve Format',
                description: 'Optimize resume structure for ATS scanning',
                impact: '+3%'
            });
        }

        if (analysis.includes('action verb') || analysis.includes('verb')) {
            improvements.push({
                title: 'Use Stronger Action Verbs',
                description: 'Start bullet points with powerful action verbs',
                impact: '+4%'
            });
        }

        return improvements;
    };

    const handleAIFeature = useCallback(async (feature) => {
        if (currentCredits < feature.credits) {
            toast.error(`❌ Insufficient AI credits. Need ${feature.credits} credits.`, {
                duration: 3000,
                icon: '💰'
            });
            return;
        }

        setChatLoading(true);

        const processingMessage = {
            role: 'ai',
            content: `Processing "${feature.title}"...`,
            timestamp: new Date(),
            thinking: true
        };
        setChatMessages(prev => [...prev, processingMessage]);

        try {
            const result = await feature.action();

            const newCredits = currentCredits - feature.credits;
            setCurrentCredits(newCredits);
            onCreditsUpdate(newCredits);

            // Update analysis scores if available
            if (result.score) {
                setAnalysisScores(prev => ({ ...prev, ats: result.score }));
            }

            if (result.improvements) {
                setImprovements(result.improvements);
            }

            if (result.skills) {
                setSelectedKeywords(prev => [...prev, ...result.skills.slice(0, 10)]);
            }

            toast.success(`✨ ${feature.title} completed!`, {
                duration: 3000,
                icon: '🎯'
            });

            const successMessage = {
                role: 'ai',
                content: `${feature.title} completed successfully!\n\n${JSON.stringify(result, null, 2)}`,
                timestamp: new Date()
            };

            setChatMessages(prev => {
                const filtered = prev.filter(msg => !msg.thinking);
                return [...filtered, successMessage];
            });

            onEnhance(activeSection, feature.id, result);

        } catch (error) {
            console.error('AI feature error:', error);

            toast.error(`Failed to execute ${feature.title}`, {
                duration: 3000,
                icon: '❌'
            });

            const errorMessage = {
                role: 'ai',
                content: `Sorry, I couldn't complete "${feature.title}". Error: ${error.message}`,
                timestamp: new Date()
            };

            setChatMessages(prev => {
                const filtered = prev.filter(msg => !msg.thinking);
                return [...filtered, errorMessage];
            });
        } finally {
            setChatLoading(false);
        }
    }, [currentCredits, activeSection, onEnhance, onCreditsUpdate, resumeData]);

    const handleChatMessage = useCallback(async (message, mode = 'chat') => {
        if (!message.trim()) return;

        if (currentCredits <= 0) {
            toast.error('❌ Insufficient AI credits. Please upgrade your plan.', {
                duration: 3000,
                icon: '💰'
            });
            return;
        }

        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date()
        };
        setChatMessages(prev => [...prev, userMessage]);
        setChatLoading(true);

        const newCredits = currentCredits - 1;
        setCurrentCredits(newCredits);
        onCreditsUpdate(newCredits);

        try {
            let aiResponse;

            switch (mode) {
                case 'analyze':
                    aiResponse = await openAIClient.analyzeResume(resumeData);
                    break;
                case 'enhance':
                    aiResponse = await openAIClient.enhanceSection(
                        activeSection,
                        resumeData[activeSection] || 'Section content',
                        user.targetRole
                    );
                    break;
                case 'critique':
                    aiResponse = await openAIClient.critiqueResume(resumeData);
                    break;
                default:
                    aiResponse = await openAIClient.generateResponse(
                        `As a resume expert, help with: ${message}\n\nResume context: ${JSON.stringify(resumeData, null, 2)}`,
                        resumeData,
                        { temperature: 0.7 }
                    );
            }

            const aiMessage = {
                role: 'ai',
                content: aiResponse,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error('Chat error:', error);

            const errorMessage = {
                role: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, errorMessage]);

            toast.error('Failed to get AI response', {
                duration: 3000,
                icon: '❌'
            });
        } finally {
            setChatLoading(false);
        }
    }, [currentCredits, onCreditsUpdate, resumeData, activeSection, user]);

    const handleATSImprovement = useCallback((improvement) => {
        toast.success(`Applying improvement: ${improvement.title}`, {
            duration: 2000,
            icon: '⚡'
        });

        setAnalysisScores(prev => ({
            ...prev,
            ats: Math.min(100, prev.ats + parseInt(improvement.impact))
        }));

        onEnhance('analysis', improvement);
    }, [onEnhance]);

    const handleFullscreenToggle = () => {
        const newState = !isFullscreen;
        setIsFullscreen(newState);
        onToggleFullscreen(newState);
    };

    const tabs = [
        { id: 'chat', label: 'AI Chat', icon: MessageSquare, color: 'purple' },
        { id: 'analysis', label: 'Analysis', icon: BarChart, color: 'blue' },
        { id: 'keywords', label: 'Keywords', icon: Search, color: 'green' },
        { id: 'features', label: 'AI Features', icon: Sparkles, color: 'pink' }
    ];

    if (!internalIsVisible && isMobile) {
        return null;
    }

    return (
        <>
            {/* Mini Toggle Button when collapsed */}
            {!internalIsVisible && (
                <motion.button
                    initial={{ opacity: 0, x: position === 'right' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggle}
                    className={`fixed ${position === 'right' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-xl transition-all duration-200`}
                    title="Show AI Assistant"
                >
                    <Brain size={20} />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-[8px] font-bold">
                        {currentCredits}
                    </div>
                </motion.button>
            )}

            {/* Main AI Assistant Panel */}
            <motion.div
                initial={false}
                animate={{
                    x: internalIsVisible ? 0 : (position === 'right' ? 384 : -384),
                    opacity: internalIsVisible ? 1 : 0
                }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed ${position === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-96 bg-white border-l border-gray-200 z-40 shadow-2xl flex flex-col ${isFullscreen ? 'w-screen h-screen' : ''}`}
            >
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center shadow-md">
                                <Brain size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
                                <p className="text-xs text-gray-600">Powered by OpenAI GPT-4</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <Zap size={12} className="text-amber-500" />
                                    <span className="text-sm font-bold text-gray-900">{currentCredits}</span>
                                    <span className="text-xs text-gray-500">credits</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={onPin}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    title={isPinned ? "Unpin Assistant" : "Pin Assistant"}
                                >
                                    {isPinned ? <Pin size={16} className="text-purple-600" /> : <PinOff size={16} className="text-gray-500" />}
                                </button>
                                <button
                                    onClick={handleFullscreenToggle}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize2 size={16} className="text-gray-500" /> : <Maximize2 size={16} className="text-gray-500" />}
                                </button>
                                <button
                                    onClick={handleToggle}
                                    className="p-2 hover:bg-white rounded-lg transition-colors"
                                    title="Hide Assistant"
                                >
                                    {position === 'right' ? <ChevronRight size={16} className="text-gray-500" /> : <ChevronLeft size={16} className="text-gray-500" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1">
                        {tabs.map((tab) => (
                            <motion.button
                                key={tab.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex-1 ${activeTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color === 'purple' ? 'from-purple-600 to-pink-600' :
                                        tab.color === 'blue' ? 'from-blue-600 to-cyan-600' :
                                            tab.color === 'green' ? 'from-green-600 to-emerald-600' :
                                                'from-pink-600 to-rose-600'} text-white shadow-sm`
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white'}`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <AnimatePresence mode="wait">
                        {activeTab === 'chat' ? (
                            <motion.div
                                key="chat"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <AIChatInterface
                                    onSendMessage={handleChatMessage}
                                    messages={chatMessages}
                                    loading={chatLoading}
                                />
                            </motion.div>
                        ) : activeTab === 'analysis' ? (
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <ATSScoreMeter
                                    score={analysisScores.ats}
                                    improvements={improvements}
                                    onImprove={handleATSImprovement}
                                />

                                {chatMessages.filter(msg => msg.role === 'ai' && msg.content.includes('Analysis')).length > 0 && (
                                    <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                                        <h3 className="font-semibold text-gray-900 mb-4">Recent AI Analysis</h3>
                                        <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {chatMessages
                                                .filter(msg => msg.role === 'ai' && msg.content.includes('Analysis'))
                                                .slice(-1)[0]?.content || 'No analysis available yet'}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === 'keywords' ? (
                            <motion.div
                                key="keywords"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="mb-6">
                                        <h3 className="font-semibold text-gray-900 mb-2">Keyword Optimization</h3>
                                        <p className="text-sm text-gray-600">Add relevant keywords to improve your ATS score</p>
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-sm font-medium text-gray-700 mb-3">Your Keywords:</div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {selectedKeywords.map((keyword, index) => (
                                                <motion.span
                                                    key={index}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-medium"
                                                >
                                                    {keyword}
                                                    <button
                                                        onClick={() => setSelectedKeywords(prev => prev.filter(k => k !== keyword))}
                                                        className="hover:text-blue-900"
                                                    >
                                                        ×
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>

                                        {selectedKeywords.length === 0 && (
                                            <div className="text-center py-4 text-gray-500">
                                                No keywords yet. Use AI features to generate keywords.
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => handleAIFeature(aiFeatures.find(f => f.id === 'generate-skills'))}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <Sparkles size={16} />
                                        Generate AI Keywords
                                        <Zap size={12} className="text-amber-300" />
                                        <span className="text-xs">1 credit</span>
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="features"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Features</h3>
                                    <p className="text-sm text-gray-600">Powered by OpenAI GPT-4 for intelligent resume optimization</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {aiFeatures.map((feature) => (
                                        <AIFeatureCard
                                            key={feature.id}
                                            {...feature}
                                            disabled={currentCredits < feature.credits}
                                            loading={chatLoading}
                                            onAction={() => handleAIFeature(feature)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-medium">AI Assistant Active</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={12} />
                                <span>Secure & Private</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Cpu size={12} />
                            <span>Powered by OpenAI GPT-4</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default AIAssistant;