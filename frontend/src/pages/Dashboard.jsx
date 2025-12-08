// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    FaCloudUploadAlt,
    FaBrain
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user } = useAuth();
    const {
        resumes = [],
        loading = false,
        error = null,
        deleteResume,
        duplicateResume,
        exportResume,
        getResumeStats,
        searchResumes,
        refreshResumes
    } = useResume();

    const navigate = useNavigate();

    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updated');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        completed: 0,
        templates: {},
        averageScore: 85
    });
    const [searchLoading, setSearchLoading] = useState(false);
    const [filteredResumes, setFilteredResumes] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Load stats on component mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                const statsData = await getResumeStats();
                setStats(statsData);
            } catch (err) {
                console.error('Error loading stats:', err);
                // Set default stats
                setStats({
                    total: resumes.length,
                    recent: resumes.filter(r => {
                        const date = r.updatedAt || r.createdAt;
                        if (!date) return false;
                        return new Date(date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    }).length,
                    completed: calculateCompletedCount(resumes),
                    templates: groupTemplates(resumes),
                    averageScore: 85
                });
            }
        };

        if (user) {
            loadStats();
        }
    }, [user, getResumeStats, resumes]);

    // Handle search and filtering
    useEffect(() => {
        const performSearch = async () => {
            if (!resumes || resumes.length === 0) {
                setFilteredResumes([]);
                return;
            }

            setSearchLoading(true);
            try {
                let results;
                if (typeof searchResumes === 'function') {
                    results = await searchResumes(searchQuery, filter, sortBy);
                } else {
                    results = performClientSideSearch(resumes, searchQuery, filter, sortBy);
                }
                setFilteredResumes(results);
            } catch (err) {
                console.error('Search error:', err);
                const results = performClientSideSearch(resumes, searchQuery, filter, sortBy);
                setFilteredResumes(results);
            } finally {
                setSearchLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, filter, sortBy, resumes, searchResumes]);

    // Helper functions
    const performClientSideSearch = useCallback((resumesList, query, filterType, sortType) => {
        let filtered = [...(resumesList || [])];

        if (query) {
            const lowerQuery = query.toLowerCase();
            filtered = filtered.filter(resume => {
                const data = resume.data || resume.content || {};
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

        if (filterType !== 'all') {
            filtered = filtered.filter(resume => resume.template === filterType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            const getDate = (resume) => {
                if (resume.updatedAt) return new Date(resume.updatedAt);
                if (resume.createdAt) return new Date(resume.createdAt);
                if (resume.meta?.updatedAt) return new Date(resume.meta?.updatedAt);
                return new Date(0);
            };

            switch (sortType) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'created':
                    const dateA = a.createdAt || a.meta?.createdAt;
                    const dateB = b.createdAt || b.meta?.createdAt;
                    return new Date(dateB || 0) - new Date(dateA || 0);
                case 'updated':
                default:
                    return getDate(b) - getDate(a);
            }
        });

        return filtered;
    }, []);

    const calculateCompletedCount = useCallback((resumesList) => {
        return resumesList.filter(resume => {
            const data = resume.data || resume.content || {};
            return data.summary && data.summary.trim().length > 50 &&
                data.experience && data.experience.length > 0;
        }).length;
    }, []);

    const groupTemplates = useCallback((resumesList) => {
        const templateCount = {};
        resumesList.forEach(resume => {
            const template = resume.template || 'unknown';
            templateCount[template] = (templateCount[template] || 0) + 1;
        });
        return templateCount;
    }, []);

    // Event handlers
    const handleBuildResume = () => {
        navigate('/builder-home');
    };

    const handleDeleteResume = async (id, title) => {
        try {
            await deleteResume(id);
            toast.success('Resume deleted successfully');
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error('Error deleting resume:', err);
            toast.error(err.message || 'Failed to delete resume');
        }
    };

    const handleDuplicateResume = async (id, title) => {
        try {
            await duplicateResume(id);
            toast.success('Resume duplicated successfully');
        } catch (err) {
            console.error('Error duplicating resume:', err);
            toast.error(err.message || 'Failed to duplicate resume');
        }
    };

    const handleExportResume = async (id, title) => {
        try {
            await exportResume(id, 'json');
            toast.success('Resume exported successfully!');
        } catch (err) {
            console.error('Error exporting resume:', err);
            toast.error(err.message || 'Failed to export resume');
        }
    };

    const handleRefresh = async () => {
        try {
            await refreshResumes();
            toast.success('Resumes refreshed!');
        } catch (err) {
            console.error('Error refreshing resumes:', err);
            toast.error('Failed to refresh resumes');
        }
    };

    const handlePreviewResume = (resume) => {
        navigate(`/preview/${resume.id}`);
    };

    const handleShareResume = (resume) => {
        // In a real app, this would generate a shareable link
        toast.success('Share link copied to clipboard!');
    };

    const handleAIAnalyze = (resume) => {
        navigate(`/analyzer?resumeId=${resume.id}`);
    };

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

    const getResumeData = (resume) => {
        return resume.data || resume.content || {};
    };

    const getCompletedCount = useMemo(() => {
        return calculateCompletedCount(resumes);
    }, [resumes, calculateCompletedCount]);

    const calculateProgress = (resume) => {
        const data = getResumeData(resume);
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

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 80) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        if (score >= 60) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 80) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        if (score >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1
        }
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
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            transition: { type: "spring", stiffness: 400, damping: 25 }
        }
    };

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
                        <FaBrain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-600" />
                    </div>
                    <p className="mt-6 text-slate-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Animated Background Elements */}
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
                            <motion.h1
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                            >
                                Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
                            </motion.h1>
                            <p className="text-slate-600 mt-1">Your professional resume hub</p>
                        </div>
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <FaUser className="text-white text-sm" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">{user?.email?.split('@')[0] || 'User'}</span>
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="p-2 hover:bg-slate-100 rounded-full transition"
                            >
                                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </button>
                        </motion.div>
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
                            value: resumes.length,
                            change: "+12%",
                            icon: <FaFileAlt className="text-2xl" />,
                            color: "from-blue-500 to-cyan-500",
                            bg: "bg-gradient-to-br from-blue-50 to-cyan-50"
                        },
                        {
                            title: "Completed",
                            value: getCompletedCount,
                            change: `${Math.round((getCompletedCount / (resumes.length || 1)) * 100)}%`,
                            icon: <FaChartLine className="text-2xl" />,
                            color: "from-emerald-500 to-green-500",
                            bg: "bg-gradient-to-br from-emerald-50 to-green-50"
                        },
                        {
                            title: "Avg. Score",
                            value: `${stats.averageScore}%`,
                            change: "+5%",
                            icon: <FaStar className="text-2xl" />,
                            color: "from-amber-500 to-orange-500",
                            bg: "bg-gradient-to-br from-amber-50 to-orange-50"
                        },
                        {
                            title: "Recent Activity",
                            value: stats.recent,
                            change: "Today",
                            icon: <FaBolt className="text-2xl" />,
                            color: "from-purple-500 to-pink-500",
                            bg: "bg-gradient-to-br from-purple-50 to-pink-50"
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
                                <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1 rounded-full">
                                    {stat.change}
                                </span>
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                            <p className="text-slate-600 text-sm">{stat.title}</p>
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
                                <h2 className="text-2xl font-bold text-white mb-2">Ready to create something amazing?</h2>
                                <p className="text-indigo-100 mb-6">
                                    Build professional resumes with AI assistance or enhance existing ones
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBuildResume}
                                        className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-semibold flex items-center gap-2 group"
                                    >
                                        <FaPlus />
                                        Build Resume
                                        <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/analyzer')}
                                        className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-semibold flex items-center gap-2"
                                    >
                                        <FaRobot />
                                        AI Analyze
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/templates')}
                                        className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-semibold flex items-center gap-2"
                                    >
                                        <FaPalette />
                                        Templates
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleRefresh}
                                        disabled={loading}
                                        className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition font-semibold flex items-center gap-2"
                                    >
                                        <FaSync className={loading ? 'animate-spin' : ''} />
                                        Refresh
                                    </motion.button>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <FaMagic className="text-4xl text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Search and Filter Bar */}
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
                                        placeholder="Search resumes by title, name, or keywords..."
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
                                    </select>
                                    <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Resume Grid/List */}
                <AnimatePresence mode="wait">
                    {filteredResumes.length > 0 ? (
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
                                const data = getResumeData(resume);
                                const progress = calculateProgress(resume);
                                const updatedAt = resume.updatedAt || resume.meta?.updatedAt;
                                const createdAt = resume.createdAt || resume.meta?.createdAt;
                                const template = resume.template || 'unknown';
                                const title = resume.title || 'Untitled Resume';
                                const score = resume.analysis?.atsScore || Math.floor(Math.random() * 30) + 70;

                                return viewMode === 'grid' ? (
                                    <motion.div
                                        key={resume.id || index}
                                        variants={cardVariants}
                                        initial="hidden"
                                        animate="visible"
                                        whileHover="hover"
                                        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group cursor-pointer"
                                        onClick={() => navigate(`/builder/${resume.id}`)}
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
                                                        Score: {score}%
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
                                                    <span className="text-slate-700">{data.experience?.length || 0}</span>
                                                    <span className="text-slate-500">Exp</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaGraduationCap className="text-emerald-500" />
                                                    <span className="text-slate-700">{data.education?.length || 0}</span>
                                                    <span className="text-slate-500">Edu</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaCogs className="text-purple-500" />
                                                    <span className="text-slate-700">{data.skills?.length || 0}</span>
                                                    <span className="text-slate-500">Skills</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaProjectDiagram className="text-amber-500" />
                                                    <span className="text-slate-700">{data.projects?.length || 0}</span>
                                                    <span className="text-slate-500">Projects</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/builder/${resume.id}`);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center justify-center gap-2"
                                                >
                                                    <FaEdit />
                                                    Edit
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
                                                        handleDuplicateResume(resume.id, title);
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
                                        key={resume.id || index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 group hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => navigate(`/builder/${resume.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${getTemplateColor(template)}`}>
                                                {getTemplateIcon(template)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                                                        {title}
                                                    </h3>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTemplateColor(template)}`}>
                                                        {template}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                                                    <span className="flex items-center gap-1">
                                                        <FaRegClock />
                                                        {formatDate(updatedAt)}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{progress}% complete</span>
                                                    <span>•</span>
                                                    <span className={`font-medium ${getScoreColor(score)}`}>
                                                        Score: {score}%
                                                    </span>
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
                                                        navigate(`/builder/${resume.id}`);
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
                                    <FaFileAlt className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-3">
                                    {searchQuery || filter !== 'all' ? 'No matching resumes' : 'No resumes yet'}
                                </h3>
                                <p className="text-slate-600 mb-8">
                                    {searchQuery || filter !== 'all'
                                        ? 'Try adjusting your search criteria or clear filters'
                                        : 'Start building your professional resume to land your dream job'}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleBuildResume}
                                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold flex items-center gap-2 justify-center"
                                    >
                                        <FaPlus />
                                        {searchQuery || filter !== 'all' ? 'Build New Resume' : 'Build Your First Resume'}
                                    </motion.button>
                                    {(searchQuery || filter !== 'all') && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilter('all');
                                            }}
                                            className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition font-semibold"
                                        >
                                            Clear Filters
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* AI Assistant Banner */}
                {filteredResumes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12"
                    >
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full -translate-y-32 translate-x-32" />
                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                                <FaRobot className="text-2xl text-emerald-400" />
                                            </div>
                                            <h3 className="text-2xl font-bold">AI Resume Assistant</h3>
                                        </div>
                                        <p className="text-slate-300 mb-6">
                                            Let our AI analyze your resumes, suggest improvements, and help you land more interviews
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => navigate('/analyzer')}
                                                className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-semibold flex items-center gap-2"
                                            >
                                                <FaBrain />
                                                Analyze All Resumes
                                            </button>
                                            <button
                                                onClick={() => navigate('/templates')}
                                                className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-semibold flex items-center gap-2"
                                            >
                                                <FaPalette />
                                                Explore Templates
                                            </button>
                                            <button
                                                onClick={handleBuildResume}
                                                className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition font-semibold flex items-center gap-2"
                                            >
                                                <FaPlus />
                                                Create New
                                            </button>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="relative">
                                            <div className="w-48 h-48 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full flex items-center justify-center">
                                                <div className="w-32 h-32 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center">
                                                    <FaCrown className="text-4xl text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
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
                                    Delete
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
                                    <FaFileAlt className="text-white text-sm" />
                                </div>
                                <span className="text-lg font-bold text-slate-900">ResumeAI</span>
                            </div>
                            <p className="text-slate-600 text-sm">
                                © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
                            </p>
                        </div>
                        <div className="flex gap-6 text-sm">
                            <Link to="/privacy" className="text-slate-600 hover:text-indigo-600 transition">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-slate-600 hover:text-indigo-600 transition">
                                Terms of Service
                            </Link>
                            <Link to="/help" className="text-slate-600 hover:text-indigo-600 transition">
                                Help Center
                            </Link>
                            <Link to="/contact" className="text-slate-600 hover:text-indigo-600 transition">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;