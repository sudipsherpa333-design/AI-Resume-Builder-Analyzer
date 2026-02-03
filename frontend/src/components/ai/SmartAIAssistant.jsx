// ------------------- SmartAIAssistant.jsx -------------------
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Wand2, Target, MessageSquare, X, Send, ThumbsUp, ThumbsDown, Copy, Zap, Brain, TrendingUp, Clock, ChevronRight, FileText, Briefcase, GraduationCap, Cpu, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

const SmartAIAssistant = ({ resumeData, currentSection, onEnhance, onApply, onClose }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [activeTab, setActiveTab] = useState('chat');
    const [aiInsights, setAiInsights] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // AI Chat Mutation
    const chatMutation = useMutation({
        mutationFn: async ({ message, conversationHistory }) => {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    resumeData,
                    conversationHistory: conversationHistory.slice(-5),
                    currentSection
                })
            });

            if (!response.ok) throw new Error('Failed to get AI response');
            return response.json();
        },
        onSuccess: (data) => {
            const aiMessage = {
                id: messages.length + 1,
                type: 'ai',
                content: data.response,
                timestamp: new Date(),
                suggestions: data.suggestions || []
            };
            setMessages(prev => [...prev, aiMessage]);
        },
        onError: (error) => {
            const aiMessage = {
                id: messages.length + 1,
                type: 'ai',
                content: "I apologize, but I'm having trouble processing your request. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMessage]);
            console.error('Chat error:', error);
        }
    });

    // AI Insights Mutation
    const insightsMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    targetRole: resumeData.targetRole,
                    currentSection
                })
            });

            if (!response.ok) throw new Error('Failed to get AI insights');
            return response.json();
        },
        onSuccess: (data) => {
            setAiInsights(data);
        },
        onError: (error) => {
            console.error('Insights error:', error);
        }
    });

    // Apply Enhancement Mutation
    const applyEnhancementMutation = useMutation({
        mutationFn: async ({ section, enhancementType }) => {
            const response = await fetch('/api/ai/enhance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section,
                    content: resumeData[section],
                    enhancementType,
                    targetRole: resumeData.targetRole
                })
            });

            if (!response.ok) throw new Error('Failed to apply enhancement');
            return response.json();
        },
        onSuccess: (data) => {
            toast.success('AI enhancement applied successfully!');
            if (onApply) {
                onApply({
                    [data.section]: data.enhancedContent,
                    aiEnhancements: {
                        applied: true,
                        lastEnhanced: new Date().toISOString(),
                        enhancement: data.enhancementType
                    }
                });
            }
        },
        onError: (error) => {
            toast.error('Failed to apply enhancement');
            console.error('Enhancement error:', error);
        }
    });

    useEffect(() => {
        scrollToBottom();
        loadInitialMessage();
        insightsMutation.mutate();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadInitialMessage = () => {
        const initialMessage = {
            id: 1,
            type: 'ai',
            content: `Hi! I'm your AI Resume Assistant. I've analyzed your resume for the "${resumeData.targetRole || 'target'}" role. How can I help you improve it today?`,
            timestamp: new Date()
        };
        setMessages([initialMessage]);
    };

    const handleSend = () => {
        if (!input.trim() || chatMutation.isLoading) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);

        chatMutation.mutate({
            message: input,
            conversationHistory: messages.map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }))
        });

        setInput('');
    };

    const handleQuickAction = (action) => {
        const actions = {
            'enhance-summary': 'Can you enhance my professional summary to make it more impactful?',
            'optimize-bullets': 'Please optimize my experience bullet points with stronger action verbs and metrics.',
            'suggest-keywords': 'What keywords should I add to my resume for better ATS compatibility?',
            'check-ats': 'Analyze my resume for ATS compatibility and suggest improvements.'
        };

        setInput(actions[action]);
        setTimeout(() => handleSend(), 100);
    };

    const handleApplySuggestion = (suggestion) => {
        applyEnhancementMutation.mutate({
            section: currentSection,
            enhancementType: suggestion.type || 'general'
        });
    };

    const handleCopyText = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const renderMessage = (message) => {
        const isAI = message.type === 'ai';

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
            >
                <div className={`max-w-[80%] ${isAI ? 'bg-blue-50' : 'bg-blue-500'} rounded-2xl p-4`}>
                    <div className="flex items-start gap-3">
                        {isAI && (
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}

                        <div className="flex-1">
                            <div className={`${isAI ? 'text-gray-900' : 'text-white'} whitespace-pre-wrap`}>
                                {message.content}
                            </div>

                            {message.suggestions && message.suggestions.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white/50 rounded-lg p-2">
                                            <span className="text-sm text-gray-700">{suggestion.text}</span>
                                            <button
                                                onClick={() => handleApplySuggestion(suggestion)}
                                                disabled={applyEnhancementMutation.isLoading}
                                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs ${isAI ? 'text-gray-500' : 'text-blue-200'}`}>
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isAI && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleCopyText(message.content)}
                                            className="p-1 hover:bg-white/50 rounded"
                                            title="Copy"
                                        >
                                            <Copy className="w-3 h-3 text-gray-500" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isAI && (
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {resumeData.personalInfo?.fullName?.charAt(0) || 'U'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderAIInsights = () => {
        if (insightsMutation.isLoading) {
            return (
                <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">AI is analyzing your resume...</p>
                </div>
            );
        }

        if (!aiInsights) return null;

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">AI Analysis Score</h3>
                            <p className="text-gray-600">Based on ATS compatibility and best practices</p>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">{aiInsights.overallScore || 0}/100</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${aiInsights.overallScore || 0}%` }}
                        ></div>
                    </div>
                </div>

                {aiInsights.sections && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(aiInsights.sections).map(([section, data]) => (
                            <div key={section} className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        {section === 'summary' && <FileText className="w-4 h-4 text-blue-600" />}
                                        {section === 'experience' && <Briefcase className="w-4 h-4 text-green-600" />}
                                        {section === 'education' && <GraduationCap className="w-4 h-4 text-purple-600" />}
                                        {section === 'skills' && <Cpu className="w-4 h-4 text-amber-600" />}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900 capitalize">{section}</h4>
                                        <div className="text-2xl font-bold text-gray-900">{data.score}/100</div>
                                    </div>
                                </div>
                                {data.suggestions?.slice(0, 2).map((suggestion, idx) => (
                                    <p key={idx} className="text-sm text-gray-600 mt-2">{suggestion}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                )}

                {aiInsights.quickWins && aiInsights.quickWins.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-600" />
                            Quick Wins
                        </h3>
                        <ul className="space-y-2">
                            {aiInsights.quickWins.slice(0, 3).map((win, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-gray-700">{win}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {aiInsights.missingKeywords && aiInsights.missingKeywords.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-purple-600" />
                            Missing Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {aiInsights.missingKeywords.slice(0, 8).map((keyword, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full text-sm">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                <Bot className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">AI Resume Assistant</h2>
                            <p className="text-sm text-gray-600">Powered by GPT-4 • Real-time optimization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'chat' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        AI Chat
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('insights');
                            if (!aiInsights) insightsMutation.mutate();
                        }}
                        className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'insights' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        <Brain className="w-4 h-4 inline mr-2" />
                        AI Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('enhancements')}
                        className={`flex-1 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'enhancements' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        <Wand2 className="w-4 h-4 inline mr-2" />
                        Enhancements
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {activeTab === 'chat' ? (
                    <>
                        <div className="h-[calc(100%-140px)] overflow-y-auto p-6">
                            <div className="space-y-4">
                                {messages.map((message) => renderMessage(message))}

                                {chatMutation.isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-blue-50 rounded-2xl p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="px-6 py-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                                {[
                                    { icon: Sparkles, label: 'Enhance Summary', action: 'enhance-summary' },
                                    { icon: Zap, label: 'Optimize Bullets', action: 'optimize-bullets' },
                                    { icon: Target, label: 'Suggest Keywords', action: 'suggest-keywords' },
                                    { icon: TrendingUp, label: 'Check ATS', action: 'check-ats' }
                                ].map((item) => (
                                    <button
                                        key={item.action}
                                        onClick={() => handleQuickAction(item.action)}
                                        disabled={chatMutation.isLoading}
                                        className="px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium text-blue-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                        disabled={chatMutation.isLoading}
                                        placeholder="Ask AI for help with your resume..."
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 disabled:opacity-50"
                                    />
                                    <button
                                        onClick={() => setInput('')}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || chatMutation.isLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {chatMutation.isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Send
                                </button>
                            </div>
                        </div>
                    </>
                ) : activeTab === 'insights' ? (
                    <div className="p-6 overflow-y-auto h-full">
                        {renderAIInsights()}
                    </div>
                ) : (
                    <div className="p-6 overflow-y-auto h-full">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">AI Enhancements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            title: 'Boost ATS Score',
                                            description: 'Add missing keywords and optimize formatting for ATS',
                                            icon: TrendingUp,
                                            action: () => applyEnhancementMutation.mutate({ section: currentSection, enhancementType: 'ats' })
                                        },
                                        {
                                            title: 'Professional Tone',
                                            description: 'Enhance language for executive and leadership roles',
                                            icon: Brain,
                                            action: () => applyEnhancementMutation.mutate({ section: currentSection, enhancementType: 'tone' })
                                        },
                                        {
                                            title: 'Quantify Achievements',
                                            description: 'Add metrics and numbers to experience bullet points',
                                            icon: Target,
                                            action: () => applyEnhancementMutation.mutate({ section: currentSection, enhancementType: 'metrics' })
                                        },
                                        {
                                            title: 'Optimize Length',
                                            description: 'Trim content to ideal 1-2 page length',
                                            icon: Clock,
                                            action: () => applyEnhancementMutation.mutate({ section: currentSection, enhancementType: 'length' })
                                        }
                                    ].map((enhancement, idx) => (
                                        <button
                                            key={idx}
                                            onClick={enhancement.action}
                                            disabled={applyEnhancementMutation.isLoading}
                                            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all text-left group disabled:opacity-50"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                                                    <enhancement.icon className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <h4 className="font-medium text-gray-900">{enhancement.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{enhancement.description}</p>
                                            <div className="flex items-center text-blue-600 text-sm font-medium">
                                                {applyEnhancementMutation.isLoading ? 'Applying...' : 'Apply Enhancement'}
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {onEnhance && (
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">Quick Enhance</h3>
                                    <button
                                        onClick={() => onEnhance(currentSection)}
                                        disabled={applyEnhancementMutation.isLoading}
                                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        AI Enhance Current Section
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SmartAIAssistant;