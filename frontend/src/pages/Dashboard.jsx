// src/pages/Dashboard.jsx - COMPLETE WORKING VERSION
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Plus,
    FileText,
    Edit,
    Copy,
    Trash2,
    Eye,
    Download,
    Cloud,
    CloudOff,
    Search,
    Grid,
    List,
    CheckCircle,
    RefreshCw,
    AlertCircle,
    CheckSquare,
    Loader2,
    ChevronRight,
    BarChart3,
    Clock,
    TrendingUp,
    Folder,
    Settings,
    Star,
    ArrowRight,
    User,
    Calendar,
    Target,
    Zap,
    Upload,
    Shield,
    Briefcase,
    GraduationCap,
    FileUp,
    LogOut,
    FileEdit,
    Check,
    X
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import Navbar from '../components/Navbar';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        userResumes = [],
        dashboardStats = {
            total: 0,
            completed: 0,
            inProgress: 0,
            drafts: 0,
            needsWork: 0,
            averageATSScore: 0,
            bestATSScore: 0
        },
        loadUserResumes,
        deleteResume,
        duplicateResume,
        createNewResume,
        syncWithCloud,
        cloudStatus = { isConnected: false, lastSync: null, hasChanges: false },
        isLoading = false,
        saveStatus = 'idle'
    } = useResume();

    // State management
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterBy, setFilterBy] = useState('all');
    const [sortBy, setSortBy] = useState('updated');
    const [viewMode, setViewMode] = useState('grid');
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showQuickTemplates, setShowQuickTemplates] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [creatingResume, setCreatingResume] = useState(false);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [stats, setStats] = useState(dashboardStats);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Dashboard tabs with proper counts
    const tabs = useMemo(() => {
        return [
            { id: 'all', label: 'All Resumes', icon: Folder, count: stats.total || 0 },
            { id: 'draft', label: 'Drafts', icon: FileText, count: stats.drafts || 0 },
            { id: 'in_progress', label: 'In Progress', icon: RefreshCw, count: stats.inProgress || 0 },
            { id: 'completed', label: 'Completed', icon: CheckCircle, count: stats.completed || 0 },
            { id: 'needs_work', label: 'Needs Work', icon: AlertCircle, count: stats.needsWork || 0 }
        ];
    }, [stats.total, stats.drafts, stats.inProgress, stats.completed, stats.needsWork]);

    // Update stats when dashboardStats changes
    useEffect(() => {
        if (dashboardStats) {
            setStats(dashboardStats);
        }
    }, [dashboardStats]);

    // Quick templates
    const quickTemplates = useMemo(() => [
        { id: 'modern', name: 'Modern Professional', icon: Briefcase, color: 'from-blue-500 to-cyan-500', description: 'Clean, contemporary design for all industries' },
        { id: 'creative', name: 'Creative Designer', icon: FileEdit, color: 'from-purple-500 to-pink-500', description: 'Visual portfolio-focused layout' },
        { id: 'executive', name: 'Executive', icon: User, color: 'from-gray-700 to-gray-900', description: 'Sophisticated layout for senior roles' },
        { id: 'minimal', name: 'Minimalist', icon: Settings, color: 'from-slate-600 to-slate-800', description: 'Simple, clean, and focused' },
        { id: 'academic', name: 'Academic', icon: GraduationCap, color: 'from-emerald-500 to-teal-500', description: 'Ideal for research and education' },
        { id: 'tech', name: 'Tech/Developer', icon: Zap, color: 'from-indigo-500 to-purple-500', description: 'Developer-focused with skills emphasis' }
    ], []);

    // Load resumes on component mount - FIXED: Only load once
    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            if (user && mounted) {
                try {
                    console.log('📂 [Dashboard] Loading user resumes...');
                    await loadUserResumes();
                    console.log('✅ [Dashboard] Loaded resumes successfully');
                } catch (error) {
                    console.error('❌ [Dashboard] Failed to load resumes:', error);
                    // Don't show toast for rate limiting errors
                    if (!error.message.includes('Rate limited') && !error.message.includes('429')) {
                        toast.error('Failed to load resumes');
                    }
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, [user, loadUserResumes]);

    // Filter and sort resumes
    const filteredResumes = useMemo(() => {
        if (!userResumes || userResumes.length === 0) return [];

        let resumes = [...userResumes];

        // Filter by active tab
        if (activeTab !== 'all') {
            resumes = resumes.filter(resume => {
                if (activeTab === 'draft') return resume.status === 'draft';
                if (activeTab === 'in_progress') return resume.status === 'in_progress';
                if (activeTab === 'completed') return resume.status === 'completed';
                if (activeTab === 'needs_work') return resume.status === 'needs_work';
                return true;
            });
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            resumes = resumes.filter(resume => {
                const title = resume.title?.toLowerCase() || '';
                const jobTitle = resume.personalInfo?.jobTitle?.toLowerCase() || '';
                const summary = resume.summary?.toLowerCase() || '';
                const firstName = resume.personalInfo?.firstName?.toLowerCase() || '';
                const lastName = resume.personalInfo?.lastName?.toLowerCase() || '';
                const fullName = `${firstName} ${lastName}`.toLowerCase().trim();

                return title.includes(query) ||
                    jobTitle.includes(query) ||
                    summary.includes(query) ||
                    firstName.includes(query) ||
                    lastName.includes(query) ||
                    fullName.includes(query);
            });
        }

        // Apply template filter
        if (filterBy !== 'all') {
            resumes = resumes.filter(resume =>
                resume.templateSettings?.templateName === filterBy
            );
        }

        // Apply sorting
        resumes.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'created':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                case 'score':
                    const scoreA = a.analysis?.atsScore || a.analysis?.score || 0;
                    const scoreB = b.analysis?.atsScore || b.analysis?.score || 0;
                    return scoreB - scoreA;
                case 'progress':
                    const progressA = a.analysis?.completeness || 0;
                    const progressB = b.analysis?.completeness || 0;
                    return progressB - progressA;
                case 'updated':
                default:
                    const dateA = new Date(a.updatedAt || a.updated || 0);
                    const dateB = new Date(b.updatedAt || b.updated || 0);
                    return dateB - dateA;
            }
        });

        return resumes;
    }, [userResumes, activeTab, searchQuery, filterBy, sortBy]);

    // Handle sync with cloud
    const handleSync = useCallback(async () => {
        if (syncing) return;

        setSyncing(true);
        try {
            console.log('🔄 [Dashboard] Syncing with cloud...');
            const success = await syncWithCloud();
            if (success) {
                console.log('✅ [Dashboard] Sync successful');
                toast.success('Synced successfully!');
            }
        } catch (error) {
            console.error('❌ [Dashboard] Sync error:', error);
            // Don't show toast if already showing "Using local data"
            if (!error.message.includes('Rate limited') && !error.message.includes('429')) {
                toast.error('Failed to sync with cloud');
            }
        } finally {
            setSyncing(false);
        }
    }, [syncWithCloud, syncing]);

    // Handle create resume - Navigate to builder home
    const handleCreateResume = useCallback(async () => {
        if (creatingResume) return;

        console.log('📝 [Dashboard] Creating new resume...');
        setCreatingResume(true);

        try {
            // Navigate to builder home to choose creation method
            navigate('/builder');
        } catch (error) {
            console.error('❌ [Dashboard] Create resume error:', error);
            toast.error(error.message || 'Failed to create resume');
        } finally {
            setCreatingResume(false);
        }
    }, [navigate, creatingResume]);

    // Handle refresh resumes
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            console.log('🔄 [Dashboard] Refreshing resumes...');
            await loadUserResumes(true); // Force refresh
            toast.success('Resumes refreshed!');
        } catch (error) {
            console.error('❌ [Dashboard] Refresh error:', error);
            // Don't show toast for rate limiting
            if (!error.message.includes('Rate limited') && !error.message.includes('429')) {
                toast.error('Failed to refresh resumes');
            }
        } finally {
            setIsRefreshing(false);
        }
    }, [loadUserResumes, isRefreshing]);

    // Handle edit resume - Navigate with ONLY ID
    const handleEditResume = useCallback((resumeId, e) => {
        if (e) e.stopPropagation();
        if (!resumeId) {
            console.error('❌ [Dashboard] No resume ID provided for edit');
            toast.error('Invalid resume');
            return;
        }
        console.log('✏️ [Dashboard] Editing resume ID:', resumeId);

        // Pass ONLY the ID, no data - Builder will fetch fresh data from DB
        navigate(`/builder/${resumeId}`);
    }, [navigate]);

    // Handle preview resume - Navigate with ONLY ID
    const handlePreviewResume = useCallback((resumeId, e) => {
        if (e) e.stopPropagation();
        if (!resumeId) {
            console.error('❌ [Dashboard] No resume ID provided for preview');
            toast.error('Invalid resume');
            return;
        }
        console.log('👁️ [Dashboard] Previewing resume ID:', resumeId);

        // Pass ONLY the ID - Preview will fetch fresh data from DB
        navigate(`/preview/${resumeId}`);
    }, [navigate]);

    // Handle delete resume
    const handleDeleteResume = useCallback(async (resumeId) => {
        if (!resumeId) {
            toast.error('No resume selected');
            return;
        }

        try {
            console.log('🗑️ [Dashboard] Deleting resume:', resumeId);
            const success = await deleteResume(resumeId);
            if (success) {
                setShowDeleteModal(null);
                setSelectedResumes(prev => prev.filter(id => id !== resumeId));
                toast.success('Resume deleted successfully');
                console.log('✅ [Dashboard] Resume deleted successfully');
            }
        } catch (error) {
            console.error('❌ [Dashboard] Delete error:', error);
            toast.error('Failed to delete resume');
        }
    }, [deleteResume]);

    // Handle duplicate resume
    const handleDuplicateResume = useCallback(async (resumeId, e) => {
        if (e) e.stopPropagation();
        if (!resumeId) {
            toast.error('No resume selected');
            return;
        }

        try {
            console.log('📋 [Dashboard] Duplicating resume:', resumeId);
            const duplicated = await duplicateResume(resumeId);
            if (duplicated) {
                toast.success('Resume duplicated successfully');
                console.log('✅ [Dashboard] Resume duplicated successfully');
            }
        } catch (error) {
            console.error('❌ [Dashboard] Duplicate error:', error);
            toast.error('Failed to duplicate resume');
        }
    }, [duplicateResume]);

    // Handle select resume
    const handleSelectResume = useCallback((resumeId, e) => {
        if (e) e.stopPropagation();

        setSelectedResumes(prev => {
            if (prev.includes(resumeId)) {
                return prev.filter(id => id !== resumeId);
            } else {
                return [...prev, resumeId];
            }
        });
    }, []);

    // Handle select all
    const handleSelectAll = useCallback(() => {
        setSelectedResumes(prev => {
            if (prev.length === filteredResumes.length) {
                return [];
            } else {
                return filteredResumes.map(r => r._id).filter(id => id);
            }
        });
    }, [filteredResumes]);

    // Handle bulk delete
    const handleBulkDelete = useCallback(async () => {
        if (selectedResumes.length === 0) return;

        try {
            console.log(`🗑️ [Dashboard] Deleting ${selectedResumes.length} resumes...`);
            const promises = selectedResumes.map(id => deleteResume(id));
            await Promise.all(promises);
            toast.success(`Deleted ${selectedResumes.length} resumes`);
            setSelectedResumes([]);
            setShowDeleteModal(null);
        } catch (error) {
            console.error('❌ [Dashboard] Bulk delete error:', error);
            toast.error('Failed to delete resumes');
        }
    }, [selectedResumes, deleteResume]);

    // Handle bulk download
    const handleBulkDownload = useCallback(() => {
        if (selectedResumes.length === 0) return;

        console.log(`📥 [Dashboard] Downloading ${selectedResumes.length} resumes...`);
        toast.success(`Preparing ${selectedResumes.length} resumes for download`);
        // In a real app, you would initiate download process here
        setSelectedResumes([]);
    }, [selectedResumes]);

    // Format date
    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'Never';

        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                if (diffHours === 0) return 'Just now';
                return `${diffHours}h ago`;
            }
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    }, []);

    // Get status badge
    const getStatusBadge = useCallback((resume) => {
        const status = resume.status || 'draft';
        const completeness = resume.analysis?.completeness || 0;

        // Determine status based on completeness if status is not explicitly set
        let effectiveStatus = status;
        if (status === 'draft' && completeness >= 90) {
            effectiveStatus = 'completed';
        } else if (status === 'draft' && completeness >= 50) {
            effectiveStatus = 'in_progress';
        }

        switch (effectiveStatus) {
            case 'completed':
                return (
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        In Progress
                    </span>
                );
            case 'needs_work':
                return (
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Needs Work
                    </span>
                );
            case 'draft':
            default:
                return (
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Draft
                    </span>
                );
        }
    }, []);

    // Get progress color
    const getProgressColor = useCallback((progress) => {
        if (progress >= 90) return 'bg-emerald-500';
        if (progress >= 70) return 'bg-green-500';
        if (progress >= 50) return 'bg-yellow-500';
        if (progress >= 30) return 'bg-orange-500';
        return 'bg-red-500';
    }, []);

    // Get score color
    const getScoreColor = useCallback((score) => {
        if (score >= 90) return 'text-emerald-600';
        if (score >= 80) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        if (score >= 60) return 'text-orange-600';
        return 'text-red-600';
    }, []);

    // Get progress text color
    const getProgressTextColor = useCallback((progress) => {
        if (progress >= 90) return 'text-emerald-700';
        if (progress >= 70) return 'text-green-700';
        if (progress >= 50) return 'text-yellow-700';
        if (progress >= 30) return 'text-orange-700';
        return 'text-red-700';
    }, []);

    // Get cloud status text
    const getCloudStatusText = useCallback(() => {
        if (cloudStatus.isConnected) {
            return cloudStatus.lastSync
                ? `Synced ${formatDate(cloudStatus.lastSync)}`
                : 'Connected to cloud';
        }
        return 'Offline - Local only';
    }, [cloudStatus.isConnected, cloudStatus.lastSync, formatDate]);

    // Get resume progress
    const getResumeProgress = useCallback((resume) => {
        // Use analysis completeness if available
        if (resume.analysis?.completeness !== undefined) {
            return resume.analysis.completeness;
        }

        // Calculate basic progress based on filled sections
        let filledSections = 0;
        let totalSections = 6; // personalInfo, summary, experience, education, skills, projects

        if (resume.personalInfo?.firstName && resume.personalInfo?.lastName) filledSections++;
        if (resume.summary?.trim().length > 50) filledSections++;
        if (resume.experience?.length > 0) filledSections++;
        if (resume.education?.length > 0) filledSections++;
        if (resume.skills?.length >= 3) filledSections++;
        if (resume.projects?.length > 0) filledSections++;

        return Math.round((filledSections / totalSections) * 100);
    }, []);

    // Get resume ATS score
    const getResumeATSScore = useCallback((resume) => {
        return resume.analysis?.atsScore || resume.analysis?.score || 0;
    }, []);

    // Get resume job title
    const getResumeJobTitle = useCallback((resume) => {
        return resume.personalInfo?.jobTitle || 'No job title specified';
    }, []);

    // Get resume name
    const getResumeName = useCallback((resume) => {
        const personalInfo = resume.personalInfo || {};
        if (personalInfo.firstName || personalInfo.lastName) {
            return `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim();
        }
        return '';
    }, []);

    // Handle import resume
    const handleImportResume = useCallback(() => {
        console.log('📤 [Dashboard] Navigating to import resume');
        navigate('/builder/import');
    }, [navigate]);

    // Handle logout
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout');
        }
    }, [logout, navigate]);

    // Loading state
    if (isLoading && userResumes.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
                        />
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Loading Dashboard</h3>
                        <p className="text-slate-600">Fetching your resumes...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Empty state
    const isEmptyState = !isLoading && userResumes.length === 0 && !searchQuery && filterBy === 'all';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
                                Welcome back, <span className="text-blue-600">{user?.name?.split(' ')[0] || 'User'}</span>!
                            </h1>
                            <p className="text-slate-600">
                                {userResumes.length > 0
                                    ? `You have ${userResumes.length} resume${userResumes.length !== 1 ? 's' : ''}`
                                    : 'Create your first professional resume'
                                }
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleSync}
                                disabled={syncing || !cloudStatus?.isConnected || saveStatus === 'saving'}
                                className={`px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${cloudStatus?.isConnected
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50'
                                    : 'bg-gradient-to-r from-slate-400 to-slate-500 text-white cursor-not-allowed'
                                    }`}
                            >
                                {syncing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : cloudStatus?.isConnected ? (
                                    <>
                                        <Cloud className="w-5 h-5" />
                                        <span>Sync Now</span>
                                    </>
                                ) : (
                                    <>
                                        <CloudOff className="w-5 h-5" />
                                        <span>Offline</span>
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing || isLoading}
                                className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isRefreshing ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-5 h-5" />
                                )}
                                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>

                            <button
                                onClick={handleCreateResume}
                                disabled={creatingResume}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingResume ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Plus className="w-5 h-5" />
                                )}
                                <span>{creatingResume ? 'Creating...' : 'New Resume'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Cloud Status Bar */}
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${cloudStatus?.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span className="text-sm font-medium text-slate-700">
                                {getCloudStatusText()}
                            </span>
                            {saveStatus === 'saving' && (
                                <span className="flex items-center gap-1 text-sm text-amber-600">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Saving...
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {cloudStatus?.hasChanges && (
                                <span className="text-sm text-amber-600">
                                    • Unsaved changes
                                </span>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Total Resumes</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stats.total}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{userResumes.length > 0 ? 'Updated recently' : 'Start creating'}</span>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Completed</p>
                                    <h3 className="text-3xl font-bold text-emerald-600">{stats.completed}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">Ready to use</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">In Progress</p>
                                    <h3 className="text-3xl font-bold text-blue-600">{stats.inProgress}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                    <RefreshCw className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-600">Being worked on</p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-slate-500 text-sm font-medium mb-1">Avg ATS Score</p>
                                    <h3 className="text-3xl font-bold text-slate-900">{stats.averageATSScore}%</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <BarChart3 className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-slate-600">
                                <Target className="w-4 h-4 mr-1 text-amber-500" />
                                <span>Best: {stats.bestATSScore}%</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Search and Filter Bar - Only show if we have resumes */}
                    {userResumes.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            placeholder="Search resumes by title, job title, or keywords..."
                                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <select
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
                                        value={filterBy}
                                        onChange={(e) => setFilterBy(e.target.value)}
                                    >
                                        <option value="all">All Templates</option>
                                        <option value="modern">Modern</option>
                                        <option value="professional">Professional</option>
                                        <option value="creative">Creative</option>
                                        <option value="executive">Executive</option>
                                        <option value="minimal">Minimal</option>
                                        <option value="tech">Tech</option>
                                    </select>

                                    <select
                                        className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                    >
                                        <option value="updated">Last Updated</option>
                                        <option value="created">Date Created</option>
                                        <option value="title">Title A-Z</option>
                                        <option value="score">ATS Score</option>
                                        <option value="progress">Progress</option>
                                    </select>

                                    <div className="flex border border-slate-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`px-3 py-3 ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'bg-white text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <Grid className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-3 ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'bg-white text-slate-600 hover:text-slate-900'}`}
                                        >
                                            <List className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                            ? tab.id === 'all' ? 'bg-blue-100 text-blue-700' :
                                                tab.id === 'draft' ? 'bg-slate-100 text-slate-700' :
                                                    tab.id === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                        tab.id === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-amber-100 text-amber-700'
                                            : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <tab.icon className="w-4 h-4" />
                                        {tab.label}
                                        <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                            ? tab.id === 'all' ? 'bg-blue-200 text-blue-800' :
                                                tab.id === 'draft' ? 'bg-slate-200 text-slate-800' :
                                                    tab.id === 'in_progress' ? 'bg-blue-200 text-blue-800' :
                                                        tab.id === 'completed' ? 'bg-emerald-200 text-emerald-800' :
                                                            'bg-amber-200 text-amber-800'
                                            : 'bg-slate-200 text-slate-700'
                                            }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bulk Actions Bar */}
                    {selectedResumes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 mb-6 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-slate-900">
                                        {selectedResumes.length} resume{selectedResumes.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleBulkDownload}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal('bulk')}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => setSelectedResumes([])}
                                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Main Content */}
                    {isEmptyState ? (
                        // Empty State
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center"
                        >
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-8">
                                <FileText className="w-12 h-12 text-blue-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                No Resumes Yet
                            </h3>
                            <p className="text-slate-600 max-w-md mx-auto mb-8">
                                Start building your professional resume to land your dream job. Choose from templates or import your existing resume.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleCreateResume}
                                    disabled={creatingResume}
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    {creatingResume ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                    <span>{creatingResume ? 'Creating...' : 'Create New Resume'}</span>
                                </button>
                                <button
                                    onClick={handleImportResume}
                                    className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    <span>Import Resume</span>
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Resume Grid/List View */}
                            {filteredResumes.length > 0 ? (
                                viewMode === 'grid' ? (
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {filteredResumes.map((resume, index) => {
                                            const progress = getResumeProgress(resume);
                                            const atsScore = getResumeATSScore(resume);
                                            const jobTitle = getResumeJobTitle(resume);
                                            const resumeName = getResumeName(resume);
                                            const isSelected = selectedResumes.includes(resume._id);

                                            return (
                                                <motion.div
                                                    key={resume._id || index}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                                    whileHover={{ y: -4 }}
                                                    className={`bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden transition-all cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                                                    onClick={() => handleSelectResume(resume._id)}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-10 h-10 rounded-lg ${resume.templateSettings?.accentColor ? `bg-[${resume.templateSettings.accentColor}]` : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                                                                        } flex items-center justify-center`}
                                                                >
                                                                    <FileText className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-slate-900 text-lg">
                                                                        {resume.title || 'Untitled Resume'}
                                                                    </h3>
                                                                    <p className="text-slate-600 text-sm">
                                                                        {resumeName || jobTitle || 'No details'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => handleSelectResume(resume._id, e)}
                                                                className={`w-6 h-6 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'}`}
                                                            >
                                                                {isSelected && (
                                                                    <CheckSquare className="w-4 h-4 text-white" />
                                                                )}
                                                            </button>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-medium text-slate-700">Progress</span>
                                                                    <span className={`text-sm font-bold ${getProgressTextColor(progress)}`}>
                                                                        {progress}%
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-200 rounded-full h-2">
                                                                    <div
                                                                        className={`h-full rounded-full ${getProgressColor(progress)} transition-all duration-300`}
                                                                        style={{ width: `${progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="w-4 h-4 text-slate-400" />
                                                                    <span className="text-sm text-slate-600">ATS Score</span>
                                                                </div>
                                                                <span className={`font-bold ${getScoreColor(atsScore)}`}>
                                                                    {atsScore}%
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                                    <span className="text-sm text-slate-600">
                                                                        {formatDate(resume.updatedAt || resume.createdAt)}
                                                                    </span>
                                                                </div>
                                                                {getStatusBadge(resume)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => handleEditResume(resume._id, e)}
                                                                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handlePreviewResume(resume._id, e)}
                                                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                                                                title="Preview"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDuplicateResume(resume._id, e)}
                                                                className="p-2 text-slate-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors"
                                                                title="Duplicate"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (resume._id) {
                                                                        setShowDeleteModal(resume._id);
                                                                    }
                                                                }}
                                                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    // List View
                                    <motion.div
                                        layout
                                        className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
                                    >
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="py-4 px-6 text-left">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={handleSelectAll}
                                                                className={`w-5 h-5 rounded border flex items-center justify-center ${selectedResumes.length === filteredResumes.length && filteredResumes.length > 0
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : 'border-slate-300'
                                                                    }`}
                                                            >
                                                                {selectedResumes.length === filteredResumes.length && filteredResumes.length > 0 && (
                                                                    <CheckSquare className="w-3 h-3 text-white" />
                                                                )}
                                                            </button>
                                                            <span className="font-medium text-slate-700">Title</span>
                                                        </div>
                                                    </th>
                                                    <th className="py-4 px-6 text-left font-medium text-slate-700">Status</th>
                                                    <th className="py-4 px-6 text-left font-medium text-slate-700">Progress</th>
                                                    <th className="py-4 px-6 text-left font-medium text-slate-700">ATS Score</th>
                                                    <th className="py-4 px-6 text-left font-medium text-slate-700">Last Updated</th>
                                                    <th className="py-4 px-6 text-left font-medium text-slate-700">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredResumes.map((resume, index) => {
                                                    const progress = getResumeProgress(resume);
                                                    const atsScore = getResumeATSScore(resume);
                                                    const isSelected = selectedResumes.includes(resume._id);

                                                    return (
                                                        <motion.tr
                                                            key={resume._id || index}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.2, delay: index * 0.05 }}
                                                            className={`border-b border-slate-100 hover:bg-slate-50 ${isSelected ? 'bg-blue-50' : ''
                                                                }`}
                                                        >
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={(e) => handleSelectResume(resume._id, e)}
                                                                        className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                                                                            }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <CheckSquare className="w-3 h-3 text-white" />
                                                                        )}
                                                                    </button>
                                                                    <div
                                                                        className="cursor-pointer"
                                                                        onClick={() => handleEditResume(resume._id)}
                                                                    >
                                                                        <h4 className="font-medium text-slate-900">
                                                                            {resume.title || 'Untitled Resume'}
                                                                        </h4>
                                                                        <p className="text-sm text-slate-600">
                                                                            {getResumeJobTitle(resume)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                {getStatusBadge(resume)}
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="w-32">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className={`text-sm font-medium ${getProgressTextColor(progress)}`}>
                                                                            {progress}%
                                                                        </span>
                                                                    </div>
                                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                                        <div
                                                                            className={`h-full rounded-full ${getProgressColor(progress)}`}
                                                                            style={{ width: `${progress}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className={`font-bold ${getScoreColor(atsScore)}`}>
                                                                    {atsScore}%
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6 text-slate-600">
                                                                {formatDate(resume.updatedAt || resume.createdAt)}
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={(e) => handleEditResume(resume._id, e)}
                                                                        className="p-2 text-slate-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handlePreviewResume(resume._id, e)}
                                                                        className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-white rounded-lg transition-colors"
                                                                        title="Preview"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => handleDuplicateResume(resume._id, e)}
                                                                        className="p-2 text-slate-600 hover:text-purple-600 hover:bg-white rounded-lg transition-colors"
                                                                        title="Duplicate"
                                                                    >
                                                                        <Copy className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            if (resume._id) {
                                                                                setShowDeleteModal(resume._id);
                                                                            }
                                                                        }}
                                                                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </motion.div>
                                )
                            ) : (
                                // No results state
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center"
                                >
                                    <Search className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                        No Matching Resumes
                                    </h3>
                                    <p className="text-slate-600 max-w-md mx-auto mb-8">
                                        No resumes found for your search criteria. Try adjusting your filters or creating a new resume.
                                    </p>
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        <button
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterBy('all');
                                                setActiveTab('all');
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all inline-flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Clear Filters
                                        </button>
                                        <button
                                            onClick={handleCreateResume}
                                            className="px-6 py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-medium hover:bg-emerald-50 transition-all inline-flex items-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create New
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>

                {/* Quick Templates Modal */}
                <AnimatePresence>
                    {showQuickTemplates && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowQuickTemplates(false)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900">Choose a Template</h3>
                                            <p className="text-slate-600">Select a template to start building your resume</p>
                                        </div>
                                        <button
                                            onClick={() => setShowQuickTemplates(false)}
                                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                                        >
                                            <X className="w-6 h-6 text-slate-500" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {quickTemplates.map((template) => (
                                            <motion.button
                                                key={template.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => {
                                                    setShowQuickTemplates(false);
                                                    navigate(`/builder?template=${template.id}`);
                                                }}
                                                className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-blue-300 hover:shadow-lg transition-all group"
                                            >
                                                <div className={`w-full h-32 rounded-lg bg-gradient-to-r ${template.color} mb-4 flex items-center justify-center`}>
                                                    <template.icon className="w-12 h-12 text-white" />
                                                </div>
                                                <h4 className="font-bold text-slate-900 mb-2">{template.name}</h4>
                                                <p className="text-sm text-slate-600 mb-4">{template.description}</p>
                                                <div className="flex items-center text-blue-600 font-medium group-hover:text-blue-700">
                                                    <span>Use Template</span>
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Modal */}
                <AnimatePresence>
                    {showDeleteModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowDeleteModal(null)}
                        >
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-900 text-center mb-4">
                                    {showDeleteModal === 'bulk'
                                        ? `Delete ${selectedResumes.length} Resumes?`
                                        : 'Delete Resume?'}
                                </h3>
                                <p className="text-slate-600 text-center mb-8">
                                    {showDeleteModal === 'bulk'
                                        ? `Are you sure you want to delete ${selectedResumes.length} selected resumes? This action cannot be undone.`
                                        : 'Are you sure you want to delete this resume? This action cannot be undone.'}
                                </p>
                                <div className="flex gap-4 justify-center">
                                    <button
                                        onClick={() => setShowDeleteModal(null)}
                                        className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={showDeleteModal === 'bulk' ? handleBulkDelete : () => handleDeleteResume(showDeleteModal)}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-pink-700 transition-all"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Dashboard;