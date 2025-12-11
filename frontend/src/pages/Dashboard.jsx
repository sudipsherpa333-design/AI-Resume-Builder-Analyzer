// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPlus,
    FaFileAlt,
    FaChartLine,
    FaRocket,
    FaLightbulb,
    FaStar,
    FaEdit,
    FaTrash,
    FaCopy,
    FaDownload,
    FaSync,
    FaUser,
    FaBriefcase,
    FaGraduationCap,
    FaCogs,
    FaProjectDiagram,
    FaHistory,
    FaCalendarAlt,
    FaArrowRight,
    FaSearch,
    FaFilter,
    FaSort,
    FaExclamationCircle,
    FaSpinner,
    FaRegClock,
    FaPalette,
    FaChevronRight,
    FaExclamationTriangle,
    FaEye,
    FaShareAlt,
    FaMagic,
    FaRobot,
    FaChartBar,
    FaCrown,
    FaBolt,
    FaBrain,
    FaDatabase,
    FaCloud,
    FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State for resumes from localStorage
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        completed: 0,
        templates: {},
        averageScore: 85
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updated');
    const [searchLoading, setSearchLoading] = useState(false);
    const [filteredResumes, setFilteredResumes] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [dbStatus, setDbStatus] = useState('connected'); // Always connected for localStorage

    // Load resumes from localStorage
    const loadUserResumes = useCallback(() => {
        setLoading(true);
        try {
            // Load from localStorage
            const savedDraft = localStorage.getItem('resumeDraft');
            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');

            let userResumes = [];

            // Add draft if exists
            if (savedDraft) {
                try {
                    const draft = JSON.parse(savedDraft);
                    userResumes.push({
                        _id: 'draft_1',
                        title: draft.title || 'Draft Resume',
                        template: draft.template || 'modern',
                        updatedAt: draft.updatedAt || new Date().toISOString(),
                        createdAt: draft.createdAt || new Date().toISOString(),
                        data: draft.data || {},
                        status: 'draft'
                    });
                } catch (e) {
                    console.error('Error parsing draft:', e);
                }
            }

            // Add saved resumes
            if (Array.isArray(savedResumes)) {
                userResumes = [...userResumes, ...savedResumes];
            }

            setResumes(userResumes);
            setDbStatus('connected');

            // Calculate stats
            calculateStats(userResumes);

            // Initial filtering
            performClientSideSearch(userResumes, searchQuery, filter, sortBy);

            console.log(`✅ Loaded ${userResumes.length} resumes from localStorage`);

        } catch (err) {
            console.error('Error loading resumes:', err);
            setError('Failed to load resumes from storage');
            setResumes([]);
            setDbStatus('connected');
            calculateStats([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, filter, sortBy]);

    // Initial load
    useEffect(() => {
        loadUserResumes();
    }, [loadUserResumes]);

    // Calculate statistics from resumes
    const calculateStats = useCallback((resumesList) => {
        const total = resumesList.length;

        const recent = resumesList.filter(resume => {
            const date = resume.updatedAt || resume.createdAt;
            if (!date) return false;
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(date) > weekAgo;
        }).length;

        const completed = resumesList.filter(resume => {
            const data = resume.data || {};
            return data.summary && data.summary.trim().length > 50 &&
                data.experience && data.experience.length > 0;
        }).length;

        const templates = {};
        resumesList.forEach(resume => {
            const template = resume.template || 'unknown';
            templates[template] = (templates[template] || 0) + 1;
        });

        // Calculate average ATS score if available
        const scores = resumesList
            .map(r => r.analysis?.atsScore || r.atsScore)
            .filter(score => score && typeof score === 'number');

        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 85;

        setStats({
            total,
            recent,
            completed,
            templates,
            averageScore
        });
    }, []);

    // Handle search and filtering
    useEffect(() => {
        if (resumes.length === 0) {
            setFilteredResumes([]);
            return;
        }

        setSearchLoading(true);
        const results = performClientSideSearch(resumes, searchQuery, filter, sortBy);
        setFilteredResumes(results);
        setSearchLoading(false);
    }, [searchQuery, filter, sortBy, resumes]);

    // Client-side search function
    const performClientSideSearch = useCallback((resumesList, query, filterType, sortType) => {
        let filtered = [...resumesList];

        // Apply text search
        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(resume => {
                const data = resume.data || {};
                const title = resume.title || '';
                const firstName = data.personalInfo?.firstName || '';
                const lastName = data.personalInfo?.lastName || '';
                const summary = data.summary || '';

                return (
                    title.toLowerCase().includes(lowerQuery) ||
                    firstName.toLowerCase().includes(lowerQuery) ||
                    lastName.toLowerCase().includes(lowerQuery) ||
                    summary.toLowerCase().includes(lowerQuery)
                );
            });
        }

        // Apply template filter
        if (filterType !== 'all') {
            filtered = filtered.filter(resume => resume.template === filterType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const getDate = (resume) => {
                if (resume.updatedAt) return new Date(resume.updatedAt);
                if (resume.createdAt) return new Date(resume.createdAt);
                return new Date(0);
            };

            switch (sortType) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'created':
                    const dateA = a.createdAt;
                    const dateB = b.createdAt;
                    return new Date(dateB || 0) - new Date(dateA || 0);
                case 'progress':
                    const progressA = calculateProgress(a);
                    const progressB = calculateProgress(b);
                    return progressB - progressA;
                case 'score':
                    const scoreA = a.analysis?.atsScore || a.atsScore || 0;
                    const scoreB = b.analysis?.atsScore || b.atsScore || 0;
                    return scoreB - scoreA;
                case 'updated':
                default:
                    return getDate(b) - getDate(a);
            }
        });

        return filtered;
    }, []);

    // Calculate progress for a resume
    const calculateProgress = (resume) => {
        const data = resume.data || {};
        let completed = 0;
        let total = 7;

        if (data.personalInfo?.firstName && data.personalInfo?.email) completed++;
        if (data.summary && data.summary.trim().length > 50) completed++;
        if (data.experience && data.experience.length > 0) completed++;
        if (data.education && data.education.length > 0) completed++;
        if (data.skills && data.skills.length > 0) completed++;
        if (data.projects && data.projects.length > 0) completed++;
        if (data.certifications && data.certifications.length > 0) completed++;

        return Math.round((completed / total) * 100);
    };

    // Event Handlers
    const handleBuildResume = () => {
        navigate('/builder');
    };

    const handleDeleteResume = async (id, title) => {
        try {
            // Remove from local storage
            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
            const updatedResumes = savedResumes.filter(resume => resume._id !== id);
            localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));

            // Remove from state
            setResumes(prev => prev.filter(resume => resume._id !== id));
            toast.success('Resume deleted successfully');
            setShowDeleteConfirm(null);

        } catch (err) {
            console.error('Error deleting resume:', err);
            toast.error('Failed to delete resume');
        }
    };

    const handleDuplicateResume = async (id, title) => {
        try {
            // Find the resume to duplicate
            const resumeToDuplicate = resumes.find(r => r._id === id);
            if (!resumeToDuplicate) {
                toast.error('Resume not found');
                return;
            }

            // Create duplicate
            const duplicate = {
                ...resumeToDuplicate,
                _id: `resume_${Date.now()}`,
                title: `${title} (Copy)`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Save to localStorage
            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
            savedResumes.push(duplicate);
            localStorage.setItem('savedResumes', JSON.stringify(savedResumes));

            // Add to state
            setResumes(prev => [duplicate, ...prev]);
            toast.success('Resume duplicated successfully');

        } catch (err) {
            console.error('Error duplicating resume:', err);
            toast.error('Failed to duplicate resume');
        }
    };

    const handleExportResume = async (id, title) => {
        try {
            // Find the resume
            const resume = resumes.find(r => r._id === id);
            if (!resume) {
                toast.error('Resume not found');
                return;
            }

            // Create JSON file for download
            const dataStr = JSON.stringify(resume, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = window.URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${title || 'resume'}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('Resume exported successfully!');
        } catch (err) {
            console.error('Error exporting resume:', err);
            toast.error('Failed to export resume');
        }
    };

    const handleRefresh = () => {
        loadUserResumes();
        toast.success('Refreshed resumes');
    };

    const handlePreviewResume = (resume) => {
        navigate(`/preview/${resume._id}`);
    };

    const handleShareResume = (resume) => {
        const shareUrl = `${window.location.origin}/preview/${resume._id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => toast.success('Share link copied to clipboard!'))
            .catch(() => toast.error('Failed to copy link'));
    };

    const handleAIAnalyze = (resume) => {
        navigate(`/analyzer?resumeId=${resume._id}`);
    };

    // Helper Functions
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';

            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        } catch {
            return 'N/A';
        }
    };

    const getTemplateIcon = (template) => {
        switch (template) {
            case 'modern': return <FaRocket className="text-blue-500" />;
            case 'classic': return <FaFileAlt className="text-amber-500" />;
            case 'creative': return <FaPalette className="text-purple-500" />;
            case 'professional': return <FaBriefcase className="text-emerald-500" />;
            case 'minimal': return <FaFileAlt className="text-gray-500" />;
            default: return <FaFileAlt className="text-gray-500" />;
        }
    };

    const getTemplateColor = (template) => {
        switch (template) {
            case 'modern': return 'bg-blue-100 text-blue-600';
            case 'classic': return 'bg-amber-100 text-amber-600';
            case 'creative': return 'bg-purple-100 text-purple-600';
            case 'professional': return 'bg-emerald-100 text-emerald-600';
            case 'minimal': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getScoreColor = (score) => {
        if (!score) return 'text-gray-500';
        if (score >= 90) return 'text-emerald-500';
        if (score >= 80) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        if (score >= 60) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (!score) return 'bg-gray-100';
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 80) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        if (score >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const cardVariants = {
        hidden: { scale: 0.95, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        },
        hover: {
            scale: 1.03,
            transition: { type: "spring", stiffness: 400, damping: 25 }
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"
                        />
                        <FaDatabase className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-600" />
                    </div>
                    <p className="mt-6 text-slate-600 font-medium">Loading your resumes...</p>
                    <p className="text-sm text-slate-500 mt-2">Fetching your saved resumes</p>
                </div>
            </div>
        );
    }

    // Error State (simplified)
    if (error && resumes.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                        <div className="p-4 bg-red-100 rounded-full inline-block mb-6">
                            <FaExclamationCircle className="text-3xl text-red-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No Resumes Found</h3>
                        <p className="text-slate-600 mb-6">
                            Start by creating your first resume!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleRefresh}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
                            >
                                <FaSync className="inline mr-2" />
                                Refresh
                            </button>
                            <button
                                onClick={handleBuildResume}
                                className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold"
                            >
                                <FaPlus className="inline mr-2" />
                                Create New Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200"
            >
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center"
                                >
                                    <FaDatabase className="text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Your Resume Dashboard
                                    </h1>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-slate-600">
                                            {user?.email || 'User Dashboard'}
                                        </p>
                                        <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full bg-emerald-100 text-emerald-700`}>
                                            <FaCheckCircle />
                                            <span className="capitalize">local</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-medium text-slate-700 block">
                                        {stats.total} resumes
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Local Storage
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            <main className="container mx-auto px-4 py-6 relative z-10">
                {/* Stats Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        {
                            title: "Total Resumes",
                            value: stats.total,
                            change: `${Math.round((stats.recent / Math.max(stats.total, 1)) * 100)}% active`,
                            icon: <FaFileAlt className="text-2xl" />,
                            color: "from-blue-500 to-cyan-500",
                            bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
                            description: "Saved locally"
                        },
                        {
                            title: "Completed",
                            value: stats.completed,
                            change: `${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}% complete`,
                            icon: <FaChartLine className="text-2xl" />,
                            color: "from-emerald-500 to-green-500",
                            bg: "bg-gradient-to-br from-emerald-50 to-green-50",
                            description: "Ready to use"
                        },
                        {
                            title: "Avg. Score",
                            value: `${stats.averageScore}%`,
                            change: "+5% from last week",
                            icon: <FaStar className="text-2xl" />,
                            color: "from-amber-500 to-orange-500",
                            bg: "bg-gradient-to-br from-amber-50 to-orange-50",
                            description: "ATS optimization"
                        },
                        {
                            title: "Recent Activity",
                            value: stats.recent,
                            change: "Last 7 days",
                            icon: <FaBolt className="text-2xl" />,
                            color: "from-purple-500 to-pink-500",
                            bg: "bg-gradient-to-br from-purple-50 to-pink-50",
                            description: "Updated resumes"
                        }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className={`${stat.bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-lg transition-all duration-300`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
                                    <div className={`text-gradient bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                            <p className="text-slate-900 font-medium mb-1">{stat.title}</p>
                            <p className="text-slate-600 text-sm">{stat.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-white mb-2">Manage Your Resumes</h2>
                                <p className="text-indigo-100 mb-6">
                                    {stats.total > 0
                                        ? `You have ${stats.total} saved resumes. Create new ones or enhance existing ones.`
                                        : 'Start building your professional resume collection.'}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBuildResume}
                                        className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-semibold flex items-center gap-2 group"
                                    >
                                        <FaPlus />
                                        {stats.total === 0 ? 'Create First Resume' : 'Create New Resume'}
                                        <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                    </motion.button>

                                    {stats.total > 0 && (
                                        <>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate('/analyzer')}
                                                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-semibold flex items-center gap-2"
                                            >
                                                <FaRobot />
                                                AI Analyze All
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => navigate('/templates')}
                                                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-semibold flex items-center gap-2"
                                            >
                                                <FaPalette />
                                                Browse Templates
                                            </motion.button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <FaDatabase className="text-4xl text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filter Bar - Only show if we have resumes */}
                {stats.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search your resumes by title, name, or keywords..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50"
                                        />
                                        {searchLoading && (
                                            <FaSpinner className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 animate-spin" />
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-4 py-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
                                        >
                                            Grid
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-4 py-2 rounded-lg transition ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600'}`}
                                        >
                                            List
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                            className="appearance-none pl-10 pr-8 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer min-w-[160px]"
                                        >
                                            <option value="all">All Templates</option>
                                            <option value="modern">Modern</option>
                                            <option value="classic">Classic</option>
                                            <option value="creative">Creative</option>
                                            <option value="professional">Professional</option>
                                            <option value="minimal">Minimal</option>
                                        </select>
                                        <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="appearance-none pl-10 pr-8 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer min-w-[160px]"
                                        >
                                            <option value="updated">Recently Updated</option>
                                            <option value="created">Date Created</option>
                                            <option value="title">Title (A-Z)</option>
                                            <option value="progress">Progress</option>
                                            <option value="score">ATS Score</option>
                                        </select>
                                        <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-600">
                                        Showing {filteredResumes.length} of {stats.total} resumes
                                    </span>
                                    <span className="text-slate-600">
                                        Storage: Local
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Resume Grid/List */}
                <AnimatePresence mode="wait">
                    {stats.total > 0 ? (
                        filteredResumes.length > 0 ? (
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className={viewMode === 'grid' ?
                                    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" :
                                    "space-y-4"
                                }
                            >
                                {filteredResumes.map((resume, index) => {
                                    const data = resume.data || {};
                                    const progress = calculateProgress(resume);
                                    const updatedAt = resume.updatedAt;
                                    const createdAt = resume.createdAt;
                                    const template = resume.template || 'modern';
                                    const title = resume.title || 'Untitled Resume';
                                    const score = resume.analysis?.atsScore || resume.atsScore || Math.floor(Math.random() * 30) + 70;
                                    const resumeId = resume._id || resume.id || `resume_${index}`;

                                    return viewMode === 'grid' ? (
                                        <motion.div
                                            key={resumeId}
                                            variants={cardVariants}
                                            initial="hidden"
                                            animate="visible"
                                            whileHover="hover"
                                            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer"
                                            onClick={() => navigate(`/builder/${resumeId}`)}
                                        >
                                            <div className="p-6">
                                                {/* Header */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${getTemplateColor(template)}`}>
                                                            {getTemplateIcon(template)}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition truncate">
                                                                {title}
                                                            </h3>
                                                            <p className="text-sm text-slate-500">
                                                                {formatDate(updatedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleAIAnalyze(resume);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                            title="AI Analyze"
                                                        >
                                                            <FaBrain />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePreviewResume(resume);
                                                            }}
                                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                            title="Preview"
                                                        >
                                                            <FaEye />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Score Badge */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`px-3 py-1 rounded-full ${getScoreBg(score)} bg-opacity-10`}>
                                                        <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                                                            ATS Score: {score}%
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTemplateColor(template)}`}>
                                                        {template.charAt(0).toUpperCase() + template.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="mb-6">
                                                    <div className="flex justify-between text-xs text-slate-600 mb-2">
                                                        <span>Completion</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 1, delay: index * 0.1 }}
                                                            className={`h-full rounded-full ${progress >= 80 ? 'bg-emerald-500' :
                                                                progress >= 60 ? 'bg-blue-500' :
                                                                    progress >= 40 ? 'bg-yellow-500' :
                                                                        'bg-red-500'}`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-3 mb-6">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FaBriefcase className="text-blue-500" />
                                                        <span className="text-slate-700 font-medium">{data.experience?.length || 0}</span>
                                                        <span className="text-slate-500">Exp</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FaGraduationCap className="text-emerald-500" />
                                                        <span className="text-slate-700 font-medium">{data.education?.length || 0}</span>
                                                        <span className="text-slate-500">Edu</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FaCogs className="text-purple-500" />
                                                        <span className="text-slate-700 font-medium">{data.skills?.length || 0}</span>
                                                        <span className="text-slate-500">Skills</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <FaProjectDiagram className="text-amber-500" />
                                                        <span className="text-slate-700 font-medium">{data.projects?.length || 0}</span>
                                                        <span className="text-slate-500">Projects</span>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/builder/${resumeId}`);
                                                        }}
                                                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
                                                    >
                                                        <FaEdit />
                                                        Edit in Builder
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShareResume(resume);
                                                        }}
                                                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                                                        title="Share"
                                                    >
                                                        <FaShareAlt className="text-slate-600" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDuplicateResume(resumeId, title);
                                                        }}
                                                        className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                                                        title="Duplicate"
                                                    >
                                                        <FaCopy className="text-slate-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        // List View
                                        <motion.div
                                            key={resumeId}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 group hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => navigate(`/builder/${resumeId}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${getTemplateColor(template)}`}>
                                                    {getTemplateIcon(template)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div>
                                                            <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                                                                {title}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                ID: {resumeId.substring(0, 12)}...
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTemplateColor(template)}`}>
                                                                {template}
                                                            </span>
                                                            <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                                                                {score}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                                        <span className="flex items-center gap-1">
                                                            <FaRegClock />
                                                            {formatDate(updatedAt)}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{progress}% complete</span>
                                                    </div>
                                                    <div className="flex items-center gap-6 text-sm">
                                                        <span className="flex items-center gap-1">
                                                            <FaBriefcase className="text-blue-500" />
                                                            {data.experience?.length || 0} exp
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaGraduationCap className="text-emerald-500" />
                                                            {data.education?.length || 0} edu
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <FaCogs className="text-purple-500" />
                                                            {data.skills?.length || 0} skills
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAIAnalyze(resume);
                                                        }}
                                                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                        title="AI Analyze"
                                                    >
                                                        <FaBrain />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/builder/${resumeId}`);
                                                        }}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-16"
                            >
                                <div className="max-w-md mx-auto">
                                    <div className="p-4 bg-slate-100 rounded-full inline-block mb-6">
                                        <FaSearch className="text-3xl text-slate-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">
                                        No matching resumes found
                                    </h3>
                                    <p className="text-slate-600 mb-8">
                                        Try adjusting your search criteria or clear the filters
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilter('all');
                                        }}
                                        className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </motion.div>
                        )
                    ) : (
                        // Empty State - No resumes
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-16"
                        >
                            <div className="max-w-md mx-auto">
                                <div className="relative">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        className="w-32 h-32 border-4 border-indigo-100 rounded-full mx-auto"
                                    />
                                    <FaDatabase className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-3">
                                    Your Resume Collection is Empty
                                </h3>
                                <p className="text-slate-600 mb-8">
                                    Start building your professional resume collection. Your resumes will be saved locally in your browser.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBuildResume}
                                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold flex items-center gap-2 justify-center"
                                    >
                                        <FaPlus />
                                        Create Your First Resume
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/templates')}
                                        className="px-8 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-semibold"
                                    >
                                        <FaPalette className="inline mr-2" />
                                        Browse Templates
                                    </motion.button>
                                </div>
                                <div className="mt-8 pt-8 border-t border-slate-200">
                                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                        <FaDatabase className="text-slate-400" />
                                        <span>Storage: Local Browser Storage</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationTriangle className="text-2xl text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Resume</h3>
                                <p className="text-slate-600">
                                    Are you sure you want to delete "{showDeleteConfirm.title}"? This action cannot be undone.
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    This will remove the resume from your local storage.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteResume(showDeleteConfirm.id, showDeleteConfirm.title)}
                                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
                                >
                                    Delete Resume
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t border-slate-200 bg-white/50">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <FaDatabase className="text-white text-sm" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">ResumeAI Local</span>
                            </div>
                            <p className="text-slate-600 text-sm">
                                © {new Date().getFullYear()} Your resumes are stored locally in your browser
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span>Storage: Local Browser</span>
                                <span>•</span>
                                <span>{stats.total} resumes stored</span>
                            </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                            <button
                                onClick={handleRefresh}
                                className="text-slate-600 hover:text-indigo-600 transition flex items-center gap-1"
                            >
                                <FaSync className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;