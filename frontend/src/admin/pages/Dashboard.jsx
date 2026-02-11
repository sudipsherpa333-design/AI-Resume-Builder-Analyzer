// frontend/src/admin/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  FiUsers,
  FiFileText,
  FiTrendingUp,
  FiCheckCircle,
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiDatabase,
  FiServer,
  FiCpu,
  FiHardDrive,
  FiDownload,
  FiEye,
  FiEdit,
  FiMoreVertical,
  FiChevronRight,
  FiUserCheck,
  FiUserX,
  FiDollarSign,
  FiPercent,
  FiGlobe,
  FiSmartphone,
  FiMonitor,
  FiHome,
  FiArchive,
  FiUserPlus
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// API Service - Only uses real endpoints
const API_SERVICE = {
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5001',

  getAuthToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  },

  async fetch(endpoint, options = {}) {
    const token = this.getAuthToken();
    if (!token) {
      console.warn('No authentication token found');
      return { success: false, message: 'No authentication token' };
    }

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
          return { success: false, message: 'Session expired' };
        }

        console.warn(`Endpoint ${endpoint} returned ${response.status}`);
        return {
          success: false,
          message: `Endpoint returned ${response.status}`,
          status: response.status
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  },

  // Get real user statistics from database
  async getUserStats() {
    return this.fetch('/admin/users/stats');
  },

  // Get real resume statistics from database
  async getResumeStats() {
    return this.fetch('/admin/resumes/stats');
  },

  // Get real users list for growth calculation
  async getUsers() {
    return this.fetch('/admin/users?limit=1000');
  },

  // Get real resumes list for growth calculation
  async getResumes() {
    return this.fetch('/admin/resumes?limit=1000');
  },

  // Get recent activity
  async getRecentActivity() {
    return this.fetch('/admin/activity');
  },

  // Calculate growth data from real users
  calculateUserGrowth(users) {
    if (!users || !users.data || !users.data.users) {
      return [];
    }

    const userList = users.data.users;
    const monthCounts = {};

    // Group users by month
    userList.forEach(user => {
      if (user.createdAt) {
        const date = new Date(user.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });

        if (!monthCounts[monthYear]) {
          monthCounts[monthYear] = {
            name: monthName,
            count: 0,
            date: monthYear
          };
        }
        monthCounts[monthYear].count++;
      }
    });

    // Sort by date and get last 6 months
    return Object.values(monthCounts)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6);
  },

  // Calculate resume growth from real resumes
  calculateResumeGrowth(resumes) {
    if (!resumes || !resumes.data || !resumes.data.resumes) {
      return [];
    }

    const resumeList = resumes.data.resumes;
    const monthCounts = {};

    // Group resumes by month
    resumeList.forEach(resume => {
      if (resume.createdAt) {
        const date = new Date(resume.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });

        if (!monthCounts[monthYear]) {
          monthCounts[monthYear] = {
            name: monthName,
            count: 0,
            date: monthYear
          };
        }
        monthCounts[monthYear].count++;
      }
    });

    // Sort by date and get last 6 months
    return Object.values(monthCounts)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-6);
  }
};

const Dashboard = () => {
  // States - ALL INITIALIZED TO 0
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Real data states - ALL ZERO INITIALLY
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    newToday: 0,
    verified: 0,
    premium: 0,
    inactive: 0,
    admin: 0
  });

  const [resumeStats, setResumeStats] = useState({
    total: 0,
    analyzed: 0,
    pending: 0,
    failed: 0,
    avgScore: 0,
    totalSize: 0,
    uniqueUsers: 0
  });

  const [userGrowth, setUserGrowth] = useState([]);
  const [resumeGrowth, setResumeGrowth] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Load all real dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);

    try {
      console.log('Loading dashboard data from database...');

      // Load real user statistics
      const userStatsResult = await API_SERVICE.getUserStats();
      console.log('User stats result:', userStatsResult);

      if (userStatsResult && userStatsResult.success) {
        const userData = userStatsResult.data || {};
        console.log('User data from API:', userData);

        setUserStats({
          total: userData.total || userData.totalUsers || 0,
          active: userData.active || userData.activeUsers || 0,
          newToday: userData.newToday || userData.newUsers || 0,
          verified: userData.verified || 0,
          premium: userData.premium || 0,
          inactive: userData.inactive || 0,
          admin: (userData.admin || 0) + (userData.superAdmin || 0)
        });
      } else {
        console.log('Using default user stats (0)');
        setUserStats({
          total: 0,
          active: 0,
          newToday: 0,
          verified: 0,
          premium: 0,
          inactive: 0,
          admin: 0
        });
      }

      // Load real resume statistics
      const resumeStatsResult = await API_SERVICE.getResumeStats();
      console.log('Resume stats result:', resumeStatsResult);

      if (resumeStatsResult && resumeStatsResult.success) {
        const resumeData = resumeStatsResult.data || {};
        console.log('Resume data from API:', resumeData);

        setResumeStats({
          total: resumeData.total || resumeData.totalResumes || 0,
          analyzed: resumeData.analyzed || 0,
          pending: resumeData.pending || 0,
          failed: resumeData.failed || 0,
          avgScore: resumeData.avgScore || resumeData.averageScore || 0,
          totalSize: resumeData.totalSize || 0,
          uniqueUsers: resumeData.uniqueUsers || resumeData.users || 0
        });
      } else {
        console.log('Using default resume stats (0)');
        setResumeStats({
          total: 0,
          analyzed: 0,
          pending: 0,
          failed: 0,
          avgScore: 0,
          totalSize: 0,
          uniqueUsers: 0
        });
      }

      // Load real users for growth calculation
      const usersResult = await API_SERVICE.getUsers();
      console.log('Users result:', usersResult);

      if (usersResult && usersResult.success) {
        const growthData = API_SERVICE.calculateUserGrowth(usersResult);
        console.log('Calculated user growth:', growthData);
        setUserGrowth(growthData);
      } else {
        setUserGrowth([]);
      }

      // Load real resumes for growth calculation
      const resumesResult = await API_SERVICE.getResumes();
      console.log('Resumes result:', resumesResult);

      if (resumesResult && resumesResult.success) {
        const growthData = API_SERVICE.calculateResumeGrowth(resumesResult);
        console.log('Calculated resume growth:', growthData);
        setResumeGrowth(growthData);
      } else {
        setResumeGrowth([]);
      }

      // Load recent activity
      const activityResult = await API_SERVICE.getRecentActivity();
      console.log('Activity result:', activityResult);

      if (activityResult && activityResult.success) {
        const activityData = activityResult.data || activityResult.activities || [];
        console.log('Activity data:', activityData);

        if (Array.isArray(activityData)) {
          const safeData = activityData.map(activity => ({
            id: activity.id || activity._id || Math.random(),
            user: typeof activity.user === 'object'
              ? activity.user.name || activity.user.username || activity.user.email || 'User'
              : activity.user || 'User',
            action: activity.action || activity.type || 'Activity',
            time: formatRelativeTime(activity.createdAt || activity.timestamp),
            status: 'success'
          })).slice(0, 5);
          setRecentActivity(safeData);
        } else {
          setRecentActivity([]);
        }
      } else {
        setRecentActivity([]);
      }

      setLastUpdated(new Date());

      if (userStats.total > 0 || resumeStats.total > 0) {
        toast.success(`Dashboard loaded: ${userStats.total} users, ${resumeStats.total} resumes`);
      } else {
        toast.success('Dashboard loaded - No data yet');
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');

      // Reset to zeros on error
      setUserStats({
        total: 0,
        active: 0,
        newToday: 0,
        verified: 0,
        premium: 0,
        inactive: 0,
        admin: 0
      });
      setResumeStats({
        total: 0,
        analyzed: 0,
        pending: 0,
        failed: 0,
        avgScore: 0,
        totalSize: 0,
        uniqueUsers: 0
      });
      setUserGrowth([]);
      setResumeGrowth([]);
      setRecentActivity([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Helper function to format relative time
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) {
      return 'Just now';
    }

    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        return 'Just now';
      }
      if (diffMins < 60) {
        return `${diffMins} ${diffMins === 1 ? 'min' : 'mins'} ago`;
      }
      if (diffHours < 24) {
        return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
      }
      if (diffDays < 7) {
        return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
      }

      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  // Formatting functions
  const formatNumber = (num) => {
    if (!num) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatTime = (date) => {
    if (!date) {
      return 'Never';
    }
    try {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    toast.success('Refreshing dashboard data...');
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, color, subtitle, loading }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div>
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{title}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Chart Colors
  const CHART_COLORS = {
    primary: '#4f46e5',
    secondary: '#10b981',
    accent: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    cyan: '#06b6d4'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Real data from your database</p>
            <div className="flex items-center gap-4 mt-2">
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FiClock className="w-4 h-4" />
                  <span>Updated: {formatTime(lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg px-4 py-2">
              <FiDatabase className="text-green-500" />
              <span>Database: </span>
              <span className="font-medium text-green-600">Connected</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* User Stats Grid - SHOWS REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Users"
            value={userStats.total}
            icon={FiUsers}
            color="bg-indigo-500"
            subtitle={`Active: ${userStats.active}`}
            loading={loading}
          />
          <StatsCard
            title="New Today"
            value={userStats.newToday}
            icon={FiUserPlus}
            color="bg-green-500"
            subtitle={`${userStats.premium} premium`}
            loading={loading}
          />
          <StatsCard
            title="Verified Users"
            value={userStats.verified}
            icon={FiUserCheck}
            color="bg-blue-500"
            subtitle={`${userStats.admin} admin`}
            loading={loading}
          />
          <StatsCard
            title="Inactive Users"
            value={userStats.inactive}
            icon={FiUserX}
            color="bg-gray-500"
            subtitle="Not active recently"
            loading={loading}
          />
        </div>

        {/* Resume Stats Grid - SHOWS REAL DATA */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Resumes"
            value={resumeStats.total}
            icon={FiFileText}
            color="bg-blue-500"
            subtitle={`Analyzed: ${resumeStats.analyzed}`}
            loading={loading}
          />
          <StatsCard
            title="Avg. Score"
            value={`${resumeStats.avgScore}%`}
            icon={FiTrendingUp}
            color="bg-green-500"
            subtitle="Average analysis score"
            loading={loading}
          />
          <StatsCard
            title="Pending Analysis"
            value={resumeStats.pending}
            icon={FiClock}
            color="bg-yellow-500"
            subtitle={`${resumeStats.failed} failed`}
            loading={loading}
          />
          <StatsCard
            title="Unique Users"
            value={resumeStats.uniqueUsers}
            icon={FiUsers}
            color="bg-purple-500"
            subtitle="Users with resumes"
            loading={loading}
          />
        </div>

        {/* Charts Grid - ONLY SHOWS IF DATA EXISTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiUsers className="w-4 h-4" />
                <span>Last 6 months</span>
              </div>
            </div>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="ml-3 text-gray-600">Loading...</p>
                </div>
              ) : userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value) => [`${value} users`, 'New Users']}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                      name="New Users"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FiUsers className="w-12 h-12 mb-2 text-gray-300" />
                  <p>No user growth data yet</p>
                  <p className="text-sm">Users will appear as they register</p>
                </div>
              )}
            </div>
          </div>

          {/* Resume Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Resume Uploads</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiFileText className="w-4 h-4" />
                <span>Last 6 months</span>
              </div>
            </div>
            <div className="h-64">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  <p className="ml-3 text-gray-600">Loading...</p>
                </div>
              ) : resumeGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resumeGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem'
                      }}
                      formatter={(value) => [`${value} resumes`, 'Uploads']}
                    />
                    <Bar
                      dataKey="count"
                      fill={CHART_COLORS.secondary}
                      radius={[4, 4, 0, 0]}
                      name="Resume Uploads"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <FiFileText className="w-12 h-12 mb-2 text-gray-300" />
                  <p>No resume uploads yet</p>
                  <p className="text-sm">Resumes will appear as users upload them</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-3 text-gray-600">Loading activity...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentActivity.map((activity) => {
                    const userName = activity.user;
                    const userInitial = userName.charAt(0).toUpperCase();

                    return (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3">
                              <span className="text-white text-xs font-medium">
                                {userInitial}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{userName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {activity.action}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {activity.time}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-gray-500">
                <FiActivity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear as users interact with the system</p>
              </div>
            )}
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Database Status</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            Connected
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiUsers className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-gray-700">Users Collection</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
              <p className="text-sm text-gray-500">Total documents</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiFileText className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Resumes Collection</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{resumeStats.total}</p>
              <p className="text-sm text-gray-500">Total documents</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FiDatabase className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Database</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{userStats.total + resumeStats.total}</p>
              <p className="text-sm text-gray-500">Total records</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
                            Last refresh: {lastUpdated ? formatTime(lastUpdated) : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;