// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    FaEye,
    FaSync,
    FaUser,
    FaBriefcase,
    FaGraduationCap,
    FaCogs,
    FaProjectDiagram,
    FaCertificate,
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
    FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const {
        resumes,
        loading,
        error,
        createResume,
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
    const [isCreating, setIsCreating] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        completed: 0,
        templates: {},
        averageScore: 0
    });
    const [searchLoading, setSearchLoading] = useState(false);
    const [filteredResumes, setFilteredResumes] = useState([]);

    // Load stats on component mount and when resumes change
    useEffect(() => {
        const loadStats = async () => {
            try {
                const statsData = await getResumeStats();
                setStats(statsData);
            } catch (err) {
                console.error('Error loading stats:', err);
            }
        };

        if (user) {
            loadStats();
        }
    }, [user, getResumeStats]);

    // Handle search and filtering
    useEffect(() => {
        const performSearch = async () => {
            if (resumes.length === 0) {
                setFilteredResumes([]);
                return;
            }

            setSearchLoading(true);
            try {
                const results = await searchResumes(searchQuery, filter, sortBy);
                setFilteredResumes(results);
            } catch (err) {
                console.error('Search error:', err);
                // Fallback to client-side filtering
                let filtered = [...resumes];

                if (searchQuery) {
                    const lowerQuery = searchQuery.toLowerCase();
                    filtered = filtered.filter(resume => {
                        const data = resume.data || resume.content || {};
                        return (
                            resume.title.toLowerCase().includes(lowerQuery) ||
                            (data.personalInfo?.firstName?.toLowerCase() || '').includes(lowerQuery) ||
                            (data.personalInfo?.lastName?.toLowerCase() || '').includes(lowerQuery) ||
                            (data.summary?.toLowerCase() || '').includes(lowerQuery)
                        );
                    });
                }

                if (filter !== 'all') {
                    filtered = filtered.filter(resume => resume.template === filter);
                }

                // Apply sorting
                filtered.sort((a, b) => {
                    const getDate = (resume) => {
                        if (resume.updatedAt) return new Date(resume.updatedAt);
                        if (resume.meta?.updatedAt) return new Date(resume.meta.updatedAt);
                        return new Date(0);
                    };

                    switch (sortBy) {
                        case 'title':
                            return a.title.localeCompare(b.title);
                        case 'created':
                            return new Date(b.createdAt || b.meta?.createdAt || 0) -
                                new Date(a.createdAt || a.meta?.createdAt || 0);
                        case 'updated':
                        default:
                            return getDate(b) - getDate(a);
                    }
                });

                setFilteredResumes(filtered);
            } finally {
                setSearchLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery, filter, sortBy, resumes, searchResumes]);

    const handleCreateResume = async () => {
        if (isCreating) return;

        setIsCreating(true);
        try {
            const newResume = await createResume({
                title: 'New Resume',
                template: 'modern',
                content: {
                    personalInfo: {
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || '',
                        phone: '',
                        location: '',
                        linkedin: '',
                        github: '',
                        portfolio: '',
                        title: ''
                    },
                    summary: '',
                    experience: [],
                    education: [],
                    skills: [],
                    projects: [],
                    certifications: [],
                    languages: [],
                    references: []
                }
            });

            if (newResume) {
                toast.success('New resume created!');
                navigate(`/builder/${newResume.id}`);
            } else {
                toast.error('Failed to create resume');
            }
        } catch (err) {
            console.error('Error creating resume:', err);
            toast.error(err.message || 'Failed to create resume');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteResume = async (id, title, e) => {
        e.stopPropagation();

        if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            try {
                await deleteResume(id);
                toast.success('Resume deleted successfully');
            } catch (err) {
                console.error('Error deleting resume:', err);
                toast.error(err.message || 'Failed to delete resume');
            }
        }
    };

    const handleDuplicateResume = async (id, title, e) => {
        e.stopPropagation();

        try {
            await duplicateResume(id);
            toast.success('Resume duplicated successfully');
        } catch (err) {
            console.error('Error duplicating resume:', err);
            toast.error(err.message || 'Failed to duplicate resume');
        }
    };

    const handleExportResume = async (id, title, e) => {
        e.stopPropagation();

        try {
            await exportResume(id, 'json');
            toast.success('Resume exported successfully! Check your downloads.');
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            });
        } catch {
            return 'N/A';
        }
    };

    const getTemplateIcon = (template) => {
        switch (template) {
            case 'modern':
                return <FaRocket className="text-blue-500" />;
            case 'classic':
                return <FaFileAlt className="text-green-500" />;
            case 'creative':
                return <FaPalette className="text-purple-500" />;
            case 'professional':
                return <FaBriefcase className="text-indigo-500" />;
            case 'minimal':
                return <FaFileAlt className="text-gray-500" />;
            default:
                return <FaFileAlt className="text-gray-500" />;
        }
    };

    const getTemplateName = (template) => {
        switch (template) {
            case 'modern': return 'Modern';
            case 'classic': return 'Classic';
            case 'creative': return 'Creative';
            case 'professional': return 'Professional';
            case 'minimal': return 'Minimal';
            default: return template.charAt(0).toUpperCase() + template.slice(1);
        }
    };

    const getResumeData = (resume) => {
        return resume.data || resume.content || {};
    };

    const getCompletedCount = useMemo(() => {
        return resumes.filter(resume => {
            const data = getResumeData(resume);
            return data.summary && data.summary.trim().length > 50 &&
                data.experience && data.experience.length > 0;
        }).length;
    }, [resumes]);

    const calculateProgress = (resume) => {
        const data = getResumeData(resume);
        let completed = 0;
        let total = 7; // personalInfo, summary, experience, education, skills, projects, certifications

        if (data.personalInfo?.firstName && data.personalInfo?.email) completed++;
        if (data.summary && data.summary.trim().length > 50) completed++;
        if (data.experience && data.experience.length > 0) completed++;
        if (data.education && data.education.length > 0) completed++;
        if (data.skills && data.skills.length > 0) completed++;
        if (data.projects && data.projects.length > 0) completed++;
        if (data.certifications && data.certifications.length > 0) completed++;

        return Math.round((completed / total) * 100);
    };

    if (loading || searchLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your resumes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
                    <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Resumes</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <FaSync />
                            Try Again
                        </button>
                        <button
                            onClick={handleCreateResume}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                        >
                            Create New Resume
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome back, {user?.name || user?.firstName || user?.email?.split('@')[0] || 'User'}!
                            </h1>
                            <p className="text-gray-600 mt-1">Manage your resumes and track your progress</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FaUser className="text-blue-500" />
                                <span>{user?.email || 'Demo User'}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Resumes</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</h3>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaFileAlt className="text-2xl text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                                <FaHistory className="mr-2" />
                                <span>{stats.recent} updated in last 30 days</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Resume Progress</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                    {getCompletedCount}/{resumes.length}
                                </h3>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <FaChartLine className="text-2xl text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                                <FaLightbulb className="mr-2" />
                                <span>Complete profiles get 3x more interviews</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Template Usage</p>
                                <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                    {Object.keys(stats.templates).length}
                                </h3>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FaPalette className="text-2xl text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                                <FaStar className="mr-2" />
                                <span>Modern template is most popular</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Your Resumes</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {filteredResumes.length} resume{filteredResumes.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleCreateResume}
                                disabled={isCreating}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <FaPlus />
                                        Create New Resume
                                    </>
                                )}
                            </button>
                            <Link
                                to="/templates"
                                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-2"
                            >
                                <FaFileAlt />
                                Browse Templates
                            </Link>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition flex items-center gap-2"
                            >
                                <FaSync className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search resumes by title, name, or keywords..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {searchLoading && (
                                        <FaSpinner className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="appearance-none pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                                    >
                                        <option value="all">All Templates</option>
                                        <option value="modern">Modern</option>
                                        <option value="classic">Classic</option>
                                        <option value="creative">Creative</option>
                                        <option value="professional">Professional</option>
                                        <option value="minimal">Minimal</option>
                                    </select>
                                    <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <FaSort className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
                                    >
                                        <option value="updated">Recently Updated</option>
                                        <option value="created">Date Created</option>
                                        <option value="title">Title (A-Z)</option>
                                    </select>
                                    <FaSort className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <FaArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Resume Grid */}
                {filteredResumes.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredResumes.map((resume, index) => {
                            const data = getResumeData(resume);
                            const progress = calculateProgress(resume);
                            const updatedAt = resume.updatedAt || resume.meta?.updatedAt;
                            const createdAt = resume.createdAt || resume.meta?.createdAt;

                            return (
                                <motion.div
                                    key={resume.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                                    onClick={() => navigate(`/builder/${resume.id}`)}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                {getTemplateIcon(resume.template)}
                                                <div className="overflow-hidden">
                                                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition truncate">
                                                        {resume.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {getTemplateName(resume.template)} Template
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => handleDuplicateResume(resume.id, resume.title, e)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Duplicate"
                                                >
                                                    <FaCopy />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteResume(resume.id, resume.title, e)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>Progress</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${progress < 30 ? 'bg-red-500' :
                                                            progress < 70 ? 'bg-yellow-500' :
                                                                'bg-green-500'
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <FaRegClock />
                                                    <span>Updated {formatDate(updatedAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <FaCalendarAlt />
                                                    <span>Created {formatDate(createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaBriefcase className="text-green-500" />
                                                    <span className="text-gray-600">
                                                        {data.experience?.length || 0} experiences
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaGraduationCap className="text-blue-500" />
                                                    <span className="text-gray-600">
                                                        {data.education?.length || 0} education
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaCogs className="text-purple-500" />
                                                    <span className="text-gray-600">
                                                        {data.skills?.length || 0} skills
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <FaProjectDiagram className="text-orange-500" />
                                                    <span className="text-gray-600">
                                                        {data.projects?.length || 0} projects
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-4 border-t">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/builder/${resume.id}`);
                                                    }}
                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                                >
                                                    <FaEdit />
                                                    Edit Resume
                                                </button>
                                                <button
                                                    onClick={(e) => handleExportResume(resume.id, resume.title, e)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                                                    title="Export as JSON"
                                                >
                                                    <FaDownload />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Navigate to preview page or open modal
                                                        toast.success('Preview feature coming soon!');
                                                    }}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                                                    title="Preview"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="p-4 bg-blue-100 rounded-full inline-block mb-6">
                                <FaFileAlt className="text-4xl text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Resumes Found</h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery || filter !== 'all'
                                    ? 'No resumes match your search criteria. Try adjusting your filters.'
                                    : 'Start building your professional resume to land your dream job. Create your first resume in minutes!'}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleCreateResume}
                                    disabled={isCreating}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2 justify-center disabled:opacity-50"
                                >
                                    {isCreating ? (
                                        <>
                                            <FaSpinner className="animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <FaPlus />
                                            Create Your First Resume
                                        </>
                                    )}
                                </button>
                                {(searchQuery || filter !== 'all') && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilter('all');
                                        }}
                                        className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Quick Tips */}
                {filteredResumes.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-3">Ready to level up your career?</h3>
                                <p className="text-blue-100 mb-4">
                                    Use our AI-powered resume analyzer to get personalized suggestions for improvement and increase your chances of landing interviews.
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        to="/analyzer"
                                        className="px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold flex items-center gap-2"
                                    >
                                        <FaChartLine />
                                        Analyze Your Resume
                                    </Link>
                                    <Link
                                        to="/templates"
                                        className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-xl hover:bg-white/10 transition font-semibold flex items-center gap-2"
                                    >
                                        <FaPalette />
                                        Browse More Templates
                                    </Link>
                                    <button
                                        onClick={handleCreateResume}
                                        disabled={isCreating}
                                        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <FaPlus />
                                        Create Another Resume
                                    </button>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="p-4 bg-white/20 rounded-full inline-block">
                                    <FaLightbulb className="text-4xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-12 py-6 border-t bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 text-sm">
                            © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition">
                                Terms of Service
                            </Link>
                            <Link to="/help" className="text-gray-600 hover:text-blue-600 transition">
                                Help Center
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;