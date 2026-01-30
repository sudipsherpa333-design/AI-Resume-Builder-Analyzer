// src/context/DashboardContext.jsx - FIXED INTEGRATION VERSION
import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';

const DashboardContext = createContext();

export const useDashboard = () => {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error('useDashboard must be used within DashboardProvider');
    }
    return context;
};

export const DashboardProvider = ({ children }) => {
    const { user, userId, isDevelopment } = useAuth();

    // State
    const [notifications, setNotifications] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasDemoData, setHasDemoData] = useState(false);

    // Generate demo data for development
    const generateDemoData = useCallback(() => {
        console.log('🏗️ Generating demo dashboard data');

        const demoStats = {
            totalResumes: 3,
            completedResumes: 2,
            draftResumes: 1,
            publishedResumes: 1,
            totalViews: 1245,
            totalDownloads: 42,
            averageAtsScore: 78,
            storageUsed: '45 MB',
            storageLimit: '500 MB',
            lastSynced: new Date().toISOString(),
            templateUsage: {
                modern: 2,
                classic: 1
            },
            highScoreResumes: 1,
            needsImprovementResumes: 0
        };

        const demoNotifications = [
            {
                id: 'notif-1',
                type: 'success',
                title: 'Resume Analysis Complete',
                message: 'Your "Software Engineer" resume scored 85/100 on ATS',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                read: false,
                icon: '✅'
            },
            {
                id: 'notif-2',
                type: 'info',
                title: 'New Template Available',
                message: 'Check out our new "Executive" template',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                read: true,
                icon: '🎨'
            },
            {
                id: 'notif-3',
                type: 'warning',
                title: 'Storage Usage',
                message: 'You\'ve used 45MB of your 500MB storage',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                read: false,
                icon: '💾'
            }
        ];

        const demoActivity = [
            {
                id: 'act-1',
                type: 'updated',
                title: 'Updated Software Engineer Resume',
                description: 'Added 3 new projects and updated skills',
                timestamp: new Date(Date.now() - 1800000).toISOString(),
                icon: '📝'
            },
            {
                id: 'act-2',
                type: 'created',
                title: 'Created Product Manager Resume',
                description: 'Used Modern template with custom sections',
                timestamp: new Date(Date.now() - 86400000).toISOString(),
                icon: '✨'
            },
            {
                id: 'act-3',
                type: 'exported',
                title: 'Exported Resume as PDF',
                description: 'Downloaded Senior Developer resume',
                timestamp: new Date(Date.now() - 172800000).toISOString(),
                icon: '📄'
            },
            {
                id: 'act-4',
                type: 'analyzed',
                title: 'Analyzed Resume ATS Score',
                description: 'Received 92/100 for Tech Lead resume',
                timestamp: new Date(Date.now() - 259200000).toISOString(),
                icon: '📊'
            }
        ];

        return { demoStats, demoNotifications, demoActivity };
    }, []);

    // Fetch dashboard stats - handles both real API and demo data
    const {
        data: dashboardStats,
        isLoading: statsLoading,
        error: statsError,
        refetch: refetchStats
    } = useQuery({
        queryKey: ['dashboard-stats', userId],
        queryFn: async () => {
            // For development mode, return demo data
            if (isDevelopment) {
                const { demoStats } = generateDemoData();
                setHasDemoData(true);
                return demoStats;
            }

            // PRODUCTION: Real API call
            if (!userId) {
                throw new Error('User not authenticated');
            }

            try {
                const response = await api.get(`/dashboard/stats/${userId}`);
                setHasDemoData(false);
                return response;
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);

                // Fallback to demo data on API failure
                if (isDevelopment) {
                    const { demoStats } = generateDemoData();
                    setHasDemoData(true);
                    return demoStats;
                }

                // Return minimal fallback data
                return {
                    totalResumes: 0,
                    completedResumes: 0,
                    draftResumes: 0,
                    publishedResumes: 0,
                    totalViews: 0,
                    totalDownloads: 0,
                    averageAtsScore: 0,
                    storageUsed: '0 MB',
                    storageLimit: '500 MB',
                    lastSynced: new Date().toISOString(),
                    templateUsage: {},
                    highScoreResumes: 0,
                    needsImprovementResumes: 0
                };
            }
        },
        enabled: !!user, // Only fetch when user exists
        staleTime: 2 * 60 * 1000, // 2 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1
    });

    // Fetch notifications
    const { data: fetchedNotifications = [] } = useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            // For development mode, return demo notifications
            if (isDevelopment) {
                const { demoNotifications } = generateDemoData();
                return demoNotifications;
            }

            // PRODUCTION: Real API call
            if (!userId) return [];

            try {
                const response = await api.get(`/users/${userId}/notifications`);
                return response;
            } catch (error) {
                console.error('Failed to fetch notifications:', error);

                // Fallback to demo data
                if (isDevelopment) {
                    const { demoNotifications } = generateDemoData();
                    return demoNotifications;
                }

                return [];
            }
        },
        enabled: !!user,
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    // Fetch recent activity
    const { data: fetchedActivity = [] } = useQuery({
        queryKey: ['recent-activity', userId],
        queryFn: async () => {
            // For development mode, return demo activity
            if (isDevelopment) {
                const { demoActivity } = generateDemoData();
                return demoActivity;
            }

            // PRODUCTION: Real API call
            if (!userId) return [];

            try {
                const response = await api.get(`/users/${userId}/activity`);
                return response;
            } catch (error) {
                console.error('Failed to fetch activity:', error);

                // Fallback to demo data
                if (isDevelopment) {
                    const { demoActivity } = generateDemoData();
                    return demoActivity;
                }

                return [];
            }
        },
        enabled: !!user,
        staleTime: 1 * 60 * 1000, // 1 minute
    });

    // Update state when data loads
    useEffect(() => {
        if (fetchedNotifications) {
            setNotifications(fetchedNotifications);
        }

        if (fetchedActivity) {
            setRecentActivity(fetchedActivity);
        }
    }, [fetchedNotifications, fetchedActivity]);

    // Refresh all dashboard data
    const refreshDashboard = useCallback(async () => {
        if (!user) {
            toast.error('Please login to refresh dashboard');
            return;
        }

        setIsRefreshing(true);

        try {
            await refetchStats();
            toast.success('Dashboard refreshed');
        } catch (error) {
            console.error('Refresh failed:', error);
            toast.error('Refresh failed');
        } finally {
            setIsRefreshing(false);
        }
    }, [refetchStats, user]);

    // Mark notification as read
    const markNotificationAsRead = useCallback(async (notificationId) => {
        try {
            if (user && userId && !isDevelopment) {
                await api.patch(`/users/${userId}/notifications/${notificationId}/read`);
            }

            // Update local state immediately for better UX
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId ? { ...notification, read: true } : notification
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Still update local state
            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId ? { ...notification, read: true } : notification
                )
            );
        }
    }, [user, userId, isDevelopment]);

    // Clear all notifications
    const clearAllNotifications = useCallback(async () => {
        try {
            if (user && userId && !isDevelopment) {
                await api.delete(`/users/${userId}/notifications`);
            }

            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            setNotifications([]);
        }
    }, [user, userId, isDevelopment]);

    // Quick actions
    const quickActions = useMemo(() => [
        {
            id: 'create-resume',
            title: 'Create New Resume',
            description: 'Start from scratch or use a template',
            icon: '📝',
            action: '/builder/new',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            id: 'import-resume',
            title: 'Import Resume',
            description: 'Upload and parse existing resume',
            icon: '📄',
            action: '/builder/import',
            color: 'from-emerald-500 to-green-500',
        },
        {
            id: 'analyze-resume',
            title: 'Analyze Resume',
            description: 'Get AI-powered feedback',
            icon: '🔍',
            action: '/analyzer',
            color: 'from-purple-500 to-pink-500',
        },
        {
            id: 'view-templates',
            title: 'View Templates',
            description: 'Browse professional templates',
            icon: '🎨',
            action: '/builder/templates',
            color: 'from-amber-500 to-orange-500'
        }
    ], []);

    // Calculate completion percentage based on available stats
    const completionPercentage = useMemo(() => {
        if (!dashboardStats?.totalResumes || dashboardStats.totalResumes === 0) return 0;
        return Math.round((dashboardStats.completedResumes / dashboardStats.totalResumes) * 100);
    }, [dashboardStats]);

    // Check for unread notifications
    const hasUnreadNotifications = useMemo(() => {
        return notifications.some(n => !n.read);
    }, [notifications]);

    // Get unread count
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    // Quick stats
    const quickStats = useMemo(() => ({
        total: dashboardStats?.totalResumes || 0,
        completed: dashboardStats?.completedResumes || 0,
        draft: dashboardStats?.draftResumes || 0,
        views: dashboardStats?.totalViews || 0,
        downloads: dashboardStats?.totalDownloads || 0,
        averageScore: dashboardStats?.averageAtsScore || 0,
        storageUsed: dashboardStats?.storageUsed || '0 MB',
        storageLimit: dashboardStats?.storageLimit || '500 MB'
    }), [dashboardStats]);

    // Storage usage percentage
    const storageUsagePercentage = useMemo(() => {
        if (!dashboardStats?.storageUsed || !dashboardStats?.storageLimit) return 0;

        const used = parseFloat(dashboardStats.storageUsed);
        const limit = parseFloat(dashboardStats.storageLimit);

        if (isNaN(used) || isNaN(limit) || limit === 0) return 0;

        return Math.round((used / limit) * 100);
    }, [dashboardStats]);

    const value = {
        // Data
        dashboardStats: dashboardStats || {},
        notifications,
        recentActivity,
        quickActions,

        // Loading states
        isLoading: statsLoading,
        isRefreshing,
        error: statsError,
        hasDemoData,

        // Actions
        refreshDashboard,
        markNotificationAsRead,
        clearAllNotifications,

        // Computed values
        completionPercentage,
        hasUnreadNotifications,
        unreadCount,
        storageUsagePercentage,

        // Quick stats
        quickStats,

        // Helper
        isDevelopment
    };

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};