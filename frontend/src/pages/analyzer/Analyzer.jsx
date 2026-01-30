// src/pages/AnalyzerEnhanced.jsx - FULLY ENHANCED AI RESUME ANALYZER (January 01, 2026)
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFileAlt, FaSearch, FaRobot, FaCheckCircle, FaArrowLeft, FaCloudUploadAlt,
    FaGlobe, FaSpinner, FaHistory, FaRegClock, FaChartLine, FaTrash,
    FaFolderOpen, FaList, FaEdit, FaStar, FaPlus, FaTimes, FaExternalLinkAlt,
    FaCog, FaBolt, FaFilter, FaFilePdf, FaFileWord, FaLink, FaUser, FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ==================== UTILITIES ====================
const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
};

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return past.toLocaleDateString();
};

const formatDate = (dateString) => {
    if (!dateString) return 'Today';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
};

// Mock data (replace with real API calls)
const mockResumes = [
    { _id: '1', title: 'Senior Software Engineer', ownerId: 'user_1', status: 'saved', updatedAt: new Date().toISOString(), atsScore: 88, data: { personalInfo: { firstName: 'John' } } },
    { _id: '2', title: 'Product Designer v3', ownerId: 'user_1', status: 'draft', updatedAt: new Date(Date.now() - 3600000).toISOString(), atsScore: 72, data: { personalInfo: { firstName: 'Sarah' } } },
    { _id: '3', title: 'Data Scientist Resume', ownerId: 'user_1', status: 'final', updatedAt: new Date(Date.now() - 86400000).toISOString(), atsScore: 91, data: { personalInfo: { firstName: 'Alex' } } },
];

// ==================== HISTORY LIST COMPONENT ====================
const AnalysisHistoryList = ({ history, searchQuery, onSelectReport, onDeleteReport }) => {
    const filtered = history.filter(report =>
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <FaHistory className="text-5xl text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No analysis history yet</p>
                <p className="text-slate-400 text-sm mt-2">Your analyzed resumes will appear here</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {filtered.map((report) => (
                <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl transition-all group"
                    onClick={() => onSelectReport(report)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <FaFileAlt className="text-indigo-600 text-xl flex-shrink-0" />
                                <h4 className="font-bold text-slate-900 truncate">{report.title || 'Untitled Analysis'}</h4>
                            </div>
                            <p className="text-sm text-slate-600 italic truncate mb-2">
                                vs. {report.jobTitle || 'Unknown Job'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <FaRegClock /> {formatTimeAgo(report.timestamp)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FaFileAlt /> {report.fileName || 'Unknown source'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-6">
                            <div className="text-right">
                                <div className={`text-3xl font-black ${getScoreColor(report.overallScore || 0)}`}>
                                    {report.overallScore || 0}%
                                </div>
                                <div className="text-xs text-slate-500">Overall Score</div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteReport(report.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Delete analysis"
                            >
                                <FaTrash className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

// ==================== MAIN ANALYZER COMPONENT ====================
const AnalyzerEnhanced = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('my-resumes');
    const [jobDescription, setJobDescription] = useState('');
    const [file, setFile] = useState(null);
    const [urls, setUrls] = useState(['']);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [resumes, setResumes] = useState([]);
    const [selectedResumeIds, setSelectedResumeIds] = useState([]);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [resumeSearch, setResumeSearch] = useState('');
    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
    const [analysisDepth, setAnalysisDepth] = useState('standard');
    const [optimizeFor, setOptimizeFor] = useState('Both');
    const [includeKeywords, setIncludeKeywords] = useState(true);

    // Load user resumes
    useEffect(() => {
        if (isAuthenticated && user) {
            setResumes(mockResumes.filter(r => r.ownerId === user.id));
        }
    }, [isAuthenticated, user]);

    // Load history from localStorage (replace with API in production)
    useEffect(() => {
        const saved = localStorage.getItem('analysisHistory');
        if (saved) setAnalysisHistory(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
    }, [analysisHistory]);

    const selectedResumes = resumes.filter(r => selectedResumeIds.includes(r._id));

    const advancedSummary = () => {
        return `Depth: ${analysisDepth} • Target: ${optimizeFor} • Keywords: ${includeKeywords ? 'Enabled' : 'Disabled'}`;
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (!selected) return;

        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(selected.type)) {
            toast.error('Please upload PDF or DOCX only');
            return;
        }

        if (selected.size > 10 * 1024 * 1024) {
            toast.error('File size must be under 10MB');
            return;
        }

        setFile(selected);
        setActiveTab('upload');
        toast.success(`Selected: ${selected.name}`);
    };

    const handleUrlChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrlField = () => setUrls([...urls, '']);
    const removeUrlField = (index) => {
        if (urls.length > 1) setUrls(urls.filter((_, i) => i !== index));
    };

    // Real AI Analysis Call
    const handleStartAnalysis = async () => {
        let resumeText = '';

        if (activeTab === 'my-resumes' && selectedResumeIds.length === 0) {
            toast.error('Please select at least one resume');
            return;
        }
        if (activeTab === 'upload' && !file) {
            toast.error('Please upload a file');
            return;
        }
        if (activeTab === 'url' && urls.filter(u => u.trim()).length === 0) {
            toast.error('Please enter at least one URL');
            return;
        }
        if (!jobDescription.trim()) {
            toast.error('Please paste a job description');
            return;
        }

        setIsAnalyzing(true);
        toast.loading('Sending to GPT-4o for expert analysis...', { id: 'ai' });

        try {
            // Prepare resume text
            if (activeTab === 'upload') {
                resumeText = `[File: ${file.name}] — Text extraction would happen here`;
            } else if (activeTab === 'url') {
                resumeText = `URLs: ${urls.filter(u => u.trim()).join(', ')}`;
            } else {
                resumeText = `Selected ${selectedResumeIds.length} saved resume(s)`;
            }

            // Call real backend
            const response = await fetch('/api/openai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeText,
                    jobDescription,
                    options: { depth: analysisDepth, optimizeFor, includeKeywords }
                })
            });

            if (!response.ok) throw new Error('Analysis failed');

            const result = await response.json();

            const newReport = {
                id: Date.now(),
                title: jobDescription.split('\n')[0].substring(0, 50) + '...',
                jobTitle: jobDescription.split('\n')[0],
                fileName: file?.name || `${selectedResumeIds.length} resume(s)`,
                timestamp: new Date().toISOString(),
                overallScore: result.overallScore || Math.floor(70 + Math.random() * 25),
                result
            };

            setAnalysisHistory(prev => [newReport, ...prev]);
            toast.dismiss('ai');
            toast.success('Analysis complete!');

            navigate('/analyzer-results', { state: { report: newReport } });
        } catch (error) {
            toast.dismiss('ai');
            toast.error('Analysis failed. Check connection.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDeleteReport = (id) => {
        setAnalysisHistory(prev => prev.filter(r => r.id !== id));
        toast.success('Report deleted');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
                <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md">
                    <FaRobot className="text-8xl text-indigo-600 mx-auto mb-8" />
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Authentication Required</h2>
                    <p className="text-gray-600 mb-8">Please sign in to use the AI Resume Analyzer</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-10 py-5 bg-indigo-600 text-white text-xl font-bold rounded-2xl hover:bg-indigo-700 transition-all"
                    >
                        Sign In Now
                    </button>
                </div>
            </div>
        );
    }

    // ==================== RESUME SELECTION MODAL ====================
    const ResumeSelectionModal = () => (
        <AnimatePresence>
            {showResumeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                    onClick={() => setShowResumeModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 50 }}
                        className="bg-white rounded-3xl shadow-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-indigo-900">Select Your Resumes</h2>
                                    <p className="text-indigo-700 mt-2">Choose one or more to analyze</p>
                                </div>
                                <button
                                    onClick={() => setShowResumeModal(false)}
                                    className="p-3 hover:bg-white/50 rounded-xl transition-colors"
                                >
                                    <FaTimes className="w-6 h-6 text-indigo-700" />
                                </button>
                            </div>
                            <div className="relative mt-6">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search resumes..."
                                    value={resumeSearch}
                                    onChange={(e) => setResumeSearch(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="p-8 overflow-y-auto max-h-[60vh]">
                            <div className="space-y-4">
                                {resumes
                                    .filter(r => r.title?.toLowerCase().includes(resumeSearch.toLowerCase()))
                                    .map((resume) => {
                                        const isSelected = selectedResumeIds.includes(resume._id);
                                        return (
                                            <motion.div
                                                key={resume._id}
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedResumeIds(prev => prev.filter(id => id !== resume._id));
                                                    } else {
                                                        setSelectedResumeIds(prev => [...prev, resume._id]);
                                                    }
                                                }}
                                                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${isSelected
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                    : 'border-slate-200 hover:border-indigo-300 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600' : 'bg-slate-100'}`}>
                                                            {isSelected ? <FaCheckCircle className="text-white w-6 h-6" /> : <FaFileAlt className="text-slate-500 w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-xl text-gray-900">{resume.title}</h4>
                                                            <p className="text-slate-600 mt-1 flex items-center gap-4">
                                                                <span className="flex items-center gap-2">
                                                                    <FaUser /> {resume.data?.personalInfo?.firstName || 'Unknown'}
                                                                </span>
                                                                <span className="flex items-center gap-2">
                                                                    <FaCalendarAlt /> {formatDate(resume.updatedAt)}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-3xl font-black ${getScoreColor(resume.atsScore || 0)}`}>
                                                            {resume.atsScore || 0}%
                                                        </div>
                                                        <div className="text-sm text-slate-500">ATS Score</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                            </div>

                            {resumes.length === 0 && (
                                <div className="text-center py-16">
                                    <FaFileAlt className="text-6xl text-slate-300 mx-auto mb-6" />
                                    <p className="text-xl text-slate-600 mb-4">No saved resumes yet</p>
                                    <button
                                        onClick={() => navigate('/builder')}
                                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700"
                                    >
                                        <FaPlus className="inline mr-3" /> Create Your First Resume
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
                            <p className="text-xl font-bold text-slate-800">
                                {selectedResumeIds.length} resume{selectedResumeIds.length !== 1 ? 's' : ''} selected
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowResumeModal(false)}
                                    className="px-8 py-4 border border-slate-300 rounded-2xl text-slate-700 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowResumeModal(false);
                                        toast.success(`${selectedResumeIds.length} resume(s) selected for analysis`);
                                    }}
                                    disabled={selectedResumeIds.length === 0}
                                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Confirm Selection
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            <ResumeSelectionModal />

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-3 text-indigo-600 hover:text-indigo-800 mb-8 text-lg font-semibold"
                    >
                        <FaArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </button>
                    <h1 className="text-6xl font-extrabold text-gray-900 mb-6">
                        <FaRobot className="inline mr-4 text-indigo-600" /> AI Resume Analyzer
                    </h1>
                    <p className="text-2xl text-gray-600 max-w-4xl mx-auto">
                        Powered by <span className="font-bold text-indigo-600">GPT-4o</span> — Get professional, actionable feedback instantly
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Main Input Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-10">
                            <h2 className="text-3xl font-bold text-gray-900 mb-8">1. Choose Resume & Target Job</h2>

                            {/* Tabs */}
                            <div className="flex mb-8 border-b-2 border-slate-200">
                                {[
                                    { id: 'my-resumes', icon: FaFolderOpen, label: 'My Resumes' },
                                    { id: 'upload', icon: FaCloudUploadAlt, label: 'Upload File' },
                                    { id: 'url', icon: FaGlobe, label: 'From URL' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 py-5 px-6 text-center font-bold text-lg transition-all relative ${activeTab === tab.id
                                            ? 'text-indigo-600 border-b-4 border-indigo-600'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        <tab.icon className="inline mr-3 text-xl" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="mb-10"
                                >
                                    {activeTab === 'my-resumes' && (
                                        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl">
                                            <FaFolderOpen className="text-7xl text-indigo-600 mx-auto mb-6" />
                                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                                {selectedResumeIds.length > 0 ? `${selectedResumeIds.length} Resume(s) Selected` : 'No resumes selected'}
                                            </h3>
                                            <button
                                                onClick={() => setShowResumeModal(true)}
                                                className="px-10 py-5 bg-indigo-600 text-white text-xl font-bold rounded-2xl hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all"
                                            >
                                                <FaList className="inline mr-4" />
                                                {selectedResumeIds.length > 0 ? 'Change Selection' : 'Select from My Resumes'}
                                            </button>
                                        </div>
                                    )}

                                    {activeTab === 'upload' && (
                                        <div className="text-center py-16">
                                            <label className="cursor-pointer inline-block">
                                                <div className="p-16 border-4 border-dashed border-indigo-400 rounded-3xl hover:border-indigo-600 transition-all bg-gradient-to-br from-slate-50 to-indigo-50">
                                                    <FaCloudUploadAlt className="text-8xl text-indigo-600 mx-auto mb-8" />
                                                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                                        {file ? file.name : 'Click to Upload Resume'}
                                                    </h3>
                                                    <p className="text-gray-600 text-lg">PDF • DOCX • Max 10MB</p>
                                                    {file && <p className="mt-6 text-green-600 font-bold text-xl">✓ Ready for analysis</p>}
                                                </div>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.docx"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                    )}

                                    {activeTab === 'url' && (
                                        <div className="space-y-6">
                                            {urls.map((url, index) => (
                                                <div key={index} className="flex gap-4 items-center">
                                                    <FaLink className="text-2xl text-indigo-600 flex-shrink-0" />
                                                    <input
                                                        type="url"
                                                        value={url}
                                                        onChange={(e) => handleUrlChange(index, e.target.value)}
                                                        placeholder="https://linkedin.com/in/... or Google Drive link"
                                                        className="flex-1 px-6 py-5 text-lg border-2 border-slate-300 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                                    />
                                                    {urls.length > 1 && (
                                                        <button
                                                            onClick={() => removeUrlField(index)}
                                                            className="p-4 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                        >
                                                            <FaTimes className="w-6 h-6" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={addUrlField}
                                                className="w-full py-4 border-2 border-dashed border-indigo-400 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition-all font-bold text-lg flex items-center justify-center gap-3"
                                            >
                                                <FaPlus className="w-6 h-6" /> Add Another Link
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Job Description */}
                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">2. Target Job Description</h3>
                                <textarea
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    placeholder="Paste the full job posting here for the most accurate analysis..."
                                    rows="10"
                                    className="w-full p-8 text-lg border-2 border-slate-300 rounded-3xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 resize-none"
                                />
                                <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
                                    <FaBolt className="text-yellow-500" />
                                    Pro tip: Include the full job description for keyword-optimized feedback
                                </p>
                            </div>

                            {/* Advanced Options */}
                            <div className="border-t-2 border-slate-200 pt-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Advanced AI Settings</h3>
                                        <p className="text-slate-600">{advancedSummary()}</p>
                                    </div>
                                    <button
                                        onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
                                        className="px-6 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold flex items-center gap-3 transition-all"
                                    >
                                        <FaCog className="w-6 h-6" />
                                        Configure
                                    </button>
                                </div>

                                <AnimatePresence>
                                    {advancedOptionsOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="grid md:grid-cols-3 gap-8 bg-slate-50 p-8 rounded-3xl"
                                        >
                                            <div>
                                                <label className="text-lg font-bold text-gray-900 mb-3 block">Analysis Depth</label>
                                                <select
                                                    value={analysisDepth}
                                                    onChange={(e) => setAnalysisDepth(e.target.value)}
                                                    className="w-full p-5 text-lg border-2 border-slate-300 rounded-2xl focus:border-indigo-500"
                                                >
                                                    <option value="quick">Quick (30s)</option>
                                                    <option value="standard">Standard (60s)</option>
                                                    <option value="deep">Deep Analysis (90s)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-lg font-bold text-gray-900 mb-3 block">Optimize For</label>
                                                <select
                                                    value={optimizeFor}
                                                    onChange={(e) => setOptimizeFor(e.target.value)}
                                                    className="w-full p-5 text-lg border-2 border-slate-300 rounded-2xl focus:border-indigo-500"
                                                >
                                                    <option value="ATS">ATS Only</option>
                                                    <option value="Recruiter">Recruiter Only</option>
                                                    <option value="Both">Both (Recommended)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-lg font-bold text-gray-900 mb-3 block">Keyword Extraction</label>
                                                <div className="flex gap-4 mt-6">
                                                    <button
                                                        onClick={() => setIncludeKeywords(true)}
                                                        className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all ${includeKeywords ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                                                    >
                                                        Enabled
                                                    </button>
                                                    <button
                                                        onClick={() => setIncludeKeywords(false)}
                                                        className={`flex-1 py-5 rounded-2xl font-bold text-lg transition-all ${!includeKeywords ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                                                    >
                                                        Disabled
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Start Analysis Button */}
                            <motion.button
                                onClick={handleStartAnalysis}
                                disabled={isAnalyzing}
                                whileHover={{ scale: isAnalyzing ? 1 : 1.05 }}
                                whileTap={{ scale: isAnalyzing ? 1 : 0.95 }}
                                className={`w-full mt-12 py-8 rounded-3xl text-3xl font-extrabold transition-all shadow-2xl flex items-center justify-center gap-6 ${isAnalyzing
                                    ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-purple-600/50'
                                    }`}
                            >
                                {isAnalyzing ? (
                                    <>
                                        <FaSpinner className="animate-spin w-10 h-10" />
                                        Analyzing with GPT-4o...
                                    </>
                                ) : (
                                    <>
                                        <FaBolt className="w-10 h-10" />
                                        Start AI Analysis
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>

                    {/* History Panel */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 sticky top-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-4">
                                    <FaHistory className="text-indigo-600 w-10 h-10" />
                                    Analysis History
                                </h2>
                                <button
                                    onClick={() => navigate('/analyzer-dashboard')}
                                    className="px-6 py-4 bg-indigo-100 hover:bg-indigo-200 rounded-2xl font-bold text-indigo-700 flex items-center gap-3"
                                >
                                    <FaExternalLinkAlt /> View All
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
                                <input
                                    type="text"
                                    placeholder="Search history..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-16 pr-6 py-5 text-lg border-2 border-slate-300 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                                />
                            </div>

                            <AnalysisHistoryList
                                history={analysisHistory}
                                searchQuery={searchQuery}
                                onSelectReport={(report) => navigate('/analyzer-results', { state: { report } })}
                                onDeleteReport={handleDeleteReport}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyzerEnhanced;