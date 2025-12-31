// src/components/ai/UnifiedAIAssistant.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Wand2, X, MessageSquare, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const UnifiedAIAssistant = ({ isVisible, onClose, activeSection, onGenerateContent, user }) => {
    const [activeTab, setActiveTab] = useState('suggestions');
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isVisible) return null;

    const handleAIEnhance = async () => {
        setIsGenerating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            await onGenerateContent(activeSection, 'professional');
            toast.success('Section enhanced with AI!');
        } catch (error) {
            toast.error('Failed to enhance with AI');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-96 bg-white border-l border-gray-200 h-full overflow-y-auto shadow-2xl"
        >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <Brain size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">AI Assistant</h3>
                            <p className="text-sm text-gray-600">Smart resume optimization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="mb-6">
                    <button
                        onClick={handleAIEnhance}
                        disabled={isGenerating}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold mb-4 flex items-center justify-center gap-3 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Enhancing...
                            </>
                        ) : (
                            <>
                                <Wand2 size={20} />
                                Enhance Current Section
                            </>
                        )}
                    </button>
                </div>

                {/* Quick Tips */}
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={16} className="text-blue-600" />
                            <span className="font-medium text-blue-800">Quick Tips</span>
                        </div>
                        <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Use action verbs like "Led", "Developed"</li>
                            <li>• Add quantifiable achievements</li>
                            <li>• Keep sentences concise</li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UnifiedAIAssistant;