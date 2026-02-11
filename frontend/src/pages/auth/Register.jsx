// src/pages/auth/Register.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';
import Navbar from '../../components/Navbar';
import {
  FaFacebook,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaChartLine,
  FaPalette,
  FaDownload,
  FaRobot,
  FaLock as FaLockIcon
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    jobTitle: ''
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Get Google Client ID from environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '35584631622-tl8qqbeer98vbd4t11thjfpqfpv86dlp.apps.googleusercontent.com';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isRedirecting) {
      console.log('📍 [Register] Already authenticated, redirecting to dashboard');
      setIsRedirecting(true);
      toast.success('Already logged in! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    }
  }, [isAuthenticated, navigate, isRedirecting]);

  // Password strength calculation
  useEffect(() => {
    const password = formData.password;
    if (!password) {
      setPasswordStrength(0);
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
      return;
    }

    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    setPasswordRequirements(requirements);

    // Calculate strength (0-5)
    const strength = Object.values(requirements).filter(Boolean).length;
    setPasswordStrength(strength);

    // Update form errors
    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (strength < 3 && password) {
        newErrors.password = 'Password is too weak';
      } else {
        delete newErrors.password;
      }
      return newErrors;
    });
  }, [formData.password]);

  // Validate password match
  useEffect(() => {
    if (formData.confirmPassword) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        return newErrors;
      });
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (passwordStrength < 3) {
      errors.password = 'Password is too weak';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]{10,20}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!acceptTerms) {
      errors.terms = 'Please accept the terms and conditions';
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Show first error as toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError, {
        duration: 4000,
        position: 'top-center'
      });
      return false;
    }

    console.log('✅ [Register] Form validation passed');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🚀 [Register] Form submission started', {
      name: formData.name,
      email: formData.email
    });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Show loading toast
    const loadingToast = toast.loading('Creating your account...', {
      position: 'top-center'
    });

    try {
      // Call register from AuthContext
      const result = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        navigate
      );

      console.log('📥 [Register] Registration result:', result);

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('🎉 Account created successfully! Redirecting...', {
          duration: 3000,
          position: 'top-center'
        });

        // AuthContext will handle navigation
      } else {
        toast.dismiss(loadingToast);

        // Handle specific error types
        if (result.error?.includes('already') || result.error?.includes('exists')) {
          toast.error('Email already registered. Please login or use a different email.', {
            duration: 6000,
            position: 'top-center'
          });
        } else {
          toast.error(result.error || 'Registration failed. Please try again.', {
            duration: 5000,
            position: 'top-center'
          });
        }
      }
    } catch (error) {
      console.error('❌ [Register] Registration error:', error);
      toast.dismiss(loadingToast);

      toast.error(
        <div>
          <div className="font-semibold">Registration failed</div>
          <div className="text-sm mt-1">Please check your information and try again</div>
        </div>,
        {
          duration: 6000,
          position: 'top-center'
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    setIsLoading(true);
    toast.loading(`Connecting with ${provider}...`, { id: 'social-register' });
    setTimeout(() => {
      toast.error(`${provider} registration is not configured yet. Please use email registration.`, { id: 'social-register' });
      setIsLoading(false);
    }, 1500);
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
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    return colors[Math.min(passwordStrength, colors.length - 1)];
  };

  const getStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[Math.min(passwordStrength, labels.length - 1)];
  };

  const isFormValid = () => {
    return formData.name.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      passwordStrength >= 3 &&
      acceptTerms &&
      Object.keys(formErrors).length === 0;
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <motion.div
          className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Brand Section */}
          <motion.div
            className="hidden lg:flex flex-col items-center justify-center text-center p-8 lg:p-12"
            variants={itemVariants}
          >
            <motion.div
              className="text-6xl mb-6"
              animate={{
                y: [0, -15, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              🎯
            </motion.div>
            <motion.h1
              className="text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
              variants={itemVariants}
            >
              Start Your Professional Journey
            </motion.h1>
            <motion.p
              className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 lg:mb-12 max-w-xl"
              variants={itemVariants}
            >
              Create your account and unlock AI-powered resume building tools
            </motion.p>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 text-left max-w-2xl"
              variants={itemVariants}
            >
              {[
                { icon: <FaRobot className="text-2xl" />, text: 'AI-Powered Builder', desc: 'Create professional resumes in minutes' },
                { icon: <FaChartLine className="text-2xl" />, text: 'Smart Analytics', desc: 'Get instant feedback on your resume' },
                { icon: <FaPalette className="text-2xl" />, text: 'Premium Templates', desc: '10+ professional designs' },
                { icon: <FaLockIcon className="text-2xl" />, text: 'Secure & Private', desc: 'Your data is always protected' },
                { icon: <FaShieldAlt className="text-2xl" />, text: 'ATS Optimization', desc: 'Pass through applicant tracking systems' },
                { icon: <FaDownload className="text-2xl" />, text: 'Multiple Formats', desc: 'Export as PDF, DOCX, or JSON' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 lg:p-5 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-lg"
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <span className="text-blue-600 dark:text-blue-400 flex-shrink-0">
                      {feature.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm lg:text-base">
                        {feature.text}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-xs lg:text-sm mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Registration Container */}
          <motion.div
            className="relative"
            variants={itemVariants}
          >
            {/* Back button for mobile */}
            <motion.div
              className="lg:hidden mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base"
              >
                <FaArrowLeft className="text-sm" />
                <span>Back to Home</span>
              </Link>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 lg:p-8 xl:p-10 border border-gray-100 dark:border-gray-700 w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg"
            >
              <div className="text-center mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2 lg:mb-3">
                  Create Account
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base">
                  Join thousands of professionals building amazing resumes
                </p>
              </div>

              {/* Google OAuth Button */}
              <div className="mb-4 lg:mb-6">
                <GoogleOAuthButton
                  text="Sign up with Google"
                  type="register"
                  variant="outline"
                  fullWidth={true}
                />
              </div>

              {/* Facebook OAuth */}
              <button
                onClick={() => handleSocialRegister('facebook')}
                disabled={isLoading || authLoading}
                className="w-full flex items-center justify-center gap-3 mb-6 lg:mb-8 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base active:scale-95"
              >
                <FaFacebook className="text-lg lg:text-xl text-blue-600 dark:text-blue-400" />
                <span>Continue with Facebook</span>
              </button>

              <div className="flex items-center mb-6 lg:mb-8">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <span className="px-4 text-sm lg:text-base text-gray-500 dark:text-gray-400">Or with email</span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                {/* Name Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm lg:text-base" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 ${formErrors.name
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Enter your full name"
                      disabled={isLoading || authLoading}
                    />
                  </div>
                  <AnimatePresence>
                    {formErrors.name && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-500 flex items-center"
                      >
                        <FaTimesCircle className="mr-1" size={10} />
                        {formErrors.name}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm lg:text-base" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 ${formErrors.email
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="your.email@example.com"
                      disabled={isLoading || authLoading}
                    />
                  </div>
                  <AnimatePresence>
                    {formErrors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-500 flex items-center"
                      >
                        <FaTimesCircle className="mr-1" size={10} />
                        {formErrors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm lg:text-base" />
                    <input
                      type={showPassword.password ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-10 lg:pl-12 pr-12 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 ${formErrors.password
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Create a strong password"
                      disabled={isLoading || authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('password')}
                      className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      disabled={isLoading || authLoading}
                    >
                      {showPassword.password ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: getPasswordStrengthColor() }}
                        >
                          {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: getPasswordStrengthColor() }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {formErrors.password && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-500 flex items-center"
                      >
                        <FaTimesCircle className="mr-1" size={10} />
                        {formErrors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-sm lg:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <FaLock className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm lg:text-base" />
                    <input
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full pl-10 lg:pl-12 pr-12 py-3 lg:py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 dark:placeholder-gray-500 ${formErrors.confirmPassword
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      placeholder="Re-enter your password"
                      disabled={isLoading || authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                      className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                      disabled={isLoading || authLoading}
                    >
                      {showPassword.confirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {formErrors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-500 flex items-center"
                      >
                        <FaTimesCircle className="mr-1" size={10} />
                        {formErrors.confirmPassword}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Terms and Conditions */}
                <motion.div className="flex items-start space-x-3" variants={itemVariants}>
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-5 w-5 mt-1 text-blue-600 dark:text-blue-500 focus:ring-blue-500 dark:focus:ring-blue-600 border-gray-300 dark:border-gray-600 rounded transition-all duration-300 flex-shrink-0 bg-white dark:bg-gray-700"
                    disabled={isLoading || authLoading}
                  />
                  <label htmlFor="accept-terms" className="text-sm lg:text-base text-gray-700 dark:text-gray-300 select-none">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    {' '}*
                  </label>
                </motion.div>

                <AnimatePresence>
                  {formErrors.terms && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500 flex items-center"
                    >
                      <FaTimesCircle className="mr-1" size={10} />
                      {formErrors.terms}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  type="submit"
                  disabled={!isFormValid() || isLoading || authLoading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 lg:py-4 px-4 rounded-xl font-semibold text-sm lg:text-base shadow-lg hover:shadow-xl transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isFormValid() ? 'hover:from-blue-700 hover:to-purple-700 hover:scale-[1.02] active:scale-95' : ''
                    }`}
                  variants={itemVariants}
                  whileHover={isFormValid() && !isLoading && !authLoading ? { scale: 1.02 } : {}}
                  whileTap={isFormValid() && !isLoading && !authLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading || authLoading ? (
                    <div className="flex items-center justify-center space-x-2 lg:space-x-3">
                      <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>
              </form>

              {/* Demo Account Notice */}
              <motion.div
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-100 dark:border-blue-800 rounded-xl"
                variants={itemVariants}
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                  Want to try first?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium hover:underline"
                  >
                    Use Demo Account on Login page
                  </Link>
                </p>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="text-center mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200 dark:border-gray-700"
                variants={itemVariants}
              >
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </motion.div>
            </motion.div>

            {/* Mobile-only links */}
            <div className="lg:hidden mt-6 text-center">
              <Link
                to="/"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors hover:underline"
              >
                ← Back to Homepage
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Register;