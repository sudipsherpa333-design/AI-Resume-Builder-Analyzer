// src/components/ai/AIChatAssistant.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import {
    Bot, User, Send, Sparkles, Wand2, Brain, Zap,
    Copy, Check, ThumbsUp, ThumbsDown, Clock,
    Loader2, MessageSquare, Mic, MicOff, Paperclip,
    Smile, Image as ImageIcon, Code, FileText,
    Briefcase, GraduationCap, Award, Languages,
    TrendingUp, Target, Lightbulb, HelpCircle,
    RefreshCw, Maximize2, Minimize2, Settings,
    Volume2, VolumeX, X, ChevronDown, ChevronUp
} from 'lucide-react';

// Chat Message Component
const ChatMessage = ({ message, isAI, timestamp, onCopy, onFeedback }) => {
    const [copied, setCopied] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        toast.success('Message copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        if (onCopy) onCopy(message);
    };

    const handleFeedback = (type) => {
        setFeedback(type);
        if (onFeedback) onFeedback(message, type);
        toast.success(`Feedback submitted: ${type === 'like' ? '👍 Liked' : '👎 Disliked'}`);
    };

    const getSectionIcon = (section) => {
        const icons = {
            summary: FileText,
            experience: Briefcase,
            education: GraduationCap,
            skills: Code,
            projects: FileText,
            certifications: Award,
            languages: Languages,
            default: MessageSquare
        };
        return icons[section] || icons.default;
    };

    const SectionIcon = message.metadata?.section ? getSectionIcon(message.metadata.section) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
        >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isAI ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                {isAI ? (
                    <Bot size={20} className="text-white" />
                ) : (
                    <User size={20} className="text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[75%] ${isAI ? '' : 'flex flex-col items-end'}`}>
                {/* Message Header */}
                <div className={`flex items-center gap-2 mb-1 ${isAI ? '' : 'justify-end'}`}>
                    {SectionIcon && isAI && (
                        <SectionIcon size={12} className="text-gray-400" />
                    )}
                    <span className="text-xs font-medium text-gray-600">
                        {isAI ? 'AI Assistant' : 'You'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Message Body */}
                <div className={`relative group ${isAI ? '' : 'flex justify-end'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${isAI ? 'bg-gradient-to-r from-gray-50 to-white border border-gray-200 text-gray-900' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'}`}>
                        <div className="whitespace-pre-line text-sm leading-relaxed">
                            {message.content}
                        </div>

                        {/* Metadata */}
                        {message.metadata?.suggestions && (
                            <div className="mt-3 pt-3 border-t border-gray-200 border-dashed">
                                <div className="text-xs font-medium text-gray-700 mb-2">AI Suggestions:</div>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    {message.metadata.suggestions.map((suggestion, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <Lightbulb size={10} className="text-amber-500" />
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {isAI && (
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex gap-1">
                                <button
                                    onClick={handleCopy}
                                    className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    title="Copy message"
                                >
                                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-gray-600" />}
                                </button>
                                <button
                                    onClick={() => handleFeedback('like')}
                                    className={`p-1.5 bg-white border rounded-lg transition-colors ${feedback === 'like' ? 'border-green-500 text-green-600' : 'border-gray-300 hover:bg-gray-50'}`}
                                    title="Like response"
                                >
                                    <ThumbsUp size={14} />
                                </button>
                                <button
                                    onClick={() => handleFeedback('dislike')}
                                    className={`p-1.5 bg-white border rounded-lg transition-colors ${feedback === 'dislike' ? 'border-red-500 text-red-600' : 'border-gray-300 hover:bg-gray-50'}`}
                                    title="Dislike response"
                                >
                                    <ThumbsDown size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Thinking Indicator */}
                {message.isThinking && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span>AI is thinking...</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Quick Prompt Component
const QuickPrompt = ({ icon: Icon, text, onClick, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
        purple: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
        green: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
        amber: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
    };

    return (
        <button
            onClick={onClick}
            className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-2 ${colorClasses[color]}`}
        >
            <Icon size={16} />
            {text}
        </button>
    );
};

// Main AIChatAssistant Component
const AIChatAssistant = ({
    activeSection,
    resumeData,
    onApplySuggestion,
    onGenerateContent,
    user,
    minimized = false,
    onToggleMinimize
}) => {
    const { generateAIResponse } = useAuth();
    const { currentResume, updateSection } = useResume();

    // State
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'ai',
            content: `Hello! I'm your AI Resume Assistant. I can help you improve your resume in many ways. What would you like to work on today?`,
            timestamp: new Date(),
            metadata: {
                type: 'welcome',
                suggestions: [
                    'Improve your summary section',
                    'Optimize for ATS compatibility',
                    'Generate content for any section',
                    'Get personalized suggestions'
                ]
            }
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [aiCredits, setAiCredits] = useState(user?.aiCredits || 50);
    const [isRecording, setIsRecording] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    const [quickPrompts] = useState([
        {
            id: 'improve-summary',
            text: 'Improve my summary',
            icon: FileText,
            color: 'blue',
            prompt: 'Can you improve my professional summary to make it more impactful?'
        },
        {
            id: 'generate-bullets',
            text: 'Generate bullet points',
            icon: Zap,
            color: 'purple',
            prompt: 'Generate 5 strong bullet points for my experience section'
        },
        {
            id: 'ats-optimize',
            text: 'Optimize for ATS',
            icon: Target,
            color: 'green',
            prompt: 'How can I optimize my resume for better ATS compatibility?'
        },
        {
            id: 'skills-suggest',
            text: 'Suggest skills',
            icon: Brain,
            color: 'amber',
            prompt: 'What skills should I add to my resume for a software engineering role?'
        }
    ]);
    const [chatHistory, setChatHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const chatContainerRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    // Focus input on mount
    useEffect(() => {
        if (inputRef.current && !minimized) {
            inputRef.current.focus();
        }
    }, [minimized]);

    // Handle AI response generation
    const generateAIResponseWithContext = async (userPrompt) => {
        if (aiCredits <= 0) {
            toast.error('Insufficient AI credits. Please upgrade your plan.');
            return null;
        }

        setIsLoading(true);

        // Add thinking message
        const thinkingMessage = {
            id: Date.now(),
            role: 'ai',
            content: '',
            timestamp: new Date(),
            isThinking: true
        };
        setMessages(prev => [...prev, thinkingMessage]);

        try {
            // Prepare context based on active section and resume data
            const context = {
                activeSection,
                resumeData: currentResume.data,
                userPrompt,
                timestamp: new Date().toISOString()
            };

            // Call AI API
            const response = await generateAIResponse(userPrompt, activeSection, context);

            // Remove thinking message
            setMessages(prev => prev.filter(msg => !msg.isThinking));

            if (response.success) {
                // Deduct credit
                setAiCredits(prev => prev - 1);

                // Parse AI response for suggestions
                const suggestions = extractSuggestions(response.data);

                const aiMessage = {
                    id: Date.now() + 1,
                    role: 'ai',
                    content: response.data,
                    timestamp: new Date(),
                    metadata: {
                        type: 'response',
                        suggestions: suggestions.slice(0, 3), // Top 3 suggestions
                        section: activeSection,
                        creditsUsed: 1
                    }
                };

                return aiMessage;
            } else {
                throw new Error(response.message || 'Failed to get AI response');
            }
        } catch (error) {
            console.error('AI Response Error:', error);
            toast.error(error.message || 'Failed to get AI response');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Extract suggestions from AI response
    const extractSuggestions = (content) => {
        const suggestionPatterns = [
            /(?:suggest|recommend|try|consider|add|include)[^.!?]*[.!?]/gi,
            /(?:you should|it would be good|better to)[^.!?]*[.!?]/gi,
            /•\s*([^•\n]+)/g
        ];

        const suggestions = [];
        suggestionPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                suggestions.push(...matches.map(m => m.trim()));
            }
        });

        return suggestions.length > 0 ? suggestions : ['Review and optimize your content', 'Add more quantifiable achievements', 'Use stronger action verbs'];
    };

    // Handle sending a message
    const handleSendMessage = async (text = input) => {
        if (!text.trim() || isLoading) return;

        // Clear input
        setInput('');

        // Add user message
        const userMessage = {
            id: Date.now(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Save to history
        setChatHistory(prev => [...prev.slice(-9), userMessage]); // Keep last 10 messages

        // Get AI response
        const aiMessage = await generateAIResponseWithContext(text);
        if (aiMessage) {
            setMessages(prev => [...prev, aiMessage]);
        }
    };

    // Handle quick prompt click
    const handleQuickPrompt = (prompt) => {
        setInput(prompt);
        setTimeout(() => handleSendMessage(prompt), 100);
    };

    // Handle apply suggestion from chat
    const handleApplyChatSuggestion = (suggestion) => {
        if (onApplySuggestion) {
            onApplySuggestion(suggestion);

            // Add confirmation message
            const confirmationMessage = {
                id: Date.now(),
                role: 'user',
                content: `Applied suggestion: ${suggestion}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, confirmationMessage]);
        }
    };

    // Handle voice input
    const toggleVoiceRecording = () => {
        if (!voiceEnabled) {
            toast.error('Please enable voice input in settings');
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            toast.success('Voice recording stopped');
            // Here you would process the recorded audio
        } else {
            setIsRecording(true);
            toast.info('Listening... Speak now');
            // Here you would start recording
        }
    };

    // Handle copy all chat
    const handleCopyChat = async () => {
        const chatText = messages.map(msg =>
            `${msg.role === 'ai' ? 'AI' : 'You'}: ${msg.content}`
        ).join('\n\n');

        await navigator.clipboard.writeText(chatText);
        toast.success('Chat copied to clipboard!');
    };

    // Handle clear chat
    const handleClearChat = () => {
        setMessages([messages[0]]); // Keep welcome message
        toast.success('Chat cleared');
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Handle feedback
    const handleFeedback = (message, type) => {
        console.log(`Feedback: ${type} for message:`, message);
        // Here you would send feedback to your analytics/feedback system
    };

    // Handle copy message
    const handleCopyMessage = (message) => {
        console.log('Copied message:', message);
    };

    if (minimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform duration-200 group"
            >
                <Bot size={24} />
                {messages.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {messages.length - 1}
                    </span>
                )}
            </button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 w-[500px] h-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">AI Chat Assistant</h3>
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-gray-600">AI Credits: {aiCredits}</div>
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                <div className="text-xs text-gray-600">Online</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleCopyChat}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Copy chat"
                        >
                            <Copy size={18} className="text-gray-600" />
                        </button>
                        <button
                            onClick={handleClearChat}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Clear chat"
                        >
                            <RefreshCw size={18} className="text-gray-600" />
                        </button>
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Chat history"
                        >
                            <Clock size={18} className="text-gray-600" />
                        </button>
                        <button
                            onClick={onToggleMinimize}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Minimize"
                        >
                            <Minimize2 size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat History Panel */}
            <AnimatePresence>
                {showHistory && chatHistory.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-gray-200 bg-gray-50 overflow-hidden"
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-semibold text-gray-900">Recent Messages</h4>
                                <button
                                    onClick={() => setChatHistory([])}
                                    className="text-xs text-red-600 hover:text-red-700"
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {chatHistory.map((msg, index) => (
                                    <div
                                        key={index}
                                        className="p-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-700 truncate cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleQuickPrompt(msg.content)}
                                    >
                                        {msg.content}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Prompts */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Quick Prompts</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {quickPrompts.map((prompt) => (
                        <QuickPrompt
                            key={prompt.id}
                            {...prompt}
                            onClick={() => handleQuickPrompt(prompt.prompt)}
                        />
                    ))}
                </div>
            </div>

            {/* Chat Messages */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-white to-gray-50"
            >
                <AnimatePresence>
                    {messages.map((message) => (
                        <ChatMessage
                            key={message.id}
                            message={message}
                            isAI={message.role === 'ai'}
                            timestamp={message.timestamp}
                            onCopy={handleCopyMessage}
                            onFeedback={handleFeedback}
                        />
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot size={20} className="text-white" />
                        </div>
                        <div className="px-4 py-3 bg-gray-100 rounded-2xl">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message here... (Shift + Enter for new line)"
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none text-sm"
                        rows="2"
                        disabled={isLoading}
                    />

                    {/* Input Actions */}
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                        <button
                            onClick={toggleVoiceRecording}
                            className={`p-2 rounded-lg ${isRecording ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-600'}`}
                            title={isRecording ? 'Stop recording' : 'Voice input'}
                        >
                            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!input.trim() || isLoading}
                            className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Send message"
                        >
                            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </div>

                {/* Input Footer */}
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className="flex items-center gap-1"
                        >
                            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                            <span>Voice {voiceEnabled ? 'On' : 'Off'}</span>
                        </button>
                        <div className="h-4 w-px bg-gray-300" />
                        <span>Press Enter to send</span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {aiCredits} AI credits remaining
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Default props
AIChatAssistant.defaultProps = {
    activeSection: 'summary',
    resumeData: {},
    onApplySuggestion: () => { },
    onGenerateContent: () => { },
    user: { aiCredits: 50 },
    minimized: false,
    onToggleMinimize: () => { }
};

export default AIChatAssistant;