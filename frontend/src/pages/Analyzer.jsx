import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaFileAlt, FaSearch, FaRobot, FaCheckCircle, FaArrowLeft, FaCloudUploadAlt,
    FaGlobe, FaSpinner, FaHistory, FaRegClock, FaChartLine, FaTrash,
    FaFolderOpen, FaList, FaEdit, FaStar, FaPlus, FaTimes, FaExternalLinkAlt,
    FaCog, FaBolt, FaFilter
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// ==================== MOCK DATA & UTILITIES (enhanced) ====================

// Mock Analysis Report Structure (Used for history and result generation)
const mockAnalysisReport = {
    id: 1,
    title: "Senior Software Engineer Match",
    fileName: "John_Doe_SE_Resume.pdf",
    jobTitle: "Senior Software Engineer (Target)",
    ownerId: 'user_1',
    timestamp: new Date().toISOString(),
    overallScore: 92,
    analysisDetails: [
        { section: 'Keywords Match', score: 95, summary: 'Strong match for "AWS," "Microservices," and "Agile." Found 9/10 key terms.', suggestions: 'None needed. Excellent alignment.' },
        { section: 'Structure & Flow', score: 85, summary: 'Clear and professional layout, but the skills section is placed too high.', suggestions: 'Move the Skills section below the Experience section for better flow.' },
        { section: 'Action Verbs', score: 90, summary: 'Effective use of impact verbs: "Developed," "Launched," and "Optimized." ', suggestions: 'Ensure quantification for all "Managed" bullet points.' },
    ]
};

// Initial history includes some reports for multiple users
const initialHistory = [
    mockAnalysisReport,
    { id: 2, title: "Data Analyst Quick Check", fileName: "Jane_Smith_DA.docx", jobTitle: "Junior Data Analyst", ownerId: 'user_2', timestamp: new Date(Date.now() - 86400000).toISOString(), overallScore: 78, analysisDetails: [] },
    { id: 3, title: "Product Manager Resubmit", fileName: "Alex_PM.pdf", jobTitle: "Product Manager", ownerId: 'user_1', timestamp: new Date(Date.now() - 172800000).toISOString(), overallScore: 88, analysisDetails: [] },
];

// Mock Resume Data (for selection modal) - now with ownerId
const mockResumes = [
    { _id: 'draft_1', title: 'My Current Draft', ownerId: 'user_1', status: 'draft', updatedAt: new Date().toISOString(), analysis: { total: 0 }, data: { personalInfo: { firstName: 'User' }, summary: 'a'.repeat(60) } },
    { _id: 'res_2', title: 'Marketing Manager V2', ownerId: 'user_1', status: 'saved', updatedAt: new Date(Date.now() - 3600000).toISOString(), atsScore: 75, analysis: { total: 75 }, data: { personalInfo: { firstName: 'Jane' } } },
    { _id: 'res_3', title: 'Lead Developer Resume', ownerId: 'user_2', status: 'final', updatedAt: new Date(Date.now() - 7200000).toISOString(), atsScore: 90, analysis: { total: 90 }, data: { personalInfo: { firstName: 'Max' } } },
];

// Utilities
const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-500';
    if (score >= 80) return 'text-yellow-500';
    if (score >= 70) return 'text-orange-500';
    return 'text-red-500';
};

const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return past.toLocaleDateString();
};

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

// ==================== HISTORY LIST COMPONENT ====================

const AnalysisHistoryList = ({ history, searchQuery, onSelectReport, onDeleteReport }) => {
    const filteredHistory = history.filter(report =>
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredHistory.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl">
                    <FaHistory className="text-3xl text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No matching analysis reports found.</p>
                </div>
            ) : (
                filteredHistory.map(report => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition cursor-pointer group"
                        onClick={() => onSelectReport(report)}
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <FaFileAlt className="text-indigo-500 flex-shrink-0" />
                                <div className="font-semibold text-slate-900 truncate">{report.title}</div>
                            </div>
                            <div className="text-sm text-slate-600 truncate italic">vs. {report.jobTitle}</div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <FaRegClock />
                                <span>{formatTimeAgo(report.timestamp)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                            <span className={`text-2xl font-black ${getScoreColor(report.overallScore)}`}>
                                {report.overallScore}%
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteReport(report.id); }}
                                className="text-slate-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50"
                                title="Delete Analysis"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    );
};

// ==================== MAIN ANALYZER COMPONENT (ENHANCED) ====================

const AnalyzerEnhanced = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('my-resumes');
    const [jobTitle, setJobTitle] = useState('');
    const [file, setFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisHistory, setAnalysisHistory] = useState(initialHistory);
    const [searchQuery, setSearchQuery] = useState('');
    const [resumes, setResumes] = useState([]);
    const [selectedResumeIds, setSelectedResumeIds] = useState([]);
    const [urls, setUrls] = useState(['']);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [resumeSearch, setResumeSearch] = useState('');
    const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
    const [analysisDepth, setAnalysisDepth] = useState('standard'); // quick | standard | deep
    const [optimizeFor, setOptimizeFor] = useState('ATS'); // ATS | Recruiter | Both
    const [includeKeywords, setIncludeKeywords] = useState(true);

    // Load user's saved resumes (ONLY user-created)
    useEffect(() => {
        if (isAuthenticated && user) {
            const userResumes = mockResumes.filter(r => r.ownerId === user.id);
            setResumes(userResumes);
        } else {
            setResumes([]);
        }
    }, [isAuthenticated, user]);

    // Find the currently selected resume objects for display
    const selectedResumes = resumes.filter(r => selectedResumeIds.includes(r._id));

    // Handle clicking a history item -> open dashboard with full list of reports
    const handleSelectReport = (report) => {
        // Navigate to a dedicated Resume Analyzer Dashboard to view ALL reports and the selected one
        navigate('/resume-analyzer-dashboard', {
            state: {
                reports: analysisHistory,
                selectedReportId: report.id
            }
        });
    };

    // ==================== Resume Selection Modal ====================
    const ResumeSelectionModal = () => (
        <AnimatePresence>
            {showResumeModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
                    onClick={() => setShowResumeModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.96, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.96, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 bg-indigo-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-indigo-900">Select Resumes for Analysis</h2>
                                    <p className="text-sm text-indigo-800 mt-1">Showing only your created/saved resumes</p>
                                </div>
                                <button
                                    onClick={() => setShowResumeModal(false)}
                                    className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full transition-colors"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="relative mt-4">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title or name..."
                                    value={resumeSearch}
                                    onChange={(e) => setResumeSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Resume List */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            <div className="space-y-4">
                                {resumes
                                    .filter(resume =>
                                        resume.title?.toLowerCase().includes(resumeSearch.toLowerCase()) ||
                                        resume.data?.personalInfo?.firstName?.toLowerCase().includes(resumeSearch.toLowerCase())
                                    )
                                    .map((resumeItem) => {
                                        const isSelected = selectedResumeIds.includes(resumeItem._id);
                                        const score = resumeItem.analysis?.total || resumeItem.atsScore || 0;

                                        return (
                                            <motion.div
                                                key={resumeItem._id}
                                                whileHover={{ scale: 1.01, boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)" }}
                                                onClick={() => {
                                                    // Allow multiple selections
                                                    if (!isSelected) {
                                                        setSelectedResumeIds([...selectedResumeIds, resumeItem._id]);
                                                    } else {
                                                        setSelectedResumeIds(selectedResumeIds.filter(id => id !== resumeItem._id));
                                                    }
                                                }}
                                                className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 shadow-sm flex items-center justify-between ${isSelected
                                                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300'
                                                    : 'border-slate-200 hover:border-indigo-300 bg-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                        {isSelected ? <FaCheckCircle /> : <FaFileAlt />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900">
                                                            {resumeItem.title || 'Untitled Resume'}
                                                        </div>
                                                        <div className="text-sm text-slate-600">
                                                            {resumeItem.data?.personalInfo?.firstName || '—'} • Updated {formatDate(resumeItem.updatedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className={`font-black text-xl ${getScoreColor(score)}`}>
                                                            {score > 0 ? `${score}%` : 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-slate-500">ATS Score</div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/builder/${resumeItem._id}`);
                                                        }}
                                                        className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-100 rounded-full"
                                                        title="Edit in Builder"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                {/* Empty State */}
                                {resumes.length === 0 && (
                                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                                        <FaFileAlt className="text-4xl text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600 mb-4 font-medium">You have no saved resumes. Create one to analyze.</p>
                                        <button
                                            onClick={() => {
                                                setShowResumeModal(false);
                                                navigate('/builder');
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center mx-auto"
                                        >
                                            <FaPlus className="mr-2" /> Start Creating New Resume
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">
                                {selectedResumeIds.length} Resume(s) Selected
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowResumeModal(false)}
                                    className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedResumeIds.length > 0) {
                                            setActiveTab('my-resumes');
                                            setShowResumeModal(false);
                                            toast.success(`Selected ${selectedResumeIds.length} resume(s) for analysis.`);
                                        }
                                    }}
                                    disabled={selectedResumeIds.length === 0}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:bg-indigo-300"
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

    // ==================== Input/Action Handlers ====================

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setActiveTab('upload');
            toast.success(`File selected: ${selectedFile.name}`);
        }
    };

    const handleUrlChange = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
    };

    const addUrlField = () => {
        setUrls([...urls, '']);
    };

    const removeUrlField = (index) => {
        if (urls.length > 1) {
            const newUrls = urls.filter((_, i) => i !== index);
            setUrls(newUrls);
        }
    };

    // Advanced "AI" configuration summary shown to user
    const advancedSummary = () => {
        return `Depth: ${analysisDepth} • Optimize for: ${optimizeFor} • Keywords extraction: ${includeKeywords ? 'on' : 'off'}`;
    };

    // --- CORE AI INTEGRATION & REDIRECT LOGIC (enhanced) ---
    const handleStartAnalysis = useCallback(async () => {
        let selectedCount = 0;

        if (activeTab === 'my-resumes') {
            selectedCount = selectedResumeIds.length;
        } else if (activeTab === 'upload') {
            selectedCount = file ? 1 : 0;
        } else if (activeTab === 'url') {
            selectedCount = urls.filter(url => url.trim()).length;
        }

        if (!jobTitle.trim() || selectedCount === 0) {
            toast.error("Please provide a job description/title and select at least one resume/file.");
            return;
        }

        setIsAnalyzing(true);

        try {
            // Collect Analysis options
            const payload = {
                jobDescription: jobTitle,
                source: activeTab,
                resumeIds: selectedResumeIds.slice(),
                file,
                urls: urls.filter(u => u.trim()),
                options: { depth: analysisDepth, optimizeFor, includeKeywords }
            };

            // --- MOCK AI/Server CALL ---
            // Simulate variable delay based on analysisDepth
            const delay = analysisDepth === 'deep' ? 3500 : analysisDepth === 'standard' ? 2200 : 1200;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Produce a synthetic but dynamic report
            const newReport = {
                id: Date.now(),
                title: `Analysis for ${jobTitle.substring(0, 40)}`,
                fileName: activeTab === 'upload' ? file?.name : (activeTab === 'url' ? 'URL Document(s)' : `${selectedCount} Saved Resume(s)`),
                ownerId: user?.id || 'guest',
                jobTitle: jobTitle.trim(),
                timestamp: new Date().toISOString(),
                overallScore: Math.min(99, Math.max(45, Math.floor(70 + Math.random() * 30 + (analysisDepth === 'deep' ? 3 : 0)))),
                options: payload.options,
                analysisDetails: [
                    { section: 'Keywords Match', score: Math.floor(60 + Math.random() * 40), summary: 'Detected core keywords and synonyms.', suggestions: includeKeywords ? 'Consider adding these missing keywords: cloud, microservices.' : 'Enable keywords extraction for richer suggestions.' },
                    { section: 'Structure & Flow', score: Math.floor(55 + Math.random() * 40), summary: 'Sections are clear but consider ordering improvements.', suggestions: 'Move summary above experience for recruiter readability.' },
                    { section: 'Impact & Metrics', score: Math.floor(50 + Math.random() * 45), summary: 'Limited quantification was detected in some bullets.', suggestions: 'Add numbers (%, $, #) to highlight achievements.' },
                ],
                sourcePayload: payload
            };

            // Save locally (in a real app, server would persist and return the report)
            setAnalysisHistory(prev => [newReport, ...prev]);

            toast.success('AI Analysis complete — opening Analyzer Dashboard...');

            // Redirect to the Resume Analyzer Dashboard and pass the reports
            navigate('/resume-analyzer-dashboard', {
                state: {
                    reports: [newReport, ...analysisHistory],
                    selectedReportId: newReport.id
                }
            });
        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [jobTitle, file, urls, activeTab, selectedResumeIds, analysisDepth, optimizeFor, includeKeywords, navigate, analysisHistory, user]);

    const handleDeleteReport = (id) => {
        setAnalysisHistory(prev => prev.filter(r => r.id !== id));
        toast.success("Analysis report deleted.");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <FaRobot className="text-5xl text-indigo-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-3">Login Required</h2>
                    <p className="text-slate-600 mb-6">Please login to access the Resume Analyzer.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // ==================== RENDER (Input and History only) ====================

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <ResumeSelectionModal />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 transition font-medium"
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3">
                        <FaRobot className="inline mr-3 text-indigo-600" /> Advanced AI Resume Analyzer
                    </h1>
                    <p className="text-slate-600 max-w-3xl mx-auto text-lg">
                        Use AI-powered analysis to optimize your resume for ATS and recruiter review. Choose options for depth, keywords extraction and optimization targets.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                        {/* LEFT COLUMN: Input Section */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Input Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-5 border-b pb-3">
                                    1. Select Resume Source & Target Job
                                </h2>

                                {/* Tabs */}
                                <div className="flex mb-4 border-b border-slate-200">
                                    {['my-resumes', 'upload', 'url'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`flex-1 py-3 text-center text-base font-semibold transition-colors relative ${activeTab === tab
                                                ? 'text-indigo-600 border-b-4 border-indigo-600'
                                                : 'text-slate-600 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                {tab === 'my-resumes' && <FaFolderOpen />}
                                                {tab === 'upload' && <FaCloudUploadAlt />}
                                                {tab === 'url' && <FaGlobe />}
                                                {tab === 'my-resumes' && 'My Resumes'}
                                                {tab === 'upload' && 'Upload File'}
                                                {tab === 'url' && 'URL/Link'}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-4"
                                    >
                                        {activeTab === 'my-resumes' && (
                                            <div className="text-center py-4 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50">
                                                <FaFolderOpen className="text-4xl text-indigo-600 mx-auto mb-4" />
                                                {selectedResumeIds.length === 0 ? (
                                                    <p className="text-slate-700 mb-4 font-medium">
                                                        Select resumes from your saved collection (only your created resumes are shown).
                                                    </p>
                                                ) : (
                                                    <p className="text-green-700 mb-4 font-bold">
                                                        Selected: {selectedResumeIds.length} Resume(s)
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => setShowResumeModal(true)}
                                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center mx-auto shadow-md"
                                                >
                                                    <FaList className="mr-2" /> {selectedResumeIds.length > 0 ? 'Change Selection' : 'Select Resumes'}
                                                </button>
                                            </div>
                                        )}
                                        {activeTab === 'upload' && (
                                            <div className="text-center py-4">
                                                <label className="cursor-pointer block p-6 border-2 border-dashed border-indigo-400 rounded-xl hover:border-indigo-600 transition-colors bg-slate-50">
                                                    <FaCloudUploadAlt className="mx-auto text-4xl text-indigo-500 mb-2" />
                                                    <p className="text-sm font-medium text-indigo-700">
                                                        {file ? `Selected: ${file.name}` : "Click to upload Resume (PDF/DOCX, Max 5MB)"}
                                                    </p>
                                                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                                                </label>
                                            </div>
                                        )}
                                        {activeTab === 'url' && (
                                            <div className="space-y-3">
                                                {urls.map((url, index) => (
                                                    <div key={index} className="flex gap-2 items-center">
                                                        <input
                                                            type="url"
                                                            value={url}
                                                            onChange={(e) => handleUrlChange(index, e.target.value)}
                                                            placeholder="Resume URL (e.g., Google Drive/Dropbox/External Link)"
                                                            className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                                        />
                                                        {urls.length > 1 && (
                                                            <button
                                                                onClick={() => removeUrlField(index)}
                                                                className="p-3 text-red-500 hover:text-red-700 transition"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={addUrlField}
                                                    className="w-full py-2 border border-dashed border-indigo-400 text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center justify-center font-medium"
                                                >
                                                    <FaPlus className="mr-2" /> Add Another URL
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                <div className="mt-8">
                                    <label className="block text-base font-semibold text-slate-700 mb-2">2. Paste Target Job Description</label>
                                    <textarea
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        rows="6"
                                        placeholder="Paste the full job description or detailed title here (e.g., Senior Node.js Developer at TechCorp...)"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm resize-none"
                                        required
                                    />
                                </div>

                                {/* Advanced Options */}
                                <div className="mt-4 border-t pt-4 flex items-center justify-between">
                                    <div className="text-sm text-slate-700">
                                        <div className="font-medium">Analysis options</div>
                                        <div className="text-xs text-slate-500">{advancedSummary()}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setAdvancedOptionsOpen(v => !v)} className="px-3 py-2 border rounded-lg bg-white hover:bg-slate-50">
                                            <FaCog className="inline mr-2" /> Options
                                        </button>
                                        <button onClick={() => { setJobTitle(''); setSelectedResumeIds([]); setFile(null); toast('Inputs cleared'); }} className="px-3 py-2 border rounded-lg bg-white hover:bg-slate-50">
                                            Clear
                                        </button>
                                    </div>
                                </div>

                                {/* Advanced options panel */}
                                <AnimatePresence>
                                    {advancedOptionsOpen && (
                                        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <label className="text-sm font-semibold">Analysis Depth</label>
                                                    <select value={analysisDepth} onChange={(e) => setAnalysisDepth(e.target.value)} className="w-full mt-2 p-2 border rounded-lg">
                                                        <option value="quick">Quick (fast)</option>
                                                        <option value="standard">Standard</option>
                                                        <option value="deep">Deep (more suggestions)</option>
                                                    </select>
                                                    <div className="text-xs text-slate-500 mt-1">Deeper analyzes take longer but produce richer suggestions.</div>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold">Optimize For</label>
                                                    <select value={optimizeFor} onChange={(e) => setOptimizeFor(e.target.value)} className="w-full mt-2 p-2 border rounded-lg">
                                                        <option value="ATS">ATS</option>
                                                        <option value="Recruiter">Recruiter</option>
                                                        <option value="Both">Both</option>
                                                    </select>
                                                    <div className="text-xs text-slate-500 mt-1">Choose target audience for suggestions and scoring.</div>
                                                </div>

                                                <div>
                                                    <label className="text-sm font-semibold">Keywords Extraction</label>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <button onClick={() => setIncludeKeywords(true)} className={`px-3 py-1 rounded-lg ${includeKeywords ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>On</button>
                                                        <button onClick={() => setIncludeKeywords(false)} className={`px-3 py-1 rounded-lg ${!includeKeywords ? 'bg-indigo-600 text-white' : 'bg-white border'}`}>Off</button>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">Extract job keywords to suggest targeted additions.</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    onClick={handleStartAnalysis}
                                    disabled={isAnalyzing || !jobTitle.trim() || (activeTab === 'my-resumes' && selectedResumeIds.length === 0) || (activeTab === 'upload' && !file) || (activeTab === 'url' && urls.filter(url => url.trim()).length === 0)}
                                    whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                                    whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                                    className={`w-full mt-6 flex items-center justify-center py-4 px-4 rounded-xl text-lg font-bold transition-all shadow-lg ${isAnalyzing
                                        ? 'bg-indigo-400 text-white cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/50'
                                        }`}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <FaSpinner className="animate-spin mr-3" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <FaChartLine className="mr-3" />
                                            Start AI Analysis
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: History Section */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sticky top-20">
                                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2 border-b pb-3">
                                    <FaHistory className="text-indigo-600" /> Recent Analyses
                                </h2>

                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-3 pl-10 border border-slate-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 shadow-inner"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="text-sm text-slate-600">Showing latest analyses</div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => navigate('/resume-analyzer-dashboard', { state: { reports: analysisHistory } })} className="text-sm px-3 py-1 border rounded-lg bg-white hover:bg-slate-50">
                                            <FaExternalLinkAlt className="inline mr-2" /> Open Dashboard
                                        </button>
                                        <button onClick={() => { setAnalysisHistory(initialHistory); toast('Reset history (demo)'); }} className="text-sm px-3 py-1 border rounded-lg bg-white hover:bg-slate-50">
                                            <FaHistory className="inline mr-2" /> Reset
                                        </button>
                                    </div>
                                </div>

                                <AnalysisHistoryList
                                    history={analysisHistory}
                                    searchQuery={searchQuery}
                                    onSelectReport={handleSelectReport}
                                    onDeleteReport={handleDeleteReport}
                                />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AnalyzerEnhanced;