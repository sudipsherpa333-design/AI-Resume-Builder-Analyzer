// frontend/src/admin/components/UserDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
    FiX, FiUser, FiMail, FiCalendar, FiFileText, FiCheckCircle,
    FiXCircle, FiClock, FiActivity, FiGlobe, FiPhone, FiBriefcase,
    FiMapPin, FiCreditCard, FiShield, FiStar, FiTrendingUp, FiDownload,
    FiEye, FiEdit, FiTrash2, FiKey, FiSend, FiCopy, FiBarChart2
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [userData, setUserData] = useState(user);
    const [notes, setNotes] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [resumes, setResumes] = useState([]);

    useEffect(() => {
        if (isOpen && user) {
            setUserData(user);
            fetchUserDetails();
        }
    }, [isOpen, user]);

    const fetchUserDetails = async () => {
        if (!user?._id) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');

            // Fetch additional data based on active tab
            if (activeTab === 'notes') {
                const response = await fetch(`/api/admin/users/${user._id}/notes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) setNotes(data.data || []);
                }
            } else if (activeTab === 'sessions') {
                const response = await fetch(`/api/admin/users/${user._id}/sessions`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) setSessions(data.data || []);
                }
            } else if (activeTab === 'resumes') {
                const response = await fetch(`/api/admin/users/${user._id}/resumes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) setResumes(data.data || []);
                }
            }
        } catch (error) {
            console.error('Fetch user details error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab !== 'overview') {
            fetchUserDetails();
        }
    }, [activeTab]);

    if (!isOpen || !userData) return null;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'active':
                return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'inactive':
                return <FiXCircle className="w-5 h-5 text-yellow-500" />;
            case 'banned':
                return <FiXCircle className="w-5 h-5 text-red-500" />;
            default:
                return <FiClock className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'text-green-700 bg-green-50 border-green-200';
            case 'inactive':
                return 'text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'banned':
                return 'text-red-700 bg-red-50 border-red-200';
            default:
                return 'text-gray-700 bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid date';
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-medium text-lg">
                                    {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            {userData.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <FiShield className="w-2.5 h-2.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{userData.name}</h3>
                            <p className="text-sm text-gray-500">{userData.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-1 px-6">
                        {['overview', 'activity', 'resumes', 'notes', 'sessions', 'settings'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-3 text-gray-600">Loading...</p>
                        </div>
                    ) : activeTab === 'overview' ? (
                        <div className="space-y-6">
                            {/* Status & Role */}
                            <div className="flex items-center gap-3">
                                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(userData.status)}`}>
                                    {getStatusIcon(userData.status)}
                                    <span className="font-medium capitalize">{userData.status || 'Unknown'}</span>
                                </div>
                                <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                    {userData.role?.replace('_', ' ')?.toUpperCase() || 'USER'}
                                </div>
                                {userData.isVerified && (
                                    <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1">
                                        <FiShield className="w-3 h-3" />
                                        Verified
                                    </div>
                                )}
                            </div>

                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <FiMail className="text-gray-400" />
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-500">Email</div>
                                                <div className="font-medium">{userData.email}</div>
                                            </div>
                                            <button
                                                onClick={() => copyToClipboard(userData.email)}
                                                className="p-1 hover:bg-gray-200 rounded"
                                            >
                                                <FiCopy className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                        {userData.phone && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FiPhone className="text-gray-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Phone</div>
                                                    <div className="font-medium">{userData.phone}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Additional Information</h4>
                                    <div className="space-y-3">
                                        {userData.company && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FiBriefcase className="text-gray-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Company</div>
                                                    <div className="font-medium">{userData.company}</div>
                                                </div>
                                            </div>
                                        )}
                                        {userData.location && (
                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                <FiMapPin className="text-gray-400" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Location</div>
                                                    <div className="font-medium">{userData.location}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Activity Stats */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-4">Activity Statistics</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-700">{userData.loginCount || 0}</div>
                                        <div className="text-xs text-blue-600 mt-1">Total Logins</div>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-xl">
                                        <div className="text-2xl font-bold text-green-700">{userData.resumeCount || 0}</div>
                                        <div className="text-xs text-green-600 mt-1">Resumes Created</div>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-700">{userData.resumeDownloads || 0}</div>
                                        <div className="text-xs text-purple-600 mt-1">Resume Downloads</div>
                                    </div>
                                    <div className="text-center p-4 bg-yellow-50 rounded-xl">
                                        <div className="text-2xl font-bold text-yellow-700">{userData.templatesUsed || 0}</div>
                                        <div className="text-xs text-yellow-600 mt-1">Templates Used</div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-medium text-gray-900 mb-4">Timeline</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <FiCalendar className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Account Created</div>
                                            <div className="text-sm text-gray-500">{formatDate(userData.createdAt)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <FiClock className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">Last Login</div>
                                            <div className="text-sm text-gray-500">
                                                {userData.lastLogin ? formatDate(userData.lastLogin) : 'Never'}
                                            </div>
                                        </div>
                                    </div>
                                    {userData.lastActive && (
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FiActivity className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">Last Activity</div>
                                                <div className="text-sm text-gray-500">{formatDate(userData.lastActive)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'activity' ? (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Recent Activity</h4>
                            {/* Activity logs would go here */}
                            <div className="text-center py-8 text-gray-500">
                                <FiActivity className="mx-auto text-3xl mb-2" />
                                <p>Activity logs will be displayed here</p>
                            </div>
                        </div>
                    ) : activeTab === 'resumes' ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">User Resumes</h4>
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                    {resumes.length} resumes
                                </span>
                            </div>
                            {resumes.length > 0 ? (
                                <div className="space-y-3">
                                    {resumes.map(resume => (
                                        <div key={resume._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-gray-900">{resume.title}</div>
                                                    <div className="text-sm text-gray-500">
                                                        Created: {formatDate(resume.createdAt)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                                        <FiDownload className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FiFileText className="mx-auto text-3xl mb-2" />
                                    <p>No resumes found</p>
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'notes' ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">User Notes</h4>
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                                    Add Note
                                </button>
                            </div>
                            {/* Notes content would go here */}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h4>
                            {/* Other tabs content */}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Close
                    </button>
                    <div className="flex gap-2">
                        <button className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                            <FiEdit className="w-4 h-4" />
                            Edit
                        </button>
                        <button className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2">
                            <FiKey className="w-4 h-4" />
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;