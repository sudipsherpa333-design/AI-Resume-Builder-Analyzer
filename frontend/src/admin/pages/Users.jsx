// frontend/src/admin/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, getStatusColor, formatTimeAgo } from '../utils/formatters';

const Users = () => {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            status: 'active',
            resumes: 3,
            lastLogin: new Date(Date.now() - 3600000).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            subscription: 'Premium'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            status: 'inactive',
            resumes: 1,
            lastLogin: new Date(Date.now() - 86400000 * 30).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
            subscription: 'Free'
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            status: 'suspended',
            resumes: 0,
            lastLogin: new Date(Date.now() - 86400000 * 60).toISOString(),
            createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
            subscription: 'Free'
        }
    ]);

    const [loading, setLoading] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link to="/admin/dashboard" className="text-slate-700 hover:text-blue-600 flex items-center">
                            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            Add User
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6">
                <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-slate-600">Manage all user accounts and permissions</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Resumes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Subscription
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-slate-900">{user.name}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                                {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {user.resumes}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatTimeAgo(user.lastLogin)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            <span className={`px-2 py-1 text-xs rounded ${user.subscription === 'Premium' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {user.subscription}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900">
                                                    Edit
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    Suspend
                                                </button>
                                                <Link
                                                    to={`/admin/users/${user.id}`}
                                                    className="text-slate-600 hover:text-slate-900"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                                Showing {users.length} users
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">
                                    Previous
                                </button>
                                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                                    1
                                </button>
                                <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">User Statistics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Total Users</span>
                                <span className="text-2xl font-bold text-slate-900">154</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Active Users</span>
                                <span className="text-2xl font-bold text-green-600">128</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">New This Month</span>
                                <span className="text-2xl font-bold text-blue-600">23</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Subscription Overview</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Premium Users</span>
                                <span className="text-xl font-bold text-purple-600">47</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600">Free Users</span>
                                <span className="text-xl font-bold text-slate-600">107</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
                                Send Welcome Email
                            </button>
                            <button className="w-full px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
                                Export Users List
                            </button>
                            <button className="w-full px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left">
                                Bulk Delete Inactive
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Users;