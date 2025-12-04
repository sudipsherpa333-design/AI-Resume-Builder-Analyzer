import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FaUsers,
    FaFileAlt,
    FaChartLine,
    FaCog,
    FaSignOutAlt,
    FaBell,
    FaSearch,
    FaFilter,
    FaDownload,
    FaEdit,
    FaTrash,
    FaUserShield,
    FaDatabase,
    FaServer
} from 'react-icons/fa';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock data
    const [users, setUsers] = useState([]);
    const [resumes, setResumes] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalResumes: 0,
        activeUsers: 0,
        premiumUsers: 0
    });

    // Chart data
    const userGrowthData = [
        { month: 'Jan', users: 400, resumes: 240 },
        { month: 'Feb', users: 300, resumes: 139 },
        { month: 'Mar', users: 200, resumes: 980 },
        { month: 'Apr', users: 278, resumes: 390 },
        { month: 'May', users: 189, resumes: 480 },
        { month: 'Jun', users: 239, resumes: 380 },
    ];

    const userTypeData = [
        { name: 'Free Users', value: 65, color: '#8884d8' },
        { name: 'Premium Users', value: 25, color: '#82ca9d' },
        { name: 'Admins', value: 10, color: '#ffc658' },
    ];

    // Check admin authentication
    useEffect(() => {
        const checkAdminAuth = () => {
            const token = localStorage.getItem('adminToken');
            const storedUser = localStorage.getItem('adminUser');

            if (!token || !storedUser) {
                toast.error('Access denied. Please login as admin.');
                navigate('/login');
                return;
            }

            try {
                const user = JSON.parse(storedUser);
                if (user.role !== 'admin') {
                    toast.error('You do not have admin privileges.');
                    navigate('/dashboard');
                    return;
                }

                setAdminUser(user);
                loadDashboardData();
            } catch (error) {
                console.error('Error parsing admin data:', error);
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        checkAdminAuth();
    }, [navigate]);

    // Load dashboard data
    const loadDashboardData = () => {
        // Mock data - in production, fetch from API
        setUsers([
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joined: '2024-01-15', resumes: 3 },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'premium', status: 'active', joined: '2024-01-20', resumes: 5 },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'inactive', joined: '2024-01-10', resumes: 1 },
            { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'premium', status: 'active', joined: '2024-01-25', resumes: 7 },
            { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'user', status: 'active', joined: '2024-01-05', resumes: 2 },
        ]);

        setResumes([
            { id: 1, title: 'Software Engineer Resume', user: 'John Doe', created: '2024-01-20', downloads: 15, template: 'Modern' },
            { id: 2, title: 'Marketing Manager CV', user: 'Jane Smith', created: '2024-01-18', downloads: 8, template: 'Classic' },
            { id: 3, title: 'Student Resume', user: 'Bob Johnson', created: '2024-01-15', downloads: 3, template: 'Simple' },
            { id: 4, title: 'Executive Resume', user: 'Alice Brown', created: '2024-01-22', downloads: 22, template: 'Professional' },
            { id: 5, title: 'Developer Portfolio', user: 'Charlie Wilson', created: '2024-01-10', downloads: 12, template: 'Creative' },
        ]);

        setStats({
            totalUsers: 1243,
            totalResumes: 3567,
            activeUsers: 892,
            premiumUsers: 156
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleUserAction = (userId, action) => {
        toast.success(`${action} action performed on user ${userId}`);
        // Implement actual user actions here
    };

    const handleResumeAction = (resumeId, action) => {
        toast.success(`${action} action performed on resume ${resumeId}`);
        // Implement actual resume actions here
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredResumes = resumes.filter(resume =>
        resume.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 flex items-center">
                                <FaUserShield className="h-8 w-8 text-red-600" />
                                <span className="ml-2 text-xl font-bold text-gray-900">AI Resume Admin</span>
                            </div>
                            <div className="hidden md:ml-6 md:flex md:space-x-8">
                                <button
                                    onClick={() => setActiveTab('dashboard')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'dashboard'
                                            ? 'border-red-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaChartLine className="mr-2" />
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'users'
                                            ? 'border-red-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaUsers className="mr-2" />
                                    Users
                                </button>
                                <button
                                    onClick={() => setActiveTab('resumes')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'resumes'
                                            ? 'border-red-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaFileAlt className="mr-2" />
                                    Resumes
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'analytics'
                                            ? 'border-red-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaDatabase className="mr-2" />
                                    Analytics
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${activeTab === 'settings'
                                            ? 'border-red-600 text-gray-900'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <FaCog className="mr-2" />
                                    Settings
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="relative mr-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                />
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                                <FaBell className="h-6 w-6" />
                                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-600"></span>
                            </button>
                            <div className="ml-3 relative">
                                <div className="flex items-center">
                                    <div className="text-sm text-gray-700 mr-3">
                                        <div className="font-medium">{adminUser?.name}</div>
                                        <div className="text-gray-500">Admin</div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
                                    >
                                        <FaSignOutAlt className="mr-2" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Stats Overview */}
                {activeTab === 'dashboard' && (
                    <>
                        <div className="px-4 py-6 sm:px-0">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <motion.div
                                    className="bg-white overflow-hidden shadow rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                                <FaUsers className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                                                    <dd className="text-3xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-sm text-green-600">
                                                <span className="font-medium">+12.5%</span> from last month
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="bg-white overflow-hidden shadow rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                                <FaFileAlt className="h-6 w-6 text-green-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Resumes</dt>
                                                    <dd className="text-3xl font-semibold text-gray-900">{stats.totalResumes.toLocaleString()}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-sm text-green-600">
                                                <span className="font-medium">+8.2%</span> from last month
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="bg-white overflow-hidden shadow rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                                                <FaChartLine className="h-6 w-6 text-yellow-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                                                    <dd className="text-3xl font-semibold text-gray-900">{stats.activeUsers.toLocaleString()}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-sm text-green-600">
                                                <span className="font-medium">+5.7%</span> from last month
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="bg-white overflow-hidden shadow rounded-lg"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <div className="p-5">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                                                <FaUserShield className="h-6 w-6 text-purple-600" />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 truncate">Premium Users</dt>
                                                    <dd className="text-3xl font-semibold text-gray-900">{stats.premiumUsers.toLocaleString()}</dd>
                                                </dl>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <div className="text-sm text-green-600">
                                                <span className="font-medium">+15.3%</span> from last month
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Charts */}
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <motion.div
                                className="bg-white shadow rounded-lg p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-4">User & Resume Growth</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={userGrowthData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="users" fill="#8884d8" name="New Users" />
                                            <Bar dataKey="resumes" fill="#82ca9d" name="Resumes Created" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            <motion.div
                                className="bg-white shadow rounded-lg p-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={userTypeData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={(entry) => `${entry.name}: ${entry.value}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {userTypeData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Users Management</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all registered users</p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    <FaFilter className="mr-2" />
                                    Filter
                                </button>
                                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                                    <FaDownload className="mr-2" />
                                    Export
                                </button>
                            </div>
                        </div>
                        <div className="border-t border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Resumes
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                            <span className="text-blue-600 font-semibold">
                                                                {user.name.charAt(0)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'premium'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.resumes}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.joined}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'edit')}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'delete')}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Resumes Tab */}
                {activeTab === 'resumes' && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Resumes Management</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">View and manage all created resumes</p>
                            </div>
                            <div className="flex space-x-2">
                                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                    <FaFilter className="mr-2" />
                                    Filter
                                </button>
                            </div>
                        </div>
                        <div className="border-t border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Resume Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Template
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Downloads
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredResumes.map((resume) => (
                                        <tr key={resume.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{resume.title}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{resume.user}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {resume.template}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {resume.downloads}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {resume.created}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleResumeAction(resume.id, 'view')}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleResumeAction(resume.id, 'download')}
                                                    className="text-green-600 hover:text-green-900 mr-3"
                                                >
                                                    <FaDownload />
                                                </button>
                                                <button
                                                    onClick={() => handleResumeAction(resume.id, 'delete')}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900">Most Used Template</h4>
                                <p className="text-2xl font-bold text-blue-600 mt-2">Modern</p>
                                <p className="text-sm text-blue-700">Used by 42% of users</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-green-900">Avg. Session Duration</h4>
                                <p className="text-2xl font-bold text-green-600 mt-2">8.5 min</p>
                                <p className="text-sm text-green-700">+2.3 min from last month</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <h4 className="text-sm font-medium text-purple-900">Conversion Rate</h4>
                                <p className="text-2xl font-bold text-purple-600 mt-2">15.7%</p>
                                <p className="text-sm text-purple-700">Free to Premium</p>
                            </div>
                        </div>
                        {/* Add more analytics components here */}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Settings</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-md font-medium text-gray-700 mb-3">System Configuration</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                                            <p className="text-sm text-gray-500">Put the system in maintenance mode</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                            <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">User Registration</p>
                                            <p className="text-sm text-gray-500">Allow new user registrations</p>
                                        </div>
                                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-green-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                                            <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;