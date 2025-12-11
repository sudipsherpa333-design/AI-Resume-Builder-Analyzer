// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                toast.success('🎉 Welcome back!');
                navigate('/dashboard', { replace: true });
            } else {
                toast.error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            toast.error('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Demo login for testing
    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            toast.loading('Logging in with demo account...', { duration: 1500 });

            // Use demo credentials
            const demoResult = await login('demo@example.com', 'demo123');

            if (demoResult.success) {
                toast.success('🚀 Welcome to Demo Account!');
                navigate('/dashboard', { replace: true });
            } else {
                toast.error('Demo login failed. Please try regular login.');
            }
        } catch (error) {
            console.error('❌ Demo login error:', error);
            toast.error('Demo login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Google Login (simplified)
    const handleGoogleLogin = () => {
        toast.loading('Google login is being set up...', { duration: 2000 });
        setTimeout(() => {
            toast.error('Google login is not configured yet. Please use email login or demo account.');
        }, 2000);
    };

    // Handle Facebook Login (simplified)
    const handleFacebookLogin = () => {
        toast.loading('Facebook login is being set up...', { duration: 2000 });
        setTimeout(() => {
            toast.error('Facebook login is not configured yet. Please use email login or demo account.');
        }, 2000);
    };

    // Animation variants
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

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <motion.div
                className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Brand Section */}
                <motion.div
                    className="hidden lg:flex flex-col items-center justify-center text-center p-8"
                    variants={itemVariants}
                >
                    <motion.div
                        className="text-6xl mb-6"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        👋
                    </motion.div>
                    <motion.h1
                        className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                        variants={itemVariants}
                    >
                        Welcome Back
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-600 mb-8"
                        variants={itemVariants}
                    >
                        Sign in to continue building your professional resume
                    </motion.p>
                    <motion.div
                        className="space-y-4 text-left max-w-sm"
                        variants={itemVariants}
                    >
                        {[
                            { icon: '🚀', text: 'Access your saved resumes' },
                            { icon: '📊', text: 'View resume analytics' },
                            { icon: '🎨', text: 'Edit with multiple templates' },
                            { icon: '📥', text: 'Download instantly in PDF format' }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.text}
                                className="flex items-center space-x-3 text-gray-700 text-lg"
                                variants={itemVariants}
                                custom={index}
                            >
                                <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                                <span>{feature.text}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Login Form */}
                <motion.div
                    className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 w-full max-w-md mx-auto"
                    variants={itemVariants}
                >
                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                            Sign In
                        </h2>
                        <p className="text-gray-600">
                            Sign in to your account to continue
                        </p>
                    </motion.div>

                    {/* Demo Button */}
                    <motion.button
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4"
                        variants={itemVariants}
                        whileHover={!isLoading ? { scale: 1.02 } : {}}
                        whileTap={!isLoading ? { scale: 0.98 } : {}}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            '🎬 Try Demo Account'
                        )}
                    </motion.button>

                    <div className="my-4 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">Or sign in with account</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <motion.div variants={itemVariants}>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                                    placeholder="your@email.com"
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </motion.div>

                        <motion.div className="flex items-center justify-between" variants={itemVariants}>
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    disabled={isLoading}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>

                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </motion.div>

                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
                            variants={itemVariants}
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                'Sign in to your account'
                            )}
                        </motion.button>
                    </form>

                    <motion.div className="my-6 flex items-center" variants={itemVariants}>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-4 text-sm text-gray-500">Or continue with</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </motion.div>

                    {/* Social Login */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            <FcGoogle className="text-xl" />
                            <span>Continue with Google</span>
                        </button>

                        {/* Facebook Button */}
                        <button
                            onClick={handleFacebookLogin}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            <FaFacebook className="text-xl text-blue-600" />
                            <span>Continue with Facebook</span>
                        </button>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className="text-center mt-8 pt-6 border-t border-gray-200"
                        variants={itemVariants}
                    >
                        <p className="text-gray-600 text-sm">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
                            >
                                Create account
                            </Link>
                        </p>
                        <Link
                            to="/"
                            className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors hover:underline"
                        >
                            ← Back to Home
                        </Link>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Login;