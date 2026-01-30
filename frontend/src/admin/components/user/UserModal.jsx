// frontend/src/admin/components/UserModal.jsx
import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiMail, FiLock, FiCheck, FiEye, FiEyeOff, FiShield, FiGlobe } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const UserModal = ({ isOpen, onClose, user, mode, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        status: 'active',
        isVerified: false,
        phone: '',
        company: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                confirmPassword: '',
                role: user.role || 'user',
                status: user.status || 'active',
                isVerified: user.isVerified || false,
                phone: user.phone || '',
                company: user.company || '',
                location: user.location || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: '',
                role: 'user',
                status: 'active',
                isVerified: false,
                phone: '',
                company: '',
                location: ''
            });
        }
    }, [mode, user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Please enter a valid email');
            return false;
        }
        if (mode === 'create' && !formData.password) {
            toast.error('Password is required');
            return false;
        }
        if (formData.password && formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const url = mode === 'create'
                ? '/api/admin/users'
                : `/api/admin/users/${user._id}`;

            const method = mode === 'create' ? 'POST' : 'PUT';

            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
                status: formData.status,
                isVerified: formData.isVerified,
                ...(formData.phone && { phone: formData.phone }),
                ...(formData.company && { company: formData.company }),
                ...(formData.location && { location: formData.location })
            };

            // Only include password if provided (for edit) or in create mode
            if (mode === 'create' || formData.password) {
                payload.password = formData.password;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.success) {
                toast.success(mode === 'create' ? 'User created successfully' : 'User updated successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch (error) {
            console.error('User operation error:', error);
            toast.error('Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {mode === 'create' ? 'Create New User' : 'Edit User'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {mode === 'create' ? 'Add a new user account' : 'Update user information'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Basic Information</h4>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required
                                        disabled={mode === 'edit'}
                                    />
                                </div>
                                {mode === 'edit' && (
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+1 (555) 123-4567"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-900">Additional Information</h4>

                            {/* Company */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    placeholder="Company name"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                />
                            </div>

                            {/* Location */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location
                                </label>
                                <div className="relative">
                                    <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Country"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Verification Status */}
                            <div className="flex items-center justify-between pt-2">
                                <div>
                                    <label className="font-medium text-gray-700">Email Verification</label>
                                    <p className="text-sm text-gray-500">Mark email as verified</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="isVerified"
                                        checked={formData.isVerified}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900">
                            {mode === 'create' ? 'Set Password' : 'Change Password'}
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {mode === 'create' ? 'Password *' : 'New Password'}
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={mode === 'create' ? 'Enter password' : 'Enter new password'}
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        required={mode === 'create'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                            </div>

                            {/* Confirm Password */}
                            {formData.password && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm password"
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Role & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                        {/* Role */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Role</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['user', 'admin'].map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'role', value: role } })}
                                        className={`px-4 py-2.5 rounded-lg border flex items-center justify-center gap-2 ${formData.role === role
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {formData.role === role && <FiCheck className="w-4 h-4" />}
                                        {role.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Status</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['active', 'inactive'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'status', value: status } })}
                                        className={`px-4 py-2.5 rounded-lg border flex items-center justify-center gap-2 ${formData.status === status
                                            ? status === 'active'
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-yellow-500 bg-yellow-50 text-yellow-700'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {formData.status === status && <FiCheck className="w-4 h-4" />}
                                        {status.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-6 border-t border-gray-200 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                                </>
                            ) : (
                                <>
                                    <FiCheck className="w-4 h-4" />
                                    {mode === 'create' ? 'Create User' : 'Update User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;