import React, { useState } from 'react';
import {
    Briefcase, GraduationCap, Code, FileText, Users,
    Award, Globe, Star, Clock, TrendingUp, Zap,
    Check, ArrowRight, X, HelpCircle, Shield, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BUILDER_TYPES = [
    {
        id: 'professional',
        title: 'Professional Resume',
        icon: Briefcase,
        description: 'Standard resume for corporate jobs and career advancement',
        features: ['ATS Optimized', 'Professional Format', 'Industry Standard'],
        color: 'from-blue-500 to-blue-600',
        timeEstimate: '10-15 mins',
        difficulty: 'Easy',
        recommendedFor: ['Corporate Jobs', 'Career Changes', 'Mid-Level Professionals'],
        templates: 8,
        popular: true
    },
    {
        id: 'academic',
        title: 'Academic CV',
        icon: GraduationCap,
        description: 'Comprehensive CV for academic and research positions',
        features: ['Publications Section', 'Research Focus', 'Academic Format'],
        color: 'from-purple-500 to-purple-600',
        timeEstimate: '20-25 mins',
        difficulty: 'Medium',
        recommendedFor: ['Researchers', 'Professors', 'PhD Candidates'],
        templates: 6,
        popular: false
    },
    {
        id: 'technical',
        title: 'Technical Resume',
        icon: Code,
        description: 'Specialized resume for tech roles and software engineering',
        features: ['Skills Matrix', 'Project Portfolio', 'Technical Stack'],
        color: 'from-green-500 to-green-600',
        timeEstimate: '15-20 mins',
        difficulty: 'Medium',
        recommendedFor: ['Developers', 'Engineers', 'Tech Leads'],
        templates: 7,
        popular: true
    },
    {
        id: 'creative',
        title: 'Creative Portfolio',
        icon: FileText,
        description: 'Visual resume for creative fields and design roles',
        features: ['Portfolio Links', 'Visual Design', 'Creative Layout'],
        color: 'from-pink-500 to-pink-600',
        timeEstimate: '15-20 mins',
        difficulty: 'Hard',
        recommendedFor: ['Designers', 'Artists', 'Marketing'],
        templates: 5,
        popular: false
    },
    {
        id: 'executive',
        title: 'Executive Resume',
        icon: Users,
        description: 'Premium resume for leadership and executive positions',
        features: ['Leadership Focus', 'Achievement Metrics', 'Strategic Impact'],
        color: 'from-emerald-500 to-emerald-600',
        timeEstimate: '20-30 mins',
        difficulty: 'Hard',
        recommendedFor: ['Executives', 'Directors', 'Senior Management'],
        templates: 4,
        popular: true
    },
    {
        id: 'student',
        title: 'Student Resume',
        icon: GraduationCap,
        description: 'Entry-level resume for students and recent graduates',
        features: ['Education Focus', 'Internship Highlight', 'Skill Development'],
        color: 'from-orange-500 to-orange-600',
        timeEstimate: '8-12 mins',
        difficulty: 'Easy',
        recommendedFor: ['Students', 'Graduates', 'Entry-Level'],
        templates: 9,
        popular: true
    },
    {
        id: 'quick',
        title: 'Quick Builder',
        icon: Zap,
        description: 'Fast resume creation with AI-powered suggestions',
        features: ['AI Assistance', 'Quick Fill', 'Smart Templates'],
        color: 'from-yellow-500 to-yellow-600',
        timeEstimate: '5-8 mins',
        difficulty: 'Very Easy',
        recommendedFor: ['Urgent Needs', 'First-Time Users', 'Simple Updates'],
        templates: 3,
        popular: true
    },
    {
        id: 'international',
        title: 'International CV',
        icon: Globe,
        description: 'Global resume format for international job applications',
        features: ['Multi-language', 'International Standards', 'Visa Ready'],
        color: 'from-indigo-500 to-indigo-600',
        timeEstimate: '25-35 mins',
        difficulty: 'Hard',
        recommendedFor: ['International Jobs', 'Expats', 'Global Companies'],
        templates: 6,
        popular: false
    }
];

const BUILDER_STATS = {
    totalTemplates: 48,
    activeUsers: '10,000+',
    successRate: '94%',
    avgTime: '12 mins'
};

export default function BuildersSelection({ onClose }) {
    const navigate = useNavigate();
    const [selectedBuilder, setSelectedBuilder] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const filteredBuilders = BUILDER_TYPES.filter(builder => {
        const matchesSearch = builder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            builder.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'popular' && builder.popular) ||
            (filter === 'easy' && builder.difficulty === 'Easy') ||
            (filter === 'quick' && builder.timeEstimate.includes('5-8'));
        return matchesSearch && matchesFilter;
    });

    const handleBuilderSelect = (builderId) => {
        setSelectedBuilder(builderId);
    };

    const handleStartBuilder = () => {
        if (selectedBuilder) {
            // Navigate to builder with selected type
            navigate(`/builder/${selectedBuilder}`);
            if (onClose) onClose();
        }
    };

    const handleQuickStart = (builderId) => {
        // Start immediately without selection
        navigate(`/builder/${builderId}`);
        if (onClose) onClose();
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Very Easy': return 'text-green-600 bg-green-100';
            case 'Easy': return 'text-green-600 bg-green-100';
            case 'Medium': return 'text-yellow-600 bg-yellow-100';
            case 'Hard': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                                <FileText className="text-white" size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Choose Your Resume Builder</h1>
                                <p className="text-gray-600">
                                    Select the builder that best matches your career goals
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 hover:bg-white rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="p-4 border-b bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{BUILDER_STATS.totalTemplates}</div>
                            <div className="text-sm text-gray-600">Templates</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{BUILDER_STATS.activeUsers}</div>
                            <div className="text-sm text-gray-600">Active Users</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{BUILDER_STATS.successRate}</div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">{BUILDER_STATS.avgTime}</div>
                            <div className="text-sm text-gray-600">Avg. Time</div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search builders by title or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                                    <FileText size={20} className="text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All Builders
                            </button>
                            <button
                                onClick={() => setFilter('popular')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap ${filter === 'popular'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Star size={16} className="inline mr-2" />
                                Popular
                            </button>
                            <button
                                onClick={() => setFilter('easy')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap ${filter === 'easy'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Easy Start
                            </button>
                            <button
                                onClick={() => setFilter('quick')}
                                className={`px-4 py-2 rounded-xl whitespace-nowrap ${filter === 'quick'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Zap size={16} className="inline mr-2" />
                                Quick
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-300px)]">
                    {/* Main Content - Builders Grid */}
                    <div className="flex-1 p-6 overflow-auto">
                        {filteredBuilders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <FileText size={24} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No builders found</h3>
                                <p className="text-gray-600">
                                    Try a different search term or filter
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {filteredBuilders.map((builder) => {
                                    const Icon = builder.icon;
                                    const isSelected = selectedBuilder === builder.id;

                                    return (
                                        <div
                                            key={builder.id}
                                            className={`border-2 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:shadow-xl ${isSelected
                                                ? 'border-blue-500 ring-4 ring-blue-100'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => handleBuilderSelect(builder.id)}
                                        >
                                            {/* Builder Header */}
                                            <div className={`bg-gradient-to-r ${builder.color} p-6`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                                            <Icon className="text-white" size={24} />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white">{builder.title}</h3>
                                                            <p className="text-white text-opacity-90 text-sm">
                                                                {builder.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <div className="bg-white text-blue-600 p-2 rounded-full">
                                                            <Check size={20} />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Badges */}
                                                <div className="flex items-center space-x-2">
                                                    {builder.popular && (
                                                        <div className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full">
                                                            <Star size={14} className="text-yellow-300 mr-1" />
                                                            <span className="text-white text-sm font-medium">Popular</span>
                                                        </div>
                                                    )}
                                                    <div className={`inline-flex items-center px-3 py-1 rounded-full ${getDifficultyColor(builder.difficulty)}`}>
                                                        <span className="text-sm font-medium">{builder.difficulty}</span>
                                                    </div>
                                                    <div className="inline-flex items-center px-3 py-1 bg-black bg-opacity-20 rounded-full">
                                                        <Clock size={14} className="text-white mr-1" />
                                                        <span className="text-white text-sm">{builder.timeEstimate}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Builder Body */}
                                            <div className="bg-white p-6">
                                                {/* Features */}
                                                <div className="mb-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">Key Features</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {builder.features.map((feature, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                                            >
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Recommended For */}
                                                <div className="mb-4">
                                                    <h4 className="font-medium text-gray-900 mb-2">Best For</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {builder.recommendedFor.map((item, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                                                            >
                                                                {item}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-blue-600">{builder.templates}</div>
                                                        <div className="text-xs text-gray-500">Templates</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {builder.difficulty === 'Very Easy' ? '95%' :
                                                                builder.difficulty === 'Easy' ? '90%' :
                                                                    builder.difficulty === 'Medium' ? '85%' : '80%'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Completion Rate</div>
                                                    </div>
                                                </div>

                                                {/* Quick Start Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleQuickStart(builder.id);
                                                    }}
                                                    className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                                                >
                                                    Start Now
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Selection Panel */}
                    <div className="w-96 border-l p-6 overflow-auto hidden lg:block">
                        <div className="sticky top-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Selected Builder</h3>

                            {selectedBuilder ? (
                                <>
                                    {(() => {
                                        const builder = BUILDER_TYPES.find(b => b.id === selectedBuilder);
                                        const Icon = builder?.icon;

                                        return (
                                            <div className="mb-6">
                                                <div className={`bg-gradient-to-r ${builder.color} p-6 rounded-xl text-white mb-4`}>
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                                                            {Icon && <Icon size={24} />}
                                                        </div>
                                                        <h3 className="text-xl font-bold">{builder.title}</h3>
                                                    </div>
                                                    <p className="text-white text-opacity-90">{builder.description}</p>
                                                </div>

                                                {/* Features List */}
                                                <div className="space-y-3 mb-6">
                                                    <h4 className="font-medium text-gray-900">What You'll Get:</h4>
                                                    <ul className="space-y-2">
                                                        {builder.features.map((feature, index) => (
                                                            <li key={index} className="flex items-center text-sm text-gray-600">
                                                                <Check size={16} className="text-green-500 mr-2" />
                                                                {feature}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Time Estimate */}
                                                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Estimated Time</h4>
                                                            <p className="text-sm text-gray-600">Based on user data</p>
                                                        </div>
                                                        <div className="text-2xl font-bold text-blue-600">
                                                            {builder.timeEstimate}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Start Button */}
                                                <button
                                                    onClick={handleStartBuilder}
                                                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:opacity-90 transition-opacity font-medium text-lg flex items-center justify-center space-x-2"
                                                >
                                                    <span>Start Building</span>
                                                    <ArrowRight size={20} />
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <HelpCircle size={24} className="text-gray-400" />
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">No Builder Selected</h4>
                                    <p className="text-gray-600 text-sm">
                                        Click on a builder card to see details and get started
                                    </p>
                                </div>
                            )}

                            {/* Comparison Button */}
                            <button
                                onClick={() => setShowComparison(true)}
                                className="w-full mt-6 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center justify-center space-x-2"
                            >
                                <TrendingUp size={18} />
                                <span>Compare Builders</span>
                            </button>

                            {/* Help Section */}
                            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl">
                                <h4 className="font-medium text-gray-900 mb-2">💡 Need Help Choosing?</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• <strong>Professional:</strong> Standard jobs, corporate roles</li>
                                    <li>• <strong>Technical:</strong> Developers, engineers, IT</li>
                                    <li>• <strong>Student:</strong> Recent graduates, internships</li>
                                    <li>• <strong>Quick:</strong> Fast updates, urgent applications</li>
                                </ul>
                            </div>

                            {/* Security Badge */}
                            <div className="mt-6 p-4 bg-gray-900 text-white rounded-xl">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Shield size={20} className="text-green-400" />
                                    <span className="font-medium">Secure & Private</span>
                                </div>
                                <p className="text-sm text-gray-300">
                                    Your data is encrypted and never shared. Delete anytime.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                                <Check size={14} className="text-green-500 mr-2" />
                                Free Templates
                            </span>
                            <span className="flex items-center">
                                <Download size={14} className="text-blue-500 mr-2" />
                                Unlimited Exports
                            </span>
                            <span className="flex items-center">
                                <Shield size={14} className="text-purple-500 mr-2" />
                                Data Privacy
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleStartBuilder}
                            disabled={!selectedBuilder}
                            className={`px-8 py-2.5 rounded-xl font-medium transition-all ${!selectedBuilder
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                                }`}
                        >
                            Start with Selected Builder
                        </button>
                    </div>
                </div>
            </div>

            {/* Comparison Modal */}
            {showComparison && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Builder Comparison</h2>
                                <button
                                    onClick={() => setShowComparison(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium text-gray-900">Builder</th>
                                        <th className="text-left p-3 font-medium text-gray-900">Time</th>
                                        <th className="text-left p-3 font-medium text-gray-900">Difficulty</th>
                                        <th className="text-left p-3 font-medium text-gray-900">Templates</th>
                                        <th className="text-left p-3 font-medium text-gray-900">Best For</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {BUILDER_TYPES.map((builder) => (
                                        <tr key={builder.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">
                                                <div className="flex items-center space-x-2">
                                                    <builder.icon size={18} className="text-gray-500" />
                                                    <span className="font-medium">{builder.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">{builder.timeEstimate}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(builder.difficulty)}`}>
                                                    {builder.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-3">{builder.templates}</td>
                                            <td className="p-3">
                                                <div className="text-sm text-gray-600">
                                                    {builder.recommendedFor.join(', ')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t">
                            <button
                                onClick={() => setShowComparison(false)}
                                className="w-full py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800"
                            >
                                Close Comparison
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}