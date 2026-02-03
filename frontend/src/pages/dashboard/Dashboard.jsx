// src/pages/dashboard/Dashboard.jsx - COMPLETELY UPDATED VERSION
import React, { useState, useCallback, useMemo, useDeferredValue, Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Import the unified API service - FIXED IMPORT
import apiService from '../../services/api';

// Context - FIXED: Changed from useResume to useResumes
import { useAuth } from '../../context/AuthContext';
import { useResumes } from '../../context/ResumeContext';

// Icons
import {
    Plus,
    Sparkle,
    FileText,
    Download,
    Loader2,
    AlertCircle,
    Clock,
    Zap,
    RefreshCw,
    FilePlus,
    BarChart3,
    Moon,
    Sun,
    TrendingUp,
    TrendingDown,
    Star,
    AlertTriangle,
    CheckCircle,
    HardDrive,
    Activity,
    Wifi,
    WifiOff,
    Search,
    BarChart,
    DownloadCloud,
    Info,
    Edit,
    Trash2,
    LayoutDashboard,
    Settings
} from 'lucide-react';

// Lazy load components
const DashboardSkeleton = lazy(() => import('../../components/dashboard/DashboardSkeleton'));
const DeleteConfirmationModal = lazy(() => import('../../components/dashboard/DeleteConfirmationModal'));
const RecentResumesGrid = lazy(() => import('../../components/dashboard/RecentResumesGrid'));
const ResumeFilters = lazy(() => import('../../components/dashboard/ResumeFilters'));
const StatsCards = lazy(() => import('../../components/dashboard/StatsCards'));
const ATSInsightsPanel = lazy(() => import('../../components/dashboard/ATSInsightsPanel'));
const Navbar = lazy(() => import('../../components/Navbar'));

// ==================== CUSTOM HOOKS ====================

const useDashboardStats = (userId) => {
    return useQuery({
        queryKey: ['dashboardStats', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');
            try {
                // FIX: Use correct API service - use apiService.dashboard.getDashboardStats
                const stats = await apiService.dashboard.getDashboardStats(userId);
                return {
                    totalResumes: stats.totalResumes || 0,
                    completedResumes: stats.completedResumes || 0,
                    inProgressResumes: stats.inProgressResumes || 0,
                    draftResumes: stats.draftResumes || 0,
                    averageAtsScore: stats.averageAtsScore || 0,
                    onlineUsers: stats.onlineUsers || 1,
                    activeSessions: stats.activeSessions || 0,
                    storageUsed: stats.storageUsed || '0 MB',
                    storageLimit: stats.storageLimit || '500 MB',
                    lastSynced: new Date().toISOString(),
                    recentActivity: stats.recentActivity || [],
                    totalViews: stats.totalViews || 0,
                    totalDownloads: stats.totalDownloads || 0,
                    highScoreResumes: stats.highScoreResumes || 0,
                    needsImprovementResumes: stats.needsImprovementResumes || 0,
                    completionRate: stats.completionRate || 0
                };
            } catch (error) {
                console.error('Failed to fetch dashboard stats from DB:', error);
                // Return fallback data
                return {
                    totalResumes: 0,
                    completedResumes: 0,
                    inProgressResumes: 0,
                    draftResumes: 0,
                    averageAtsScore: 0,
                    onlineUsers: 1,
                    activeSessions: 1,
                    storageUsed: '0 MB',
                    storageLimit: '500 MB',
                    lastSynced: new Date().toISOString(),
                    recentActivity: [],
                    totalViews: 0,
                    totalDownloads: 0,
                    highScoreResumes: 0,
                    needsImprovementResumes: 0,
                    completionRate: 0
                };
            }
        },
        enabled: !!userId,
        staleTime: 2 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: 1
    });
};

const useUserResumes = (userId) => {
    return useQuery({
        queryKey: ['userResumes', userId],
        queryFn: async () => {
            if (!userId) throw new Error('User ID required');
            try {
                // FIX: Use correct API service - use apiService.resume.getUserResumes
                const resumes = await apiService.resume.getUserResumes(userId);

                // Handle different response formats
                let resumesData = [];
                if (Array.isArray(resumes)) {
                    resumesData = resumes;
                } else if (resumes?.data && Array.isArray(resumes.data)) {
                    resumesData = resumes.data;
                } else if (resumes?.resumes && Array.isArray(resumes.resumes)) {
                    resumesData = resumes.resumes;
                } else {
                    // If it's already an object with resumes data, use it directly
                    resumesData = resumes || [];
                }

                console.log('Fetched resumes data:', resumesData); // Debug log

                if (!Array.isArray(resumesData)) {
                    return []; // Return empty array if not an array
                }

                return resumesData.map(resume => ({
                    _id: resume._id || resume.id,
                    id: resume._id || resume.id,
                    title: resume.title || 'Untitled Resume',
                    template: resume.template || 'modern',
                    status: resume.status || 'draft',
                    isPrimary: resume.isPrimary || false,
                    isStarred: resume.isStarred || false,
                    analysis: resume.analysis || {
                        atsScore: resume.atsScore || 0,
                        completeness: resume.completeness || 0,
                        suggestions: resume.suggestions || []
                    },
                    personalInfo: resume.personalInfo || {
                        fullName: resume.personalInfo?.fullName || resume.fullName || '',
                        email: resume.personalInfo?.email || resume.email || '',
                        phone: resume.personalInfo?.phone || resume.phone || ''
                    },
                    updatedAt: resume.updatedAt || resume.lastUpdated || new Date().toISOString(),
                    createdAt: resume.createdAt || new Date().toISOString(),
                    tags: Array.isArray(resume.tags) ? resume.tags : [],
                    views: resume.views || 0,
                    downloads: resume.downloads || 0,
                    userId: resume.userId || userId
                }));
            } catch (error) {
                console.error('Failed to fetch resumes from DB:', error);
                return []; // Return empty array on error
            }
        },
        enabled: !!userId,
        staleTime: 3 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        retry: 1
    });
};

// ==================== UTILITY FUNCTIONS ====================

const filterAndSortResumes = (resumes, searchQuery, filters) => {
    const query = searchQuery.toLowerCase().trim();
    let filtered = [...resumes];

    if (query) {
        filtered = filtered.filter(resume => {
            const titleMatch = resume.title?.toLowerCase().includes(query);
            const nameMatch = resume.personalInfo?.fullName?.toLowerCase().includes(query);
            return titleMatch || nameMatch;
        });
    }

    if (filters.status !== 'all') {
        filtered = filtered.filter(resume => {
            if (filters.status === 'completed') return resume.status === 'completed';
            if (filters.status === 'draft') return resume.status === 'draft';
            if (filters.status === 'starred') return resume.isStarred;
            if (filters.status === 'primary') return resume.isPrimary;
            if (filters.status === 'ats-high') return resume.analysis?.atsScore >= 80;
            if (filters.status === 'ats-low') return resume.analysis?.atsScore < 60;
            return resume.status === filters.status;
        });
    }

    filtered.sort((a, b) => {
        const aDate = new Date(a.updatedAt || a.createdAt);
        const bDate = new Date(b.updatedAt || b.createdAt);

        switch (filters.sortBy) {
            case 'updatedAt':
                return filters.sortOrder === 'desc' ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime();
            case 'atsScore':
                return filters.sortOrder === 'desc' ? (b.analysis?.atsScore || 0) - (a.analysis?.atsScore || 0) : (a.analysis?.atsScore || 0) - (b.analysis?.atsScore || 0);
            case 'title':
                return filters.sortOrder === 'desc' ? b.title?.localeCompare(a.title || '') : a.title?.localeCompare(b.title || '');
            default:
                return 0;
        }
    });

    return filtered;
};

const calculateEnhancedStats = (dashboardStats, rawResumes, selectedResumes) => {
    const totalResumes = rawResumes.length;
    const completedResumes = rawResumes.filter(r => r.status === 'completed').length;
    const draftResumes = rawResumes.filter(r => r.status === 'draft').length;

    const atsScores = rawResumes.filter(r => r.analysis?.atsScore).map(r => r.analysis.atsScore);
    const averageAtsScore = atsScores.length > 0 ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : 0;

    const highScoreResumes = rawResumes.filter(r => r.analysis?.atsScore >= 80).length;
    const needsImprovementResumes = rawResumes.filter(r => r.analysis?.atsScore < 60).length;

    const totalViews = rawResumes.reduce((sum, r) => sum + (r.views || 0), 0);
    const totalDownloads = rawResumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

    const storageUsedMB = parseFloat(dashboardStats.storageUsed?.replace(' MB', '') || 0);
    const storageLimitMB = parseFloat(dashboardStats.storageLimit?.replace(' MB', '') || 500);

    return {
        ...dashboardStats,
        totalResumes,
        completedResumes,
        draftResumes,
        averageAtsScore,
        highScoreResumes,
        needsImprovementResumes,
        totalViews,
        totalDownloads,
        selectedCount: selectedResumes.length,
        storageUsedPercentage: storageLimitMB > 0 ? (storageUsedMB / storageLimitMB) * 100 : 0,
        hasResumes: totalResumes > 0,
        completionRate: totalResumes > 0 ? Math.round((completedResumes / totalResumes) * 100) : 0
    };
};

// ATS Score Card Component
const ATSMetricCard = ({ title, value, icon: Icon, color, description, darkMode, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${darkMode
                ? 'bg-gray-800/50 border-gray-700 hover:border-blue-500 hover:bg-gray-800'
                : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
        >
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {description}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mb-1">
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {value}
                </div>
            </div>
        </motion.div>
    );
};

// ==================== MAIN COMPONENT ====================

const Dashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // FIXED: Changed from useResume to useResumes
    const { refreshResumes } = useResumes();

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [filters, setFilters] = useState({
        status: 'all',
        sortBy: 'updatedAt',
        sortOrder: 'desc',
        template: 'all'
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [resumeToDelete, setResumeToDelete] = useState(null);
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [darkMode, setDarkMode] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Apply dark mode class to document
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    // Check for stored theme preference
    useEffect(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            setDarkMode(true);
        }
    }, []);

    // Queries using unified API service - FIXED endpoints
    const {
        data: dashboardStatsData,
        isLoading: isStatsLoading,
        refetch: refetchStats
    } = useDashboardStats(user?._id || user?.id);

    const {
        data: rawResumes = [],
        isLoading: isResumesLoading,
        refetch: refetchResumes
    } = useUserResumes(user?._id || user?.id);

    // Derived Data
    const filteredResumes = useMemo(() =>
        filterAndSortResumes(rawResumes, deferredSearchQuery, filters),
        [rawResumes, deferredSearchQuery, filters]
    );

    const enhancedStats = useMemo(() =>
        calculateEnhancedStats(dashboardStatsData || {}, rawResumes, selectedResumes),
        [dashboardStatsData, rawResumes, selectedResumes]
    );

    // ATS Metrics Cards
    const atsMetrics = [
        {
            title: 'Overall Score',
            value: `${enhancedStats.averageAtsScore}%`,
            icon: BarChart,
            color: enhancedStats.averageAtsScore >= 80 ? 'text-green-600' :
                enhancedStats.averageAtsScore >= 60 ? 'text-blue-600' :
                    'text-amber-600',
            description: 'Average ATS compatibility',
            onClick: () => navigate('/analyzer')
        },
        {
            title: 'High Scores',
            value: enhancedStats.highScoreResumes,
            icon: Star,
            color: 'text-green-600',
            description: 'Resumes with 80+ ATS score',
            onClick: () => setFilters(prev => ({ ...prev, status: 'ats-high' }))
        },
        {
            title: 'Need Improvement',
            value: enhancedStats.needsImprovementResumes,
            icon: AlertTriangle,
            color: 'text-red-600',
            description: 'Resumes below 60 ATS score',
            onClick: () => setFilters(prev => ({ ...prev, status: 'ats-low' }))
        },
        {
            title: 'Completion Rate',
            value: `${enhancedStats.completionRate}%`,
            icon: CheckCircle,
            color: enhancedStats.completionRate >= 80 ? 'text-green-600' :
                enhancedStats.completionRate >= 60 ? 'text-blue-600' :
                    'text-amber-600',
            description: 'Complete resumes',
            onClick: () => setFilters(prev => ({ ...prev, status: 'completed' }))
        }
    ];

    // Create resume mutation - FIXED: Use apiService.resume.createResume
    const createMutation = useMutation({
        mutationFn: (resumeData) => apiService.resume.createResume(resumeData),
        onMutate: () => {
            toast.loading('Creating resume...', { id: 'create-resume' });
        },
        onSuccess: (createdResume) => {
            toast.success('Resume created successfully!', { id: 'create-resume', icon: '📄' });

            // Get the resume ID from response
            const resumeId = createdResume._id || createdResume.id || createdResume.data?._id;

            if (resumeId && !resumeId.startsWith('temp_')) {
                // Navigate immediately with real ID
                navigate(`/builder/edit/${resumeId}`);
            } else {
                console.error('Invalid resume ID returned from create:', createdResume);
                toast.error('Failed to get valid resume ID from server');
            }
        },
        onError: (err) => {
            toast.error('Failed to create resume: ' + (err.message || 'Please try again'), { id: 'create-resume' });
            console.error('Create resume error:', err);
        },
        onSettled: () => {
            // Invalidate queries to refetch from server
            queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id || user?.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?._id || user?.id] });
        },
    });

    // Delete resume mutation - FIXED: Use apiService.resume.deleteResume
    const deleteMutation = useMutation({
        mutationFn: (resumeId) => apiService.resume.deleteResume(resumeId),
        onSuccess: () => {
            toast.success('Resume deleted successfully');
            setSelectedResumes(prev => prev.filter(id => id !== resumeToDelete?._id));
        },
        onError: (err) => toast.error('Failed to delete resume: ' + (err.message || 'Please try again')),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id || user?.id] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?._id || user?.id] });
        },
    });

    // Export resume mutation - FIXED: Use apiService.resume.exportResume
    const exportMutation = useMutation({
        mutationFn: ({ resumeId, format }) => apiService.resume.exportResume(resumeId, format),
        onMutate: ({ resumeId }) => toast.loading('Exporting...', { id: `export-${resumeId}` }),
        onSuccess: (data, { resumeId, format }) => {
            toast.success(`Exported as ${format.toUpperCase()}!`, { id: `export-${resumeId}` });
            // Note: exportResume should handle the download internally
            // No need to create download link here
        },
        onError: (err, { resumeId }) => toast.error('Export failed: ' + (err.message || 'Please try again'), { id: `export-${resumeId}` }),
    });

    // Event Handlers
    const handleCreateResume = useCallback(() => {
        if (!user?._id && !user?.id) {
            toast.error('User not authenticated');
            return;
        }

        const newResumeData = {
            title: `${user?.name?.split(' ')[0] || 'My'}'s Resume`,
            template: 'modern',
            personalInfo: {
                fullName: user?.name || '',
                email: user?.email || ''
            },
            status: 'draft',
            isPrimary: rawResumes.length === 0,
            userId: user._id || user.id
        };
        createMutation.mutate(newResumeData);
    }, [user, createMutation, rawResumes.length]);

    const handleDeleteResume = useCallback((resume) => {
        setResumeToDelete(resume);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDeleteResume = useCallback(() => {
        if (!resumeToDelete?._id) return;
        deleteMutation.mutate(resumeToDelete._id);
        setIsDeleteModalOpen(false);
        setResumeToDelete(null);
    }, [resumeToDelete, deleteMutation]);

    const handleExportResume = useCallback((resumeId, format = 'pdf') => {
        exportMutation.mutate({ resumeId, format });
    }, [exportMutation]);

    const handleRefresh = useCallback(() => {
        setIsSyncing(true);
        Promise.all([
            refetchStats(),
            refetchResumes(),
            refreshResumes && refreshResumes()
        ])
            .then(() => {
                toast.success('Dashboard refreshed!');
            })
            .catch((error) => {
                console.error('Refresh error:', error);
                toast.error('Refresh failed: ' + (error.message || 'Please try again'));
            })
            .finally(() => {
                setIsSyncing(false);
            });
    }, [refetchStats, refetchResumes, refreshResumes]);

    const handleSelectResume = useCallback((resumeId) => {
        setSelectedResumes(prev => prev.includes(resumeId) ? prev.filter(id => id !== resumeId) : [...prev, resumeId]);
    }, []);

    const handleBulkExport = useCallback(async (format = 'pdf') => {
        if (selectedResumes.length === 0) {
            toast.error('No resumes selected');
            return;
        }
        toast.loading(`Exporting ${selectedResumes.length} resumes...`, { id: 'bulk-export' });
        try {
            // For bulk export, we'll handle each individually for now
            const promises = selectedResumes.map(resumeId =>
                apiService.resume.exportResume(resumeId, format)
            );
            const results = await Promise.all(promises);
            toast.success(`Exported ${selectedResumes.length} resumes!`, { id: 'bulk-export' });
        } catch (error) {
            toast.error('Bulk export failed: ' + (error.message || 'Please try again'), { id: 'bulk-export' });
        }
    }, [selectedResumes]);

    // Navigation
    const navMenuItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, active: true },
        { label: 'Builder', href: '/builder', icon: FilePlus },
        { label: 'Templates', href: '/templates', icon: FileText },
        { label: 'Analyzer', href: '/analyzer', icon: BarChart3 },
        { label: 'Settings', href: '/settings', icon: Settings }
    ];

    // Loading & Error States
    if (isResumesLoading || isStatsLoading) {
        return (
            <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
                <DashboardSkeleton darkMode={darkMode} />
            </Suspense>
        );
    }

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gradient-to-b from-gray-50 to-blue-50/30'}`}>
            {/* Navbar */}
            <Suspense fallback={<div className="h-16 border-b dark:border-gray-700" />}>
                <Navbar
                    user={user}
                    menuItems={navMenuItems}
                    onSearch={setSearchQuery}
                    searchQuery={searchQuery}
                    darkMode={darkMode}
                    onToggleDarkMode={() => setDarkMode(!darkMode)}
                />
            </Suspense>

            {/* Main Content */}
            <main className="pt-20 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                                {/* Welcome & Stats Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h1 className={`text-2xl md:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                                            Welcome back,{' '}
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                                {user?.name?.split(' ')[0] || 'User'}
                                            </span>
                                        </h1>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {enhancedStats.hasResumes
                                                ? `You have ${enhancedStats.totalResumes} resume${enhancedStats.totalResumes !== 1 ? 's' : ''} • ${enhancedStats.averageAtsScore}% avg ATS score`
                                                : 'Create your first professional resume to get started'
                                            }
                                        </p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-3">
                                        <button
                                            onClick={handleRefresh}
                                            disabled={isSyncing}
                                            className={`p-2 rounded-lg transition-colors ${darkMode
                                                ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-50'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50'
                                                }`}
                                        >
                                            {isSyncing ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Date & Create Button Row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                                            <Clock className="w-4 h-4" />
                                            {new Date().toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleCreateResume}
                                            disabled={createMutation.isPending}
                                            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 group"
                                        >
                                            {createMutation.isPending ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                            )}
                                            <span>New Resume</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Selection Bar */}
                    {selectedResumes.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'}`}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                                        <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {selectedResumes.length} resume{selectedResumes.length !== 1 ? 's' : ''} selected
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleBulkExport('pdf')}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export All
                                    </button>
                                    <button
                                        onClick={() => setSelectedResumes([])}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ATS Metrics Grid */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                ATS Performance Overview
                            </h2>
                            <button
                                onClick={() => navigate('/analyzer')}
                                className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                Full Analysis
                            </button>
                        </div>

                        {/* ATS Metrics Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {atsMetrics.map((metric, index) => (
                                <ATSMetricCard
                                    key={index}
                                    title={metric.title}
                                    value={metric.value}
                                    icon={metric.icon}
                                    color={metric.color}
                                    description={metric.description}
                                    darkMode={darkMode}
                                    onClick={metric.onClick}
                                />
                            ))}
                        </div>

                        {/* Stats Cards */}
                        <Suspense fallback={<div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-32" />}>
                            <StatsCards
                                stats={enhancedStats}
                                loading={isStatsLoading}
                                darkMode={darkMode}
                                onStatClick={(statKey) => {
                                    if (statKey === 'totalResumes') document.getElementById('resumes-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        </Suspense>
                    </div>

                    {/* Mobile Create Button */}
                    <div className="mb-6 md:hidden">
                        <button
                            onClick={handleCreateResume}
                            disabled={createMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            <span>Create New Resume</span>
                        </button>
                    </div>

                    {/* Resume Section */}
                    <div id="resumes-section" className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className={`text-xl font-semibold mb-1 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Your Resumes
                                    {enhancedStats.totalResumes > 0 && (
                                        <span className={`text-sm font-normal ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                            ({enhancedStats.totalResumes})
                                        </span>
                                    )}
                                </h2>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {filteredResumes.length} of {rawResumes.length} shown
                                    {searchQuery && ` • Searching: "${searchQuery}"`}
                                </p>
                            </div>

                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Suspense fallback={<div className={`w-64 h-10 rounded-lg animate-pulse ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />}>
                                    <ResumeFilters
                                        searchQuery={searchQuery}
                                        onSearch={setSearchQuery}
                                        filters={filters}
                                        onFilterChange={setFilters}
                                        totalResumes={rawResumes.length}
                                        filteredResumesCount={filteredResumes.length}
                                        onClearFilters={() => {
                                            setSearchQuery('');
                                            setFilters({ status: 'all', sortBy: 'updatedAt', sortOrder: 'desc' });
                                        }}
                                        darkMode={darkMode}
                                    />
                                </Suspense>
                            </div>
                        </div>

                        {/* Recent Resumes Grid */}
                        <Suspense fallback={<div className={`rounded-xl shadow-sm border p-6 h-96 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} />}>
                            <RecentResumesGrid
                                resumes={filteredResumes}
                                searchQuery={deferredSearchQuery}
                                filters={filters}
                                selectedResumes={selectedResumes}
                                onEdit={(resume) => navigate(`/builder/edit/${resume._id || resume.id}`)}
                                onView={(resumeId) => navigate(`/preview/${resumeId}`)}
                                onDelete={handleDeleteResume}
                                onExport={handleExportResume}
                                onSelect={handleSelectResume}
                                onCreateResume={handleCreateResume}
                                isCreating={createMutation.isPending}
                                isLoading={isResumesLoading}
                                isEmpty={filteredResumes.length === 0}
                                hasSelection={selectedResumes.length > 0}
                                darkMode={darkMode}
                            />
                        </Suspense>
                    </div>

                    {/* Storage Usage */}
                    {enhancedStats.storageUsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-xl shadow-sm border p-5 mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    <HardDrive className="w-4 h-4 text-gray-500" />
                                    Storage Usage
                                </h3>
                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {enhancedStats.storageUsed} / {enhancedStats.storageLimit}
                                </span>
                            </div>
                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Usage</span>
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                                        {Math.round(enhancedStats.storageUsedPercentage)}%
                                    </span>
                                </div>
                                <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${enhancedStats.storageUsedPercentage > 80
                                            ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                            : enhancedStats.storageUsedPercentage > 60
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                                            }`}
                                        style={{ width: `${Math.min(100, enhancedStats.storageUsedPercentage)}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Delete Confirmation Modal */}
                    <Suspense fallback={null}>
                        <AnimatePresence>
                            {isDeleteModalOpen && resumeToDelete && (
                                <DeleteConfirmationModal
                                    isOpen={isDeleteModalOpen}
                                    onClose={() => {
                                        setIsDeleteModalOpen(false);
                                        setResumeToDelete(null);
                                    }}
                                    onConfirm={confirmDeleteResume}
                                    isLoading={deleteMutation.isPending}
                                    resumeTitle={resumeToDelete.title}
                                    darkMode={darkMode}
                                />
                            )}
                        </AnimatePresence>
                    </Suspense>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;