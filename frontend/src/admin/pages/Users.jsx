// frontend/src/admin/pages/Users.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    FiUser,
    FiUsers,
    FiSearch,
    FiFilter,
    FiEye,
    FiEdit,
    FiTrash2,
    FiRefreshCw,
    FiCheckCircle,
    FiXCircle,
    FiMoreVertical,
    FiMail,
    FiCalendar,
    FiUserCheck,
    FiUserX,
    FiUserPlus,
    FiDatabase,
    FiDownload,
    FiKey,
    FiClock,
    FiChevronLeft,
    FiChevronRight,
    FiPhone,
    FiMapPin,
    FiShield,
    FiStar,
    FiAlertCircle,
    FiPlus,
    FiSave,
    FiX
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// API Service
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

    // User endpoints
    async getUsers(params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        return this.fetch(`/admin/users?${queryParams}`);
    },

    async getUserStats() {
        return this.fetch('/admin/users/stats');
    },

    async getUserDetails(id) {
        return this.fetch(`/admin/users/${id}`);
    },

    async createUser(data) {
        return this.fetch('/admin/users', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async updateUser(id, data) {
        return this.fetch(`/admin/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async deleteUser(id) {
        return this.fetch(`/admin/users/${id}`, {
            method: 'DELETE'
        });
    },

    async exportUsers(format = 'csv') {
        return this.fetch(`/admin/users/export?format=${format}`);
    },

    async sendEmailToUser(id, data) {
        return this.fetch(`/admin/users/${id}/email`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async resetUserPassword(id) {
        return this.fetch(`/admin/users/${id}/reset-password`, {
            method: 'POST'
        });
    },

    async bulkUpdateUsers(ids, data) {
        return this.fetch('/admin/users/bulk-update', {
            method: 'PUT',
            body: JSON.stringify({ ids, data })
        });
    },

    async bulkDeleteUsers(ids) {
        return this.fetch('/admin/users/bulk-delete', {
            method: 'DELETE',
            body: JSON.stringify({ ids })
        });
    }
};

const Users = () => {
    // State management
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');
    const [planFilter, setPlanFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [selectedUsers, setSelectedUsers] = useState([]);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Form states
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user',
        status: 'active',
        subscription: 'free',
        phone: '',
        address: ''
    });

    // Pagination
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        newToday: 0,
        verified: 0,
        premium: 0,
        inactive: 0,
        admin: 0
    });

    // Load users
    const loadUsers = useCallback(async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page,
                limit: pagination.limit,
                ...(search && { search }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(roleFilter !== 'all' && { role: roleFilter }),
                ...(planFilter !== 'all' && { plan: planFilter }),
                ...(dateFilter !== 'all' && { dateRange: dateFilter })
            };

            const response = await API_SERVICE.getUsers(params);

            if (response.success && response.data) {
                setUsers(response.data.users || []);
                setPagination(prev => ({
                    ...prev,
                    page: response.data.pagination?.page || page,
                    total: response.data.pagination?.total || 0,
                    pages: response.data.pagination?.pages || 0
                }));
            } else {
                throw new Error(response.message || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            setError(error.message);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, roleFilter, planFilter, dateFilter, pagination.limit]);

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            const response = await API_SERVICE.getUserStats();
            if (response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }, []);

    // Load user details
    const loadUserDetails = useCallback(async (userId) => {
        setLoadingDetails(true);
        try {
            const response = await API_SERVICE.getUserDetails(userId);
            if (response.success && response.data) {
                setUserDetails(response.data);
                setShowUserModal(true);
            } else {
                toast.error(response.message || 'Failed to load user details');
            }
        } catch (error) {
            toast.error('Failed to load user details');
        } finally {
            setLoadingDetails(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadUsers();
        loadStats();
    }, [loadUsers, loadStats]);

    // Handle search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== '') {
                setPagination(prev => ({ ...prev, page: 1 }));
                loadUsers(1);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search, loadUsers]);

    // Handle filter changes
    useEffect(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
        const timer = setTimeout(() => {
            loadUsers(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [statusFilter, roleFilter, planFilter, dateFilter, loadUsers]);

    // Helper functions
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

    // Action handlers
    const handleRefresh = () => {
        loadUsers(pagination.page);
        loadStats();
        toast.success('Refreshing user data...');
    };

    const handleUserSelect = (userId) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user._id || user.id));
        }
    };

    // Create user
    const handleCreateUser = async () => {
        try {
            const response = await API_SERVICE.createUser(newUser);
            if (response.success) {
                toast.success('User created successfully');
                setShowCreateModal(false);
                setNewUser({
                    name: '',
                    email: '',
                    password: '',
                    role: 'user',
                    status: 'active',
                    subscription: 'free',
                    phone: '',
                    address: ''
                });
                loadUsers(pagination.page);
                loadStats();
            } else {
                throw new Error(response.message || 'Failed to create user');
            }
        } catch (error) {
            toast.error(`Failed to create user: ${error.message}`);
        }
    };

    // Edit user
    const handleEditUser = (user) => {
        setEditingUser(user);
        setShowEditModal(true);
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        try {
            const updateData = {
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                status: editingUser.status,
                subscription: editingUser.subscription?.plan || editingUser.subscription,
                phone: editingUser.phone,
                address: editingUser.address
            };

            const response = await API_SERVICE.updateUser(editingUser._id || editingUser.id, updateData);
            if (response.success) {
                toast.success('User updated successfully');
                setShowEditModal(false);
                setEditingUser(null);
                loadUsers(pagination.page);
                loadStats();
            } else {
                throw new Error(response.message || 'Failed to update user');
            }
        } catch (error) {
            toast.error(`Failed to update user: ${error.message}`);
        }
    };

    // Delete user
    const handleDeleteUser = async (userId) => {
        try {
            const response = await API_SERVICE.deleteUser(userId);
            if (response.success) {
                toast.success('User deleted successfully');
                setShowDeleteModal(false);
                setSelectedUser(null);
                loadUsers(pagination.page);
                loadStats();
            } else {
                throw new Error(response.message || 'Failed to delete user');
            }
        } catch (error) {
            toast.error(`Failed to delete user: ${error.message}`);
        }
    };

    // Bulk delete
    const handleBulkDelete = async () => {
        try {
            const response = await API_SERVICE.bulkDeleteUsers(selectedUsers);
            if (response.success) {
                toast.success(`Deleted ${selectedUsers.length} users successfully`);
                setSelectedUsers([]);
                setShowDeleteModal(false);
                loadUsers(pagination.page);
                loadStats();
            } else {
                throw new Error(response.message || 'Failed to delete users');
            }
        } catch (error) {
            toast.error(`Failed to delete users: ${error.message}`);
        }
    };

    // Send email
    const handleSendEmail = async (userId) => {
        const emailContent = prompt('Enter email message:', 'Hello, this is a message from the admin.');
        if (!emailContent) return;

        try {
            const response = await API_SERVICE.sendEmailToUser(userId, {
                subject: 'Message from Admin',
                message: emailContent
            });
            if (response.success) {
                toast.success('Email sent successfully');
            } else {
                throw new Error(response.message || 'Failed to send email');
            }
        } catch (error) {
            toast.error(`Failed to send email: ${error.message}`);
        }
    };

    // Reset password
    const handleResetPassword = async (userId) => {
        if (window.confirm('Are you sure you want to reset this user\'s password? A reset link will be sent to their email.')) {
            try {
                const response = await API_SERVICE.resetUserPassword(userId);
                if (response.success) {
                    toast.success('Password reset email sent');
                } else {
                    throw new Error(response.message || 'Failed to reset password');
                }
            } catch (error) {
                toast.error(`Failed to reset password: ${error.message}`);
            }
        }
    };

    // Bulk actions
    const [bulkAction, setBulkAction] = useState('');

    const handleBulkAction = async () => {
        if (!bulkAction || selectedUsers.length === 0) return;

        if (bulkAction === 'delete') {
            setShowDeleteModal(true);
            return;
        }

        let updateData = {};
        let actionName = '';

        switch (bulkAction) {
            case 'activate':
                updateData = { status: 'active' };
                actionName = 'activate';
                break;
            case 'deactivate':
                updateData = { status: 'inactive' };
                actionName = 'deactivate';
                break;
            case 'make_admin':
                updateData = { role: 'admin' };
                actionName = 'make admin';
                break;
            case 'remove_admin':
                updateData = { role: 'user' };
                actionName = 'remove admin';
                break;
            default:
                return;
        }

        try {
            const response = await API_SERVICE.bulkUpdateUsers(selectedUsers, updateData);
            if (response.success) {
                toast.success(`${actionName}d ${selectedUsers.length} users`);
                setSelectedUsers([]);
                setBulkAction('');
                loadUsers(pagination.page);
                loadStats();
            } else {
                throw new Error(response.message || `Failed to ${actionName} users`);
            }
        } catch (error) {
            toast.error(`Failed to ${actionName} users: ${error.message}`);
        }
    };

    // Export users
    const handleExport = async () => {
        try {
            const response = await API_SERVICE.exportUsers('csv');
            if (response.success && response.data) {
                // Create download link
                const blob = new Blob([response.data], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast.success('Users exported successfully');
            } else {
                throw new Error(response.message || 'Failed to export users');
            }
        } catch (error) {
            toast.error(`Failed to export users: ${error.message}`);
        }
    };

    // Badge components
    const StatusBadge = ({ status }) => {
        const statusMap = {
            active: { color: 'bg-green-100 text-green-800', icon: FiCheckCircle, label: 'Active' },
            inactive: { color: 'bg-red-100 text-red-800', icon: FiXCircle, label: 'Inactive' },
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: FiAlertCircle, label: 'Pending' },
            suspended: { color: 'bg-gray-100 text-gray-800', icon: FiUserX, label: 'Suspended' }
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

    const RoleBadge = ({ role }) => {
        const roleMap = {
            admin: { color: 'bg-purple-100 text-purple-800', label: 'Admin' },
            super_admin: { color: 'bg-indigo-100 text-indigo-800', label: 'Super Admin' },
            user: { color: 'bg-gray-100 text-gray-800', label: 'User' }
        };
        const config = roleMap[role] || roleMap.user;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    const SubscriptionBadge = ({ subscription }) => {
        const subMap = {
            premium: { color: 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800', label: 'Premium' },
            pro: { color: 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800', label: 'Pro' },
            enterprise: { color: 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800', label: 'Enterprise' },
            free: { color: 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800', label: 'Free' }
        };
        const plan = subscription?.plan || subscription || 'free';
        const config = subMap[plan] || subMap.free;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="px-6 py-8">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        <p className="text-gray-600">Manage all user accounts</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                        >
                            <FiDownload />
                            Export CSV
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2.5 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700"
                        >
                            <FiPlus />
                            Create User
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50"
                        >
                            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">New Today</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.newToday}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Verified</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Premium</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.premium}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Inactive</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <p className="text-sm text-gray-500">Admins</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                    <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FiUserCheck className="text-indigo-600" />
                                <div>
                                    <span className="font-medium text-indigo-900">
                                        {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <select
                                    value={bulkAction}
                                    onChange={(e) => setBulkAction(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                >
                                    <option value="">Select action...</option>
                                    <option value="activate">Activate Selected</option>
                                    <option value="deactivate">Deactivate Selected</option>
                                    <option value="make_admin">Make Admin</option>
                                    <option value="remove_admin">Remove Admin</option>
                                    <option value="delete">Delete Selected</option>
                                </select>
                                <button
                                    onClick={handleBulkAction}
                                    disabled={!bulkAction}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    Apply Action
                                </button>
                                <button
                                    onClick={() => setSelectedUsers([])}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Clear Selection
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search users by name, email..."
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
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
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                                <option value="suspended">Suspended</option>
                            </select>

                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>

                            <select
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="all">All Plans</option>
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
                            </select>

                            <select
                                value={pagination.limit}
                                onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            >
                                <option value="10">10 per page</option>
                                <option value="25">25 per page</option>
                                <option value="50">50 per page</option>
                                <option value="100">100 per page</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left w-12">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === users.length && users.length > 0}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 focus:ring-indigo-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plan
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
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                            <p className="mt-4 text-gray-600">Loading users...</p>
                                        </td>
                                    </tr>
                                ) : error ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <FiAlertCircle className="mx-auto text-red-400 text-5xl mb-4" />
                                            <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Users</h3>
                                            <p className="text-gray-600 mb-4">{error}</p>
                                            <button
                                                onClick={handleRefresh}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Retry
                                            </button>
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <FiUser className="mx-auto text-gray-400 text-5xl mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Found</h3>
                                            <p className="text-gray-600">Try adjusting your search or filters</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user._id || user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user._id || user.id)}
                                                    onChange={() => handleUserSelect(user._id || user.id)}
                                                    className="rounded border-gray-300 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                                                <span className="text-white font-medium">
                                                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={user.status} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <SubscriptionBadge subscription={user.subscription} />
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => loadUserDetails(user._id || user.id)}
                                                        className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg"
                                                        title="View Details"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg"
                                                        title="Edit User"
                                                    >
                                                        <FiEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleSendEmail(user._id || user.id)}
                                                        className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg"
                                                        title="Send Email"
                                                    >
                                                        <FiMail className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(user._id || user.id)}
                                                        className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-lg"
                                                        title="Reset Password"
                                                    >
                                                        <FiKey className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                                                        title="Delete User"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.page * pagination.limit, pagination.total)}
                                    </span> of{' '}
                                    <span className="font-medium">{pagination.total}</span> users
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => loadUsers(pagination.page - 1)}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                                    >
                                        <FiChevronLeft className="w-4 h-4" />
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(pagination.pages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            if (pagination.pages <= 5 || pageNum === 1 || pageNum === pagination.pages ||
                                                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => loadUsers(pageNum)}
                                                        className={`w-10 h-10 rounded-lg text-sm ${pagination.page === pageNum
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button
                                        onClick={() => loadUsers(pagination.page + 1)}
                                        disabled={pagination.page === pagination.pages}
                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1"
                                    >
                                        Next
                                        <FiChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Create User Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={newUser.status}
                                            onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                                    <select
                                        value={newUser.subscription}
                                        onChange={(e) => setNewUser({ ...newUser, subscription: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCreateUser}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <FiUserPlus className="w-4 h-4" />
                                    Create User
                                </button>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit User Modal */}
                {showEditModal && editingUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.name || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email || ''}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <select
                                            value={editingUser.role || 'user'}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={editingUser.status || 'active'}
                                            onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="pending">Pending</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                                    <select
                                        value={editingUser.subscription?.plan || editingUser.subscription || 'free'}
                                        onChange={(e) => setEditingUser({ ...editingUser, subscription: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                        <option value="pro">Pro</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleUpdateUser}
                                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <FiSave className="w-4 h-4" />
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
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
                                        {selectedUser ? 'Delete User' : `Delete ${selectedUsers.length} Users`}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {selectedUser ? `Delete ${selectedUser.name}?` : 'Delete selected users?'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                This action cannot be undone. All user data will be permanently deleted.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (selectedUser) {
                                            handleDeleteUser(selectedUser._id || selectedUser.id);
                                        } else {
                                            handleBulkDelete();
                                        }
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedUser(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Details Modal */}
                {showUserModal && userDetails && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <FiUser className="text-indigo-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-xl">User Details</h3>
                                        <p className="text-sm text-gray-600">Complete user profile</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <FiX className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {loadingDetails ? (
                                <div className="py-12 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Profile Header */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-gray-50 rounded-xl">
                                        <div className="flex-shrink-0">
                                            {userDetails.avatar ? (
                                                <img src={userDetails.avatar} alt={userDetails.name} className="w-20 h-20 rounded-full" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                                    <span className="text-white text-2xl font-medium">
                                                        {userDetails.name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900">{userDetails.name}</h4>
                                            <p className="text-gray-600 mb-2">{userDetails.email}</p>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <StatusBadge status={userDetails.status} />
                                                <RoleBadge role={userDetails.role} />
                                                <SubscriptionBadge subscription={userDetails.subscription} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">Contact Information</label>
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <FiMail className="text-gray-400" />
                                                        <span className="text-gray-700">{userDetails.email}</span>
                                                    </div>
                                                    {userDetails.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <FiPhone className="text-gray-400" />
                                                            <span className="text-gray-700">{userDetails.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">Account Information</label>
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Created</span>
                                                        <span className="text-sm text-gray-900">
                                                            {formatDate(userDetails.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Last Login</span>
                                                        <span className="text-sm text-gray-900">
                                                            {formatDateTime(userDetails.lastLogin) || 'Never'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Email Verified</span>
                                                        <span className={`px-2 py-1 rounded text-xs ${userDetails.emailVerified
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {userDetails.emailVerified ? 'Yes' : 'No'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-1 block">Activity</label>
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-600">Resumes Created</span>
                                                        <span className="font-medium text-gray-900">
                                                            {userDetails.resumeCount || 0}
                                                        </span>
                                                    </div>
                                                    {userDetails.subscription && (
                                                        <>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-gray-600">Plan</span>
                                                                <SubscriptionBadge subscription={userDetails.subscription} />
                                                            </div>
                                                            {userDetails.subscription.validUntil && (
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-600">Valid Until</span>
                                                                    <span className="text-sm text-gray-900">
                                                                        {formatDate(userDetails.subscription.validUntil)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div>
                                                <label className="text-sm font-medium text-gray-500 mb-3 block">Quick Actions</label>
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => handleSendEmail(userDetails._id || userDetails.id)}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                    >
                                                        Send Email
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(userDetails._id || userDetails.id)}
                                                        className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                                                    >
                                                        Reset Password
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(userDetails);
                                                            setShowDeleteModal(true);
                                                            setShowUserModal(false);
                                                        }}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                                    >
                                                        Delete User
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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

export default Users;