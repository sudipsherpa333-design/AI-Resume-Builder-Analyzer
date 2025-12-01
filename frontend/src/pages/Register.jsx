import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });

  const { register, socialLogin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Google Auth Setup
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
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-client-id',
        callback: handleGoogleResponse,
        auto_select: false,
      });
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
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
        toast.success('Successfully registered with Google!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Google registration failed');
      }
    } catch (error) {
      console.error('Google registration error:', error);
      toast.error('Google registration failed. Please try again.');
    } finally {
      setSocialLoading(prev => ({ ...prev, google: false }));
    }
  };

  const handleGoogleRegister = () => {
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

  const handleFacebookRegister = async () => {
    setSocialLoading(prev => ({ ...prev, facebook: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.success('Facebook registration would be implemented here!');
      toast('For now, please use email registration or Google sign-in.', {
        icon: 'ℹ️',
        duration: 4000,
      });

    } catch (error) {
      console.error('Facebook registration error:', error);
      toast.error('Facebook registration failed. Please try again.');
    } finally {
      setSocialLoading(prev => ({ ...prev, facebook: false }));
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.success) {
        toast.success('Account created successfully! Welcome! 🎉');
        navigate(from, { replace: true });
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo registration for testing
  const handleDemoRegister = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const demoData = {
        name: 'Demo User',
        email: `demo${Math.random().toString(36).substr(2, 5)}@resumebuilder.com`,
        password: 'demopassword123'
      };

      const result = await register(demoData);
      if (result.success) {
        toast.success('Demo account created! Welcome! 🚀');
        navigate(from, { replace: true });
      }
    } catch (error) {
      toast.error('Demo registration failed');
    } finally {
      setIsLoading(false);
    }
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
            🚀
          </motion.div>
          <motion.h1
            className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            variants={itemVariants}
          >
            Start Your Journey
          </motion.h1>
          <motion.p
            className="text-xl text-gray-600 mb-8"
            variants={itemVariants}
          >
            Join thousands building professional resumes
          </motion.p>
          <motion.div
            className="space-y-4 text-left max-w-sm"
            variants={itemVariants}
          >
            {[
              { icon: '✨', text: 'Easy drag & drop builder' },
              { icon: '🎯', text: 'Professional templates' },
              { icon: '⚡', text: 'Instant PDF download' },
              { icon: '📊', text: 'ATS optimized resumes' }
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

        {/* Register Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 w-full max-w-md mx-auto relative z-10"
          variants={itemVariants}
        >
          <motion.div
            className="text-center mb-8"
            variants={itemVariants}
          >
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Start building your professional resume today</p>
          </motion.div>

          {/* Demo Button */}
          <motion.button
            onClick={handleDemoRegister}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mb-4 relative z-30"
            variants={itemVariants}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Demo Account...</span>
              </div>
            ) : (
              'Try Demo Account'
            )}
          </motion.button>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or create real account</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400 text-black"
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
            </motion.div>

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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400 text-black"
                  placeholder="Enter your email"
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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400 text-black"
                  placeholder="Enter your password"
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
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400 text-black"
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </motion.div>

            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2 relative z-30"
              variants={itemVariants}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          <motion.div className="my-6 flex items-center" variants={itemVariants}>
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or sign up with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </motion.div>

          <motion.div className="grid grid-cols-1 gap-3" variants={itemVariants}>
            {/* Google Button Container */}
            <div id="googleButtonContainer" className="min-h-[40px] flex justify-center">
              {/* Google button will be rendered here if needed */}
            </div>

            <button
              onClick={handleGoogleRegister}
              disabled={socialLoading.google || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 text-sm relative z-20"
            >
              {socialLoading.google ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  <FcGoogle className="text-lg" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={handleFacebookRegister}
              disabled={socialLoading.facebook || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 text-sm relative z-20"
            >
              {socialLoading.facebook ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <>
                  <FaFacebook className="text-lg text-blue-600" />
                  <span>Continue with Facebook</span>
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            className="text-center mt-6 pt-6 border-t border-gray-200"
            variants={itemVariants}
          >
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
            <Link
              to="/"
              className="inline-block mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;