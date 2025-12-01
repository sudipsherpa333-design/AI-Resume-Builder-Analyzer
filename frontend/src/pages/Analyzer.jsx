import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft,
    FaSync,
    FaEdit,
    FaChartBar,
    FaStar,
    FaExclamationTriangle,
    FaCheckCircle,
    FaLightbulb,
    FaDownload,
    FaShare,
    FaClock,
    FaFileAlt,
    FaGraduationCap,
    FaBriefcase,
    FaUser,
    FaCogs
} from 'react-icons/fa';

const Analyzer = () => {
    const navigate = useNavigate();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [resumeData, setResumeData] = useState(null);

    // Load resume data from localStorage
    useEffect(() => {
        const loadResumeData = () => {
            try {
                const savedDraft = localStorage.getItem('resumeDraft');
                if (savedDraft) {
                    const parsed = JSON.parse(savedDraft);
                    setResumeData(parsed.data || parsed);
                }
            } catch (error) {
                console.error('Error loading resume data:', error);
            }
        };

        loadResumeData();
        analyzeResume();
    }, []);

    const analyzeResume = () => {
        setIsAnalyzing(true);

        // Simulate analysis process
        setTimeout(() => {
            const sampleAnalysis = {
                overallScore: 78,
                atsScore: 82,
                wordCount: 487,
                readTime: '2-3 minutes',
                lastAnalyzed: new Date().toLocaleString(),

                sections: {
                    personalInfo: {
                        score: 28,
                        maxScore: 30,
                        status: 'excellent',
                        suggestions: ['Add LinkedIn profile for better networking'],
                        completeness: 95
                    },
                    summary: {
                        score: 16,
                        maxScore: 20,
                        status: 'good',
                        suggestions: ['Add more quantifiable achievements', 'Include industry keywords'],
                        completeness: 80
                    },
                    experience: {
                        score: 22,
                        maxScore: 30,
                        status: 'good',
                        suggestions: ['Add more achievement metrics', 'Include specific technologies used'],
                        completeness: 73
                    },
                    education: {
                        score: 9,
                        maxScore: 10,
                        status: 'excellent',
                        suggestions: [],
                        completeness: 90
                    },
                    skills: {
                        score: 13,
                        maxScore: 15,
                        status: 'good',
                        suggestions: ['Categorize skills by proficiency level'],
                        completeness: 87
                    }
                },

                suggestions: [
                    {
                        type: 'critical',
                        title: 'Add Achievement Metrics',
                        description: 'Include quantifiable results in your experience section to demonstrate impact',
                        priority: 'high',
                        section: 'experience',
                        fix: 'Add numbers, percentages, and specific results to your achievements'
                    },
                    {
                        type: 'improvement',
                        title: 'Enhance Professional Summary',
                        description: 'Make your summary more compelling with action verbs and industry keywords',
                        priority: 'medium',
                        section: 'summary',
                        fix: 'Use strong action verbs and include 3-5 key industry terms'
                    },
                    {
                        type: 'suggestion',
                        title: 'Add LinkedIn Profile',
                        description: 'Include your LinkedIn profile in personal information for better networking',
                        priority: 'low',
                        section: 'personalInfo',
                        fix: 'Add your LinkedIn URL to the personal information section'
                    },
                    {
                        type: 'improvement',
                        title: 'Categorize Skills',
                        description: 'Organize skills by category and proficiency level',
                        priority: 'medium',
                        section: 'skills',
                        fix: 'Group skills into categories like Technical, Soft Skills, Tools, etc.'
                    }
                ],

                strengths: [
                    'Clear and professional contact information',
                    'Well-structured education section',
                    'Good variety of technical skills',
                    'Appropriate resume length',
                    'Clean formatting and organization'
                ],

                industryComparison: {
                    experienceEntries: { current: 3, average: '3-5' },
                    skillsListed: { current: 8, average: '8-12' },
                    summaryLength: { current: 245, average: '150-400' },
                    achievementMetrics: { current: 2, average: '3-5' }
                },

                keywordAnalysis: {
                    missingKeywords: ['leadership', 'management', 'optimization', 'automation'],
                    foundKeywords: ['development', 'javascript', 'react', 'node.js', 'database'],
                    keywordDensity: 'Good'
                }
            };

            setAnalysis(sampleAnalysis);
            setIsAnalyzing(false);
        }, 2500);
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'excellent': return '🟢';
            case 'good': return '🔵';
            case 'average': return '🟡';
            case 'needs-work': return '🔴';
            default: return '⚪';
        }
    };

    const generateReport = () => {
        const report = {
            analysis: analysis,
            resumeData: resumeData,
            generatedAt: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-analysis-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaChartBar className="text-blue-600 text-2xl" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-gray-900 mb-4"
                    >
                        Analyzing Your Resume
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 mb-8"
                    >
                        Our AI is carefully reviewing each section of your resume...
                    </motion.p>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="h-2 bg-blue-200 rounded-full overflow-hidden"
                    >
                        <div className="h-full bg-blue-600 rounded-full" />
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaArrowLeft />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Resume Analyzer
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    AI-powered resume analysis and improvement suggestions
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={generateReport}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <FaDownload />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button
                                onClick={analyzeResume}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaSync />
                                <span className="hidden sm:inline">Re-analyze</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {analysis && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Score Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
                    >
                        {/* Overall Score */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                                <FaChartBar className="text-blue-600 text-xl" />
                            </div>
                            <div className="text-center">
                                <div
                                    className="text-4xl font-bold mb-2"
                                    style={{ color: getScoreColor(analysis.overallScore) }}
                                >
                                    {analysis.overallScore}/100
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                    <div
                                        className="h-3 rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${analysis.overallScore}%`,
                                            backgroundColor: getScoreColor(analysis.overallScore)
                                        }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {analysis.overallScore >= 80 ? 'Excellent! Your resume is well-optimized.' :
                                        analysis.overallScore >= 60 ? 'Good! Some improvements can make it great.' :
                                            'Needs work. Focus on the suggestions below.'}
                                </p>
                            </div>
                        </div>

                        {/* ATS Score */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">ATS Score</h3>
                                <FaCheckCircle className="text-green-600 text-xl" />
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-600 mb-2">
                                    {analysis.atsScore}/100
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                                    <div
                                        className="h-3 rounded-full bg-green-600 transition-all duration-1000"
                                        style={{ width: `${analysis.atsScore}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600">
                                    {analysis.atsScore >= 80 ? 'Excellent ATS compatibility' :
                                        analysis.atsScore >= 60 ? 'Good ATS compatibility' :
                                            'May have issues with ATS systems'}
                                </p>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
                                <FaFileAlt className="text-purple-600 text-xl" />
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Word Count</span>
                                    <span className="font-semibold">{analysis.wordCount}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Read Time</span>
                                    <span className="font-semibold">{analysis.readTime}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Last Analyzed</span>
                                    <span className="font-semibold text-sm">{analysis.lastAnalyzed}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="flex overflow-x-auto mb-8 border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Overview', icon: FaChartBar },
                            { id: 'suggestions', label: 'Suggestions', icon: FaLightbulb },
                            { id: 'sections', label: 'Section Analysis', icon: FaUser },
                            { id: 'comparison', label: 'Industry Comparison', icon: FaBriefcase },
                            { id: 'keywords', label: 'Keyword Analysis', icon: FaCogs }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeTab === 'overview' && (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <OverviewTab analysis={analysis} />
                                </motion.div>
                            )}

                            {activeTab === 'suggestions' && (
                                <motion.div
                                    key="suggestions"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <SuggestionsTab analysis={analysis} />
                                </motion.div>
                            )}

                            {activeTab === 'sections' && (
                                <motion.div
                                    key="sections"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <SectionAnalysisTab analysis={analysis} resumeData={resumeData} />
                                </motion.div>
                            )}

                            {activeTab === 'comparison' && (
                                <motion.div
                                    key="comparison"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <ComparisonTab analysis={analysis} />
                                </motion.div>
                            )}

                            {activeTab === 'keywords' && (
                                <motion.div
                                    key="keywords"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="p-6"
                                >
                                    <KeywordAnalysisTab analysis={analysis} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center gap-4 mt-8"
                    >
                        <button
                            onClick={() => navigate('/builder')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            <FaEdit />
                            Edit Resume
                        </button>
                        <button
                            onClick={() => navigate('/resumes')}
                            className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                        >
                            <FaFileAlt />
                            View All Resumes
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

// Sub-components for each tab
const OverviewTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Resume Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section Scores */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Section Scores</h4>
                {Object.entries(analysis.sections).map(([section, data]) => (
                    <div key={section} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900 capitalize">
                                {section.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-bold text-blue-600">
                                {data.score}/{data.maxScore}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{
                                    width: `${(data.score / data.maxScore) * 100}%`,
                                    backgroundColor:
                                        (data.score / data.maxScore) >= 0.8 ? '#10b981' :
                                            (data.score / data.maxScore) >= 0.6 ? '#3b82f6' :
                                                '#f59e0b'
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">{data.status}</span>
                            <span className="text-sm text-gray-600">{data.completeness}% complete</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Strengths */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-4">Key Strengths</h4>
                <div className="space-y-3">
                    {analysis.strengths.map((strength, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                            <FaCheckCircle className="text-green-600 flex-shrink-0" />
                            <span className="text-sm text-green-800">{strength}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const SuggestionsTab = ({ analysis }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Improvement Suggestions</h3>
            <span className="text-sm text-gray-600">
                {analysis.suggestions.length} suggestions found
            </span>
        </div>

        <div className="space-y-4">
            {analysis.suggestions.map((suggestion, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                >
                    <div className={`p-4 ${suggestion.priority === 'high' ? 'bg-red-50 border-l-4 border-red-500' :
                        suggestion.priority === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                            'bg-blue-50 border-l-4 border-blue-500'
                        }`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                {suggestion.priority === 'high' ? (
                                    <FaExclamationTriangle className="text-red-600 text-lg flex-shrink-0" />
                                ) : suggestion.priority === 'medium' ? (
                                    <FaLightbulb className="text-yellow-600 text-lg flex-shrink-0" />
                                ) : (
                                    <FaCheckCircle className="text-blue-600 text-lg flex-shrink-0" />
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                }`}>
                                {suggestion.priority}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <span>💡 How to fix:</span>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.fix}</p>
                        <div className="mt-2 text-xs text-gray-500">
                            Section: <span className="font-medium capitalize">{suggestion.section}</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

const SectionAnalysisTab = ({ analysis, resumeData }) => (
    <div className="space-y-8">
        <h3 className="text-xl font-bold text-gray-900">Detailed Section Analysis</h3>

        {/* Professional Summary Section */}
        <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <FaFileAlt className="text-blue-600 text-xl" />
                <h4 className="text-lg font-semibold text-gray-900">Professional Summary</h4>
                <span className="ml-auto px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {analysis.sections.summary.score}/{analysis.sections.summary.maxScore}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Summary */}
                <div>
                    <h5 className="font-medium text-gray-900 mb-3">Current Summary</h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[120px]">
                        {resumeData?.professionalSummary ? (
                            <p className="text-gray-700 text-sm leading-relaxed">{resumeData.professionalSummary}</p>
                        ) : (
                            <p className="text-gray-500 text-sm italic">No summary provided</p>
                        )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                        Length: {resumeData?.professionalSummary?.length || 0} characters
                    </div>
                </div>

                {/* Improvement Suggestions */}
                <div>
                    <h5 className="font-medium text-gray-900 mb-3">Improvement Suggestions</h5>
                    <div className="space-y-2">
                        {analysis.sections.summary.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                                <span className="text-yellow-500 mt-0.5">•</span>
                                <span className="text-gray-700">{suggestion}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Education Section */}
        <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
                <FaGraduationCap className="text-green-600 text-xl" />
                <h4 className="text-lg font-semibold text-gray-900">Education</h4>
                <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {analysis.sections.education.score}/{analysis.sections.education.maxScore}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Education */}
                <div>
                    <h5 className="font-medium text-gray-900 mb-3">Education Details</h5>
                    <div className="space-y-3">
                        {resumeData?.education?.length > 0 ? (
                            resumeData.education.map((edu, index) => (
                                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <div className="font-medium text-gray-900">{edu.degree}</div>
                                    <div className="text-sm text-gray-600">{edu.school}</div>
                                    <div className="text-xs text-gray-500">
                                        {edu.startDate} - {edu.endDate || 'Present'}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm italic">No education information provided</p>
                        )}
                    </div>
                </div>

                {/* Education Analysis */}
                <div>
                    <h5 className="font-medium text-gray-900 mb-3">Analysis</h5>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Completeness</span>
                            <span className="font-medium text-green-600">{analysis.sections.education.completeness}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Entries</span>
                            <span className="font-medium text-gray-900">{resumeData?.education?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Status</span>
                            <span className="font-medium text-green-600 capitalize">{analysis.sections.education.status}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Add similar sections for Experience, Skills, etc. */}
    </div>
);

const ComparisonTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Industry Comparison</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Your Resume vs Industry Average</h4>
                {Object.entries(analysis.industryComparison).map(([metric, data]) => (
                    <div key={metric} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 capitalize">
                                {metric.replace(/([A-Z])/g, ' $1')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-blue-600">{data.current}</span>
                            <span className="text-sm text-gray-600">Industry: {data.average}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">💡 Industry Best Practices</h4>
                <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Include 3-5 relevant work experiences with quantifiable achievements</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>List 8-12 skills categorized by proficiency level</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Keep professional summary between 150-400 characters</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Use action verbs and industry-specific keywords throughout</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>Include 3-5 measurable achievements per position</span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
);

const KeywordAnalysisTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Keyword Analysis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Found Keywords */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">✅ Keywords Found</h4>
                <div className="flex flex-wrap gap-2">
                    {analysis.keywordAnalysis.foundKeywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-green-800">Keyword Density:</span>
                        <span className="text-green-700">{analysis.keywordAnalysis.keywordDensity}</span>
                    </div>
                </div>
            </div>

            {/* Missing Keywords */}
            <div className="border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">🔍 Recommended Keywords</h4>
                <div className="flex flex-wrap gap-2">
                    {analysis.keywordAnalysis.missingKeywords.map((keyword, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                        >
                            {keyword}
                        </span>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        Consider adding these industry-relevant keywords to improve ATS compatibility and relevance.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

export default Analyzer;