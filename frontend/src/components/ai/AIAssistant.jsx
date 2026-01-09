// src/components/ai/AIAssistant.jsx - FULLY AI-INTEGRATED (January 01, 2026)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import {
    Brain, MessageSquare, Sparkles, Target, Zap,
    Lightbulb, BarChart, CheckCircle, AlertCircle,
    Copy, Check, Maximize2, Minimize2, RefreshCw,
    ChevronRight, Bot, User, Send, X, Pin, PinOff,
    Loader2, Shield, Cpu, Star, FileText, Briefcase,
    Code, Award, Search, ChevronLeft
} from 'lucide-react';

// ==================== OPENAI CLIENT (SECURE VIA BACKEND) ====================
const openAIClient = {
    async generate(prompt, options = {}) {
        try {
            const response = await fetch('http://localhost:5001/api/openai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: options.model || 'gpt-4o-mini',
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_tokens || 1000
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'AI request failed');
            }

            const data = await response.json();
            return data.text || data.result || '';
        } catch (error) {
            console.error('OpenAI Error:', error);
            throw error;
        }
    },

    async enhanceSection(section, content, targetRole = '') {
        const prompt = targetRole
            ? `You are a world-class resume writer. Rewrite this ${section} section for a ${targetRole} role. Make it concise, impactful, ATS-friendly, and use strong action verbs with quantifiable results where possible:\n\n${content}`
            : `You are a world-class resume writer. Rewrite this ${section} section to be more professional, impactful, and ATS-friendly:\n\n${content}`;

        return this.generate(prompt, { temperature: 0.6 });
    },

    async analyzeResume(resumeData) {
        const prompt = `You are an expert resume analyst. Analyze this resume and return a detailed report in this exact JSON format:

{
  "overallScore": number (0-100),
  "atsScore": number (0-100),
  "strengths": string[],
  "weaknesses": string[],
  "missingKeywords": string[],
  "recommendations": string[],
  "summary": string
}

Resume data:
${JSON.stringify(resumeData, null, 2)}`;

        const response = await this.generate(prompt, {
            model: 'gpt-4o-mini',
            temperature: 0.3,
            max_tokens: 1500
        });

        try {
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: response };
        } catch {
            return { summary: response };
        }
    }
};

// ==================== AI FEATURE CARD ====================
const AIFeatureCard = ({
    icon: Icon,
    title,
    description,
    credits,
    onClick,
    disabled,
    loading
}) => {
    const colors = ['purple', 'blue', 'green', 'amber', 'pink'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const gradients = {
        purple: 'from-purple-500 to-pink-500',
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        amber: 'from-amber-500 to-orange-500',
        pink: 'from-pink-500 to-rose-500'
    };

    return (
        <motion.button
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={disabled || loading}
            onClick={onClick}
            className={`relative p-6 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradients[color]} opacity-0 hover:opacity-10 transition-opacity`} />

            <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl bg-gradient-to-br ${gradients[color]} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 text-${color}-600`} />
                </div>
                <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900">{title}</h3>
                        <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-bold text-amber-600">{credits}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-indigo-600'}`}>
                    {loading ? 'Processing...' : 'Use Feature'}
                </span>
                {loading && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
                {!loading && <ChevronRight className="w-5 h-5 text-indigo-600" />}
            </div>
        </motion.button>
    );
};

// ==================== CHAT MESSAGE ====================
const ChatMessage = ({ message, isAI, timestamp, thinking = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-4 ${isAI ? '' : 'flex-row-reverse'}`}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${isAI ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-blue-600 to-cyan-600'}`}>
            {isAI ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
        </div>
        <div className={`flex-1 max-w-lg ${isAI ? '' : 'text-right'}`}>
            <div className={`inline-block p-4 rounded-2xl shadow-sm ${isAI ? 'bg-white border border-gray-200' : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'}`}>
                {thinking ? (
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm">Thinking...</span>
                    </div>
                ) : (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message}</div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    </motion.div>
);

// ==================== MAIN AI ASSISTANT ====================
const AIAssistant = ({
    isVisible = true,
    onClose,
    resumeData = {},
    onEnhance = () => { },
    aiCredits = 50,
    onCreditsUpdate = () => { },
    isMobile = false,
    position = 'right'
}) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('features');
    const [chatMessages, setChatMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(aiCredits);
    const chatRef = useRef(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const features = [
        {
            icon: Sparkles,
            title: 'Enhance Summary',
            description: 'Make your professional summary more impactful and ATS-friendly',
            credits: 3,
            action: async () => {
                const content = resumeData.summary?.content || 'No summary found';
                const enhanced = await openAIClient.enhanceSection('summary', content);
                onEnhance('summary', enhanced);
                return enhanced;
            }
        },
        {
            icon: Briefcase,
            title: 'Optimize Experience',
            description: 'Improve bullet points with strong verbs and metrics',
            credits: 5,
            action: async () => {
                const exp = resumeData.experience?.items || [];
                const text = exp.map(e => e.description).join('\n\n');
                const enhanced = await openAIClient.enhanceSection('experience', text);
                return enhanced;
            }
        },
        {
            icon: Target,
            title: 'ATS Analysis',
            description: 'Get detailed ATS compatibility score and suggestions',
            credits: 4,
            action: async () => {
                const analysis = await openAIClient.analyzeResume(resumeData);
                return JSON.stringify(analysis, null, 2);
            }
        },
        {
            icon: Code,
            title: 'Generate Skills',
            description: 'AI-suggested skills based on your experience',
            credits: 2,
            action: async () => {
                const industry = user?.industry || 'technology';
                const prompt = `Generate 15 relevant skills for a ${user?.experienceLevel || 'mid-level'} professional in ${industry}`;
                return await openAIClient.generate(prompt);
            }
        }
    ];

    const handleFeature = async (feature) => {
        if (credits < feature.credits) {
            toast.error('Not enough credits!');
            return;
        }

        setLoading(true);
        const thinkingMsg = { role: 'ai', content: '', timestamp: new Date(), thinking: true };
        setChatMessages(prev => [...prev, thinkingMsg]);

        try {
            const result = await feature.action();
            const newCredits = credits - feature.credits;
            setCredits(newCredits);
            onCreditsUpdate(newCredits);

            setChatMessages(prev => {
                const filtered = prev.filter(m => !m.thinking);
                return [...filtered, {
                    role: 'ai',
                    content: result,
                    timestamp: new Date()
                }];
            });

            toast.success(`${feature.title} completed!`);
        } catch (error) {
            setChatMessages(prev => {
                const filtered = prev.filter(m => !m.thinking);
                return [...filtered, {
                    role: 'ai',
                    content: 'Sorry, something went wrong. Please try again.',
                    timestamp: new Date()
                }];
            });
            toast.error('AI request failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChat = async () => {
        if (!input.trim() || loading) return;
        if (credits < 1) {
            toast.error('No credits left!');
            return;
        }

        const userMsg = { role: 'user', content: input, timestamp: new Date() };
        setChatMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const newCredits = credits - 1;
        setCredits(newCredits);
        onCreditsUpdate(newCredits);

        try {
            const response = await openAIClient.generate(
                `You are a helpful resume assistant. User question: ${input}\n\nResume context: ${JSON.stringify(resumeData, null, 2)}`
            );

            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: response,
                timestamp: new Date()
            }]);
        } catch {
            toast.error('Failed to get response');
        } finally {
            setLoading(false);
        }
    };

    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ x: position === 'right' ? 400 : -400 }}
            animate={{ x: 0 }}
            exit={{ x: position === 'right' ? 400 : -400 }}
            className={`fixed ${position === 'right' ? 'right-0' : 'left-0'} top-0 h-full w-96 bg-white border-${position === 'right' ? 'l' : 'r'} border-gray-200 shadow-2xl z-50 flex flex-col`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">AI Assistant</h2>
                            <p className="text-xs text-gray-600">GPT-4o Powered</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-white rounded-lg shadow-sm">
                            <span className="text-sm font-bold text-amber-600">{credits}</span>
                            <span className="text-xs text-gray-500 ml-1">credits</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    {['features', 'chat'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            {tab === 'features' ? 'Features' : 'Chat'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'features' ? (
                    <div className="space-y-6">
                        {features.map((f, i) => (
                            <AIFeatureCard
                                key={i}
                                {...f}
                                disabled={credits < f.credits}
                                loading={loading}
                                onClick={() => handleFeature(f)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 pb-4">
                            {chatMessages.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p>Ask me anything about your resume!</p>
                                </div>
                            ) : (
                                chatMessages.map((msg, i) => (
                                    <ChatMessage key={i} {...msg} />
                                ))
                            )}
                            {loading && <ChatMessage message="" isAI thinking />}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                                    placeholder="Ask AI anything..."
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleChat}
                                    disabled={loading || !input.trim()}
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500">
                <div className="flex items-center justify-center gap-4">
                    <Shield className="w-4 h-4" /> Secure & Private
                    <Cpu className="w-4 h-4" /> GPT-4o Powered
                </div>
            </div>
        </motion.div>
    );
};

export default AIAssistant;