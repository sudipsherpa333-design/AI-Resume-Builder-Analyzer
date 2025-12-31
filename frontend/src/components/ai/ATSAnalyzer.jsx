// src/components/ai/ATSAnalyzer.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useResume } from '../../context/ResumeContext';
import {
    Target, CheckCircle, XCircle, AlertCircle, TrendingUp,
    BarChart, FileText, Search, Zap, Shield, Clock,
    Download, RefreshCw, Eye, EyeOff, Copy, Check,
    HelpCircle, Info, ExternalLink, Filter, Settings,
    TrendingDown, Star, Award, Lightbulb, ArrowUpRight
} from 'lucide-react';

// Score Meter Component
const ScoreMeter = ({ score, label, description, color = 'blue' }) => {
    const getColorClasses = (score) => {
        if (score >= 90) return { bg: 'from-green-500 to-emerald-600', text: 'text-green-600' };
        if (score >= 80) return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-600' };
        if (score >= 70) return { bg: 'from-amber-500 to-orange-600', text: 'text-amber-600' };
        return { bg: 'from-red-500 to-rose-600', text: 'text-red-600' };
    };

    const colors = getColorClasses(score);

    return (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
                <div className={`text-3xl font-bold ${colors.text}`}>{score}%</div>
            </div>

            <div className="mb-4">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${colors.bg} rounded-full`}
                    />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="text-sm">
                    {score >= 90 && (
                        <span className="text-green-600 font-medium">Excellent ✓</span>
                    )}
                    {score >= 80 && score < 90 && (
                        <span className="text-blue-600 font-medium">Good ✓</span>
                    )}
                    {score >= 70 && score < 80 && (
                        <span className="text-amber-600 font-medium">Fair</span>
                    )}
                    {score < 70 && (
                        <span className="text-red-600 font-medium">Needs Improvement</span>
                    )}
                </div>
                <div className="text-xs text-gray-500">
                    Updated just now
                </div>
            </div>
        </div>
    );
};

// Issue Card Component
const IssueCard = ({ issue, priority, onFix }) => {
    const priorityColors = {
        critical: 'bg-red-50 border-red-200',
        high: 'bg-amber-50 border-amber-200',
        medium: 'bg-blue-50 border-blue-200',
        low: 'bg-gray-50 border-gray-200'
    };

    const priorityIcons = {
        critical: <XCircle size={16} className="text-red-600" />,
        high: <AlertCircle size={16} className="text-amber-600" />,
        medium: <AlertCircle size={16} className="text-blue-600" />,
        low: <Info size={16} className="text-gray-600" />
    };

    const getFixAction = (type) => {
        const actions = {
            keyword: 'Add missing keywords',
            format: 'Fix formatting issues',
            length: 'Optimize content length',
            grammar: 'Fix grammar/spelling',
            structure: 'Improve structure',
            contact: 'Add contact information'
        };
        return actions[type] || 'Fix this issue';
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl border ${priorityColors[priority]}`}
        >
            <div className="flex items-start gap-3">
                <div className="pt-1">
                    {priorityIcons[priority]}
                </div>
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${priority === 'critical' ? 'bg-red-100 text-red-700' : priority === 'high' ? 'bg-amber-100 text-amber-700' : priority === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {priority.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Found in: <span className="font-medium">{issue.section}</span>
                        </div>
                        <button
                            onClick={() => onFix(issue)}
                            className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                            {getFixAction(issue.type)}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Keyword Analysis Component
const KeywordAnalysis = ({ keywords, missingKeywords, onAddKeyword }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All Keywords' },
        { id: 'technical', label: 'Technical Skills' },
        { id: 'soft', label: 'Soft Skills' },
        { id: 'industry', label: 'Industry Terms' },
        { id: 'action', label: 'Action Verbs' }
    ];

    const filteredKeywords = selectedCategory === 'all'
        ? keywords
        : keywords.filter(k => k.category === selectedCategory);

    const filteredMissing = selectedCategory === 'all'
        ? missingKeywords
        : missingKeywords.filter(k => k.category === selectedCategory);

    return (
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-gray-900">Keyword Analysis</h3>
                    <p className="text-sm text-gray-600">Optimize for better ATS matching</p>
                </div>
                <div className="text-sm font-medium text-blue-600">
                    {keywords.length} / {keywords.length + missingKeywords.length} keywords
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${selectedCategory === category.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        {category.label}
                    </button>
                ))}
            </div>

            {/* Present Keywords */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="font-medium text-gray-900">Present Keywords ({keywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {filteredKeywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm border border-green-200"
                        >
                            {keyword.text}
                            {keyword.weight && (
                                <span className="ml-1 text-xs text-green-600">
                                    ({keyword.weight})
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            </div>

            {/* Missing Keywords */}
            {filteredMissing.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <AlertCircle size={16} className="text-red-600" />
                        <span className="font-medium text-gray-900">Missing Keywords ({missingKeywords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {filteredMissing.map((keyword, index) => (
                            <button
                                key={index}
                                onClick={() => onAddKeyword(keyword)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-sm border border-red-200 transition-colors flex items-center gap-1"
                            >
                                + {keyword.text}
                                {keyword.priority === 'high' && (
                                    <span className="text-xs text-red-600">(High)</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Keyword Tips */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb size={16} className="text-amber-600" />
                    <span className="font-medium text-gray-900">Keyword Tips</span>
                </div>
                <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-center gap-2">
                        <Zap size={12} className="text-blue-500" />
                        Use industry-specific terms relevant to your target job
                    </li>
                    <li className="flex items-center gap-2">
                        <TrendingUp size={12} className="text-green-500" />
                        Include both hard skills and soft skills
                    </li>
                    <li className="flex items-center gap-2">
                        <Target size={12} className="text-purple-500" />
                        Match keywords from the job description
                    </li>
                </ul>
            </div>
        </div>
    );
};

// Main ATS Analyzer Component
const ATSAnalyzer = ({ resumeData, onFixIssue, onAddKeyword, onOptimize }) => {
    const { currentResume } = useResume();

    // State
    const [scores, setScores] = useState({
        overall: 85,
        keywords: 92,
        formatting: 88,
        readability: 85,
        length: 78,
        contact: 95
    });

    const [issues, setIssues] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [missingKeywords, setMissingKeywords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(true);
    const [selectedView, setSelectedView] = useState('overview');

    // Analyze resume data
    const analyzeResume = useCallback(() => {
        setLoading(true);

        // Simulate analysis
        setTimeout(() => {
            // Mock analysis based on resume data
            const analysis = performATSAnalysis(currentResume.data);

            setScores(analysis.scores);
            setIssues(analysis.issues);
            setKeywords(analysis.keywords);
            setMissingKeywords(analysis.missingKeywords);

            setLoading(false);
            toast.success('ATS analysis complete!');
        }, 1500);
    }, [currentResume.data]);

    // Initial analysis
    useEffect(() => {
        analyzeResume();
    }, [analyzeResume]);

    // Handle fix issue
    const handleFixIssue = (issue) => {
        if (onFixIssue) {
            onFixIssue(issue);
            toast.success(`Applying fix for: ${issue.title}`);

            // Remove fixed issue
            setIssues(prev => prev.filter(i => i.id !== issue.id));

            // Update score
            setScores(prev => ({
                ...prev,
                overall: Math.min(prev.overall + 5, 100),
                [issue.category]: Math.min(prev[issue.category] + 10, 100)
            }));
        }
    };

    // Handle add keyword
    const handleAddKeyword = (keyword) => {
        if (onAddKeyword) {
            onAddKeyword(keyword);

            // Move keyword from missing to present
            setMissingKeywords(prev => prev.filter(k => k.text !== keyword.text));
            setKeywords(prev => [...prev, { ...keyword, added: true }]);

            // Update keyword score
            setScores(prev => ({
                ...prev,
                keywords: Math.min(prev.keywords + 2, 100)
            }));

            toast.success(`Added keyword: ${keyword.text}`);
        }
    };

    // Handle optimize all
    const handleOptimizeAll = () => {
        if (onOptimize) {
            onOptimize();

            // Simulate optimization
            setScores({
                overall: 95,
                keywords: 98,
                formatting: 96,
                readability: 92,
                length: 90,
                contact: 99
            });

            // Clear most issues
            setIssues(prev => prev.filter(i => i.priority === 'critical'));

            toast.success('All optimizations applied!');
        }
    };

    // Performance analysis
    const getPerformanceLevel = (score) => {
        if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
        if (score >= 80) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
        if (score >= 70) return { level: 'Fair', color: 'text-amber-600', bg: 'bg-amber-100' };
        return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
    };

    const performance = getPerformanceLevel(scores.overall);

    // Views
    const views = [
        { id: 'overview', label: 'Overview', icon: BarChart },
        { id: 'issues', label: 'Issues', icon: AlertCircle },
        { id: 'keywords', label: 'Keywords', icon: Search },
        { id: 'tips', label: 'Tips', icon: Lightbulb }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">ATS Analyzer</h2>
                    <p className="text-gray-600">Optimize your resume for Applicant Tracking Systems</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={analyzeResume}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm flex items-center gap-2"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Analyzing...' : 'Re-analyze'}
                    </button>
                    <button
                        onClick={handleOptimizeAll}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg flex items-center gap-2"
                    >
                        <Zap size={16} />
                        Optimize All
                    </button>
                </div>
            </div>

            {/* Performance Banner */}
            <div className={`p-6 rounded-2xl border ${performance.bg} border-gray-200`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                            <div className={`text-3xl font-bold ${performance.color}`}>{scores.overall}%</div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">ATS Score: {performance.level}</h3>
                            <p className="text-gray-600">
                                Your resume is {scores.overall >= 80 ? 'well optimized' : 'could be improved'} for ATS systems
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-600">Compared to average</div>
                        <div className="text-2xl font-bold text-gray-900">+{scores.overall - 70}%</div>
                    </div>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
                {views.map((view) => (
                    <button
                        key={view.id}
                        onClick={() => setSelectedView(view.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${selectedView === view.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <view.icon size={16} />
                        {view.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                {selectedView === 'overview' && (
                    <>
                        {/* Score Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ScoreMeter
                                score={scores.keywords}
                                label="Keyword Match"
                                description="Relevance to target job keywords"
                                color="green"
                            />
                            <ScoreMeter
                                score={scores.formatting}
                                label="Formatting"
                                description="ATS-friendly formatting and structure"
                                color="blue"
                            />
                            <ScoreMeter
                                score={scores.readability}
                                label="Readability"
                                description="Ease of reading and comprehension"
                                color="purple"
                            />
                            <ScoreMeter
                                score={scores.length}
                                label="Length Optimization"
                                description="Ideal resume length for ATS"
                                color="amber"
                            />
                            <ScoreMeter
                                score={scores.contact}
                                label="Contact Information"
                                description="Complete and properly formatted"
                                color="green"
                            />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="text-sm text-gray-600 mb-1">Issues Found</div>
                                <div className="text-2xl font-bold text-gray-900">{issues.length}</div>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="text-sm text-gray-600 mb-1">Keywords Present</div>
                                <div className="text-2xl font-bold text-gray-900">{keywords.length}</div>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="text-sm text-gray-600 mb-1">Missing Keywords</div>
                                <div className="text-2xl font-bold text-gray-900">{missingKeywords.length}</div>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="text-sm text-gray-600 mb-1">Estimated Rank</div>
                                <div className="text-2xl font-bold text-green-600">Top 15%</div>
                            </div>
                        </div>
                    </>
                )}

                {selectedView === 'issues' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Issues to Fix</h3>
                            <div className="text-sm text-gray-600">
                                {issues.filter(i => i.priority === 'critical' || i.priority === 'high').length} critical/high priority
                            </div>
                        </div>

                        {issues.length > 0 ? (
                            <div className="space-y-4">
                                {issues
                                    .sort((a, b) => {
                                        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                                        return priorityOrder[a.priority] - priorityOrder[b.priority];
                                    })
                                    .map((issue) => (
                                        <IssueCard
                                            key={issue.id}
                                            issue={issue}
                                            priority={issue.priority}
                                            onFix={handleFixIssue}
                                        />
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                                <h4 className="font-medium text-gray-900 mb-2">No Issues Found!</h4>
                                <p className="text-gray-600">Your resume is well optimized for ATS systems.</p>
                            </div>
                        )}
                    </div>
                )}

                {selectedView === 'keywords' && (
                    <KeywordAnalysis
                        keywords={keywords}
                        missingKeywords={missingKeywords}
                        onAddKeyword={handleAddKeyword}
                    />
                )}

                {selectedView === 'tips' && (
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Lightbulb size={20} className="text-amber-600" />
                            ATS Optimization Tips
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-xl border border-blue-100">
                                    <h4 className="font-medium text-gray-900 mb-2">✓ Use Standard Formatting</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Use common fonts (Arial, Times New Roman)</li>
                                        <li>• Avoid tables, columns, and graphics</li>
                                        <li>• Save as .docx or .pdf</li>
                                        <li>• Use standard headings (H1, H2)</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-blue-100">
                                    <h4 className="font-medium text-gray-900 mb-2">✓ Optimize Keywords</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Match keywords from job description</li>
                                        <li>• Include industry-specific terms</li>
                                        <li>• Use variations of key terms</li>
                                        <li>• Place keywords in relevant sections</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-white rounded-xl border border-blue-100">
                                    <h4 className="font-medium text-gray-900 mb-2">✓ Structure Matters</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Keep resume 1-2 pages maximum</li>
                                        <li>• Use reverse chronological order</li>
                                        <li>• Include clear contact information</li>
                                        <li>• Add relevant sections in order</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-white rounded-xl border border-blue-100">
                                    <h4 className="font-medium text-gray-900 mb-2">✓ Content Quality</h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Use action verbs at start of bullets</li>
                                        <li>• Include quantifiable achievements</li>
                                        <li>• Be specific and concrete</li>
                                        <li>• Proofread for errors</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-blue-200">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-blue-600" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Pro Tip: Customize for Each Job</h4>
                                    <p className="text-sm text-gray-600">
                                        Always tailor your resume for each job application. Use keywords from the job description
                                        and highlight relevant experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                    Last analyzed: {new Date().toLocaleDateString()}
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2">
                        <Download size={16} />
                        Export Report
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <ArrowUpRight size={16} />
                        View Detailed Report
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function for ATS analysis
const performATSAnalysis = (resumeData) => {
    // Mock analysis - in real app, this would be more sophisticated
    const mockScores = {
        overall: 85,
        keywords: 92,
        formatting: 88,
        readability: 85,
        length: 78,
        contact: 95
    };

    const mockIssues = [
        {
            id: 1,
            title: 'Missing Quantifiable Achievements',
            description: 'Add numbers and metrics to your experience bullet points',
            section: 'Experience',
            type: 'content',
            priority: 'high',
            category: 'readability'
        },
        {
            id: 2,
            title: 'Insufficient Keywords',
            description: 'Add more industry-specific keywords',
            section: 'Skills',
            type: 'keyword',
            priority: 'medium',
            category: 'keywords'
        },
        {
            id: 3,
            title: 'Resume Too Long',
            description: 'Consider reducing content to 1-2 pages',
            section: 'Overall',
            type: 'length',
            priority: 'medium',
            category: 'length'
        },
        {
            id: 4,
            title: 'Weak Action Verbs',
            description: 'Use stronger action verbs at start of bullet points',
            section: 'Experience',
            type: 'content',
            priority: 'low',
            category: 'readability'
        }
    ];

    const mockKeywords = [
        { text: 'React', category: 'technical', weight: 'High' },
        { text: 'Node.js', category: 'technical', weight: 'High' },
        { text: 'JavaScript', category: 'technical', weight: 'High' },
        { text: 'Leadership', category: 'soft', weight: 'Medium' },
        { text: 'Project Management', category: 'soft', weight: 'Medium' },
        { text: 'Agile', category: 'industry', weight: 'Medium' },
        { text: 'Developed', category: 'action', weight: 'Low' },
        { text: 'Implemented', category: 'action', weight: 'Low' }
    ];

    const mockMissingKeywords = [
        { text: 'TypeScript', category: 'technical', priority: 'high' },
        { text: 'AWS', category: 'technical', priority: 'high' },
        { text: 'Docker', category: 'technical', priority: 'medium' },
        { text: 'Problem Solving', category: 'soft', priority: 'medium' },
        { text: 'Communication', category: 'soft', priority: 'low' },
        { text: 'DevOps', category: 'industry', priority: 'medium' },
        { text: 'Spearheaded', category: 'action', priority: 'low' },
        { text: 'Orchestrated', category: 'action', priority: 'low' }
    ];

    return {
        scores: mockScores,
        issues: mockIssues,
        keywords: mockKeywords,
        missingKeywords: mockMissingKeywords
    };
};

// Default props
ATSAnalyzer.defaultProps = {
    resumeData: {},
    onFixIssue: () => { },
    onAddKeyword: () => { },
    onOptimize: () => { }
};

export default ATSAnalyzer;