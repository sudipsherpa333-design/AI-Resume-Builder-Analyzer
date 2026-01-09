// frontend/src/admin/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Users,
    FileText,
    TrendingUp,
    Clock,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Download,
    Upload,
    Eye,
    BarChart3,
    Cpu,
    Server,
    Database,
    Network,
    Shield,
    Zap,
    Cloud,
    Activity,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { useAdmin } from '../context/AdminContext';

// Stats Card Component
const StatsCard = ({
    title,
    value,
    change,
    icon,
    color = 'blue',
    loading = false
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800 text-green-700 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-5 transition-all duration-300 hover:shadow-lg ${colorClasses[color]}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${colorClasses[color]} bg-opacity-50`}>
                    {icon}
                </div>
                <div className={`text-sm font-medium px-2.5 py-1 rounded-full ${colorClasses[color]} bg-opacity-50`}>
                    {change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-medium opacity-80">{title}</h3>
                {loading ? (
                    <div className="h-8 w-24 bg-current bg-opacity-20 rounded animate-pulse"></div>
                ) : (
                    <p className="text-2xl font-bold">{value}</p>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                <div className="text-xs opacity-70">
                    Updated just now
                </div>
            </div>
        </motion.div>
    );
};

// Simple Line Chart Component
const SimpleLineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                <p>No chart data available</p>
            </div>
        );
    }

    // Simple chart rendering
    const maxValue = Math.max(...data.map(d => d.users + d.resumes));

    return (
        <div className="h-full flex items-end space-x-1">
            {data.slice(-15).map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex justify-center space-x-px">
                        <div
                            className="w-1/2 bg-blue-500 rounded-t"
                            style={{ height: `${(item.users / maxValue) * 100}%` }}
                        />
                        <div
                            className="w-1/2 bg-green-500 rounded-t"
                            style={{ height: `${(item.resumes / maxValue) * 100}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                        {new Date(item.date).getDate()}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                <p>No chart data available</p>
            </div>
        );
    }

    const maxUsage = Math.max(...data.map(d => d.usage));

    return (
        <div className="h-full space-y-3">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.usage} uses
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(item.usage / maxUsage) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// Loading Spinner Component
const LoadingSpinner = ({ size = "md", text = "Loading..." }) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
        xl: "h-16 w-16"
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-500`} />
            {text && (
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {text}
                </p>
            )}
        </div>
    );
};

// Main Dashboard Component
const AdminDashboard = () => {
    const { admin } = useAdmin();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [usingFallback, setUsingFallback] = useState(false);

    const fetchDashboardData = async (showToast = false) => {
        if (!showToast) setLoading(true);
        setRefreshing(true);

        try {
            const result = await dashboardService.getDashboardStats();

            if (result.success) {
                setStats(result.data);
                setLastUpdated(result.timestamp);
                setUsingFallback(false);

                if (showToast) {
                    toast.success('Dashboard updated successfully');
                }
            } else {
                if (result.fallback) {
                    setStats(result.data);
                    setUsingFallback(true);

                    toast.warning(
                        <div>
                            <p className="font-semibold">Using offline data</p>
                            <p className="text-sm opacity-90">Server connection unavailable</p>
                        </div>,
                        { duration: 5000 }
                    );
                } else {
                    toast.error(result.error || 'Failed to load dashboard data');
                }
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            toast.error('Unexpected error loading dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    if (loading && !stats) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" text="Loading dashboard..." />
            </div>
        );
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Welcome back, {admin?.name || 'Admin'}! Here's what's happening.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <AnimatePresence mode="wait">
                        {usingFallback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-sm font-medium"
                            >
                                <Cloud className="w-4 h-4" />
                                <span>Offline Mode</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => fetchDashboardData(true)}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-100 dark:border-gray-700 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
            </motion.div>

            {/* Status Indicator */}
            <AnimatePresence>
                {lastUpdated && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
                        </div>
                        {usingFallback && (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                <AlertCircle className="w-4 h-4" />
                                <span>Displaying cached data</span>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Summary Cards */}
            <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <motion.div variants={itemVariants}>
                    <StatsCard
                        title="Total Users"
                        value={stats?.summary?.totalUsers?.toLocaleString() || '1,284'}
                        change={stats?.analytics?.userGrowth || 23.5}
                        icon={<Users className="w-6 h-6" />}
                        color="blue"
                        loading={loading && !stats}
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <StatsCard
                        title="Total Resumes"
                        value={stats?.summary?.totalResumes?.toLocaleString() || '3,256'}
                        change={stats?.analytics?.resumeGrowth || 45.2}
                        icon={<FileText className="w-6 h-6" />}
                        color="green"
                        loading={loading && !stats}
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <StatsCard
                        title="Active Users"
                        value={stats?.summary?.activeUsers?.toLocaleString() || '847'}
                        change={12.3}
                        icon={<Activity className="w-6 h-6" />}
                        color="purple"
                        loading={loading && !stats}
                    />
                </motion.div>

                <motion.div variants={itemVariants}>
                    <StatsCard
                        title="Conversion Rate"
                        value={`${stats?.analytics?.conversionRate || 12.8}%`}
                        change={2.4}
                        icon={<TrendingUp className="w-6 h-6" />}
                        color="orange"
                        loading={loading && !stats}
                    />
                </motion.div>
            </motion.div>

            {/* Charts Section */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Activity Overview
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Last 30 days performance
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Users</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Resumes</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-64">
                        {stats?.timeline ? (
                            <SimpleLineChart data={stats.timeline} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <p>Chart data not available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Template Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Template Usage
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Most popular resume templates
                            </p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64">
                        {stats?.topTemplates ? (
                            <SimpleBarChart data={stats.topTemplates.slice(0, 5)} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                <p>Template data not available</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Recent Activity & System Health */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {stats?.recentActivity ? (
                            <>
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                New Users
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Past 24 hours
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stats.recentActivity.newUsers}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4" />
                                            +12.5%
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                New Resumes
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Past 24 hours
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stats.recentActivity.newResumes}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4" />
                                            +23.8%
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                            <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                AI Analyses
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Past 24 hours
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stats.recentActivity.aiAnalyses}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                            <ArrowUpRight className="w-4 h-4" />
                                            +18.2%
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <p>No recent activity data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Health */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        System Health
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Server Uptime
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Last 30 days
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.performance?.uptime || 99.8}%
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Excellent</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                    <Cpu className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        CPU Usage
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Current load
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(stats?.performance?.cpuUsage || 32.5, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats?.performance?.cpuUsage || 32.5}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Memory Usage
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Current utilization
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(stats?.performance?.memoryUsage || 67.2, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {stats?.performance?.memoryUsage || 67.2}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                                    <Network className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Response Time
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Average API response
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stats?.performance?.responseTime || 142}ms
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">Good</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border border-blue-100 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                        <Eye className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Reports</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                        <Download className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Export Data</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                        <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
                        <Upload className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AdminDashboard;