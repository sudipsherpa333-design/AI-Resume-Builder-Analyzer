// src/components/ai/AIAssistant.jsx - FIXED WITH PROPER HIDE/UNHIDE
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
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
    isOpen = false,
    onClose,
    resumeData = {},
    activeSection = '',
    onSuggestion = () => { },
    onApplySuggestion = () => { }
}) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('features');
    const [chatMessages, setChatMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [credits, setCredits] = useState(50);
    const [isPinned, setIsPinned] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const chatRef = useRef(null);

    // Auto-scroll chat
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Reset chat when reopening
    useEffect(() => {
        if (isOpen && activeTab === 'chat' && chatMessages.length === 0) {
            setChatMessages([
                {
                    role: 'ai',
                    content: `Hello! I'm your AI Resume Assistant. I can help you:\n\n1. Enhance your resume sections\n2. Optimize bullet points\n3. Analyze ATS compatibility\n4. Generate skills\n5. Answer questions about your resume\n\nHow can I help you today?`,
                    timestamp: new Date()
                }
            ]);
        }
    }, [isOpen, activeTab]);

    const features = [
        {
            id: 'enhance-summary',
            icon: Sparkles,
            title: 'Enhance Summary',
            description: 'Make your professional summary more impactful and ATS-friendly',
            credits: 3,
            action: async () => {
                try {
                    const content = resumeData.summary || resumeData.personalInfo?.summary || 'No summary found';
                    const enhanced = await openAIClient.enhanceSection('summary', content);
                    return { type: 'summary', content: enhanced, creditsUsed: 3 };
                } catch (error) {
                    throw new Error('Failed to enhance summary');
                }
            }
        },
        {
            id: 'optimize-experience',
            icon: Briefcase,
            title: 'Optimize Experience',
            description: 'Improve bullet points with strong verbs and metrics',
            credits: 5,
            action: async () => {
                try {
                    const experiences = resumeData.experience || [];
                    const expText = experiences.map((exp, index) =>
                        `Experience ${index + 1}: ${exp.position || 'Position'} at ${exp.company || 'Company'}\n${exp.description || 'No description'}\n`
                    ).join('\n');

                    const enhanced = await openAIClient.enhanceSection('experience', expText || 'No experience found');
                    return { type: 'experience', content: enhanced, creditsUsed: 5 };
                } catch (error) {
                    throw new Error('Failed to optimize experience');
                }
            }
        },
        {
            id: 'ats-analysis',
            icon: Target,
            title: 'ATS Analysis',
            description: 'Get detailed ATS compatibility score and suggestions',
            credits: 4,
            action: async () => {
                try {
                    const analysis = await openAIClient.analyzeResume(resumeData);
                    const formattedAnalysis = `ATS Analysis Report:\n\n` +
                        `Overall Score: ${analysis.overallScore || 'N/A'}/100\n` +
                        `ATS Score: ${analysis.atsScore || 'N/A'}/100\n\n` +
                        `Strengths:\n${(analysis.strengths || []).map(s => `• ${s}`).join('\n')}\n\n` +
                        `Weaknesses:\n${(analysis.weaknesses || []).map(w => `• ${w}`).join('\n')}\n\n` +
                        `Recommendations:\n${(analysis.recommendations || []).map(r => `• ${r}`).join('\n')}`;

                    return { type: 'analysis', content: formattedAnalysis, creditsUsed: 4 };
                } catch (error) {
                    throw new Error('Failed to analyze resume');
                }
            }
        },
        {
            id: 'generate-skills',
            icon: Code,
            title: 'Generate Skills',
            description: 'AI-suggested skills based on your experience',
            credits: 2,
            action: async () => {
                try {
                    const experiences = resumeData.experience || [];
                    const skillsText = experiences.map(exp => exp.description || '').join(' ');

                    const prompt = `Based on this work experience: "${skillsText}", generate 15 relevant technical and soft skills with proficiency levels (Beginner, Intermediate, Advanced, Expert). Format as bullet points.`;

                    const skills = await openAIClient.generate(prompt, { temperature: 0.6 });
                    return { type: 'skills', content: skills, creditsUsed: 2 };
                } catch (error) {
                    throw new Error('Failed to generate skills');
                }
            }
        }
    ];

    const handleFeature = async (feature) => {
        if (credits < feature.credits) {
            toast.error(`Not enough credits! Need ${feature.credits}, have ${credits}`);
            return;
        }

        setLoading(true);

        // Add thinking message
        const thinkingMsg = {
            role: 'ai',
            content: '',
            timestamp: new Date(),
            thinking: true
        };

        setChatMessages(prev => [...prev, thinkingMsg]);

        try {
            const result = await feature.action();

            // Update credits
            const newCredits = credits - result.creditsUsed;
            setCredits(newCredits);

            // Remove thinking message and add result
            setChatMessages(prev => {
                const filtered = prev.filter(m => !m.thinking);
                return [...filtered, {
                    role: 'ai',
                    content: result.content,
                    timestamp: new Date()
                }];
            });

            // Apply suggestion to current section if applicable
            if (result.type === activeSection) {
                onApplySuggestion(activeSection, { content: result.content });
            }

            // Show suggestion notification
            onSuggestion(result.type, result.content);

            toast.success(`${feature.title} completed! Used ${result.creditsUsed} credits.`);

        } catch (error) {
            console.error('AI feature error:', error);

            setChatMessages(prev => {
                const filtered = prev.filter(m => !m.thinking);
                return [...filtered, {
                    role: 'ai',
                    content: 'Sorry, something went wrong. Please try again.',
                    timestamp: new Date()
                }];
            });

            toast.error('AI request failed. Please check your connection.');
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

        const userMsg = {
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Deduct credit
        const newCredits = credits - 1;
        setCredits(newCredits);

        try {
            // Add context to the prompt
            const context = `User's resume information:
      - Name: ${resumeData.personalInfo?.fullName || 'Not provided'}
      - Experience: ${(resumeData.experience || []).length} positions
      - Education: ${(resumeData.education || []).length} entries
      - Skills: ${(resumeData.skills || []).length} skills
      - Current section: ${activeSection}`;

            const fullPrompt = `${context}\n\nUser question: ${input}\n\nPlease provide helpful, specific advice about their resume.`;

            const response = await openAIClient.generate(fullPrompt, {
                temperature: 0.7,
                max_tokens: 500
            });

            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: response,
                timestamp: new Date()
            }]);

        } catch (error) {
            console.error('Chat error:', error);

            setChatMessages(prev => [...prev, {
                role: 'ai',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);

            toast.error('Failed to get response');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 400, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 400, opacity: 0 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className="fixed right-0 top-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
                    style={{ height: isMinimized ? 'auto' : '100vh' }}
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

                                <button
                                    onClick={() => setIsPinned(!isPinned)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title={isPinned ? "Unpin" : "Pin"}
                                >
                                    {isPinned ? <Pin className="w-5 h-5 text-purple-600" /> : <PinOff className="w-5 h-5 text-gray-500" />}
                                </button>

                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title={isMinimized ? "Maximize" : "Minimize"}
                                >
                                    {isMinimized ? <Maximize2 className="w-5 h-5 text-gray-500" /> : <Minimize2 className="w-5 h-5 text-gray-500" />}
                                </button>

                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                    title="Close"
                                >
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
                                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {tab === 'features' ? 'AI Features' : 'Chat Assistant'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className={`flex-1 overflow-y-auto ${isMinimized ? 'hidden' : 'block'}`}>
                        {activeTab === 'features' ? (
                            <div className="p-4 space-y-4">
                                <div className="mb-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">AI Features</h3>
                                    <p className="text-sm text-gray-600">Use credits to enhance your resume</p>
                                </div>

                                <div className="space-y-3">
                                    {features.map((feature, index) => (
                                        <AIFeatureCard
                                            key={feature.id}
                                            {...feature}
                                            disabled={credits < feature.credits || loading}
                                            loading={loading}
                                            onClick={() => handleFeature(feature)}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Chat Messages */}
                                <div
                                    ref={chatRef}
                                    className="flex-1 overflow-y-auto p-4 space-y-6"
                                >
                                    {chatMessages.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                            <p className="text-gray-500">Ask me anything about your resume!</p>
                                            <p className="text-sm text-gray-400 mt-2">Each question uses 1 credit</p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg, index) => (
                                            <ChatMessage
                                                key={index}
                                                message={msg.content}
                                                isAI={msg.role === 'ai'}
                                                timestamp={msg.timestamp}
                                                thinking={msg.thinking}
                                            />
                                        ))
                                    )}

                                    {loading && <ChatMessage message="" isAI thinking />}
                                </div>

                                {/* Chat Input */}
                                <div className="border-t p-4 bg-white">
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Ask about your resume..."
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none transition-all"
                                                disabled={loading}
                                            />
                                            <div className="absolute right-3 top-3 text-xs text-gray-400">
                                                1 credit
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleChat}
                                            disabled={loading || !input.trim() || credits < 1}
                                            className={`px-4 py-3 rounded-xl transition-all ${loading || !input.trim() || credits < 1
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                                                }`}
                                        >
                                            {loading ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                <span>Secure & Private</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Cpu className="w-4 h-4" />
                                <span>GPT-4o Powered</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIAssistant;