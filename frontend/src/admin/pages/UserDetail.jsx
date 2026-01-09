// frontend/src/admin/pages/UserDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, FileText, Eye, Download, Edit, Save, X } from 'lucide-react';
import { useAdminData } from '../hooks/useAdminData.js';
import { formatDate, formatNumber } from '../utils/formatters.js';
import userService from '../services/userService.js';

const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const { data: userData, loading, error, fetchData } = useAdminData(
        () => userService.getUserById(id)
    );

    useEffect(() => {
        if (userData?.data?.user) {
            setEditData(userData.data.user);
        }
    }, [userData]);

    const handleSave = async () => {
        try {
            await userService.updateUser(id, editData);
            setIsEditing(false);
            fetchData();
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !userData?.data?.user) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600">Error loading user: {error}</p>
                <button
                    onClick={() => navigate('/admin/users')}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Back to Users
                </button>
            </div>
        );
    }

    const { user, resumes, stats } = userData.data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
                        <p className="text-gray-600">Manage user information and activities</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData(user);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                        </button>
                    )}
                </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="md:col-span-2">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-2xl font-bold">
                                    {user.name?.charAt(0) || 'U'}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <div className="flex items-center text-gray-600 mt-1">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {user.email}
                                </div>
                                <div className="flex items-center text-gray-600 mt-1">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Joined {formatDate(user.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.name || ''}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                ) : (
                                    <p className="text-gray-900">{user.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                {isEditing ? (
                                    <select
                                        value={editData.isActive || true}
                                        onChange={(e) => setEditData({ ...editData, isActive: e.target.value === 'true' })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                ) : (
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Stats */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats.totalResumes || 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Resumes</div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats.totalViews || 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Views</div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-gray-900">
                                {formatNumber(stats.totalDownloads || 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Downloads</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Resumes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Resumes</h3>
                </div>

                {resumes?.length === 0 ? (
                    <div className="p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No resumes created yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {resumes.map((resume) => (
                            <div key={resume._id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{resume.title}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span className="flex items-center">
                                                <Eye className="w-3 h-3 mr-1" />
                                                {resume.views || 0} views
                                            </span>
                                            <span className="flex items-center">
                                                <Download className="w-3 h-3 mr-1" />
                                                {resume.downloads || 0} downloads
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {formatDate(resume.createdAt)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDetail;