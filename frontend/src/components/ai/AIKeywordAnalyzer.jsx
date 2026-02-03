// ------------------- AIKeywordAnalyzer.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Target, CheckCircle, XCircle, AlertCircle, TrendingUp, Zap, Filter, Copy, Plus, BarChart, Hash, ArrowRight, RefreshCw, X, Star, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

const AIKeywordAnalyzer = ({ resumeData, keywords = [], jobDescription = '', atsScore = 0, onAddKeywords, onClose }) => {
    const [missingKeywords, setMissingKeywords] = useState([]);
    const [keywordDensity, setKeywordDensity] = useState({});
    const [industryKeywords, setIndustryKeywords] = useState([]);
    const [selectedIndustry, setSelectedIndustry] = useState('technology');
    const [activeTab, setActiveTab] = useState('overview');

    const industries = [
        { id: 'technology', name: 'Technology', keywords: ['JavaScript', 'React', 'Node.js', 'AWS', 'Python', 'Machine Learning'] },
        { id: 'finance', name: 'Finance', keywords: ['Risk Management', 'Financial Analysis', 'Excel', 'SQL', 'Compliance'] },
        { id: 'marketing', name: 'Marketing', keywords: ['SEO', 'Content Strategy', 'Social Media', 'Analytics', 'CRM'] },
        { id: 'healthcare', name: 'Healthcare', keywords: ['HIPAA', 'Clinical', 'Patient Care', 'EHR', 'Medical Terminology'] },
    ];

    // AI Keyword Analysis Query
    const keywordAnalysisQuery = useQuery({
        queryKey: ['keyword-analysis', resumeData._id, jobDescription],
        queryFn: async () => {
            const response = await fetch('/api/ai/keywords/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    jobDescription,
                    targetRole: resumeData.targetRole
                })
            });

            if (!response.ok) throw new Error('Failed to analyze keywords');
            return response.json();
        },
        enabled: !!resumeData._id
    });

    // Extract Keywords from JD Mutation
    const extractKeywordsMutation = useMutation({
        mutationFn: async (jd) => {
            const response = await fetch('/api/ai/keywords/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobDescription: jd })
            });

            if (!response.ok) throw new Error('Failed to extract keywords');
            return response.json();
        },
        onSuccess: (data) => {
            setMissingKeywords(data.missingKeywords || []);
            setKeywordDensity(data.density || {});
            toast.success('AI extracted keywords from job description!');
        },
        onError: (error) => {
            toast.error('Failed to extract keywords');
            console.error('Keyword extraction error:', error);
        }
    });

    // Get Industry Keywords Mutation
    const industryKeywordsMutation = useMutation({
        mutationFn: async (industry) => {
            const response = await fetch('/api/ai/keywords/industry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    industry,
                    targetRole: resumeData.targetRole,
                    currentKeywords: keywords
                })
            });

            if (!response.ok) throw new Error('Failed to get industry keywords');
            return response.json();
        },
        onSuccess: (data) => {
            setIndustryKeywords(data.keywords || []);
        },
        onError: (error) => {
            console.error('Industry keywords error:', error);
        }
    });

    useEffect(() => {
        if (jobDescription) {
            extractKeywordsMutation.mutate(jobDescription);
        }

        if (selectedIndustry) {
            industryKeywordsMutation.mutate(selectedIndustry);
        }
    }, [jobDescription, selectedIndustry]);

    const handleAddKeyword = (keyword) => {
        onAddKeywords([keyword]);
        toast.success(`Added "${keyword}" to resume keywords`);
    };

    const handleAddAllMissing = () => {
        onAddKeywords(missingKeywords);
        toast.success(`Added ${missingKeywords.length} keywords to resume`);
    };

    const handleAnalyzeKeywords = () => {
        keywordAnalysisQuery.refetch();
    };

    const KeywordBadge = ({ keyword, status, showDensity = false, onClick }) => {
        const statusColors = {
            high: 'bg-green-100 text-green-800 border-green-200',
            medium: 'bg-blue-100 text-blue-800 border-blue-200',
            low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            none: 'bg-gray-100 text-gray-800 border-gray-200'
        };

        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${statusColors[status.score]} ${onClick ? 'cursor-pointer hover:shadow-sm' : ''}`}
                onClick={() => onClick && onClick(keyword)}
            >
                {status.present ? (
                    <CheckCircle className="w-4 h-4" />
                ) : (
                    <XCircle className="w-4 h-4" />
                )}
                <span className="font-medium">{keyword}</span>
                {showDensity && status.density > 0 && (
                    <span className="text-xs opacity-75">({status.density}x)</span>
                )}
                {!status.present && onClick && (
                    <Plus className="w-3 h-3 ml-1" />
                )}
            </motion.div>
        );
    };

    return (
        <div className="bg-white rounded-2xl">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl">
                            <Search className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">AI Keyword Analyzer</h2>
                            <p className="text-gray-600">Real-time keyword optimization with AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-700">ATS Score</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{atsScore}%</span>
                                    <span className="text-sm text-gray-600">/ 100%</span>
                                </div>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${atsScore}%` }}
                                className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                            />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-700">Keywords Found</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{keywords.length}</span>
                                    <span className="text-sm text-gray-600">total</span>
                                </div>
                            </div>
                            <Hash className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="mt-2 text-sm text-gray-600">In your resume</p>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-700">Missing Keywords</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-gray-900">{missingKeywords.length}</span>
                                    <span className="text-sm text-gray-600">found</span>
                                </div>
                            </div>
                            <AlertCircle className="w-8 h-8 text-amber-600" />
                        </div>
                        <p className="mt-2 text-sm text-gray-600">From job description</p>
                    </div>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <div className="flex px-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        <BarChart className="w-4 h-4 inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('density')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'density' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        <Filter className="w-4 h-4 inline mr-2" />
                        Density Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'suggestions' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                    >
                        <Zap className="w-4 h-4 inline mr-2" />
                        AI Suggestions
                    </button>
                </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Missing Keywords</h3>
                                    <p className="text-gray-600">Keywords from job description not in your resume</p>
                                </div>
                                {missingKeywords.length > 0 && (
                                    <button
                                        onClick={handleAddAllMissing}
                                        disabled={extractKeywordsMutation.isLoading}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add All
                                    </button>
                                )}
                            </div>

                            {extractKeywordsMutation.isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600">AI is extracting keywords...</p>
                                </div>
                            ) : missingKeywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {missingKeywords.map((keyword, idx) => (
                                        <KeywordBadge
                                            key={idx}
                                            keyword={keyword}
                                            status={{ present: false, density: 0, score: 'none' }}
                                            onClick={handleAddKeyword}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">All keywords found! 🎉</h4>
                                    <p className="text-gray-600">Your resume includes all important keywords from the job description.</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Current Keywords</h3>
                            <div className="flex flex-wrap gap-2">
                                {keywords.slice(0, 20).map((keyword, idx) => (
                                    <KeywordBadge
                                        key={idx}
                                        keyword={keyword}
                                        status={{ present: true, density: keywordDensity[keyword] || 1, score: 'high' }}
                                        showDensity={true}
                                    />
                                ))}
                            </div>
                            {keywords.length > 20 && (
                                <p className="mt-2 text-sm text-gray-600">
                                    + {keywords.length - 20} more keywords...
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'density' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Keyword Density Analysis</h3>
                            <p className="text-gray-600 mb-4">AI-analyzed keyword frequency and optimal usage</p>

                            {keywordAnalysisQuery.isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600">AI is analyzing keyword density...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {Object.entries(keywordDensity)
                                        .filter(([_, count]) => count > 0)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 15)
                                        .map(([keyword, count]) => {
                                            const densityScore = Math.min(count * 20, 100);
                                            const status = densityScore > 40 ? 'high' : densityScore > 20 ? 'medium' : 'low';

                                            return (
                                                <div key={keyword} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-900">{keyword}</span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-sm text-gray-600">{count} occurrences</span>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${status === 'high' ? 'bg-green-100 text-green-700' : status === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {status === 'high' ? 'High' : status === 'medium' ? 'Medium' : 'Low'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${densityScore}%` }}
                                                            className={`h-full ${status === 'high' ? 'bg-green-500' : status === 'medium' ? 'bg-blue-500' : 'bg-yellow-500'}`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'suggestions' && (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Industry Keywords</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {industries.map((industry) => (
                                    <button
                                        key={industry.id}
                                        onClick={() => {
                                            setSelectedIndustry(industry.id);
                                            industryKeywordsMutation.mutate(industry.id);
                                        }}
                                        className={`px-4 py-2 rounded-lg transition-colors ${selectedIndustry === industry.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        {industry.name}
                                    </button>
                                ))}
                            </div>

                            {industryKeywordsMutation.isLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-gray-600">AI is fetching industry keywords...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {industryKeywords.map((keyword, idx) => (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-lg border bg-gray-50 border-gray-200 hover:shadow-sm cursor-pointer transition-all"
                                            onClick={() => handleAddKeyword(keyword)}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">{keyword}</span>
                                                <Plus className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                    Industry
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Click to add
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleAnalyzeKeywords}
                        disabled={extractKeywordsMutation.isLoading || keywordAnalysisQuery.isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${extractKeywordsMutation.isLoading ? 'animate-spin' : ''}`} />
                        Re-analyze
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => {
                                const allKeywords = [...missingKeywords, ...industryKeywords];
                                onAddKeywords(allKeywords);
                                toast.success(`Added ${allKeywords.length} keywords to resume`);
                                onClose();
                            }}
                            disabled={extractKeywordsMutation.isLoading}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                        >
                            {extractKeywordsMutation.isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            Apply All Suggestions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIKeywordAnalyzer;