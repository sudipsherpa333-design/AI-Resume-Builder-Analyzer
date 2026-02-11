// src/pages/dashboard/Dashboard.jsx - FIXED COMPLETE VERSION
import React, { useState, useCallback, useMemo, useDeferredValue, Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

// Import the unified API service
import apiService from '../../services/api';

// Context
import { useAuth } from '../../context/AuthContext';

// Components
import Navbar from '../../components/Navbar';

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
  Eye,
  Edit,
  Trash2,
  Search,
  BarChart,
  DownloadCloud,
  Info,
  ExternalLink,
  Users,
  Target,
  Award,
  TrendingUp as TrendingUpIcon,
  Menu,
  X,
  Grid,
  List
} from 'lucide-react';

// Lazy load components
const DashboardSkeleton = lazy(() => import('../../components/dashboard/DashboardSkeleton'));
const DeleteConfirmationModal = lazy(() => import('../../components/dashboard/DeleteConfirmationModal'));

// ==================== CUSTOM HOOKS ====================
const useDashboardStats = (userId) => {
  return useQuery({
    queryKey: ['dashboardStats', userId],
    queryFn: async () => {
      if (!userId) {
        console.warn('⚠️ No user ID provided for dashboard stats');
        throw new Error('User ID required');
      }

      try {
        console.log('📊 Calculating dashboard stats from resumes...');

        // Check authentication
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ No authentication token found');
          throw new Error('User not authenticated');
        }

        console.log('✅ Token found, fetching resumes for stats...');

        // Get resumes to calculate stats
        const resumes = await apiService.resume.getUserResumes();

        if (!Array.isArray(resumes)) {
          console.warn('⚠️ Resumes data is not an array, returning default stats');
          return getDefaultStats();
        }

        console.log(`📈 Found ${resumes.length} resumes, calculating stats...`);

        // Calculate stats from resumes
        return calculateStatsFromResumes(resumes);
      } catch (error) {
        console.error('❌ Dashboard stats error:', error);

        // If it's an auth error, re-throw it
        if (error.message.includes('not authenticated') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized')) {
          console.error('🔐 Auth error detected, re-throwing for redirect');
          throw error;
        }

        // For other errors, return default stats
        console.warn('⚠️ Returning default stats due to error');
        return getDefaultStats();
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });
};

// Helper function to calculate stats from resumes
const calculateStatsFromResumes = (resumes) => {
  if (!Array.isArray(resumes) || resumes.length === 0) {
    return getDefaultStats();
  }

  const totalResumes = resumes.length;
  const completedResumes = resumes.filter(r => r.status === 'completed').length;
  const draftResumes = resumes.filter(r => r.status === 'draft').length;
  const inProgressResumes = resumes.filter(r => r.status === 'in-progress').length;

  // Calculate ATS scores
  const atsScores = resumes
    .filter(r => r.analysis?.atsScore)
    .map(r => r.analysis.atsScore);

  const averageAtsScore = atsScores.length > 0 ?
    Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length) : 0;

  const highScoreResumes = resumes.filter(r => r.analysis?.atsScore >= 80).length;
  const mediumScoreResumes = resumes.filter(r =>
    r.analysis?.atsScore >= 60 && r.analysis?.atsScore < 80
  ).length;
  const lowScoreResumes = resumes.filter(r => r.analysis?.atsScore < 60).length;

  // Calculate views and downloads
  const totalViews = resumes.reduce((sum, r) => sum + (r.views || 0), 0);
  const totalDownloads = resumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

  // Calculate completion rate
  const completionRate = totalResumes > 0 ?
    Math.round((completedResumes / totalResumes) * 100) : 0;

  // Get template distribution
  const templatesUsed = resumes.reduce((acc, resume) => {
    const template = resume.template || 'unknown';
    acc[template] = (acc[template] || 0) + 1;
    return acc;
  }, {});

  // Generate recent activity from resume updates
  const recentActivity = resumes
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(resume => ({
      type: 'update',
      description: `${resume.title} was updated`,
      timestamp: resume.updatedAt,
      resumeId: resume._id
    }));

  // Calculate storage usage (simplified - 0.5MB per resume)
  const storageUsedMB = Math.round(totalResumes * 0.5);
  const storageLimitMB = 500;
  const storageUsedPercentage = Math.round((storageUsedMB / storageLimitMB) * 100);

  return {
    totalResumes,
    completedResumes,
    draftResumes,
    inProgressResumes,
    averageAtsScore,
    highScoreResumes,
    mediumScoreResumes,
    lowScoreResumes,
    totalViews,
    totalDownloads,
    completionRate,
    templatesUsed,
    recentActivity,
    storageUsed: `${storageUsedMB} MB`,
    storageLimit: `${storageLimitMB} MB`,
    storageUsedPercentage,
    lastSynced: new Date().toISOString(),
    onlineUsers: 1,
    activeSessions: 0,
    needsImprovementResumes: lowScoreResumes,
    performanceTrend: totalResumes > 0 ? 'improving' : 'stable'
  };
};

// Helper function for default stats
const getDefaultStats = () => {
  return {
    totalResumes: 0,
    completedResumes: 0,
    draftResumes: 0,
    inProgressResumes: 0,
    averageAtsScore: 0,
    highScoreResumes: 0,
    mediumScoreResumes: 0,
    lowScoreResumes: 0,
    totalViews: 0,
    totalDownloads: 0,
    completionRate: 0,
    templatesUsed: {},
    recentActivity: [],
    storageUsed: '0 MB',
    storageLimit: '500 MB',
    storageUsedPercentage: 0,
    lastSynced: new Date().toISOString(),
    onlineUsers: 1,
    activeSessions: 0,
    needsImprovementResumes: 0,
    performanceTrend: 'stable'
  };
};

// FIXED: Removed userId parameter from apiService call
const useUserResumes = (userId) => {
  return useQuery({
    queryKey: ['userResumes', userId],
    queryFn: async () => {
      try {
        console.log('📥 Fetching user resumes...');

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('⚠️ No auth token found, returning empty array');
          return [];
        }

        // ✅ FIXED: apiService.resume.getUserResumes() doesn't take userId parameter
        const resumes = await apiService.resume.getUserResumes();

        if (!Array.isArray(resumes)) {
          console.warn('⚠️ Resumes data is not an array:', resumes);
          return [];
        }

        console.log(`✅ Fetched ${resumes.length} resumes`);

        return resumes.map(resume => ({
          _id: resume._id || resume.id,
          id: resume._id || resume.id,
          title: resume.title || 'Untitled Resume',
          template: resume.template || 'modern',
          status: resume.status || 'draft',
          isPrimary: resume.isPrimary || false,
          isStarred: resume.isStarred || false,
          isPinned: resume.isPinned || false,
          analysis: {
            atsScore: resume.analysis?.atsScore || resume.atsScore || 0,
            completeness: resume.analysis?.completeness || resume.completeness || 0,
            suggestions: resume.analysis?.suggestions || resume.suggestions || [],
            lastAnalyzed: resume.analysis?.lastAnalyzed || resume.lastAnalyzed
          },
          personalInfo: {
            fullName: resume.personalInfo?.fullName || '',
            email: resume.personalInfo?.email || '',
            phone: resume.personalInfo?.phone || '',
            location: resume.personalInfo?.location || ''
          },
          updatedAt: resume.updatedAt || new Date().toISOString(),
          createdAt: resume.createdAt || new Date().toISOString(),
          tags: Array.isArray(resume.tags) ? resume.tags : [],
          views: resume.views || 0,
          downloads: resume.downloads || 0,
          userId: resume.userId || userId,
          version: resume.version || 1,
          color: resume.color || '#3b82f6',
          font: resume.font || 'inter'
        }));
      } catch (error) {
        console.error('❌ Resumes error:', error);

        // If it's an auth error, re-throw it for redirect
        if (error.message.includes('not authenticated') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized')) {
          throw error;
        }

        return [];
      }
    },
    enabled: !!userId, // Only run if userId exists
    staleTime: 3 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2
  });
};

// ==================== UTILITY FUNCTIONS ====================

const filterAndSortResumes = (resumes, searchQuery, filters) => {
  const query = searchQuery.toLowerCase().trim();

  let filtered = [...resumes];

  // Search filter
  if (query) {
    filtered = filtered.filter(resume => {
      const titleMatch = resume.title?.toLowerCase().includes(query);
      const nameMatch = resume.personalInfo?.fullName?.toLowerCase().includes(query);
      const emailMatch = resume.personalInfo?.email?.toLowerCase().includes(query);
      const tagMatch = resume.tags?.some(tag => tag.toLowerCase().includes(query));
      return titleMatch || nameMatch || emailMatch || tagMatch;
    });
  }

  // Status filter
  if (filters.status !== 'all') {
    filtered = filtered.filter(resume => {
      switch (filters.status) {
        case 'completed': return resume.status === 'completed';
        case 'draft': return resume.status === 'draft';
        case 'in-progress': return resume.status === 'in-progress';
        case 'starred': return resume.isStarred;
        case 'pinned': return resume.isPinned;
        case 'primary': return resume.isPrimary;
        case 'ats-high': return resume.analysis?.atsScore >= 80;
        case 'ats-medium': return resume.analysis?.atsScore >= 60 && resume.analysis?.atsScore < 80;
        case 'ats-low': return resume.analysis?.atsScore < 60;
        case 'needs-review': return resume.analysis?.atsScore < 60 || resume.analysis?.completeness < 70;
        default: return resume.status === filters.status;
      }
    });
  }

  // Template filter
  if (filters.template !== 'all') {
    filtered = filtered.filter(resume => resume.template === filters.template);
  }

  // Sorting
  filtered.sort((a, b) => {
    const order = filters.sortOrder === 'desc' ? -1 : 1;

    switch (filters.sortBy) {
      case 'updatedAt': {
        const aDate = new Date(a.updatedAt);
        const bDate = new Date(b.updatedAt);
        return order * (bDate.getTime() - aDate.getTime());
      }
      case 'createdAt': {
        const aDate = new Date(a.createdAt);
        const bDate = new Date(b.createdAt);
        return order * (bDate.getTime() - aDate.getTime());
      }
      case 'atsScore': {
        const aScore = a.analysis?.atsScore || 0;
        const bScore = b.analysis?.atsScore || 0;
        return order * (bScore - aScore);
      }
      case 'views': return order * ((b.views || 0) - (a.views || 0));
      case 'downloads': return order * ((b.downloads || 0) - (a.downloads || 0));
      case 'title': return order * a.title.localeCompare(b.title);
      case 'name': {
        const aName = a.personalInfo?.fullName || '';
        const bName = b.personalInfo?.fullName || '';
        return order * aName.localeCompare(bName);
      }
      default: return 0;
    }
  });

  return filtered;
};

const calculateEnhancedStats = (dashboardStats, rawResumes, selectedResumes) => {
  const totalResumes = rawResumes.length;
  const completedResumes = rawResumes.filter(r => r.status === 'completed').length;
  const draftResumes = rawResumes.filter(r => r.status === 'draft').length;
  const inProgressResumes = rawResumes.filter(r => r.status === 'in-progress').length;
  const starredResumes = rawResumes.filter(r => r.isStarred).length;
  const pinnedResumes = rawResumes.filter(r => r.isPinned).length;
  const primaryResumes = rawResumes.filter(r => r.isPrimary).length;

  const atsScores = rawResumes
    .filter(r => r.analysis?.atsScore)
    .map(r => r.analysis.atsScore);

  const averageAtsScore = atsScores.length > 0
    ? Math.round(atsScores.reduce((a, b) => a + b, 0) / atsScores.length)
    : 0;

  const highScoreResumes = rawResumes.filter(r => r.analysis?.atsScore >= 80).length;
  const mediumScoreResumes = rawResumes.filter(r =>
    r.analysis?.atsScore >= 60 && r.analysis?.atsScore < 80
  ).length;
  const lowScoreResumes = rawResumes.filter(r => r.analysis?.atsScore < 60).length;

  const totalViews = rawResumes.reduce((sum, r) => sum + (r.views || 0), 0);
  const totalDownloads = rawResumes.reduce((sum, r) => sum + (r.downloads || 0), 0);

  // Calculate storage
  const storageUsedMB = parseFloat(dashboardStats?.storageUsed?.replace(' MB', '') || 0);
  const storageLimitMB = parseFloat(dashboardStats?.storageLimit?.replace(' MB', '') || 500);
  const storageUsedPercentage = storageLimitMB > 0
    ? (storageUsedMB / storageLimitMB) * 100
    : 0;

  // Template distribution
  const templatesUsed = rawResumes.reduce((acc, resume) => {
    const template = resume.template || 'unknown';
    acc[template] = (acc[template] || 0) + 1;
    return acc;
  }, {});

  // Calculate trends
  const lastMonthResumes = rawResumes.filter(r => {
    const resumeDate = new Date(r.createdAt);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return resumeDate > oneMonthAgo;
  }).length;

  const completionRate = totalResumes > 0
    ? Math.round((completedResumes / totalResumes) * 100)
    : 0;

  return {
    ...dashboardStats,
    totalResumes,
    completedResumes,
    draftResumes,
    inProgressResumes,
    starredResumes,
    pinnedResumes,
    primaryResumes,
    averageAtsScore,
    highScoreResumes,
    mediumScoreResumes,
    lowScoreResumes,
    totalViews,
    totalDownloads,
    selectedCount: selectedResumes.length,
    storageUsedPercentage,
    storageUsedMB,
    storageLimitMB,
    templatesUsed,
    lastMonthResumes,
    completionRate,
    hasResumes: totalResumes > 0,
    isEmpty: totalResumes === 0
  };
};

// ==================== SUB-COMPONENTS ====================

const StatCard = ({ title, value, icon: Icon, color, description, trend, darkMode, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all shadow-sm hover:shadow-md ${darkMode
        ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`p-1.5 sm:p-2 rounded-lg ${color.bg} ${color.text}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className={`font-semibold text-xs sm:text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {title}
            </h3>
            {trend && (
              <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                <TrendingUpIcon className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-xs ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className={`text-xs hidden xs:inline ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-1">
        <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
        {description && (
          <p className={`text-xs mt-0.5 sm:mt-1 line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const ResumeCard = ({ resume, isSelected, darkMode, onEdit, onDelete, onExport, onSelect, onView, onStar, onPin }) => {
  const [showActions, setShowActions] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (score >= 60) return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400';
    return 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'in-progress': return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'draft': return 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getTemplateColor = (template) => {
    const colors = {
      'modern': 'from-blue-500 to-cyan-500',
      'professional': 'from-purple-500 to-pink-500',
      'creative': 'from-orange-500 to-red-500',
      'minimal': 'from-gray-500 to-gray-700',
      'elegant': 'from-emerald-500 to-teal-500',
      'bold': 'from-rose-500 to-pink-500'
    };
    return colors[template] || 'from-gray-500 to-gray-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`relative p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all cursor-pointer group ${isSelected
        ? darkMode
          ? 'border-blue-500 bg-blue-900/20'
          : 'border-blue-500 bg-blue-50'
        : darkMode
          ? 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      onClick={() => !isSelected && onEdit(resume)}
    >
      {/* Template indicator */}
      <div className={`absolute top-0 right-0 w-12 sm:w-16 h-1 rounded-t-lg bg-gradient-to-r ${getTemplateColor(resume.template)}`} />

      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(resume._id);
            }}
            onClick={(e) => e.stopPropagation()}
            className={`w-4 h-4 sm:w-4 sm:h-4 rounded cursor-pointer flex-shrink-0 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 mb-0.5 sm:mb-1">
              <h3 className={`font-semibold truncate text-sm sm:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {resume.title || 'Untitled Resume'}
              </h3>
              {resume.isPinned && (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 12V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v8l-2 2v2h5.17l1.01 4.03c.11.42.49.73.93.73s.82-.31.93-.73L13.83 16H18v-2l-2-2z" />
                </svg>
              )}
            </div>
            <p className={`text-xs sm:text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {resume.personalInfo?.fullName || 'No name provided'}
              {resume.personalInfo?.location && ` • ${resume.personalInfo.location}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {resume.isPrimary && (
            <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
              Primary
            </span>
          )}
          <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs font-medium rounded-full ${getStatusColor(resume.status)}`}>
            {resume.status === 'in-progress' ? 'In Progress' : resume.status}
          </span>
        </div>
      </div>

      {/* Progress & Stats */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className={`text-xs sm:text-sm font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full ${getScoreColor(resume.analysis?.atsScore || 0)}`}>
                {resume.analysis?.atsScore || 0}% ATS
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {resume.analysis?.completeness || 0}% complete
              </span>
            </div>
          </div>
          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            v{resume.version || 1}
          </span>
        </div>

        {/* Progress bar */}
        <div className={`h-1 sm:h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${resume.analysis?.completeness || 0}%` }}
          />
        </div>
      </div>

      {/* Tags and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {resume.template && (
            <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {resume.template}
            </span>
          )}
          {resume.tags?.slice(0, 1).map((tag, index) => (
            <span key={index} className={`px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {tag}
            </span>
          ))}
          {resume.tags?.length > 1 && (
            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              +{resume.tags.length - 1}
            </span>
          )}
        </div>

        {/* Mobile actions menu */}
        <div className="sm:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className={`p-1.5 rounded-lg ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Menu className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-2 top-12 z-10 p-2 rounded-lg shadow-lg border backdrop-blur-sm"
                style={{
                  backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderColor: darkMode ? '#374151' : '#e5e7eb'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStar?.(resume._id, !resume.isStarred);
                      setShowActions(false);
                    }}
                    className={`p-2 rounded-lg flex items-center gap-2 ${resume.isStarred
                      ? 'text-amber-500'
                      : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Star className="w-4 h-4" fill={resume.isStarred ? 'currentColor' : 'none'} />
                    <span className="text-sm">{resume.isStarred ? 'Unstar' : 'Star'}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(resume._id);
                      setShowActions(false);
                    }}
                    className="p-2 rounded-lg flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(resume._id, 'pdf');
                      setShowActions(false);
                    }}
                    className="p-2 rounded-lg flex items-center gap-2 text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Export</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(resume);
                      setShowActions(false);
                    }}
                    className="p-2 rounded-lg flex items-center gap-2 text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(resume);
                      setShowActions(false);
                    }}
                    className="p-2 rounded-lg flex items-center gap-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStar?.(resume._id, !resume.isStarred);
            }}
            className={`p-1.5 rounded-lg hover:opacity-80 ${resume.isStarred
              ? 'text-amber-500'
              : darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            title={resume.isStarred ? 'Unstar' : 'Star'}
          >
            <Star className="w-4 h-4" fill={resume.isStarred ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin?.(resume._id, !resume.isPinned);
            }}
            className={`p-1.5 rounded-lg hover:opacity-80 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            title={resume.isPinned ? 'Unpin' : 'Pin'}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 12V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v8l-2 2v2h5.17l1.01 4.03c.11.42.49.73.93.73s.82-.31.93-.73L13.83 16H18v-2l-2-2z" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(resume._id);
            }}
            className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:opacity-80"
            title="Preview Resume"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport(resume._id, 'pdf');
            }}
            className="p-1.5 rounded-lg text-green-500 hover:text-green-600 hover:opacity-80"
            title="Export PDF"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(resume);
            }}
            className="p-1.5 rounded-lg text-purple-500 hover:text-purple-600 hover:opacity-80"
            title="Edit Resume"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(resume);
            }}
            className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:opacity-80"
            title="Delete Resume"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{resume.views || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{resume.downloads || 0}</span>
          </div>
        </div>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          {new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </motion.div>
  );
};

// ==================== MAIN COMPONENT ====================

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  // ============ FIXED: Improved Authentication Check ============
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) {
      console.log('🔄 Auth is still loading...');
      return;
    }

    // Only redirect when we're sure user is not authenticated
    if (!isAuthenticated) {
      console.log('🔒 User not authenticated, redirecting to login');
      toast.error('Please login to access the dashboard');
      navigate('/login', { replace: true });
    } else {
      console.log('✅ User authenticated, loading dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]); // Watch for changes in auth state

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    // This will briefly show while redirect is happening
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Now we're authenticated, render the dashboard
  console.log('🎨 Rendering dashboard content...');


  // State
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    template: 'all',
    view: 'grid' // 'grid' or 'list'
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Navigation menu for Navbar
  const navMenuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'LayoutDashboard',
      active: true,
      badge: null
    },
    {
      label: 'Builder',
      href: '/builder',
      icon: 'FilePlus',
      badge: null
    },
    {
      label: 'Templates',
      href: '/templates',
      icon: 'FileText',
      badge: 'New'
    },
    {
      label: 'Analyzer',
      href: '/analyzer',
      icon: 'BarChart3',
      badge: null
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: 'Settings',
      badge: null
    }
  ];

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load theme preference
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(storedTheme === 'dark' || (!storedTheme && prefersDark));
  }, []);

  // Database Queries - FIXED: Now using the updated useDashboardStats hook
  const {
    data: dashboardStatsData,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats
  } = useDashboardStats(user?._id || user?.id);

  const {
    data: rawResumes = [],
    isLoading: isResumesLoading,
    isError: isResumesError,
    refetch: refetchResumes
  } = useUserResumes(user?._id || user?.id);

  // Derived Data
  const filteredResumes = useMemo(() =>
    filterAndSortResumes(rawResumes, deferredSearchQuery, filters),
    [rawResumes, deferredSearchQuery, filters]
  );

  const enhancedStats = useMemo(() =>
    calculateEnhancedStats(dashboardStatsData || getDefaultStats(), rawResumes, selectedResumes),
    [dashboardStatsData, rawResumes, selectedResumes]
  );

  // Stat Cards Configuration
  const statCards = [
    {
      title: 'Total Resumes',
      value: enhancedStats.totalResumes,
      icon: FileText,
      color: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
      description: `${enhancedStats.completedResumes} completed, ${enhancedStats.draftResumes} drafts`,
      trend: { value: 12, label: 'this month' },
      onClick: () => setFilters(prev => ({ ...prev, status: 'all' }))
    },
    {
      title: 'ATS Score',
      value: `${enhancedStats.averageAtsScore}%`,
      icon: Target,
      color: {
        bg: enhancedStats.averageAtsScore >= 80 ? 'bg-green-100 dark:bg-green-900/30' :
          enhancedStats.averageAtsScore >= 60 ? 'bg-amber-100 dark:bg-amber-900/30' :
            'bg-red-100 dark:bg-red-900/30',
        text: enhancedStats.averageAtsScore >= 80 ? 'text-green-600 dark:text-green-400' :
          enhancedStats.averageAtsScore >= 60 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
      },
      description: 'Average compatibility',
      trend: { value: 5, label: 'vs last month' },
      onClick: () => navigate('/analyzer')
    },
    {
      title: 'Storage Used',
      value: `${Math.round(enhancedStats.storageUsedPercentage)}%`,
      icon: HardDrive,
      color: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
      description: `${enhancedStats.storageUsedMB.toFixed(1)} MB of ${enhancedStats.storageLimitMB} MB`,
      trend: null,
      onClick: () => toast.info('Consider upgrading for more storage')
    },
    {
      title: 'Performance',
      value: `${enhancedStats.completionRate}%`,
      icon: TrendingUp,
      color: {
        bg: enhancedStats.completionRate >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30' :
          enhancedStats.completionRate >= 50 ? 'bg-amber-100 dark:bg-amber-900/30' :
            'bg-red-100 dark:bg-red-900/30',
        text: enhancedStats.completionRate >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
          enhancedStats.completionRate >= 50 ? 'text-amber-600 dark:text-amber-400' :
            'text-red-600 dark:text-red-400'
      },
      description: 'Resumes completed',
      trend: { value: 8, label: 'improvement' },
      onClick: () => setFilters(prev => ({ ...prev, status: 'completed' }))
    }
  ];

  // ✅ ADDED: Missing mutation hooks
  const exportMutation = useMutation({
    mutationFn: ({ resumeId, format }) => apiService.resume.exportResume(resumeId, format),
    onMutate: () => {
      toast.loading('Exporting resume...', { id: 'export-resume' });
    },
    onSuccess: (data) => {
      toast.success('Resume exported successfully!', { id: 'export-resume' });
      // Handle file download
      if (data.url) {
        window.open(data.url, '_blank');
      }
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
    },
    onError: (error) => {
      console.error('Export error:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to export resume';
      toast.error(errorMessage, { id: 'export-resume' });
    }
  });

  const starMutation = useMutation({
    mutationFn: ({ resumeId, starred }) => apiService.resume.updateResume(resumeId, { isStarred: starred }),
    onMutate: ({ resumeId, starred }) => {
      // Optimistic update
      queryClient.setQueryData(['userResumes', user?._id], (old) =>
        old?.map(resume =>
          resume._id === resumeId ? { ...resume, isStarred: starred } : resume
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
    },
    onError: (error) => {
      console.error('Star error:', error);
      toast.error('Failed to update star status');
      // Revert optimistic update
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
    }
  });

  const pinMutation = useMutation({
    mutationFn: ({ resumeId, pinned }) => apiService.resume.updateResume(resumeId, { isPinned: pinned }),
    onMutate: ({ resumeId, pinned }) => {
      // Optimistic update
      queryClient.setQueryData(['userResumes', user?._id], (old) =>
        old?.map(resume =>
          resume._id === resumeId ? { ...resume, isPinned: pinned } : resume
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
    },
    onError: (error) => {
      console.error('Pin error:', error);
      toast.error('Failed to update pin status');
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
    }
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (resumeData) => apiService.resume.createResume(resumeData),
    onMutate: () => {
      toast.loading('Creating resume...', { id: 'create-resume' });
    },
    onSuccess: (createdResume) => {
      toast.success('Resume created successfully!', { id: 'create-resume' });
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?._id] });

      if (createdResume?._id) {
        setTimeout(() => navigate(`/builder/edit/${createdResume._id}`), 1000);
      }
    },
    onError: (error) => {
      console.error('Create error details:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create resume. Please try again.';
      toast.error(errorMessage, { id: 'create-resume' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (resumeId) => apiService.resume.deleteResume(resumeId),
    onMutate: () => {
      toast.loading('Deleting resume...', { id: 'delete-resume' });
    },
    onSuccess: () => {
      toast.success('Resume deleted!', { id: 'delete-resume' });
      queryClient.invalidateQueries({ queryKey: ['userResumes', user?._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats', user?._id] });
      setSelectedResumes(prev => prev.filter(id => id !== resumeToDelete?._id));
    },
    onError: (error) => {
      console.error('Delete error details:', error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete resume. Please try again.';
      toast.error(errorMessage, { id: 'delete-resume' });
    },
    onSettled: () => {
      setIsDeleteModalOpen(false);
      setResumeToDelete(null);
    }
  });

  // Event Handlers
  const handleCreateResume = useCallback(() => {
    if (!user?._id) {
      toast.error('Please login to create a resume');
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
      // ✅ FIXED: Remove userId as apiService will handle it automatically
      tags: ['new'],
      analysis: {
        atsScore: 0,
        completeness: 0,
        suggestions: ['Add more details to improve your resume']
      }
    };

    createMutation.mutate(newResumeData);
  }, [user, rawResumes.length, createMutation]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchStats(), refetchResumes()]);
      toast.success('Dashboard updated!');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh dashboard');
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchStats, refetchResumes]);

  const handleDeleteResume = useCallback((resume) => {
    setResumeToDelete(resume);
    setIsDeleteModalOpen(true);
  }, []);

  const handleExportResume = useCallback((resumeId, format = 'pdf') => {
    exportMutation.mutate({ resumeId, format });
  }, [exportMutation]);

  const handleSelectResume = useCallback((resumeId) => {
    setSelectedResumes(prev =>
      prev.includes(resumeId)
        ? prev.filter(id => id !== resumeId)
        : [...prev, resumeId]
    );
  }, []);

  const handleViewResume = useCallback((resumeId) => {
    navigate(`/preview/${resumeId}`);
  }, [navigate]);

  const handleEditResume = useCallback((resume) => {
    navigate(`/builder/edit/${resume._id}`);
  }, [navigate]);

  const handleStarResume = useCallback((resumeId, starred) => {
    starMutation.mutate({ resumeId, starred });
  }, [starMutation]);

  const handlePinResume = useCallback((resumeId, pinned) => {
    pinMutation.mutate({ resumeId, pinned });
  }, [pinMutation]);

  const handleBulkAction = useCallback((action) => {
    if (selectedResumes.length === 0) {
      toast.error('Select resumes first');
      return;
    }

    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedResumes.length} selected resumes?`)) {
          selectedResumes.forEach(id => {
            deleteMutation.mutate(id);
          });
          setSelectedResumes([]);
        }
        break;
      case 'export':
        selectedResumes.forEach(id => {
          exportMutation.mutate({ resumeId: id, format: 'pdf' });
        });
        break;
      case 'star':
        selectedResumes.forEach(id => {
          starMutation.mutate({ resumeId: id, starred: true });
        });
        break;
      default:
        break;
    }
    setBulkAction(null);
  }, [selectedResumes, deleteMutation, exportMutation, starMutation]);

  const handleLogout = useCallback(() => {
    logout(navigate);
  }, [logout, navigate]);

  // Loading States
  if (isResumesLoading || isStatsLoading) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900" />}>
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <Navbar
            user={user}
            menuItems={navMenuItems}
            onSearch={setSearchQuery}
            searchQuery={searchQuery}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onLogout={handleLogout}
          />
          <main className="pt-16 sm:pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
              <DashboardSkeleton darkMode={darkMode} />
            </div>
          </main>
        </div>
      </Suspense>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* External Navbar */}
      <Navbar
        user={user}
        menuItems={navMenuItems}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dashboard
                </h1>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="sm:hidden p-2 rounded-lg border"
                  style={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    borderColor: darkMode ? '#4b5563' : '#e5e7eb'
                  }}
                >
                  {showFilters ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
              </div>
              <p className={`text-sm sm:text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome back, <span className="font-semibold">{user?.name || user?.email}</span>
                {enhancedStats.totalResumes > 0 && (
                  <span className="ml-1 sm:ml-2">• {enhancedStats.totalResumes} resumes</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border transition-all flex-shrink-0 ${darkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                title="Toggle theme"
              >
                {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border flex items-center gap-1 sm:gap-2 transition-all flex-1 sm:flex-auto ${darkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  } disabled:opacity-50`}
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="text-sm sm:text-base">Refresh</span>
              </button>

              <button
                onClick={handleCreateResume}
                disabled={createMutation.isPending}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center gap-1 sm:gap-2 font-semibold transition-all shadow-md flex-shrink-0
                  ${createMutation.isPending
                    ? 'bg-blue-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white hover:shadow-lg`}
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="text-sm sm:text-base">New</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
            {statCards.map((stat, index) => (
              <StatCard key={index} {...stat} darkMode={darkMode} />
            ))}
          </div>

          {/* Performance Metrics */}
          <div className="mb-6 sm:mb-8">
            <h2 className={`text-lg sm:text-xl font-semibold mb-3 sm:mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ATS Score Distribution</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>High (80+)</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">{enhancedStats.highScoreResumes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Medium (60-79)</span>
                    <span className="font-semibold text-amber-600 text-sm sm:text-base">{enhancedStats.mediumScoreResumes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Low (&lt;60)</span>
                    <span className="font-semibold text-red-600 text-sm sm:text-base">{enhancedStats.lowScoreResumes}</span>
                  </div>
                </div>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Resume Status</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Completed</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">{enhancedStats.completedResumes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</span>
                    <span className="font-semibold text-blue-600 text-sm sm:text-base">{enhancedStats.inProgressResumes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Drafts</span>
                    <span className="font-semibold text-gray-600 text-sm sm:text-base">{enhancedStats.draftResumes}</span>
                  </div>
                </div>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-medium mb-2 sm:mb-3 text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Activity</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Views</span>
                    <span className="font-semibold text-purple-600 text-sm sm:text-base">{enhancedStats.totalViews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Downloads</span>
                    <span className="font-semibold text-emerald-600 text-sm sm:text-base">{enhancedStats.totalDownloads}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>This Month</span>
                    <span className="font-semibold text-blue-600 text-sm sm:text-base">{enhancedStats.lastMonthResumes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resumes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base ${darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-transparent'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-transparent'
                      }`}
                  />
                </div>
              </div>

              {/* Mobile filter toggle button */}
              <div className="flex items-center gap-2 sm:hidden">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 flex-1 ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <Menu className="w-4 h-4" />
                  <span>Filters</span>
                </button>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: prev.view === 'grid' ? 'list' : 'grid' }))}
                  className={`p-2 rounded-lg border ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {filters.view === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </button>
              </div>

              {/* Desktop filters */}
              <div className="hidden sm:flex flex-wrap gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="draft">Drafts</option>
                  <option value="starred">Starred</option>
                  <option value="pinned">Pinned</option>
                  <option value="primary">Primary</option>
                </select>

                <select
                  value={filters.template}
                  onChange={(e) => setFilters(prev => ({ ...prev, template: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="all">All Templates</option>
                  <option value="modern">Modern</option>
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="updatedAt">Last Updated</option>
                  <option value="createdAt">Date Created</option>
                  <option value="atsScore">ATS Score</option>
                  <option value="views">Most Viewed</option>
                </select>

                <button
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
                  }))}
                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {filters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
                </button>

                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: prev.view === 'grid' ? 'list' : 'grid' }))}
                  className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  {filters.view === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                  {filters.view === 'grid' ? 'List' : 'Grid'}
                </button>
              </div>
            </div>

            {/* Mobile filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="sm:hidden overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-2 mb-3 p-3 rounded-lg border"
                    style={{
                      backgroundColor: darkMode ? '#1f2937' : '#f9fafb',
                      borderColor: darkMode ? '#374151' : '#e5e7eb'
                    }}
                  >
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className={`px-2 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500                         text-xs ${darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="draft">Drafts</option>
                    </select>

                    <select
                      value={filters.template}
                      onChange={(e) => setFilters(prev => ({ ...prev, template: e.target.value }))}
                      className={`px-2 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="all">All Templates</option>
                      <option value="modern">Modern</option>
                      <option value="professional">Professional</option>
                      <option value="creative">Creative</option>
                    </select>

                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className={`px-2 py-2 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="updatedAt">Last Updated</option>
                      <option value="atsScore">ATS Score</option>
                      <option value="views">Most Viewed</option>
                    </select>

                    <button
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        sortOrder: prev.sortOrder === 'desc' ? 'asc' : 'desc'
                      }))}
                      className={`px-2 py-2 rounded-lg border text-xs ${darkMode
                        ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      {filters.sortOrder === 'desc' ? 'Desc' : 'Asc'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resume Count and Bulk Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className={`text-lg sm:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                My Resumes {filteredResumes.length > 0 && `(${filteredResumes.length})`}
              </h2>
              {searchQuery && filteredResumes.length > 0 && (
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Showing results for "<span className="font-medium">{searchQuery}</span>"
                </p>
              )}
            </div>

            {selectedResumes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedResumes.length} selected
                </span>
                <select
                  value={bulkAction || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction(e.target.value);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                    }`}
                >
                  <option value="">Bulk Actions</option>
                  <option value="export">Export Selected</option>
                  <option value="star">Star Selected</option>
                  <option value="delete">Delete Selected</option>
                </select>
                <button
                  onClick={() => setSelectedResumes([])}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${darkMode
                    ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Resumes Grid/List */}
          {isResumesError || isStatsError ? (
            <div className={`text-center py-8 sm:py-12 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Error Loading Data
              </h3>
              <p className={`mb-4 max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                There was a problem loading your dashboard data. Please try refreshing the page.
              </p>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-4 py-2 rounded-lg font-medium ${darkMode
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Page'}
              </button>
            </div>
          ) : filteredResumes.length === 0 ? (
            <div className={`text-center py-8 sm:py-12 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <FilePlus className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {searchQuery ? 'No matching resumes' : 'No resumes yet'}
              </h3>
              <p className={`mb-6 max-w-md mx-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchQuery
                  ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                  : 'Create your first resume to get started with your professional journey.'}
              </p>
              <button
                onClick={handleCreateResume}
                disabled={createMutation.isPending}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 mx-auto ${createMutation.isPending
                  ? 'bg-blue-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  } text-white shadow-md hover:shadow-lg`}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    {searchQuery ? 'Create New Resume' : 'Create Your First Resume'}
                  </>
                )}
              </button>
            </div>
          ) : filters.view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              <AnimatePresence mode="wait">
                {filteredResumes.map((resume) => (
                  <ResumeCard
                    key={resume._id}
                    resume={resume}
                    isSelected={selectedResumes.includes(resume._id)}
                    darkMode={darkMode}
                    onEdit={handleEditResume}
                    onDelete={handleDeleteResume}
                    onExport={handleExportResume}
                    onSelect={handleSelectResume}
                    onView={handleViewResume}
                    onStar={handleStarResume}
                    onPin={handlePinResume}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className={`rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className={`grid grid-cols-12 gap-4 p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedResumes.length === filteredResumes.length && filteredResumes.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResumes(filteredResumes.map(r => r._id));
                      } else {
                        setSelectedResumes([]);
                      }
                    }}
                    className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div className="col-span-4 font-medium text-sm">Title</div>
                <div className="col-span-2 font-medium text-sm">Status</div>
                <div className="col-span-2 font-medium text-sm">ATS Score</div>
                <div className="col-span-2 font-medium text-sm">Last Updated</div>
                <div className="col-span-1 font-medium text-sm">Actions</div>
              </div>

              <AnimatePresence mode="wait">
                {filteredResumes.map((resume) => (
                  <motion.div
                    key={resume._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`grid grid-cols-12 gap-4 p-4 items-center border-b ${darkMode
                      ? 'border-gray-700 bg-gray-800/50 hover:bg-gray-800'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedResumes.includes(resume._id)}
                        onChange={(e) => handleSelectResume(resume._id)}
                        className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${resume.isPinned ? 'bg-amber-500' : resume.isStarred ? 'bg-blue-500' : 'bg-gray-300'}`} />
                        <span className={`font-medium truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {resume.title}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {resume.personalInfo?.fullName || 'No name'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(resume.status)}`}>
                        {resume.status === 'in-progress' ? 'In Progress' : resume.status}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className={`font-medium ${resume.analysis?.atsScore >= 80 ? 'text-green-600' : resume.analysis?.atsScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                        {resume.analysis?.atsScore || 0}%
                      </span>
                    </div>
                    <div className="col-span-2 text-sm">
                      {new Date(resume.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditResume(resume)}
                          className={`p-1 rounded ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportResume(resume._id)}
                          className={`p-1 rounded ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Load More/Pagination */}
          {filteredResumes.length > 0 && filteredResumes.length < rawResumes.length && (
            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={() => toast.info('Load more feature coming soon!')}
                className={`px-4 py-2 rounded-lg border font-medium ${darkMode
                  ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50'
                  }`}
              >
                Load More Resumes
              </button>
            </div>
          )}

          {/* Quick Tips */}
          <div className={`mt-6 sm:mt-8 p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkle className="w-5 h-5 text-blue-500" />
              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quick Tips</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className={`font-medium text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Improve ATS Score</h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Use keywords from job descriptions to increase your resume's compatibility
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className={`font-medium text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Regular Updates</h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Update your resume every 6 months to keep it current and relevant
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className={`font-medium text-sm mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Multiple Versions</h4>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create tailored resumes for different job types or industries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Suspense fallback={null}>
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setResumeToDelete(null);
          }}
          onConfirm={() => {
            if (resumeToDelete) {
              deleteMutation.mutate(resumeToDelete._id);
            }
          }}
          resume={resumeToDelete}
          darkMode={darkMode}
          isLoading={deleteMutation.isPending}
        />
      </Suspense>

      {/* Footer */}
      <footer className={`mt-8 pt-4 sm:pt-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3">
            <div>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Last synced: {new Date(enhancedStats.lastSynced).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/help')}
                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Help Center
              </button>
              <button
                onClick={() => navigate('/feedback')}
                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Send Feedback
              </button>
              <button
                onClick={() => window.open('https://example.com/docs', '_blank')}
                className={`text-sm ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Documentation
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;