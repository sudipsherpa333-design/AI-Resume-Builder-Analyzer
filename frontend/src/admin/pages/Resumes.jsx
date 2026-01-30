// frontend/src/admin/pages/Resumes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    FiFileText,
    FiSearch,
    FiFilter,
    FiEye,
    FiDownload,
    FiTrash2,
    FiRefreshCw,
    FiUser,
    FiCalendar,
    FiBarChart2,
    FiTrendingUp,
    FiCheckCircle,
    FiXCircle,
    FiMoreVertical,
    FiExternalLink,
    FiPrinter,
    FiShare2,
    FiX,
    FiAlertCircle,
    FiArchive,
    FiUsers,
    FiDatabase,
    FiChevronLeft,
    FiChevronRight,
    FiEdit,
    FiCopy,
    FiLock,
    FiUnlock,
    FiClock,
    FiActivity,
    FiPercent,
    FiHardDrive
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// API Service for Database Operations
const API_SERVICE = {
    baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001',

    getAuthToken() {
        return localStorage.getItem('adminToken') || localStorage.getItem('token');
    },

    async fetch(endpoint, options = {}) {
        const token = this.getAuthToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers
                },
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('adminToken');
                    window.location.href = '/admin/login';
                    throw new Error('Session expired. Please login again.');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `API error: ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Updated endpoint paths
    async getResumes(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        return this.fetch(`/api/admin/resumes?${queryParams}`);
    },

    async getResumeStats() {
        return this.fetch('/api/admin/resumes/stats');
    },

    async getResumeDetails(id) {
        return this.fetch(`/api/admin/resumes/${id}`);
    },

    async deleteResume(id) {
        return this.fetch(`/api/resumes/${id}`, {
            method: 'DELETE'
        });
    },

    async exportResumes(format = 'csv') {
        return this.fetch(`/api/admin/resumes/export?format=${format}`);
    },

    async analyzeResume(id) {
        return this.fetch(`/api/resumes/${id}/analyze`, {
            method: 'POST'
        });
    },

    async updateResumeVisibility(id, isPublic) {
        return this.fetch(`/api/resumes/${id}/visibility`, {
            method: 'PUT',
            body: JSON.stringify({ isPublic })
        });
    },

    async duplicateResume(id) {
        return this.fetch(`/api/resumes/${id}/duplicate`, {
            method: 'POST'
        });
    },

    async bulkDeleteResumes(ids) {
        return this.fetch('/api/admin/resumes/bulk-delete', {
            method: 'POST',
            body: JSON.stringify({ ids })
        });
    }
};

const Resumes = () => {
    // Database State
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedResumes, setSelectedResumes] = useState([]);
    const [viewMode, setViewMode] = useState('table');

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Updated stats with default values
    const [stats, setStats] = useState({
        total: 0,
        analyzed: 0,
        pending: 0,
        failed: 0,
        totalSize: 0,
        avgScore: 0,
        uniqueUsers: 0,
        growth: 0,
        thisWeek: 0,
        thisMonth: 0
    });

    const [exporting, setExporting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [resumeDetails, setResumeDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [statsLoading, setStatsLoading] = useState(false);

    // Fetch resumes from database
    const fetchResumes = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                limit: pagination.limit,
                ...(search && { search }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(typeFilter !== 'all' && { type: typeFilter }),
                ...(dateFilter !== 'all' && { dateRange: dateFilter })
            };

            const response = await API_SERVICE.getResumes(params);

            if (response.success && response.data) {
                setResumes(response.data.resumes || []);
                setPagination(prev => ({
                    ...prev,
                    page: response.data.pagination?.page || page,
                    total: response.data.pagination?.total || 0,
                    pages: response.data.pagination?.pages || 0
                }));

                if (response.data.resumes?.length > 0) {
                    toast.success(`Loaded ${response.data.resumes.length} resumes`);
                }
            } else {
                throw new Error(response.message || 'Failed to fetch resumes');
            }
        } catch (error) {
            console.error('Error fetching resumes:', error);
            setError(error.message);
            toast.error('Failed to load resumes');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, typeFilter, dateFilter, pagination.limit]);

    // Fetch resume statistics from database with fallback
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const response = await API_SERVICE.getResumeStats();

            if (response.success) {
                // Handle different response structures
                const data = response.data || response;

                setStats({
                    total: data.totalResumes || data.total || 0,
                    analyzed: data.analyzed || (data.totalResumes - (data.pending || 0) - (data.failed || 0)) || 0,
                    pending: data.pending || 0,
                    failed: data.failed || 0,
                    totalSize: data.totalSize || 0,
                    avgScore: data.avgScore || data.averageScore || 0,
                    uniqueUsers: data.uniqueUsers || data.users || 0,
                    growth: data.growth || data.resumeGrowth || 0,
                    thisWeek: data.thisWeek || 0,
                    thisMonth: data.thisMonth || 0
                });
            } else {
                // Fallback to calculate from local data
                calculateLocalStats();
            }
        } catch (error) {
            console.warn('Error fetching stats, using local calculation:', error);
            // Don't show error toast for stats, just use local calculation
            calculateLocalStats();
        } finally {
            setStatsLoading(false);
        }
    }, [resumes]);

    // Calculate stats from local resumes data as fallback
    const calculateLocalStats = useCallback(() => {
        if (resumes.length === 0) return;

        const total = resumes.length;
        const analyzed = resumes.filter(r => r.analysis?.status === 'analyzed').length;
        const pending = resumes.filter(r => r.analysis?.status === 'pending').length;
        const failed = resumes.filter(r => r.analysis?.status === 'failed').length;
        const totalSize = resumes.reduce((sum, r) => sum + (r.fileSize || 0), 0);
        const avgScore = resumes.length > 0
            ? Math.round(resumes.reduce((sum, r) => sum + (r.analysis?.score || 0), 0) / resumes.length)
            : 0;
        const uniqueUsers = new Set(resumes.map(r => r.user?._id || r.userId)).size;

        setStats(prev => ({
            ...prev,
            total,
            analyzed,
            pending,
            failed,
            totalSize,
            avgScore,
            uniqueUsers
        }));
    }, [resumes]);

    // Load resume details
    const loadResumeDetails = useCallback(async (resumeId) => {
        setLoadingDetails(true);
        try {
            const response = await API_SERVICE.getResumeDetails(resumeId);
            if (response.success && response.data) {
                setResumeDetails(response.data);
                setShowResumeModal(true);
            } else {
                toast.error('Failed to load resume details');
            }
        } catch (error) {
            console.error('Error loading resume details:', error);
            toast.error('Failed to load resume details');
        } finally {
            setLoadingDetails(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchResumes();
    }, [fetchResumes]);

    // Load stats when resumes change or after initial load
    useEffect(() => {
        if (!loading && resumes.length > 0) {
            fetchStats();
        }
    }, [resumes, loading, fetchStats]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== '') {
                setPagination(prev => ({ ...prev, page: 1 }));
                fetchResumes(1);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, fetchResumes]);

    // Handle filter changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
        const timer = setTimeout(() => {
            fetchResumes(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [statusFilter, typeFilter, dateFilter, fetchResumes]);

    const handleRefresh = () => {
        fetchResumes(pagination.page);
        fetchStats();
        toast.success('Refreshing resume data...');
    };

    const handleResumeSelect = (resumeId) => {
        setSelectedResumes(prev =>
            prev.includes(resumeId)
                ? prev.filter(id => id !== resumeId)
                : [...prev, resumeId]
        );
    };

    const handleSelectAll = () => {
        if (selectedResumes.length === resumes.length) {
            setSelectedResumes([]);
        } else {
            setSelectedResumes(resumes.map(resume => resume._id || resume.id));
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const response = await API_SERVICE.exportResumes('csv');
            if (response.success) {
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resumes_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success('Resumes exported successfully');
            }
        } catch (error) {
            toast.error('Failed to export resumes');
        } finally {
            setExporting(false);
        }
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedResumes.length === 0) return;

        if (bulkAction === 'delete') {
            setShowDeleteModal(true);
            return;
        }

        try {
            if (bulkAction === 'analyze') {
                const promises = selectedResumes.map(id => API_SERVICE.analyzeResume(id));
                await Promise.all(promises);
                toast.success(`Analysis started for ${selectedResumes.length} resumes`);
            } else if (bulkAction === 'make_public') {
                const promises = selectedResumes.map(id => API_SERVICE.updateResumeVisibility(id, true));
                await Promise.all(promises);
                toast.success(`${selectedResumes.length} resumes made public`);
            } else if (bulkAction === 'make_private') {
                const promises = selectedResumes.map(id => API_SERVICE.updateResumeVisibility(id, false));
                await Promise.all(promises);
                toast.success(`${selectedResumes.length} resumes made private`);
            }

            setSelectedResumes([]);
            setBulkAction('');
            fetchResumes(pagination.page);
        } catch (error) {
            toast.error(`Failed to perform action: ${error.message}`);
        }
    };

    const handleDeleteResume = async (resumeId) => {
        try {
            await API_SERVICE.deleteResume(resumeId);
            toast.success('Resume deleted successfully');
            fetchResumes(pagination.page);
            fetchStats();
            setShowDeleteModal(false);
            setSelectedResume(null);
        } catch (error) {
            toast.error('Failed to delete resume');
        }
    };

    const handleBulkDelete = async () => {
        try {
            await API_SERVICE.bulkDeleteResumes(selectedResumes);
            toast.success(`Successfully deleted ${selectedResumes.length} resumes`);
            setSelectedResumes([]);
            setBulkAction('');
            setShowDeleteModal(false);
            fetchResumes(pagination.page);
            fetchStats();
        } catch (error) {
            toast.error('Failed to delete resumes');
        }
    };

    const handleAnalyzeResume = async (resumeId) => {
        try {
            await API_SERVICE.analyzeResume(resumeId);
            toast.success('Analysis started successfully');
            fetchResumes(pagination.page);
        } catch (error) {
            toast.error('Failed to analyze resume');
        }
    };

    const handleToggleVisibility = async (resumeId, isPublic) => {
        try {
            await API_SERVICE.updateResumeVisibility(resumeId, !isPublic);
            toast.success(`Resume ${isPublic ? 'made private' : 'made public'}`);
            fetchResumes(pagination.page);
        } catch (error) {
            toast.error('Failed to update visibility');
        }
    };

    const handleDuplicateResume = async (resumeId) => {
        try {
            await API_SERVICE.duplicateResume(resumeId);
            toast.success('Resume duplicated successfully');
            fetchResumes(pagination.page);
        } catch (error) {
            toast.error('Failed to duplicate resume');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const ScoreBadge = ({ score }) => {
        let color = 'bg-gray-100 text-gray-800 border-gray-200';
        if (score >= 80) color = 'bg-green-100 text-green-800 border-green-200';
        else if (score >= 60) color = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        else color = 'bg-red-100 text-red-800 border-red-200';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
                {score}%
            </span>
        );
    };

    const StatusBadge = ({ status }) => {
        const statusMap = {
            analyzed: {
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: FiCheckCircle,
                label: 'Analyzed'
            },
            analyzing: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: FiBarChart2,
                label: 'Analyzing'
            },
            pending: {
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: FiClock,
                label: 'Pending'
            },
            failed: {
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: FiXCircle,
                label: 'Failed'
            }
        };

        const config = statusMap[status] || statusMap.pending;
        const Icon = config.icon;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const TypeBadge = ({ type }) => {
        const typeMap = {
            pdf: {
                color: 'bg-red-100 text-red-800 border-red-200',
                label: 'PDF'
            },
            docx: {
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'DOCX'
            },
            txt: {
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                label: 'TXT'
            }
        };

        const config = typeMap[type] || typeMap.pdf;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    // Stats Card Component
    const StatsCard = ({ title, value, icon: Icon, color, subtitle, loading }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-8 w-20 bg-gray-200 rounded"></div>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    )}
                    {subtitle && !loading && (
                        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    // Resume Grid Card Component
    const ResumeCard = ({ resume }) => (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <FiFileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">
                            {resume.fileName || `Resume_${resume._id}`}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <TypeBadge type={resume.fileType || 'pdf'} />
                            <span className="text-xs text-gray-500">
                                {formatFileSize(resume.fileSize)}
                            </span>
                        </div>
                    </div>
                </div>
                <input
                    type="checkbox"
                    checked={selectedResumes.includes(resume._id || resume.id)}
                    onChange={() => handleResumeSelect(resume._id || resume.id)}
                    className="rounded border-gray-300 focus:ring-indigo-500"
                />
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User</span>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                                {resume.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <span className="text-sm text-gray-900 truncate max-w-[120px]">
                            {resume.user?.name || 'Unknown User'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Score</span>
                    <ScoreBadge score={resume.analysis?.score || 0} />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <StatusBadge status={resume.analysis?.status || 'pending'} />
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm text-gray-900">{formatDate(resume.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Visibility</span>
                    <button
                        onClick={() => handleToggleVisibility(resume._id || resume.id, resume.isPublic)}
                        className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${resume.isPublic
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}
                    >
                        {resume.isPublic ? (
                            <>
                                <FiUnlock className="w-3 h-3" />
                                Public
                            </>
                        ) : (
                            <>
                                <FiLock className="w-3 h-3" />
                                Private
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                    onClick={() => loadResumeDetails(resume._id || resume.id)}
                    className="flex-1 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                >
                    <FiEye className="inline w-4 h-4 mr-1" />
                    View
                </button>
                <a
                    href={resume.fileUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
                >
                    <FiDownload className="inline w-4 h-4 mr-1" />
                    Download
                </a>
                <button
                    onClick={() => {
                        setSelectedResume(resume);
                        setShowDeleteModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                    <FiTrash2 className="inline w-4 h-4 mr-1" />
                    Delete
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="px-6 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Resume Management</h2>
                        <p className="text-gray-600">View and manage all resumes in the database</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <FiDatabase className="w-4 h-4 text-indigo-600" />
                            <span>Connected to database</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-4 py-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                            >
                                Grid
                            </button>
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={exporting || resumes.length === 0}
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <FiDownload className={exporting ? 'animate-spin' : ''} />
                            {exporting ? 'Exporting...' : 'Export CSV'}
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-md hover:shadow-lg"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                    <StatsCard
                        title="Total Resumes"
                        value={stats.total}
                        icon={FiFileText}
                        color="bg-indigo-500"
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="Analyzed"
                        value={stats.analyzed}
                        icon={FiCheckCircle}
                        color="bg-green-500"
                        subtitle={`${stats.total > 0 ? Math.round((stats.analyzed / stats.total) * 100) : 0}% of total`}
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="Avg Score"
                        value={`${stats.avgScore}%`}
                        icon={FiPercent}
                        color="bg-blue-500"
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="Unique Users"
                        value={stats.uniqueUsers}
                        icon={FiUsers}
                        color="bg-purple-500"
                        loading={statsLoading}
                    />
                    <StatsCard
                        title="Total Size"
                        value={formatFileSize(stats.totalSize)}
                        icon={FiHardDrive}
                        color="bg-yellow-500"
                        loading={statsLoading}
                    />
                </div>

                {/* Bulk Actions */}
                {selectedResumes.length > 0 && (
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FiFileText className="text-indigo-600" />
                                <div>
                                    <span className="font-medium text-indigo-900">
                                        {selectedResumes.length} resume{selectedResumes.length !== 1 ? 's' : ''} selected
                                    </span>
                                    <p className="text-sm text-indigo-600 mt-1">
                                        Choose an action to perform on selected resumes
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                >
                                    <option value="">Select action...</option>
                                    <option value="analyze">Analyze Selected</option>
                                    <option value="make_public">Make Public</option>
                                    <option value="make_private">Make Private</option>
                                    <option value="delete">Delete Selected</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Apply Action
                                </button>
                                <button
                                    onClick={() => setSelectedResumes([])}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search resumes by filename, user, or content..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Status</option>
                                <option value="analyzed">Analyzed</option>
                                <option value="analyzing">Analyzing</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Types</option>
                                <option value="pdf">PDF</option>
                                <option value="docx">DOCX</option>
                                <option value="txt">TXT</option>
                            </select>

                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="year">This Year</option>
                            </select>

                            <select
                                value={pagination.limit}
                                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="5">5 per page</option>
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                                <option value="100">100 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Resumes Content */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading resumes from database...</p>
                        <p className="text-sm text-gray-400 mt-1">Please wait while we fetch the data</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <FiAlertCircle className="mx-auto text-red-400 text-5xl mb-4" />
                        <h3 className="text-lg font-medium text-red-600 mb-2">Database Connection Error</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Retry Connection
                            </button>
                            <button
                                onClick={() => setError(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                ) : resumes.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <FiFileText className="mx-auto text-gray-400 text-5xl mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Resumes Found</h3>
                        <p className="text-gray-600 mb-6">No resumes match your current filters or search criteria</p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    setSearch('');
                                    setStatusFilter('all');
                                    setTypeFilter('all');
                                    setDateFilter('all');
                                    fetchResumes(1);
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Clear All Filters
                            </button>
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {resumes.map((resume) => (
                                <ResumeCard key={resume._id || resume.id} resume={resume} />
                            ))}
                        </div>

                        {/* Pagination for Grid View */}
                        {pagination.pages > 1 && (
                            <div className="bg-white rounded-xl border border-gray-200 p-4">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> resumes
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => fetchResumes(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                        >
                                            <FiChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                                            const pageNum = i + 1;
                                            if (pagination.pages > 5) {
                                                if (pageNum === 1) return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => fetchResumes(pageNum)}
                                                        className={`w-10 h-10 rounded-lg text-sm transition-colors ${pagination.page === pageNum
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                                if (pageNum === 5) return (
                                                    <button
                                                        key="last"
                                                        onClick={() => fetchResumes(pagination.pages)}
                                                        className={`w-10 h-10 rounded-lg text-sm transition-colors ${pagination.page === pagination.pages
                                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pagination.pages}
                                                    </button>
                                                );
                                                if (pageNum === 3) return (
                                                    <span key="ellipsis" className="px-2 text-gray-400">
                                                        ...
                                                    </span>
                                                );
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => fetchResumes(pageNum)}
                                                    className={`w-10 h-10 rounded-lg text-sm transition-colors ${pagination.page === pageNum
                                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                        : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}
                                        <button
                                            onClick={() => fetchResumes(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                        >
                                            Next
                                            <FiChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // Table View
                    <>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left w-12">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedResumes.length === resumes.length && resumes.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="rounded border-gray-300 focus:ring-indigo-500"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Resume
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {resumes.map((resume) => (
                                            <tr key={resume._id || resume.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedResumes.includes(resume._id || resume.id)}
                                                        onChange={() => handleResumeSelect(resume._id || resume.id)}
                                                        className="rounded border-gray-300 focus:ring-indigo-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                                            <FiFileText className="w-5 h-5 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                                                {resume.fileName || `Resume_${resume._id}`}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                <span>{formatFileSize(resume.fileSize)}</span>
                                                                <span>•</span>
                                                                <span>{resume.downloads || 0} downloads</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                                            <span className="text-white text-xs font-medium">
                                                                {resume.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">
                                                                {resume.user?.name || 'Unknown User'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {resume.user?.email || ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <ScoreBadge score={resume.analysis?.score || 0} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={resume.analysis?.status || 'pending'} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <TypeBadge type={resume.fileType || 'pdf'} />
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {formatDate(resume.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => loadResumeDetails(resume._id || resume.id)}
                                                            className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <FiEye className="w-4 h-4" />
                                                        </button>
                                                        <a
                                                            href={resume.fileUrl || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <FiDownload className="w-4 h-4" />
                                                        </a>
                                                        <button
                                                            onClick={() => handleAnalyzeResume(resume._id || resume.id)}
                                                            className="p-1.5 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Analyze"
                                                        >
                                                            <FiBarChart2 className="w-4 h-4" />
                                                        </button>
                                                        <div className="relative group">
                                                            <button
                                                                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                                                title="More Actions"
                                                            >
                                                                <FiMoreVertical className="w-4 h-4" />
                                                            </button>
                                                            <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                                                <div className="py-1">
                                                                    <button
                                                                        onClick={() => window.open(resume.fileUrl || '#', '_blank')}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <FiExternalLink className="w-3 h-3 text-blue-600" />
                                                                        Open in New Tab
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDuplicateResume(resume._id || resume.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        <FiCopy className="w-3 h-3 text-purple-600" />
                                                                        Duplicate
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleToggleVisibility(resume._id || resume.id, resume.isPublic)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        {resume.isPublic ? (
                                                                            <>
                                                                                <FiLock className="w-3 h-3 text-yellow-600" />
                                                                                Make Private
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <FiUnlock className="w-3 h-3 text-green-600" />
                                                                                Make Public
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <div className="border-t border-gray-100 my-1"></div>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedResume(resume);
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                                                                    >
                                                                        <FiTrash2 className="w-3 h-3" />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Table Footer with Pagination */}
                            <div className="px-6 py-4 border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> resumes
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => fetchResumes(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                        >
                                            <FiChevronLeft className="w-4 h-4" />
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {(() => {
                                                const pages = [];
                                                const maxVisible = 5;
                                                let startPage = Math.max(1, pagination.page - Math.floor(maxVisible / 2));
                                                let endPage = Math.min(pagination.pages, startPage + maxVisible - 1);

                                                if (endPage - startPage + 1 < maxVisible) {
                                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                                }

                                                if (startPage > 1) {
                                                    pages.push(
                                                        <button
                                                            key={1}
                                                            onClick={() => fetchResumes(1)}
                                                            className="w-10 h-10 rounded-lg text-sm transition-colors border border-gray-300 hover:bg-gray-50"
                                                        >
                                                            1
                                                        </button>
                                                    );
                                                    if (startPage > 2) {
                                                        pages.push(
                                                            <span key="ellipsis1" className="px-2 text-gray-400">
                                                                ...
                                                            </span>
                                                        );
                                                    }
                                                }

                                                for (let i = startPage; i <= endPage; i++) {
                                                    pages.push(
                                                        <button
                                                            key={i}
                                                            onClick={() => fetchResumes(i)}
                                                            className={`w-10 h-10 rounded-lg text-sm transition-colors ${pagination.page === i
                                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {i}
                                                        </button>
                                                    );
                                                }

                                                if (endPage < pagination.pages) {
                                                    if (endPage < pagination.pages - 1) {
                                                        pages.push(
                                                            <span key="ellipsis2" className="px-2 text-gray-400">
                                                                ...
                                                            </span>
                                                        );
                                                    }
                                                    pages.push(
                                                        <button
                                                            key={pagination.pages}
                                                            onClick={() => fetchResumes(pagination.pages)}
                                                            className={`w-10 h-10 rounded-lg text-sm transition-colors ${pagination.page === pagination.pages
                                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pagination.pages}
                                                        </button>
                                                    );
                                                }

                                                return pages;
                                            })()}
                                        </div>
                                        <button
                                            onClick={() => fetchResumes(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                        >
                                            Next
                                            <FiChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FiTrash2 className="text-red-600 w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {selectedResume ? 'Delete Resume' : `Delete ${selectedResumes.length} Resumes`}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedResume ? `Delete ${selectedResume.fileName}?` : 'Delete selected resumes?'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                This action cannot be undone. All resume data, including analysis results and file, will be permanently deleted.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedResume) {
                                            handleDeleteResume(selectedResume._id || selectedResume.id);
                                        } else {
                                            handleBulkDelete();
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                                >
                                    Delete Permanently
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedResume(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resume Details Modal */}
                {showResumeModal && resumeDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <FiFileText className="text-indigo-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-xl">Resume Details</h3>
                                        <p className="text-sm text-gray-600">Complete resume information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowResumeModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {loadingDetails ? (
                                <div className="py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading resume details...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Resume Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-50 rounded-xl">
                                        <div className="flex-shrink-0">
                                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                                <FiFileText className="w-10 h-10 text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900">{resumeDetails.fileName}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <TypeBadge type={resumeDetails.fileType || 'pdf'} />
                                                <ScoreBadge score={resumeDetails.analysis?.score || 0} />
                                                <StatusBadge status={resumeDetails.analysis?.status || 'pending'} />
                                                <button
                                                    onClick={() => handleToggleVisibility(resumeDetails._id || resumeDetails.id, resumeDetails.isPublic)}
                                                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${resumeDetails.isPublic
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                        }`}
                                                >
                                                    {resumeDetails.isPublic ? (
                                                        <>
                                                            <FiUnlock className="w-3 h-3" />
                                                            Public
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiLock className="w-3 h-3" />
                                                            Private
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 mb-1">Resume ID</p>
                                            <p className="text-sm font-mono text-gray-700 truncate max-w-[200px]">
                                                {resumeDetails._id || resumeDetails.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Resume Information Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">File Information</label>
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">File Size</span>
                                                        <span className="font-medium text-gray-900">
                                                            {formatFileSize(resumeDetails.fileSize)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Downloads</span>
                                                        <span className="font-medium text-gray-900">
                                                            {resumeDetails.downloads || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Views</span>
                                                        <span className="font-medium text-gray-900">
                                                            {resumeDetails.views || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">File Type</span>
                                                        <span className="font-medium text-gray-900 uppercase">
                                                            {resumeDetails.fileType || 'PDF'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">User Information</label>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                                            <span className="text-white font-medium">
                                                                {resumeDetails.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{resumeDetails.user?.name || 'Unknown User'}</p>
                                                            <p className="text-sm text-gray-600">{resumeDetails.user?.email || ''}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                User ID: {resumeDetails.user?._id || resumeDetails.userId}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">Timeline</label>
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Created</span>
                                                        <span className="text-sm text-gray-900">
                                                            {formatDateTime(resumeDetails.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Last Updated</span>
                                                        <span className="text-sm text-gray-900">
                                                            {formatDateTime(resumeDetails.updatedAt || resumeDetails.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Last Analyzed</span>
                                                        <span className="text-sm text-gray-900">
                                                            {formatDateTime(resumeDetails.lastAnalyzed)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Last Downloaded</span>
                                                        <span className="text-sm text-gray-900">
                                                            {formatDateTime(resumeDetails.lastDownloaded)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {resumeDetails.analysis && (
                                                <div>
                                                    <label className="text-sm font-medium text-gray-500 mb-1 block">Analysis Metadata</label>
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-gray-600">Analysis Duration</span>
                                                            <span className="font-medium text-gray-900">
                                                                {resumeDetails.analysis.duration || 'N/A'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-gray-600">Keywords Found</span>
                                                            <span className="font-medium text-gray-900">
                                                                {resumeDetails.analysis.keywordsCount || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Analysis Results */}
                                    {resumeDetails.analysis && (
                                        <div className="border border-gray-200 rounded-lg p-5">
                                            <h4 className="font-bold text-gray-900 mb-4">Analysis Results</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 mb-2">Overall Score</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full"
                                                                style={{ width: `${resumeDetails.analysis.score}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="font-bold text-gray-900">{resumeDetails.analysis.score}%</span>
                                                    </div>
                                                </div>

                                                {resumeDetails.analysis.categories && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {Object.entries(resumeDetails.analysis.categories).map(([category, score]) => (
                                                            <div key={category} className="bg-gray-50 p-3 rounded-lg">
                                                                <p className="text-xs text-gray-500 mb-1">
                                                                    {category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-2">
                                                                        <div
                                                                            className="bg-indigo-500 h-1.5 rounded-full"
                                                                            style={{ width: `${score}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="font-medium text-gray-900">{score}%</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {resumeDetails.analysis.suggestions && resumeDetails.analysis.suggestions.length > 0 && (
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-2">Suggestions for Improvement</p>
                                                        <ul className="space-y-2">
                                                            {resumeDetails.analysis.suggestions.map((suggestion, index) => (
                                                                <li key={index} className="flex items-start gap-2 text-sm">
                                                                    <FiAlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                                                    <span className="text-gray-700">{suggestion}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                        <a
                                            href={resumeDetails.fileUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                                        >
                                            <FiDownload className="w-4 h-4" />
                                            Download Resume
                                        </a>
                                        <button
                                            onClick={() => handleAnalyzeResume(resumeDetails._id || resumeDetails.id)}
                                            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
                                        >
                                            <FiBarChart2 className="w-4 h-4" />
                                            Re-analyze
                                        </button>
                                        <button
                                            onClick={() => handleDuplicateResume(resumeDetails._id || resumeDetails.id)}
                                            className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                        >
                                            <FiCopy className="w-4 h-4" />
                                            Duplicate
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedResume(resumeDetails);
                                                setShowDeleteModal(true);
                                                setShowResumeModal(false);
                                            }}
                                            className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Resumes;