// src/pages/analyzer/AIAnalyzerEnhanced.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Icons - Consolidated (FaTarget removed - replaced with FaBullseye)
import {
  FaRobot, FaFileAlt, FaCheckCircle, FaSpinner, FaArrowLeft,
  FaHistory, FaPlus, FaTimes, FaClock, FaChartLine, FaSearch,
  FaCloudUploadAlt, FaGlobe, FaRegClock, FaTrash, FaFolderOpen,
  FaList, FaEdit, FaStar, FaExternalLinkAlt, FaCog, FaBolt,
  FaFilter, FaFilePdf, FaFileWord, FaLink, FaUser, FaCalendarAlt,
  FaAngleDown, FaAngleUp, FaRegCopy, FaDownload, FaShareAlt,
  FaLightbulb, FaBullseye, FaBalanceScale, FaMagic, FaCrown
} from 'react-icons/fa';

// Context & Hooks
import { useAuth } from '../../context/AuthContext';
import { useResume } from '../../context/ResumeContext';
import useAIAnalyzer from '../../hooks/useAIAnalyzer';

// Components
import AIAnalysisReport from './AIAnalysisReport';

// ==================== UTILITIES ====================
const getScoreColor = (score) => {
  if (score >= 90) return 'text-emerald-500';
  if (score >= 80) return 'text-green-500';
  if (score >= 70) return 'text-yellow-500';
  if (score >= 60) return 'text-orange-500';
  return 'text-red-500';
};

const getScoreGradient = (score) => {
  if (score >= 90) return 'from-emerald-500 to-green-500';
  if (score >= 80) return 'from-green-500 to-lime-500';
  if (score >= 70) return 'from-yellow-500 to-amber-500';
  if (score >= 60) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-rose-500';
};

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Just now';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ==================== HISTORY COMPONENT ====================
const AnalysisHistoryList = ({ history, searchQuery, onSelect, onDelete, onViewAll }) => {
  const filtered = history.filter(report =>
    report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaHistory className="text-2xl text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Recent Analyses</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2"
        >
          View All <FaExternalLinkAlt />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
          <FaClock className="text-5xl text-blue-300 mx-auto mb-4" />
          <p className="text-gray-600">No analysis history yet</p>
          <p className="text-gray-500 text-sm mt-2">Your first analysis will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {filtered.slice(0, 5).map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => onSelect(report)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FaFileAlt className="text-blue-600 flex-shrink-0" />
                    <h4 className="font-semibold text-gray-900 truncate">
                      {report.title || 'Untitled Analysis'}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    vs. {report.jobTitle || 'Unknown Job'}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaClock /> {formatTimeAgo(report.timestamp)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaChartLine /> Score: {report.overallScore || 0}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-black ${getScoreColor(report.overallScore || 0)}`}>
                    {report.overallScore || 0}%
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(report.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete analysis"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== RESUME SELECTION MODAL ====================
const ResumeSelectionModal = ({ isOpen, onClose, resumes, selectedIds, onSelect, search, onSearch }) => {
  const filteredResumes = resumes.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.personalInfo?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Select Resumes to Analyze</h2>
                  <p className="text-blue-100">Choose one or more resumes for analysis</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="relative mt-4">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300" />
                <input
                  type="text"
                  placeholder="Search resumes..."
                  value={search}
                  onChange={(e) => onSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            {/* List */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="space-y-3">
                {filteredResumes.map((resume) => {
                  const isSelected = selectedIds.includes(resume._id);
                  return (
                    <motion.div
                      key={resume._id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => onSelect(resume._id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-600' : 'bg-gray-100'}`}>
                            {isSelected ? <FaCheckCircle className="text-white" /> : <FaFileAlt className="text-gray-600" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{resume.title}</h4>
                            <p className="text-sm text-gray-600">
                              {resume.personalInfo?.name || 'No name'} • Updated {formatTimeAgo(resume.updatedAt)}
                            </p>
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(resume.atsScore || 0)}`}>
                          {resume.atsScore || 0}%
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {resumes.length === 0 && (
                <div className="text-center py-12">
                  <FaFileAlt className="text-5xl text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-4">No saved resumes found</p>
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/builder';
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    <FaPlus className="inline mr-2" /> Create Your First Resume
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
              <p className="font-semibold text-gray-900">
                {selectedIds.length} resume{selectedIds.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (selectedIds.length > 0) {
                      toast.success(`${selectedIds.length} resume(s) selected`);
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ==================== MAIN COMPONENT ====================
const AIAnalyzerEnhanced = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { resumes } = useResume();
  const { analyzeResumeVsJob, isAnalyzing } = useAIAnalyzer();

  // State
  const [activeTab, setActiveTab] = useState('my-resumes');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState(null);
  const [urls, setUrls] = useState(['']);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResumeIds, setSelectedResumeIds] = useState([]);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeSearch, setResumeSearch] = useState('');
  const [advancedOptions, setAdvancedOptions] = useState({
    depth: 'standard',
    optimizeFor: 'both',
    includeKeywords: true,
    showSuggestions: true,
    compareMode: 'detailed'
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeView, setActiveView] = useState('input'); // input, report, history

  // Initialize
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Load history
    const saved = localStorage.getItem('aiAnalysisHistory');
    if (saved) {
      try {
        setAnalysisHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }
  }, [isAuthenticated, navigate]);

  // Save history
  useEffect(() => {
    localStorage.setItem('aiAnalysisHistory', JSON.stringify(analysisHistory));
  }, [analysisHistory]);

  // Handlers
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
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const handleStartAnalysis = async () => {
    // Validation
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

    try {
      let resumeData;

      if (activeTab === 'my-resumes') {
        const selectedResumes = resumes.filter(r => selectedResumeIds.includes(r._id));
        resumeData = selectedResumes[0]; // For now, analyze first selected
      }

      const result = await analyzeResumeVsJob(resumeData, jobDescription, advancedOptions);

      if (result) {
        const newReport = {
          id: Date.now(),
          title: `Analysis: ${jobDescription.split('\n')[0].substring(0, 30)}...`,
          jobTitle: jobDescription.split('\n')[0] || 'Unknown Job',
          fileName: file?.name || `${selectedResumeIds.length} resume(s)`,
          timestamp: new Date().toISOString(),
          overallScore: result.jobFitScore?.overallScore || 0,
          resumeData,
          jobDescription,
          analysis: result,
          options: advancedOptions
        };

        setAnalysisHistory(prev => [newReport, ...prev.slice(0, 49)]);
        setAnalysisResult(newReport);
        setActiveView('report');
        toast.success('Analysis complete!');
      }
    } catch (error) {
      toast.error(error.message || 'Analysis failed');
      console.error('Analysis error:', error);
    }
  };

  const handleLoadFromHistory = (report) => {
    setAnalysisResult(report);
    setActiveView('report');
  };

  const handleDeleteReport = (id) => {
    setAnalysisHistory(prev => prev.filter(r => r.id !== id));
    toast.success('Report deleted');
  };

  const selectedResumes = resumes.filter(r => selectedResumeIds.includes(r._id));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center p-12 bg-white rounded-3xl shadow-2xl max-w-md">
          <FaRobot className="text-7xl text-blue-600 mx-auto mb-8" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8">Sign in to access the AI Resume Analyzer</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-xl hover:shadow-lg transition"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Resume Selection Modal */}
      <ResumeSelectionModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        resumes={resumes}
        selectedIds={selectedResumeIds}
        onSelect={(id) => {
          setSelectedResumeIds(prev =>
            prev.includes(id)
              ? prev.filter(i => i !== id)
              : [...prev, id]
          );
        }}
        search={resumeSearch}
        onSearch={setResumeSearch}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-blue-100 hover:text-white mb-4"
              >
                <FaArrowLeft /> Back to Dashboard
              </button>
              <h1 className="text-4xl md:text-5xl font-bold mb-2 flex items-center gap-4">
                <FaRobot className="text-5xl" /> AI Resume Analyzer
              </h1>
              <p className="text-xl text-blue-100">
                Professional resume analysis powered by advanced AI
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-sm text-blue-200">Average Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Input */}
          <div className="lg:col-span-2 space-y-8">
            {activeView === 'input' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Input Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Analyze Your Resume</h2>

                  {/* Tabs */}
                  <div className="flex mb-8 border-b border-gray-200">
                    {[
                      { id: 'my-resumes', icon: FaFolderOpen, label: 'My Resumes' },
                      { id: 'upload', icon: FaCloudUploadAlt, label: 'Upload File' },
                      { id: 'url', icon: FaGlobe, label: 'From URL' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 px-6 text-center font-semibold text-lg transition-all ${activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <tab.icon className="inline mr-3" /> {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="mb-8">
                    {activeTab === 'my-resumes' && (
                      <div className="text-center p-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                        <FaFolderOpen className="text-6xl text-blue-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">
                          {selectedResumeIds.length > 0
                            ? `${selectedResumeIds.length} Resume(s) Selected`
                            : 'No Resumes Selected'}
                        </h3>
                        <button
                          onClick={() => setShowResumeModal(true)}
                          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition flex items-center gap-3 mx-auto"
                        >
                          <FaList /> {selectedResumeIds.length > 0 ? 'Change Selection' : 'Select Resumes'}
                        </button>
                      </div>
                    )}

                    {activeTab === 'upload' && (
                      <div className="text-center p-12 border-4 border-dashed border-blue-300 rounded-2xl hover:border-blue-500 transition cursor-pointer">
                        <label className="cursor-pointer">
                          <FaCloudUploadAlt className="text-7xl text-blue-600 mx-auto mb-6" />
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">
                            {file ? file.name : 'Click to Upload Resume'}
                          </h3>
                          <p className="text-gray-600">PDF • DOCX • Max 10MB</p>
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
                      <div className="space-y-4">
                        {urls.map((url, index) => (
                          <div key={index} className="flex gap-3 items-center">
                            <FaLink className="text-blue-600 text-xl flex-shrink-0" />
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => handleUrlChange(index, e.target.value)}
                              placeholder="https://linkedin.com/in/... or Google Drive link"
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                            {urls.length > 1 && (
                              <button
                                onClick={() => removeUrlField(index)}
                                className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          onClick={addUrlField}
                          className="w-full py-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold flex items-center justify-center gap-3"
                        >
                          <FaPlus /> Add Another URL
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Job Description */}
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <FaBullseye /> Target Job Description
                    </h3>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job posting here for the most accurate analysis..."
                      rows="8"
                      className="w-full p-6 border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <FaLightbulb className="text-yellow-500" />
                        Pro tip: Include the full job description for better keyword matching
                      </p>
                      <span className="text-sm text-gray-500">
                        {jobDescription.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="border-t pt-8">
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <div className="flex items-center gap-3">
                        <FaCog className="text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">Advanced Settings</span>
                      </div>
                      {showAdvanced ? <FaAngleUp /> : <FaAngleDown />}
                    </button>

                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 space-y-6"
                        >
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Analysis Depth
                              </label>
                              <select
                                value={advancedOptions.depth}
                                onChange={(e) => setAdvancedOptions(prev => ({ ...prev, depth: e.target.value }))}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500"
                              >
                                <option value="quick">Quick (30 seconds)</option>
                                <option value="standard">Standard (60 seconds)</option>
                                <option value="deep">Deep Analysis (90 seconds)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Optimize For
                              </label>
                              <select
                                value={advancedOptions.optimizeFor}
                                onChange={(e) => setAdvancedOptions(prev => ({ ...prev, optimizeFor: e.target.value }))}
                                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500"
                              >
                                <option value="ats">ATS Systems</option>
                                <option value="recruiter">Human Recruiters</option>
                                <option value="both">Both (Recommended)</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-6">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={advancedOptions.includeKeywords}
                                onChange={(e) => setAdvancedOptions(prev => ({ ...prev, includeKeywords: e.target.checked }))}
                                className="w-5 h-5 text-blue-600 rounded"
                              />
                              <span className="text-gray-700">Include Keyword Analysis</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={advancedOptions.showSuggestions}
                                onChange={(e) => setAdvancedOptions(prev => ({ ...prev, showSuggestions: e.target.checked }))}
                                className="w-5 h-5 text-blue-600 rounded"
                              />
                              <span className="text-gray-700">Show Improvement Suggestions</span>
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Analyze Button */}
                  <motion.button
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing}
                    whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                    whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                    className={`w-full mt-8 py-5 rounded-xl text-2xl font-bold transition-all shadow-lg ${isAnalyzing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl text-white'
                      }`}
                  >
                    {isAnalyzing ? (
                      <>
                        <FaSpinner className="animate-spin inline mr-3" /> Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <FaRobot className="inline mr-3" /> Start AI Analysis
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Features Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <FaCrown /> What You Get
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: FaChartLine, title: 'Job Fit Score', desc: 'Overall match percentage' },
                      { icon: FaMagic, title: 'Keyword Analysis', desc: 'Missing & matching keywords' },
                      { icon: FaBalanceScale, title: 'ATS Compatibility', desc: 'Resume scanner score' },
                      { icon: FaLightbulb, title: 'Actionable Tips', desc: 'Improvement suggestions' }
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                          <feature.icon className="text-2xl" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">{feature.title}</h4>
                          <p className="text-blue-100 text-sm">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Report View */
              <AIAnalysisReport
                analysis={analysisResult}
                onBack={() => setActiveView('input')}
              />
            )}
          </div>

          {/* Right Panel - History & Stats */}
          <div className="space-y-8">
            {/* History Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-8">
              <AnalysisHistoryList
                history={analysisHistory}
                searchQuery={searchQuery}
                onSelect={handleLoadFromHistory}
                onDelete={handleDeleteReport}
                onViewAll={() => setActiveView('history')}
              />
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <FaChartLine /> Analysis Stats
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{analysisHistory.length}</div>
                  <div className="text-indigo-200">Total Analyses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {analysisHistory.length > 0
                      ? Math.round(analysisHistory.reduce((a, b) => a + (b.overallScore || 0), 0) / analysisHistory.length)
                      : 0}%
                  </div>
                  <div className="text-indigo-200">Average Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {new Set(analysisHistory.map(h => h.jobTitle)).size}
                  </div>
                  <div className="text-indigo-200">Different Jobs Analyzed</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/builder')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition"
                >
                  <FaPlus className="text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Create New Resume</div>
                    <div className="text-sm text-gray-600">Start from scratch</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setActiveView('input');
                    setJobDescription('');
                    setFile(null);
                    setUrls(['']);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition"
                >
                  <FaFileAlt className="text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">New Analysis</div>
                    <div className="text-sm text-gray-600">Start fresh analysis</div>
                  </div>
                </button>
                <button
                  onClick={() => window.open('https://resumewriting.com/tips', '_blank')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition"
                >
                  <FaLightbulb className="text-yellow-500" />
                  <div>
                    <div className="font-semibold text-gray-900">Resume Tips</div>
                    <div className="text-sm text-gray-600">Improvement guides</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyzerEnhanced;