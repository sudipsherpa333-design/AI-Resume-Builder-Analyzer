import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaSync, FaMagic, FaExclamationCircle, FaExclamationTriangle, FaCheckCircle, FaRobot, FaTimes, FaCopy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AISuggestionsPanel = ({ resumeData, activeSection, onApplySuggestion }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [responding, setResponding] = useState(false);

    useEffect(() => {
        if (activeSection) {
            loadSuggestions(activeSection);
        }
    }, [activeSection]);

    const loadSuggestions = async (section) => {
        setLoading(true);
        try {
            // Mock AI suggestions
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockSuggestions = {
                personalInfo: [
                    {
                        id: 1,
                        type: 'improvement',
                        text: 'Add your LinkedIn profile URL to increase professional visibility',
                        priority: 'medium',
                        action: 'Add LinkedIn URL'
                    },
                    {
                        id: 2,
                        type: 'format',
                        text: 'Consider adding a professional title to showcase your expertise',
                        priority: 'high',
                        action: 'Add Professional Title'
                    }
                ],
                summary: [
                    {
                        id: 1,
                        type: 'rewrite',
                        text: 'Start your summary with a strong action statement highlighting your key achievements',
                        priority: 'high',
                        action: 'Rewrite Summary'
                    },
                    {
                        id: 2,
                        type: 'keyword',
                        text: 'Add industry-specific keywords like "strategic planning", "team leadership", "cross-functional collaboration"',
                        priority: 'medium',
                        action: 'Add Keywords'
                    }
                ],
                experience: [
                    {
                        id: 1,
                        type: 'action',
                        text: 'Start bullet points with strong action verbs (Managed, Developed, Implemented, Led)',
                        priority: 'high',
                        action: 'Use Action Verbs'
                    },
                    {
                        id: 2,
                        type: 'quantify',
                        text: 'Add numbers to your achievements (e.g., "Increased sales by 25%", "Reduced costs by $50K")',
                        priority: 'high',
                        action: 'Quantify Results'
                    }
                ],
                skills: [
                    {
                        id: 1,
                        type: 'categorize',
                        text: 'Group similar skills together (Technical, Soft Skills, Tools, Certifications)',
                        priority: 'medium',
                        action: 'Categorize Skills'
                    }
                ]
            };

            setSuggestions(mockSuggestions[section] || []);
        } catch (error) {
            console.error('Error loading suggestions:', error);
            toast.error('Failed to load AI suggestions');
        } finally {
            setLoading(false);
        }
    };

    const handlePromptSubmit = async () => {
        if (!prompt.trim()) return;

        setResponding(true);
        try {
            // Mock AI response
            await new Promise(resolve => setTimeout(resolve, 1200));

            const responses = {
                'make it more professional': 'I\'ll help make this more professional. Try: "Results-driven professional with extensive experience in [field]. Proven track record of delivering innovative solutions and driving operational excellence through strategic planning and effective team leadership."',
                'add more keywords': 'Here are industry-relevant keywords to add: "strategic planning", "process optimization", "stakeholder management", "data-driven decision making", "cross-functional collaboration", "project management", "performance metrics", "quality assurance"',
                'make it shorter': 'Condensed version: "Experienced professional skilled in [key areas]. Demonstrated success in [achievements]. Strong background in [relevant skills]."',
                'rewrite for tech jobs': 'Technical version: "Software engineer with expertise in full-stack development. Proficient in modern frameworks and cloud technologies. Experience in building scalable applications and leading development teams."',
                'make it stronger': 'Stronger version: "Accomplished professional with a proven ability to drive results. Expertise in [key areas] with a history of exceeding targets. Skilled leader with excellent problem-solving capabilities."'
            };

            setAiResponse(responses[prompt.toLowerCase()] || 'I\'ll help improve your content. Consider highlighting your key achievements and using industry-specific terminology to make a stronger impact.');
            toast.success('AI responded to your prompt!');
        } catch (error) {
            console.error('Error getting AI response:', error);
            toast.error('Failed to get AI response');
        } finally {
            setResponding(false);
        }
    };

    const quickPrompts = [
        'make it more professional',
        'add more keywords',
        'make it shorter',
        'rewrite for tech jobs',
        'make it stronger'
    ];

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                        <FaBrain className="text-xl" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">AI Resume Assistant</h3>
                        <p className="text-gray-400 text-sm">Powered by GPT-4</p>
                    </div>
                </div>
            </div>

            {/* Active Section Info */}
            <div className="p-4 bg-gray-800/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold">{activeSection ? activeSection.charAt(0).toUpperCase() + activeSection.slice(1) : 'Select a Section'}</h4>
                        <p className="text-gray-400 text-sm">AI suggestions for this section</p>
                    </div>
                    <button
                        onClick={() => activeSection && loadSuggestions(activeSection)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                    >
                        <FaSync className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <FaSync className="animate-spin text-3xl mb-4 text-purple-400" />
                        <p>AI is analyzing your content...</p>
                    </div>
                ) : suggestions.length > 0 ? (
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-300">Suggestions</h4>
                        {suggestions.map((suggestion, idx) => (
                            <motion.div
                                key={suggestion.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${suggestion.priority === 'high' ? 'bg-red-500/20' : suggestion.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'}`}>
                                        {suggestion.priority === 'high' ? <FaExclamationCircle className="text-red-400" /> :
                                            suggestion.priority === 'medium' ? <FaExclamationTriangle className="text-yellow-400" /> :
                                                <FaCheckCircle className="text-green-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-300 mb-2">{suggestion.text}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs px-2 py-1 rounded ${suggestion.priority === 'high' ? 'bg-red-500/30 text-red-300' : suggestion.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-green-500/30 text-green-300'}`}>
                                                {suggestion.priority} priority
                                            </span>
                                            <button
                                                onClick={() => onApplySuggestion(suggestion)}
                                                className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded hover:opacity-90 transition"
                                            >
                                                {suggestion.action}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        <FaMagic className="text-3xl mx-auto mb-3" />
                        <p>Select a section to see AI suggestions</p>
                    </div>
                )}
            </div>

            {/* AI Prompt Section */}
            <div className="border-t border-gray-700 p-4">
                <h4 className="font-semibold mb-3">Ask AI to Improve</h4>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {quickPrompts.map((quickPrompt, idx) => (
                        <button
                            key={idx}
                            onClick={() => setPrompt(quickPrompt)}
                            className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full transition"
                        >
                            {quickPrompt}
                        </button>
                    ))}
                </div>

                {/* Prompt Input */}
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask AI to improve this section..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600"
                        onKeyPress={(e) => e.key === 'Enter' && handlePromptSubmit()}
                    />
                    <button
                        onClick={handlePromptSubmit}
                        disabled={!prompt.trim() || responding}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {responding ? <FaSync className="animate-spin" /> : 'Ask'}
                    </button>
                </div>

                {/* AI Response */}
                {aiResponse && (
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/30">
                        <div className="flex items-center gap-2 mb-2">
                            <FaRobot className="text-purple-400" />
                            <span className="text-sm font-semibold">AI Response:</span>
                        </div>
                        <p className="text-gray-300 text-sm">{aiResponse}</p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(aiResponse);
                                    toast.success('Copied to clipboard!');
                                }}
                                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
                            >
                                <FaCopy className="inline mr-1" /> Copy
                            </button>
                            <button
                                onClick={() => setAiResponse('')}
                                className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition"
                            >
                                <FaTimes className="inline mr-1" /> Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AISuggestionsPanel;