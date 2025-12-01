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
    const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });
    const [rememberMe, setRememberMe] = useState(false);

    const { login, socialLogin, demoLogin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Compute redirect target: prefer location.state.from (set by ProtectedRoute), fall back to query param, default to home
    const getRedirectTarget = () => {
        const searchParams = new URLSearchParams(location.search);
        const redirectQuery = searchParams.get('redirect');
        return location.state?.from?.pathname || redirectQuery || '/';
    };

    const [from, setFrom] = useState(getRedirectTarget());

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, from, navigate]);

    // ==================== GOOGLE AUTH SETUP ====================
    useEffect(() => {
        const loadGoogleSDK = () => {
            if (window.google) return;

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initializeGoogleAuth;
            document.head.appendChild(script);
        };

        loadGoogleSDK();

        return () => {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const initializeGoogleAuth = () => {
        if (!window.google) return;

        try {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE',
                callback: handleGoogleResponse,
                auto_select: false,
            });
            console.log('✅ Google SDK initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Google Auth:', error);
        }
    };

    const handleGoogleResponse = async (response) => {
        setSocialLoading(prev => ({ ...prev, google: true }));

        try {
            const socialData = {
                token: response.credential,
                provider: 'google'
            };

            const result = await socialLogin('google', socialData);
            if (result.success) {
                toast.success('🎉 Successfully logged in with Google!');
                navigate(from, { replace: true });
            } else {
                toast.error(result.message || 'Google login failed');
            }
        } catch (error) {
            console.error('❌ Google login error:', error);
            toast.error('Google login failed. Please try again.');
        } finally {
            setSocialLoading(prev => ({ ...prev, google: false }));
        }
    };

    const handleGoogleLogin = () => {
        if (window.google) {
            try {
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        const container = document.getElementById('googleButtonContainer');
                        if (container) {
                            window.google.accounts.id.renderButton(container, {
                                theme: 'outline',
                                size: 'large',
                                width: '100%',
                                text: 'continue_with'
                            });
                        }
                    }
                });
            } catch (error) {
                console.error('Google prompt error:', error);
                toast.error('Google sign-in is not available. Please try again.');
            }
        } else {
            toast.error('Google sign-in is loading. Please try again in a moment.');
        }
    };

    // ==================== FACEBOOK AUTH SETUP ====================
    useEffect(() => {
        const loadFacebookSDK = () => {
            if (window.FB) return;

            const script = document.createElement('script');
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0&appId=' +
                (import.meta.env.VITE_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID_HERE');

            script.onload = initializeFacebookAuth;
            document.head.appendChild(script);
        };

        loadFacebookSDK();

        return () => {
            const script = document.querySelector('script[src*="facebook"]');
            if (script) {
                document.head.removeChild(script);
            }
        };
    }, []);

    const initializeFacebookAuth = () => {
        if (!window.FB) return;

        try {
            window.FB.init({
                appId: import.meta.env.VITE_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID_HERE',
                xfbml: true,
                version: 'v18.0'
            });
            console.log('✅ Facebook SDK initialized');
        } catch (error) {
            console.error('❌ Failed to initialize Facebook Auth:', error);
        }
    };

    const handleFacebookLogin = async () => {
        setSocialLoading(prev => ({ ...prev, facebook: true }));

        try {
            if (!window.FB) {
                toast.error('Facebook SDK is not loaded. Please try again.');
                setSocialLoading(prev => ({ ...prev, facebook: false }));
                return;
            }

            window.FB.login(async (response) => {
                if (response.authResponse) {
                    const accessToken = response.authResponse.accessToken;

                    // Get user profile info
                    window.FB.api('/me', { fields: 'id,name,email,picture' }, async (userInfo) => {
                        const socialData = {
                            token: accessToken,
                            provider: 'facebook',
                            userData: {
                                id: userInfo.id,
                                name: userInfo.name,
                                email: userInfo.email,
                                picture: userInfo.picture?.data?.url
                            }
                        };

                        try {
                            const result = await socialLogin('facebook', socialData);
                            if (result.success) {
                                toast.success('🎉 Successfully logged in with Facebook!');
                                navigate(from, { replace: true });
                            } else {
                                toast.error(result.message || 'Facebook login failed');
                            }
                        } catch (error) {
                            console.error('❌ Facebook login error:', error);
                            toast.error('Facebook login failed. Please try again.');
                        } finally {
                            setSocialLoading(prev => ({ ...prev, facebook: false }));
                        }
                    });
                } else {
                    console.log('User cancelled Facebook login or did not fully authorize.');
                    setSocialLoading(prev => ({ ...prev, facebook: false }));
                }
            }, { scope: 'public_profile,email' });
        } catch (error) {
            console.error('❌ Facebook login error:', error);
            toast.error('Facebook login failed. Please try again.');
            setSocialLoading(prev => ({ ...prev, facebook: false }));
        }
    };

    // ==================== EMAIL/PASSWORD HANDLERS ====================
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

        // Simple email format check (skip for admin username)
        if (formData.email !== 'airesume100' && !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(formData.email, formData.password);

            if (result.success) {
                toast.success('🎉 Welcome back!');
                
                // Check for admin role
                if (result.user?.role === 'admin') {
                    toast.success('👮 Redirecting to Admin Dashboard...');
                    // Redirect to Admin App (assuming it runs on port 5174)
                    // Using window.location to break out of current SPA router
                    setTimeout(() => {
                        window.location.href = 'http://localhost:5174';
                    }, 1000);
                } else {
                    // Redirect to dashboard after successful login
                    navigate('/dashboard', { replace: true });
                }
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
            toast.loading('Attempting demo login...', { duration: 2000 });

            const result = await demoLogin();

            if (result.success) {
                toast.success('🚀 Welcome to Demo Account! Redirecting to dashboard...');
                // Always redirect to dashboard for demo account
                setTimeout(() => navigate('/dashboard', { replace: true }), 500);
            } else {
                toast.error(result.message || '❌ Demo account not available. Please check your connection.');
                console.log('Demo login failed:', result.message);
            }
        } catch (error) {
            console.error('❌ Demo login error:', error);
            toast.error('Demo login failed. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // ==================== ANIMATION VARIANTS ====================
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

    // ==================== RENDER ====================
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
                        Continue building amazing resumes
                    </motion.p>
                    <motion.div
                        className="space-y-4 text-left max-w-sm"
                        variants={itemVariants}
                    >
                        {[
                            { icon: '🚀', text: 'Pick up where you left off' },
                            { icon: '📊', text: 'Access your resume analytics' },
                            { icon: '🎨', text: 'Edit your existing templates' },
                            { icon: '📥', text: 'Download your resumes instantly' }
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
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
                        <p className="text-gray-600">Sign in to your account to continue</p>
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
                                Email Address or Admin Username
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                                    placeholder="your@email.com or username"
                                    disabled={isLoading}
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
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
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

                    {/* Social Login Buttons */}
                    <motion.div className="space-y-3" variants={itemVariants}>
                        {/* Google Button Container */}
                        <div id="googleButtonContainer" className="w-full flex justify-center" />

                        {/* Google Manual Button (fallback) */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={socialLoading.google || isLoading}
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {socialLoading.google ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                </div>
                            ) : (
                                <>
                                    <FcGoogle className="text-xl" />
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>

                        {/* Facebook Button */}
                        <button
                            onClick={handleFacebookLogin}
                            disabled={socialLoading.facebook || isLoading}
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {socialLoading.facebook ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Connecting...</span>
                                </div>
                            ) : (
                                <>
                                    <FaFacebook className="text-xl text-blue-600" />
                                    <span>Continue with Facebook</span>
                                </>
                            )}
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
