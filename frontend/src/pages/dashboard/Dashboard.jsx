import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
    Users,
    FileText,
    CheckCircle,
    Clock,
    Edit,
    TrendingUp,
    Download,
    Eye,
    Star,
    Search,
    Plus,
    Filter,
    RefreshCw,
    AlertCircle,
    BarChart3,
    Award,
    Target,
    Zap
} from 'lucide-react';

// Context
import { useAuth } from '../../context/AuthContext';
import { useResumes } from '../../context/ResumeContext'; // ✅ Changed to useResumes

// Services
import apiService from '../../services/api'; // ✅ Fixed import
// OR: import { dashboardService } from '../../services/api';

// Components
import Navbar from '../../components/Navbar';
import QuickActions from '../../components/dashboard/QuickActions';
import ResumeCard from '../../components/dashboard/ResumeCard';
import StatsCard from '../../components/dashboard/StatsCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import ATSMeter from '../../components/dashboard/ATSMeter';
import RecentResumes from '../../components/dashboard/RecentResumes';
import StorageUsage from '../../components/dashboard/StorageUsage';
import EmptyState from '../../components/dashboard/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { resumes: contextResumes, loading: contextLoading, refreshResumes } = useResumes(); // ✅ Changed to useResumes

    // State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('updatedAt');

    // Fetch dashboard stats using React Query
    const {
        data: queryStats,
        isLoading: queryStatsLoading,
        error: queryStatsError,
        refetch: refetchStats
    } = useQuery({
        queryKey: ['dashboardStats', user?.id],
        queryFn: async () => {
            if (!user?.id) {
                return null;
            }

            try {
                // ✅ FIXED: Use apiService.dashboard.getDashboardStats
                const statsData = await apiService.dashboard.getDashboardStats(user.id);
                return statsData;
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
                // Return default stats on error
                return getDefaultStats();
            }
        },
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        retryDelay: 1000
    });

    // Update local stats when query returns data
    useEffect(() => {
        if (queryStats) {
            setStats(queryStats);
            setLoadingStats(false);
        } else if (queryStatsError) {
            setStats(getDefaultStats());
            setLoadingStats(false);
        }
    }, [queryStats, queryStatsError]);

    // Fetch local stats as fallback
    useEffect(() => {
        const fetchLocalStats = async () => {
            try {
                // Calculate stats from local resumes if API fails
                const completed = contextResumes.filter(r => r.status === 'completed').length;
                const inProgress = contextResumes.filter(r => r.status === 'in-progress').length;
                const drafts = contextResumes.filter(r => r.status === 'draft').length;
                const avgScore = contextResumes.length > 0
                    ? Math.round(contextResumes.reduce((sum, r) => sum + (r.analysis?.atsScore || 0), 0) / contextResumes.length)
                    : 0;
                const highScore = contextResumes.filter(r => (r.analysis?.atsScore || 0) >= 80).length;
                const needsImprovement = contextResumes.filter(r => (r.analysis?.atsScore || 0) < 60).length;
                const totalViews = contextResumes.reduce((sum, r) => sum + (r.views || 0), 0);
                const totalDownloads = contextResumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

                setStats(prev => ({
                    ...prev,
                    totalResumes: contextResumes.length,
                    completedResumes: completed,
                    inProgressResumes: inProgress,
                    draftResumes: drafts,
                    averageAtsScore: avgScore,
                    totalViews: totalViews,
                    totalDownloads: totalDownloads,
                    highScoreResumes: highScore,
                    needsImprovementResumes: needsImprovement,
                    completionRate: contextResumes.length > 0
                        ? Math.round((completed / contextResumes.length) * 100)
                        : 0
                }));
                setLoadingStats(false);
            } catch (error) {
                console.error('Error calculating local stats:', error);
                setStats(getDefaultStats());
                setLoadingStats(false);
            }
        };

        if (!stats && contextResumes.length > 0) {
            fetchLocalStats();
        }
    }, [contextResumes, stats]);

    // Default stats function
    const getDefaultStats = () => {
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
    };

    // Filter and sort resumes
    const filteredResumes = useMemo(() => {
        let filtered = [...contextResumes];

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(resume =>
                resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                resume.personalInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (resume.tags && resume.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
            );
        }

        // Apply status filter
        if (filter !== 'all') {
            filtered = filtered.filter(resume => resume.status === filter);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'updatedAt':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'createdAt':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'atsScore':
                    return (b.analysis?.atsScore || 0) - (a.analysis?.atsScore || 0);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [contextResumes, searchTerm, filter, sortBy]);

    // Handle refresh
    const handleRefresh = async () => {
        try {
            await Promise.all([
                refetchStats(),
                refreshResumes()
            ]);
            toast.success('Dashboard refreshed');
        } catch (error) {
            toast.error('Failed to refresh');
        }
    };

    // Handle create new resume
    const handleCreateResume = () => {
        navigate('/builder/new');
    };

    // Handle resume click
    const handleResumeClick = (resumeId) => {
        navigate(`/builder/edit/${resumeId}`);
    };

    // Handle analyze resume
    const handleAnalyzeResume = (resumeId) => {
        navigate(`/analyzer/results/${resumeId}`);
    };

    // Loading state
    if (contextLoading || loadingStats) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                <Navbar />
                <div className="pt-16">
                    <LoadingSpinner
                        message="Loading your dashboard..."
                        size="lg"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className={`transition-all duration-200 ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-16`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user?.name?.split(' ')[0] || 'User'}!
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Here's what's happening with your resumes today.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleRefresh}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Refresh
                                </button>

                                <button
                                    onClick={handleCreateResume}
                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-md flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Resume
                                </button>
                            </div>
                        </div>

                        {/* Search and Filter */}
                        <div className="mt-6 flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search resumes by title, name, or tags..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="draft">Draft</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                >
                                    <option value="updatedAt">Last Updated</option>
                                    <option value="createdAt">Date Created</option>
                                    <option value="title">Title (A-Z)</option>
                                    <option value="atsScore">ATS Score</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatsCard
                            title="Total Resumes"
                            value={stats?.totalResumes || 0}
                            icon={FileText}
                            color="from-blue-500 to-cyan-500"
                            trend={stats?.totalResumes > 0 ? 'positive' : 'neutral'}
                        />

                        <StatsCard
                            title="Completed"
                            value={stats?.completedResumes || 0}
                            icon={CheckCircle}
                            color="from-green-500 to-emerald-500"
                            trend="positive"
                        />

                        <StatsCard
                            title="In Progress"
                            value={stats?.inProgressResumes || 0}
                            icon={Clock}
                            color="from-amber-500 to-orange-500"
                            trend="neutral"
                        />

                        <StatsCard
                            title="Average ATS Score"
                            value={`${stats?.averageAtsScore || 0}%`}
                            icon={TrendingUp}
                            color="from-purple-500 to-pink-500"
                            trend={stats?.averageAtsScore > 70 ? 'positive' : stats?.averageAtsScore > 50 ? 'neutral' : 'negative'}
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Quick Actions */}
                            <QuickActions
                                onCreateResume={handleCreateResume}
                                onAnalyzeAll={() => navigate('/analyzer')}
                                onViewTemplates={() => navigate('/builder/templates')}
                                onExportAll={() => toast.info('Export all feature coming soon')}
                            />

                            {/* Resumes List */}
                            <div className="bg-white rounded-xl shadow-md p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            Your Resumes ({filteredResumes.length})
                                        </h2>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {searchTerm ? `Search results for "${searchTerm}"` : 'All your resumes'}
                                        </p>
                                    </div>

                                    <div className="text-sm text-gray-500">
                                        Showing {filteredResumes.length} of {contextResumes.length}
                                    </div>
                                </div>

                                {filteredResumes.length === 0 ? (
                                    <EmptyState
                                        title={searchTerm ? "No matching resumes" : "No resumes yet"}
                                        message={searchTerm ? "Try a different search term" : "Create your first resume to get started"}
                                        icon={searchTerm ? Search : FileText}
                                        actionText="Create Resume"
                                        onAction={handleCreateResume}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredResumes.slice(0, 6).map((resume) => (
                                            <ResumeCard
                                                key={resume._id || resume.id}
                                                resume={resume}
                                                onClick={() => handleResumeClick(resume._id || resume.id)}
                                                onAnalyze={() => handleAnalyzeResume(resume._id || resume.id)}
                                                onEdit={() => handleResumeClick(resume._id || resume.id)}
                                                onStar={() => toast.info('Star feature coming soon')}
                                            />
                                        ))}
                                    </div>
                                )}

                                {filteredResumes.length > 6 && (
                                    <div className="mt-6 text-center">
                                        <Link
                                            to="/resumes"
                                            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            View all {filteredResumes.length} resumes
                                            <span>→</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* ATS Meter */}
                            <ATSMeter
                                score={stats?.averageAtsScore || 0}
                                highScore={stats?.highScoreResumes || 0}
                                needsImprovement={stats?.needsImprovementResumes || 0}
                                onImprove={() => navigate('/analyzer/ats')}
                            />
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-8">
                            {/* Recent Activity */}
                            <ActivityFeed
                                activities={stats?.recentActivity || []}
                                loading={false}
                                onViewAll={() => navigate('/dashboard/activity')}
                            />

                            {/* Recent Resumes */}
                            <RecentResumes
                                resumes={contextResumes.slice(0, 3)}
                                onResumeClick={handleResumeClick}
                            />

                            {/* Storage Usage */}
                            <StorageUsage
                                used={stats?.storageUsed || '0 MB'}
                                limit={stats?.storageLimit || '500 MB'}
                                onUpgrade={() => toast.info('Upgrade feature coming soon')}
                            />

                            {/* Completion Progress */}
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-md p-6 border border-blue-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Target className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Completion Progress</h3>
                                        <p className="text-sm text-gray-600">Overall resume completion</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-700">Completion Rate</span>
                                            <span className="font-semibold text-gray-900">{stats?.completionRate || 0}%</span>
                                        </div>
                                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                                                style={{ width: `${stats?.completionRate || 0}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-3">
                                        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                                            <div className="text-2xl font-bold text-blue-600">{stats?.totalViews || 0}</div>
                                            <div className="text-xs text-gray-600 mt-1">Total Views</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                                            <div className="text-2xl font-bold text-cyan-600">{stats?.totalDownloads || 0}</div>
                                            <div className="text-xs text-gray-600 mt-1">Downloads</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-md p-6 border border-amber-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-amber-100 rounded-lg">
                                        <Zap className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Quick Tips</h3>
                                        <p className="text-sm text-gray-600">Improve your resumes</p>
                                    </div>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>Complete all required sections for better ATS scores</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>Use action verbs and quantify achievements</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>Run ATS analysis before applying to jobs</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>Export as PDF for best compatibility</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <div className="mb-4 md:mb-0">
                            <p>Last synced: {stats?.lastSynced ? new Date(stats.lastSynced).toLocaleString() : 'Never'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <div className={`w-2 h-2 rounded-full ${stats?.onlineUsers > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <span>{stats?.onlineUsers || 0} online</span>
                            </span>
                            <button
                                onClick={handleRefresh}
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3" />
                                <span>Sync Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;