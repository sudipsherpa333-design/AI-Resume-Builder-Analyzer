import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import {
  FaUsers,
  FaFileAlt,
  FaChartLine,
  FaClock,
  FaUserPlus,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getRecentActivity()
      ]);
      setStats(statsResponse);
      setRecentActivity(activityResponse);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
      link: '/admin/users'
    },
    {
      title: 'Total Resumes',
      value: stats.totalResumes || 0,
      icon: FaFileAlt,
      color: 'bg-green-500',
      change: '+8%',
      trend: 'up',
      link: '/admin/resumes'
    },
    {
      title: 'Active Users (7d)',
      value: stats.recentUsers || 0,
      icon: FaClock,
      color: 'bg-purple-500',
      change: '+5%',
      trend: 'up',
      link: '/admin/analytics'
    },
    {
      title: 'New Users (30d)',
      value: stats.newUsers || 45,
      icon: FaUserPlus,
      color: 'bg-orange-500',
      change: '+15%',
      trend: 'up',
      link: '/admin/users'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your admin dashboard. Here's what's happening with your platform today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <Link to={stat.link} className="block hover:opacity-80 transition-opacity">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === 'up' ? (
                      <FaArrowUp className="text-green-500 text-xs mr-1" />
                    ) : (
                      <FaArrowDown className="text-red-500 text-xs mr-1" />
                    )}
                    <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="text-xl" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'resume' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {activity.type}
                </span>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="space-y-4">
            {[
              { service: 'Database', status: 'operational', color: 'bg-green-500' },
              { service: 'API Server', status: 'operational', color: 'bg-green-500' },
              { service: 'File Storage', status: 'operational', color: 'bg-green-500' },
              { service: 'AI Analysis', status: 'degraded', color: 'bg-yellow-500' },
            ].map((service, index) => (
              <div key={service.service} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{service.service}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${service.color}`}></div>
                  <span className="text-xs font-medium text-gray-600 capitalize">{service.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/admin/users"
                className="text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded text-center hover:bg-blue-100 transition-colors"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/resumes"
                className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded text-center hover:bg-green-100 transition-colors"
              >
                View Resumes
              </Link>
              <Link
                to="/admin/analytics"
                className="text-xs bg-purple-50 text-purple-700 px-3 py-2 rounded text-center hover:bg-purple-100 transition-colors"
              >
                Analytics
              </Link>
              <Link
                to="/admin/settings"
                className="text-xs bg-gray-50 text-gray-700 px-3 py-2 rounded text-center hover:bg-gray-100 transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
