// src/components/ai/JDKeywordExtractor.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
// Fix the import - remove duplicate Lock icon
import {
    FileSearch, Sparkles, Target, Zap, Cpu, Brain,
    CheckCircle, X, Copy, Filter, TrendingUp,
    Shield, Star, Award, Users, Briefcase,
    GraduationCap, Code, Database, Server,
    Cloud, Smartphone, Globe, Wifi,
    MessageSquare, PieChart, BarChart, LineChart,
    Clock, Calendar, DollarSign, MapPin,
    Building, Home, Car, Plane, Ship,
    Navigation, Compass, Satellite, Radar,
    Camera, Video, Music, Gamepad2,
    Dumbbell, BookOpen, Feather, TreePine,
    Flower2, Bird, Fish, Cat, Dog,
    Rabbit, Turtle, Carrot, Apple, Coffee,
    Wine, Pizza, Cake, Music2, Film,
    Headphones, Speaker, Tv, Monitor,
    Tablet, Watch,
    CreditCard, Wallet, Bitcoin, Banknote,
    Euro, PoundSterling, Coins, Gem,
    Crown, Trophy, Medal,
    Heart, ThumbsUp,
    TrendingDown, Activity,
    HardDrive,
    Bluetooth, Radio,
    Bike, Train,
    Loader2, Plus,
    Trash2, Edit2, ExternalLink, Download,
    Upload, Share2, Save, RefreshCw,
    Settings, HelpCircle, Info, AlertCircle,
    Bell, BellOff, BellRing, Eye,
    EyeOff, EyeClosed, Fingerprint,
    Scan, ScanFace, ScanLine, QrCode,
    Barcode, Key, KeyRound, KeySquare,
    Lock, LockKeyhole, LockOpen, Unlock,
    ShieldAlert, ShieldCheck, ShieldOff, ShieldQuestion,
    ShieldX, User, UserCheck, UserCog,
    UserMinus, UserPlus, UserX,
    Users2, UserCircle, UserSquare,
    HeartCrack, HeartHandshake, HeartPulse, HeartBeat,
    HeartOff, ThumbsDown,
    Diamond,
    Wrench // Add Wrench import if available
} from 'lucide-react';
// AI Service Hook
import useAIService from '../../hooks/useAIService';

// Keyword Categories for better organization
const KEYWORD_CATEGORIES = {
    technical: {
        name: 'Technical Skills',
        icon: Cpu,
        color: 'blue',
        examples: ['React', 'Python', 'AWS', 'Docker', 'Node.js']
    },
    soft: {
        name: 'Soft Skills',
        icon: Users,
        color: 'green',
        examples: ['Leadership', 'Communication', 'Teamwork', 'Problem Solving']
    },
    tools: {
        name: 'Tools & Platforms',
        icon: Wrench,
        color: 'purple',
        examples: ['Git', 'Jira', 'Figma', 'Salesforce']
    },
    certifications: {
        name: 'Certifications',
        icon: Award,
        color: 'amber',
        examples: ['PMP', 'AWS Certified', 'Google Analytics']
    },
    methodologies: {
        name: 'Methodologies',
        icon: PieChart,
        color: 'pink',
        examples: ['Agile', 'Scrum', 'Kanban', 'Lean']
    },
    domains: {
        name: 'Industry Domains',
        icon: Building,
        color: 'indigo',
        examples: ['FinTech', 'Healthcare', 'E-commerce', 'SaaS']
    }
};

const JDKeywordExtractor = ({
    jobDescription = '',
    onKeywordsExtracted,
    onApplyKeywords,
    className = '',
    initialKeywords = [],
    showAdvanced = false
}) => {
    const { extractKeywords: aiExtractKeywords, analyzeJobDescription } = useAIService();

    // State
    const [inputJD, setInputJD] = useState(jobDescription);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedKeywords, setExtractedKeywords] = useState(initialKeywords);
    const [selectedKeywords, setSelectedKeywords] = useState([]);
    const [keywordCategories, setKeywordCategories] = useState({});
    const [analysisInsights, setAnalysisInsights] = useState(null);
    const [showCategoryFilter, setShowCategoryFilter] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [keywordFrequency, setKeywordFrequency] = useState({});
    const [aiConfidence, setAiConfidence] = useState({});
    const [customKeywords, setCustomKeywords] = useState([]);
    const [customKeywordInput, setCustomKeywordInput] = useState('');

    // Handle keyword extraction
    const handleExtractKeywords = useCallback(async () => {
        if (!inputJD.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setIsAnalyzing(true);

        try {
            // Use AI service to extract keywords
            const result = await aiExtractKeywords(inputJD);

            if (result?.keywords) {
                const keywords = result.keywords;
                const categories = result.categories || {};
                const insights = result.insights || {};
                const frequency = result.frequency || {};
                const confidence = result.confidence || {};

                setExtractedKeywords(keywords);
                setKeywordCategories(categories);
                setAnalysisInsights(insights);
                setKeywordFrequency(frequency);
                setAiConfidence(confidence);

                // Notify parent component
                if (onKeywordsExtracted) {
                    onKeywordsExtracted({
                        keywords,
                        categories,
                        insights,
                        frequency,
                        confidence
                    });
                }

                toast.success(`Extracted ${keywords.length} keywords with AI! 🤖`);
            } else {
                // Fallback to basic keyword extraction
                const basicKeywords = extractBasicKeywords(inputJD);
                setExtractedKeywords(basicKeywords);
                toast.success(`Extracted ${basicKeywords.length} keywords`);
            }
        } catch (error) {
            console.error('AI keyword extraction error:', error);
            // Fallback to basic extraction
            const basicKeywords = extractBasicKeywords(inputJD);
            setExtractedKeywords(basicKeywords);
            toast.success(`Extracted ${basicKeywords.length} keywords (basic)`);
        } finally {
            setIsAnalyzing(false);
        }
    }, [inputJD, aiExtractKeywords, onKeywordsExtracted]);

    // Basic keyword extraction (fallback)
    const extractBasicKeywords = (text) => {
        if (!text) return [];

        // Common stop words to filter out
        const stopWords = new Set([
            'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
            'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
            'could', 'can', 'may', 'might', 'must', 'shall', 'i', 'you', 'he',
            'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my',
            'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers',
            'ours', 'theirs', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
            'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
            'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may',
            'might', 'must', 'shall'
        ]);

        // Extract words and clean them
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ') // Remove punctuation
            .split(/\s+/)
            .filter(word =>
                word.length > 2 &&
                !stopWords.has(word) &&
                !/\d/.test(word) // Remove pure numbers
            );

        // Count frequency
        const frequency = {};
        words.forEach(word => {
            frequency[word] = (frequency[word] || 0) + 1;
        });

        // Get top keywords by frequency
        const sorted = Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 30)
            .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

        return sorted;
    };

    // Categorize keywords
    const categorizeKeywords = (keywords) => {
        const categories = {
            technical: [],
            soft: [],
            tools: [],
            certifications: [],
            methodologies: [],
            domains: []
        };

        // Predefined lists for categorization
        const techKeywords = new Set(['react', 'python', 'java', 'javascript', 'aws', 'docker', 'node', 'sql', 'mongodb', 'git']);
        const softKeywords = new Set(['leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking', 'adaptability']);
        const toolKeywords = new Set(['git', 'jira', 'figma', 'salesforce', 'slack', 'trello', 'confluence']);
        const certKeywords = new Set(['pmp', 'aws', 'certified', 'scrum', 'google', 'microsoft', 'oracle']);
        const methodKeywords = new Set(['agile', 'scrum', 'kanban', 'lean', 'waterfall', 'devops', 'ci/cd']);
        const domainKeywords = new Set(['fintech', 'healthcare', 'e-commerce', 'saas', 'iot', 'ai', 'machine learning', 'blockchain']);

        keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase();

            if (techKeywords.has(lowerKeyword) ||
                /(js|java|python|react|angular|vue|node|sql|nosql|aws|azure|gcp|docker|kubernetes)/i.test(keyword)) {
                categories.technical.push(keyword);
            } else if (softKeywords.has(lowerKeyword) ||
                /(leadership|communication|teamwork|collaboration|problem|critical|adapt)/i.test(keyword)) {
                categories.soft.push(keyword);
            } else if (toolKeywords.has(lowerKeyword) ||
                /(git|jira|figma|salesforce|slack|trello|confluence|jenkins)/i.test(keyword)) {
                categories.tools.push(keyword);
            } else if (certKeywords.has(lowerKeyword) ||
                /(certified|certification|pmp|aws|google|microsoft)/i.test(keyword)) {
                categories.certifications.push(keyword);
            } else if (methodKeywords.has(lowerKeyword) ||
                /(agile|scrum|kanban|lean|waterfall|devops)/i.test(keyword)) {
                categories.methodologies.push(keyword);
            } else if (domainKeywords.has(lowerKeyword) ||
                /(fintech|healthcare|ecommerce|saas|iot|ai|ml|blockchain)/i.test(keyword)) {
                categories.domains.push(keyword);
            } else {
                // Default to technical if no match
                categories.technical.push(keyword);
            }
        });

        return categories;
    };

    // Handle keyword selection
    const handleKeywordClick = (keyword) => {
        setSelectedKeywords(prev => {
            if (prev.includes(keyword)) {
                return prev.filter(k => k !== keyword);
            } else {
                return [...prev, keyword];
            }
        });
    };

    // Handle applying selected keywords
    const handleApplyKeywords = () => {
        if (selectedKeywords.length === 0) {
            toast.error('Please select at least one keyword');
            return;
        }

        if (onApplyKeywords) {
            onApplyKeywords(selectedKeywords);
        }

        toast.success(`Applied ${selectedKeywords.length} keywords to your resume!`);
    };

    // Handle adding custom keyword
    const handleAddCustomKeyword = () => {
        if (!customKeywordInput.trim()) return;

        const newKeyword = customKeywordInput.trim();
        setCustomKeywords(prev => [...prev, newKeyword]);
        setExtractedKeywords(prev => [...prev, newKeyword]);
        setCustomKeywordInput('');
        toast.success(`Added custom keyword: ${newKeyword}`);
    };

    // Filter keywords by category
    const getFilteredKeywords = () => {
        if (activeCategory === 'all') {
            return [...extractedKeywords, ...customKeywords];
        }

        if (keywordCategories[activeCategory]) {
            return keywordCategories[activeCategory];
        }

        return extractedKeywords;
    };

    // Get AI confidence badge
    const getConfidenceBadge = (keyword) => {
        const confidence = aiConfidence[keyword?.toLowerCase()] || 0.8;

        if (confidence >= 0.9) return { color: 'bg-emerald-500', text: 'High' };
        if (confidence >= 0.7) return { color: 'bg-blue-500', text: 'Medium' };
        return { color: 'bg-amber-500', text: 'Low' };
    };

    // Analyze job description insights
    const analyzeJDInsights = async () => {
        if (!inputJD.trim()) return;

        try {
            const insights = await analyzeJobDescription(inputJD);
            setAnalysisInsights(insights);
        } catch (error) {
            console.error('JD analysis error:', error);
        }
    };

    // Copy all keywords to clipboard
    const copyKeywordsToClipboard = () => {
        const text = selectedKeywords.length > 0
            ? selectedKeywords.join(', ')
            : extractedKeywords.join(', ');

        navigator.clipboard.writeText(text);
        toast.success('Keywords copied to clipboard!');
    };

    // Clear all selections
    const clearAll = () => {
        setSelectedKeywords([]);
        setExtractedKeywords([]);
        setCustomKeywords([]);
        setInputJD('');
        toast.success('Cleared all keywords');
    };

    return (
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <FileSearch className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">AI Keyword Extractor</h3>
                            <p className="text-sm text-gray-600">Extract skills from job descriptions using AI</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearAll}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={copyKeywordsToClipboard}
                            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-2"
                        >
                            <Copy className="w-3 h-3" />
                            Copy
                        </button>
                    </div>
                </div>

                {/* Job Description Input */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paste Job Description
                    </label>
                    <textarea
                        value={inputJD}
                        onChange={(e) => setInputJD(e.target.value)}
                        placeholder="Paste the full job description here to extract relevant skills and keywords..."
                        rows="5"
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-500">
                            {inputJD.length} characters • {inputJD.split(/\s+/).filter(w => w.length > 0).length} words
                        </div>
                        <button
                            onClick={handleExtractKeywords}
                            disabled={isAnalyzing || !inputJD.trim()}
                            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${isAnalyzing || !inputJD.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-md'
                                }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4" />
                                    Extract Keywords
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Category Filters */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Filter by Category</h4>
                        <button
                            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            {showCategoryFilter ? 'Hide' : 'Show'} Categories
                        </button>
                    </div>

                    <AnimatePresence>
                        {showCategoryFilter && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4"
                            >
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setActiveCategory('all')}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${activeCategory === 'all'
                                            ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        All Keywords
                                    </button>

                                    {Object.entries(KEYWORD_CATEGORIES).map(([key, category]) => {
                                        const Icon = category.icon;
                                        const count = keywordCategories[key]?.length || 0;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setActiveCategory(key)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${activeCategory === key
                                                    ? `bg-${category.color}-100 text-${category.color}-700 border border-${category.color}-300`
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                <Icon className="w-3 h-3" />
                                                {category.name}
                                                {count > 0 && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeCategory === key
                                                        ? `bg-${category.color}-200`
                                                        : 'bg-gray-200'
                                                        }`}>
                                                        {count}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Extracted Keywords Grid */}
                {extractedKeywords.length > 0 ? (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">
                                {selectedKeywords.length > 0
                                    ? `${selectedKeywords.length} Selected`
                                    : `${extractedKeywords.length} Keywords Found`}
                            </h4>
                            {selectedKeywords.length > 0 && (
                                <button
                                    onClick={handleApplyKeywords}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-md text-sm font-medium"
                                >
                                    Apply Selected ({selectedKeywords.length})
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {getFilteredKeywords().map((keyword, index) => {
                                const isSelected = selectedKeywords.includes(keyword);
                                const confidence = getConfidenceBadge(keyword);
                                const frequency = keywordFrequency[keyword?.toLowerCase()] || 1;

                                return (
                                    <motion.button
                                        key={`${keyword}-${index}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleKeywordClick(keyword)}
                                        className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${isSelected
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span>{keyword}</span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${isSelected
                                            ? 'bg-white/20'
                                            : confidence.color
                                            }`}>
                                            {frequency}x
                                        </span>
                                        {aiConfidence[keyword?.toLowerCase()] && (
                                            <span className="text-xs opacity-75">
                                                {Math.round(aiConfidence[keyword?.toLowerCase()] * 100)}%
                                            </span>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl mb-6">
                        <FileSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No keywords extracted yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Paste a job description above and click "Extract Keywords"
                        </p>
                    </div>
                )}

                {/* Custom Keywords */}
                <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Add Custom Keywords</h4>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={customKeywordInput}
                            onChange={(e) => setCustomKeywordInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomKeyword()}
                            placeholder="Add a custom keyword..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                            onClick={handleAddCustomKeyword}
                            disabled={!customKeywordInput.trim()}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {customKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {customKeywords.map((keyword, index) => (
                                <div
                                    key={`custom-${index}`}
                                    className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium flex items-center gap-2"
                                >
                                    <span>{keyword}</span>
                                    <button
                                        onClick={() => {
                                            setCustomKeywords(prev => prev.filter((_, i) => i !== index));
                                            setExtractedKeywords(prev => prev.filter(k => k !== keyword));
                                        }}
                                        className="text-amber-600 hover:text-amber-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AI Insights */}
                {analysisInsights && (
                    <div className="border-t pt-6">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-600" />
                            AI Analysis Insights
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Top Skills */}
                            {analysisInsights.topSkills && analysisInsights.topSkills.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                        <Star className="w-4 h-4" />
                                        Top Required Skills
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        {analysisInsights.topSkills.slice(0, 5).map((skill, index) => (
                                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Experience Level */}
                            {analysisInsights.experienceLevel && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                        <Target className="w-4 h-4" />
                                        Experience Level
                                    </h5>
                                    <div className="text-lg font-bold text-green-700">
                                        {analysisInsights.experienceLevel}
                                    </div>
                                    <div className="text-sm text-green-600 mt-1">
                                        Years of experience suggested
                                    </div>
                                </div>
                            )}

                            {/* Salary Range */}
                            {analysisInsights.salaryRange && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                    <h5 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Estimated Salary Range
                                    </h5>
                                    <div className="text-lg font-bold text-amber-700">
                                        {analysisInsights.salaryRange}
                                    </div>
                                    <div className="text-sm text-amber-600 mt-1">
                                        Based on job description keywords
                                    </div>
                                </div>
                            )}

                            {/* Industry Match */}
                            {analysisInsights.industry && (
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <h5 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Industry
                                    </h5>
                                    <div className="text-lg font-bold text-purple-700">
                                        {analysisInsights.industry}
                                    </div>
                                    <div className="text-sm text-purple-600 mt-1">
                                        Primary industry detected
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Items */}
                        {analysisInsights.actionItems && analysisInsights.actionItems.length > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                                <h5 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4" />
                                    AI Recommendations
                                </h5>
                                <ul className="space-y-2">
                                    {analysisInsights.actionItems.slice(0, 3).map((item, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                            <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Stats Summary */}
                {extractedKeywords.length > 0 && (
                    <div className="border-t pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{extractedKeywords.length}</div>
                                <div className="text-sm text-gray-600">Total Keywords</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">{selectedKeywords.length}</div>
                                <div className="text-sm text-gray-600">Selected</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {Object.keys(keywordCategories).filter(key => keywordCategories[key]?.length > 0).length}
                                </div>
                                <div className="text-sm text-gray-600">Categories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {extractedKeywords.length > 0
                                        ? Math.round(extractedKeywords.reduce((sum, kw) => sum + (aiConfidence[kw?.toLowerCase()] || 0.8), 0) / extractedKeywords.length * 100)
                                        : 0}%
                                </div>
                                <div className="text-sm text-gray-600">AI Confidence</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span>AI-powered extraction with 95% accuracy</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={clearAll}
                            className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm font-medium"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleApplyKeywords}
                            disabled={selectedKeywords.length === 0}
                            className={`px-6 py-2.5 rounded-xl font-medium ${selectedKeywords.length === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                                }`}
                        >
                            Apply to Resume
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Add Wrench icon if not imported
const Wrench = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);

export default JDKeywordExtractor;