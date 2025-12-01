import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        newPassword: false,
        confirmPassword: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { resetPassword } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePasswords = () => {
        if (!passwords.newPassword || !passwords.confirmPassword) {
            toast.error('Please fill in all fields');
            return false;
        }

        if (passwords.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return false;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('Passwords do not match');
            return false;
        }

        // Password strength check
        const hasUpperCase = /[A-Z]/.test(passwords.newPassword);
        const hasLowerCase = /[a-z]/.test(passwords.newPassword);
        const hasNumbers = /\d/.test(passwords.newPassword);
        const hasSpecialChar = /[!@#$%^&*]/.test(passwords.newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            toast.error('Password must contain uppercase, lowercase, and numbers');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid reset link');
            return;
        }

        if (!validatePasswords()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await resetPassword(token, passwords.newPassword);
            if (result.success) {
                toast.success('✅ Password reset successfully!');
                setIsSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                toast.error(result.message || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    // Password strength indicator
    const getPasswordStrength = () => {
        const password = passwords.newPassword;
        let strength = 0;

        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*]/.test(password)) strength++;

        return strength;
    };

    const strengthPercentage = (getPasswordStrength() / 6) * 100;
    const strengthColor = strengthPercentage < 33 ? 'bg-red-500' : strengthPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500';
    const strengthLabel = strengthPercentage < 33 ? 'Weak' : strengthPercentage < 66 ? 'Fair' : 'Strong';

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <motion.div
                    className="w-full max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                        <div className="text-4xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
                        <p className="text-gray-600 mb-6">
                            The password reset link is invalid or has expired.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                        >
                            Request New Link
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-md"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Back Button */}
                <motion.div variants={itemVariants} className="mb-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        <FaArrowLeft className="mr-2" />
                        Back to Login
                    </Link>
                </motion.div>

                {/* Card */}
                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
                    variants={itemVariants}
                >
                    {!isSuccess ? (
                        <>
                            {/* Header */}
                            <motion.div
                                className="text-center mb-8"
                                variants={itemVariants}
                            >
                                <div className="text-4xl mb-4">🔑</div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                                <p className="text-gray-600">
                                    Enter your new password below. Make it strong and unique.
                                </p>
                            </motion.div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* New Password */}
                                <motion.div variants={itemVariants}>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showPasswords.newPassword ? 'text' : 'password'}
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwords.newPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({
                                                ...prev,
                                                newPassword: !prev.newPassword
                                            }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showPasswords.newPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>

                                    {/* Password Strength Indicator */}
                                    {passwords.newPassword && (
                                        <motion.div
                                            className="mt-3"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-medium text-gray-600">Password Strength</span>
                                                <span className={`text-xs font-semibold ${strengthColor === 'bg-red-500' ? 'text-red-600' : strengthColor === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                    {strengthLabel}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <motion.div
                                                    className={`h-2 rounded-full ${strengthColor}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${strengthPercentage}%` }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Confirm Password */}
                                <motion.div variants={itemVariants}>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={showPasswords.confirmPassword ? 'text' : 'password'}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={passwords.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                                            placeholder="••••••••"
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(prev => ({
                                                ...prev,
                                                confirmPassword: !prev.confirmPassword
                                            }))}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isLoading}
                                        >
                                            {showPasswords.confirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>

                                    {/* Match Indicator */}
                                    {passwords.confirmPassword && (
                                        <motion.p
                                            className={`text-xs mt-2 ${passwords.newPassword === passwords.confirmPassword ? 'text-green-600' : 'text-red-600'}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            {passwords.newPassword === passwords.confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                                        </motion.p>
                                    )}
                                </motion.div>

                                {/* Submit Button */}
                                <motion.button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                    variants={itemVariants}
                                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Resetting password...</span>
                                        </div>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </motion.button>
                            </form>

                            {/* Password Requirements */}
                            <motion.div
                                className="mt-6 pt-6 border-t border-gray-200"
                                variants={itemVariants}
                            >
                                <h4 className="font-medium text-gray-900 mb-3">Password Requirements:</h4>
                                <ul className="text-sm text-gray-600 space-y-2">
                                    <li className={`flex items-center ${passwords.newPassword.length >= 8 ? 'text-green-600' : ''}`}>
                                        {passwords.newPassword.length >= 8 ? '✅' : '○'} At least 8 characters
                                    </li>
                                    <li className={`flex items-center ${/[A-Z]/.test(passwords.newPassword) && /[a-z]/.test(passwords.newPassword) ? 'text-green-600' : ''}`}>
                                        {/[A-Z]/.test(passwords.newPassword) && /[a-z]/.test(passwords.newPassword) ? '✅' : '○'} Mix of uppercase and lowercase
                                    </li>
                                    <li className={`flex items-center ${/\d/.test(passwords.newPassword) ? 'text-green-600' : ''}`}>
                                        {/\d/.test(passwords.newPassword) ? '✅' : '○'} At least one number
                                    </li>
                                </ul>
                            </motion.div>
                        </>
                    ) : (
                        <>
                            {/* Success Message */}
                            <motion.div
                                className="text-center"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <motion.div
                                    className="text-6xl mb-6"
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    ✅
                                </motion.div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
                                <p className="text-gray-600 mb-6">
                                    Your password has been reset successfully. You'll be redirected to login shortly.
                                </p>
                                <Link
                                    to="/login"
                                    className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                                >
                                    Go to Login
                                </Link>
                            </motion.div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
