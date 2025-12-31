// src/components/ai/AISuggestionsPanel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useResume } from '../../context/ResumeContext';
import {
    Lightbulb, Zap, Target, TrendingUp, CheckCircle,
    AlertCircle, Clock, Sparkles, Wand2, Brain,
    ArrowRight, Check, X, RefreshCw, Filter,
    Star, Award, TrendingDown, BarChart, Eye,
    EyeOff, Copy, Download, Settings, HelpCircle,
    MessageSquare, Users, Briefcase, GraduationCap,
    Code, FileText, Award as AwardIcon, Languages,
    User, Search, Hash, Type, Bold, Italic,
    List, ListOrdered, AlignLeft, AlignCenter,
    AlignRight, Link, Image as ImageIcon
} from 'lucide-react';

// Suggestion Card Component
const SuggestionCard = ({ suggestion, onApply, onDismiss, onViewDetails }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-50 border-red-200';
            case 'high': return 'bg-amber-50 border-amber-200';
            case 'medium': return 'bg-blue-50 border-blue-200';
            case 'low': return 'bg-gray-50 border-gray-200';
            default: return 'bg-gray-50 border-gray-200';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'critical': return <AlertCircle size={16} className="text-red-600" />;
            case 'high': return <AlertCircle size={16} className="text-amber-600" />;
            case 'medium': return <AlertCircle size={16} className="text-blue-600" />;
            case 'low': return <HelpCircle size={16} className="text-gray-600" />;
            default: return <Lightbulb size={16} className="text-gray-600" />;
        }
    };

    const getSectionIcon = (section) => {
        const icons = {
            summary: FileText,
            experience: Briefcase,
            education: GraduationCap,
            skills: Code,
            projects: FileText,
            certifications: AwardIcon,
            languages: Languages,
            personalInfo: User,
            overall: Brain
        };
        const Icon = icons[section] || Lightbulb;
        return <Icon size={14} />;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`p-4 rounded-xl border ${getPriorityColor(suggestion.priority)}`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="pt-1">
                    {getPriorityIcon(suggestion.priority)}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    {getSectionIcon(suggestion.section)}
                                    {suggestion.section}
                                </span>
                                <span className="text-xs text-gray-500">•</span>
                                <span className="text-xs text-gray-500">
                                    {suggestion.type}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onViewDetails(suggestion)}
                                className="p-1 hover:bg-white rounded"
                                title="View details"
                            >
                                <Eye size={14} className="text-gray-600" />
                            </button>
                            <button
                                onClick={() => onDismiss(suggestion)}
                                className="p-1 hover:bg-white rounded"
                                title="Dismiss"
                            >
                                <X size={14} className="text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>

                    {/* Impact & Effort */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-xs">
                            <span className="text-gray-600">Impact: </span>
                            <span className={`font-medium ${suggestion.impact === 'high' ? 'text-green-600' : suggestion.impact === 'medium' ? 'text-amber-600' : 'text-gray-600'}`}>
                                {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)}
                            </span>
                        </div>
                        <div className="text-xs">
                            <span className="text-gray-600">Effort: </span>
                            <span className={`font-medium ${suggestion.effort === 'low' ? 'text-green-600' : suggestion.effort === 'medium' ? 'text-amber-600' : 'text-red-600'}`}>
                                {suggestion.effort.charAt(0).toUpperCase() + suggestion.effort.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onApply(suggestion)}
                            className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg flex items-center gap-2"
                        >
                            <Check size={14} />
                            Apply Suggestion
                        </button>
                        <button
                            onClick={() => onViewDetails(suggestion)}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Suggestion Detail Modal
const SuggestionDetailModal = ({ suggestion, onClose, onApply }) => {
    if (!suggestion) return null;

    const getBenefitColor = (benefit) => {
        switch (benefit) {
            case 'ats': return 'bg-blue-100 text-blue-700';
            case 'readability': return 'bg-green-100 text-green-700';
            case 'impact': return 'bg-purple-100 text-purple-700';
            case 'completeness': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <Lightbulb size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{suggestion.title}</h2>
                                <p className="text-sm text-gray-600">
                                    {suggestion.section} • {suggestion.type}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg"
                        >
                            <X size={20} className="text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {/* Description */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-700">{suggestion.detailedDescription || suggestion.description}</p>
                    </div>

                    {/* Benefits */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {suggestion.benefits?.map((benefit, index) => (
                                <div
                                    key={index}
                                    className={`px-3 py-2 rounded-lg text-center ${getBenefitColor(benefit.type)}`}
                                >
                                    <div className="text-sm font-medium">{benefit.title}</div>
                                    <div className="text-xs">{benefit.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Example */}
                    {suggestion.example && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-2">Example</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="mb-3">
                                    <div className="text-sm text-gray-600 mb-1">Before:</div>
                                    <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                                        {suggestion.example.before}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">After:</div>
                                    <div className="text-sm text-gray-700 bg-green-50 p-3 rounded border border-green-200">
                                        {suggestion.example.after}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Implementation Steps */}
                    {suggestion.steps && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">How to Implement</h3>
                            <ol className="space-y-2">
                                {suggestion.steps.map((step, index) => (
                                    <li key={index} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="text-sm text-gray-700">{step}</div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Estimated time: {suggestion.estimatedTime}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    onApply(suggestion);
                                    onClose();
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg flex items-center gap-2"
                            >
                                <Check size={16} />
                                Apply This Suggestion
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Statistics Card Component
const StatsCard = ({ icon: Icon, value, label, color = 'blue', trend = null }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        amber: 'bg-amber-50 text-amber-700',
        purple: 'bg-purple-50 text-purple-700',
        red: 'bg-red-50 text-red-700'
    };

    return (
        <div className={`p-4 rounded-xl ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-sm">{label}</div>
                </div>
                <div className="p-2 bg-white rounded-lg">
                    <Icon size={20} />
                </div>
            </div>
            {trend && (
                <div className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last analysis
                </div>
            )}
        </div>
    );
};

// Main AISuggestionsPanel Component
const AISuggestionsPanel = ({
    activeSection,
    resumeData,
    onApplySuggestion,
    onGenerateContent,
    user,
    minimized = false,
    onToggleMinimize
}) => {
    const { currentResume, updateSection, enhanceWithAI } = useResume();

    // State
    const [suggestions, setSuggestions] = useState([]);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('priority');
    const [stats, setStats] = useState({
        total: 0,
        applied: 0,
        pending: 0,
        impactScore: 0
    });
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    // Filters
    const filters = [
        { id: 'all', label: 'All Suggestions' },
        { id: 'critical', label: 'Critical', icon: AlertCircle },
        { id: 'high', label: 'High Priority', icon: TrendingUp },
        { id: 'medium', label: 'Medium', icon: Lightbulb },
        { id: 'low', label: 'Low', icon: HelpCircle }
    ];

    // Sort options
    const sortOptions = [
        { id: 'priority', label: 'Priority' },
        { id: 'impact', label: 'Impact' },
        { id: 'effort', label: 'Effort' },
        { id: 'section', label: 'Section' }
    ];

    // Generate mock suggestions based on resume data
    const generateSuggestions = () => {
        const mockSuggestions = [
            {
                id: 1,
                title: 'Add Quantifiable Achievements',
                description: 'Include numbers and metrics in your experience section to showcase impact',
                section: 'experience',
                type: 'content',
                priority: 'high',
                impact: 'high',
                effort: 'medium',
                estimatedTime: '5-10 minutes',
                benefits: [
                    { type: 'impact', title: 'Increased Impact', description: 'Makes achievements measurable' },
                    { type: 'ats', title: 'ATS Friendly', description: 'Keywords with numbers' }
                ],
                example: {
                    before: 'Managed projects and improved processes',
                    after: 'Managed 15+ projects with budgets up to $500k, improving processes by 35%'
                },
                steps: [
                    'Review each bullet point in experience section',
                    'Add specific numbers and percentages',
                    'Focus on results and outcomes',
                    'Use action verbs'
                ]
            },
            {
                id: 2,
                title: 'Optimize Keywords for ATS',
                description: 'Add industry-specific keywords for better ATS compatibility',
                section: 'skills',
                type: 'keyword',
                priority: 'high',
                impact: 'high',
                effort: 'low',
                estimatedTime: '2-5 minutes',
                benefits: [
                    { type: 'ats', title: 'Better Ranking', description: 'Higher ATS match score' },
                    { type: 'readability', title: 'Relevance', description: 'More targeted content' }
                ]
            },
            {
                id: 3,
                title: 'Improve Professional Summary',
                description: 'Make your summary more impactful and targeted to your career goals',
                section: 'summary',
                type: 'content',
                priority: 'medium',
                impact: 'medium',
                effort: 'medium',
                estimatedTime: '10-15 minutes',
                benefits: [
                    { type: 'impact', title: 'Strong First Impression', description: 'Captures recruiter attention' },
                    { type: 'readability', title: 'Clear Focus', description: 'Defines career direction' }
                ]
            },
            {
                id: 4,
                title: 'Add Missing Contact Information',
                description: 'Ensure all necessary contact details are included and formatted correctly',
                section: 'personalInfo',
                type: 'completeness',
                priority: 'critical',
                impact: 'high',
                effort: 'low',
                estimatedTime: '1-2 minutes',
                benefits: [
                    { type: 'completeness', title: 'Complete Profile', description: 'No missing information' },
                    { type: 'ats', title: 'ATS Compliance', description: 'Proper contact format' }
                ]
            },
            {
                id: 5,
                title: 'Use Stronger Action Verbs',
                description: 'Replace weak verbs with powerful action verbs at the start of bullet points',
                section: 'experience',
                type: 'writing',
                priority: 'medium',
                impact: 'medium',
                effort: 'low',
                estimatedTime: '3-5 minutes',
                benefits: [
                    { type: 'impact', title: 'More Dynamic', description: 'Creates stronger impression' },
                    { type: 'readability', title: 'Better Flow', description: 'Improves reading experience' }
                ]
            },
            {
                id: 6,
                title: 'Balance Skills Categories',
                description: 'Ensure proper distribution between technical, soft, and industry skills',
                section: 'skills',
                type: 'organization',
                priority: 'low',
                impact: 'medium',
                effort: 'medium',
                estimatedTime: '5-8 minutes',
                benefits: [
                    { type: 'completeness', title: 'Well-Rounded', description: 'Shows diverse capabilities' },
                    { type: 'ats', title: 'Keyword Coverage', description: 'Broader keyword matching' }
                ]
            }
        ];

        return mockSuggestions;
    };

    // Initialize suggestions
    useEffect(() => {
        setLoading(true);
        const newSuggestions = generateSuggestions();
        setSuggestions(newSuggestions);
        setFilteredSuggestions(newSuggestions);

        // Calculate stats
        const applied = newSuggestions.filter(s => s.applied).length;
        const pending = newSuggestions.filter(s => !s.applied).length;
        const impactScore = Math.round(
            newSuggestions.reduce((acc, s) => acc + (s.priority === 'critical' || s.priority === 'high' ? 10 : 5), 0)
        );

        setStats({
            total: newSuggestions.length,
            applied,
            pending,
            impactScore
        });

        setLoading(false);
    }, [currentResume.data]);

    // Filter and sort suggestions
    useEffect(() => {
        let filtered = suggestions;

        // Apply filter
        if (filter !== 'all') {
            filtered = filtered.filter(s => s.priority === filter);
        }

        // Apply sort
        filtered = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'priority':
                    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'impact':
                    const impactOrder = { high: 0, medium: 1, low: 2 };
                    return impactOrder[a.impact] - impactOrder[b.impact];
                case 'effort':
                    const effortOrder = { low: 0, medium: 1, high: 2 };
                    return effortOrder[a.effort] - effortOrder[b.effort];
                case 'section':
                    return a.section.localeCompare(b.section);
                default:
                    return 0;
            }
        });

        setFilteredSuggestions(filtered);
    }, [suggestions, filter, sortBy]);

    // Handle apply suggestion
    const handleApplySuggestion = async (suggestion) => {
        try {
            // Mark as applied
            setSuggestions(prev => prev.map(s =>
                s.id === suggestion.id ? { ...s, applied: true, appliedAt: new Date() } : s
            ));

            // Update stats
            setStats(prev => ({
                ...prev,
                applied: prev.applied + 1,
                pending: prev.pending - 1
            }));

            // Apply AI enhancement
            await enhanceWithAI(suggestion.section, suggestion.title);

            // Call callback
            if (onApplySuggestion) {
                onApplySuggestion(suggestion);
            }

            toast.success(`Applied: ${suggestion.title}`);
        } catch (error) {
            toast.error('Failed to apply suggestion');
            // Revert if failed
            setSuggestions(prev => prev.map(s =>
                s.id === suggestion.id ? { ...s, applied: false } : s
            ));
        }
    };

    // Handle dismiss suggestion
    const handleDismissSuggestion = (suggestion) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
        toast.info('Suggestion dismissed');
    };

    // Handle view details
    const handleViewDetails = (suggestion) => {
        setSelectedSuggestion(suggestion);
    };

    // Handle close details
    const handleCloseDetails = () => {
        setSelectedSuggestion(null);
    };

    // Handle regenerate suggestions
    const handleRegenerate = () => {
        setLoading(true);
        setTimeout(() => {
            const newSuggestions = generateSuggestions();
            setSuggestions(newSuggestions);
            setLoading(false);
            toast.success('New suggestions generated!');
        }, 1000);
    };

    // Handle apply all
    const handleApplyAll = async () => {
        const highPriority = suggestions.filter(s =>
            (s.priority === 'critical' || s.priority === 'high') && !s.applied
        );

        if (highPriority.length === 0) {
            toast.info('No high priority suggestions to apply');
            return;
        }

        try {
            for (const suggestion of highPriority) {
                await handleApplySuggestion(suggestion);
            }
            toast.success(`Applied ${highPriority.length} high priority suggestions`);
        } catch (error) {
            toast.error('Failed to apply some suggestions');
        }
    };

    if (minimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform duration-200 group"
            >
                <Lightbulb size={24} />
                {filteredSuggestions.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {filteredSuggestions.length}
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
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
                            <Lightbulb size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">AI Suggestions</h3>
                            <div className="text-xs text-gray-600">
                                {stats.pending} pending • {stats.applied} applied
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRegenerate}
                            disabled={loading}
                            className="p-2 hover:bg-white rounded-lg"
                            title="Regenerate suggestions"
                        >
                            <RefreshCw size={18} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                            className="p-2 hover:bg-white rounded-lg"
                            title="Toggle view"
                        >
                            {viewMode === 'list' ? (
                                <BarChart size={18} className="text-gray-600" />
                            ) : (
                                <List size={18} className="text-gray-600" />
                            )}
                        </button>
                        <button
                            onClick={onToggleMinimize}
                            className="p-2 hover:bg-white rounded-lg"
                            title="Minimize"
                        >
                            <X size={18} className="text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-b border-gray-200">
                <div className="grid grid-cols-4 gap-3">
                    <StatsCard
                        icon={Lightbulb}
                        value={stats.total}
                        label="Total"
                        color="blue"
                    />
                    <StatsCard
                        icon={CheckCircle}
                        value={stats.applied}
                        label="Applied"
                        color="green"
                    />
                    <StatsCard
                        icon={AlertCircle}
                        value={stats.pending}
                        label="Pending"
                        color="amber"
                    />
                    <StatsCard
                        icon={TrendingUp}
                        value={stats.impactScore}
                        label="Impact Score"
                        color="purple"
                    />
                </div>
            </div>

            {/* Filters & Sort */}
            <div className="p-4 border-b border-gray-200 space-y-3">
                {/* Filter Tabs */}
                <div className="flex gap-1 overflow-x-auto">
                    {filters.map((filterItem) => (
                        <button
                            key={filterItem.id}
                            onClick={() => setFilter(filterItem.id)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === filterItem.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {filterItem.icon && <filterItem.icon size={12} />}
                            {filterItem.label}
                        </button>
                    ))}
                </div>

                {/* Sort & Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleApplyAll}
                        className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-lg flex items-center gap-2"
                    >
                        <Zap size={14} />
                        Apply All High Priority
                    </button>
                </div>
            </div>

            {/* Suggestions List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4" />
                        <div className="text-gray-900 font-medium">Analyzing your resume...</div>
                        <div className="text-sm text-gray-600 mt-2">Generating AI suggestions</div>
                    </div>
                ) : filteredSuggestions.length > 0 ? (
                    <div className={`space-y-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : ''}`}>
                        <AnimatePresence>
                            {filteredSuggestions.map((suggestion) => (
                                <SuggestionCard
                                    key={suggestion.id}
                                    suggestion={suggestion}
                                    onApply={handleApplySuggestion}
                                    onDismiss={handleDismissSuggestion}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <CheckCircle size={48} className="text-green-500 mb-4" />
                        <div className="text-gray-900 font-medium mb-2">No suggestions found</div>
                        <div className="text-sm text-gray-600 text-center">
                            {filter === 'all'
                                ? 'Your resume looks great! Try analyzing a different section.'
                                : 'No suggestions match your current filter.'}
                        </div>
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
                            >
                                Show All Suggestions
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} />
                        <span>AI-powered suggestions</span>
                    </div>
                    <div className="text-xs">
                        Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* Suggestion Detail Modal */}
            <AnimatePresence>
                {selectedSuggestion && (
                    <SuggestionDetailModal
                        suggestion={selectedSuggestion}
                        onClose={handleCloseDetails}
                        onApply={handleApplySuggestion}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Default props
AISuggestionsPanel.defaultProps = {
    activeSection: 'summary',
    resumeData: {},
    onApplySuggestion: () => { },
    onGenerateContent: () => { },
    user: { aiCredits: 50 },
    minimized: false,
    onToggleMinimize: () => { }
};

export default AISuggestionsPanel;