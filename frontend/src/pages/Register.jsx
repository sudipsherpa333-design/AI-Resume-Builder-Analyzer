import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleOAuthButton from '../components/GoogleOAuthButton';
import Navbar from '../components/Navbar'; // Added Navbar here
import { FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const { register } = useAuth();
  const navigate = useNavigate();

  // Get Google Client ID from environment
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '35584631622-tl8qqbeer98vbd4t11thjfpqfpv86dlp.apps.googleusercontent.com';

  // Check password strength
  useEffect(() => {
    const password = formData.password;
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
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) errors.push('Name is required');
    if (!formData.email.trim()) errors.push('Email is required');
    if (!formData.password) errors.push('Password is required');
    if (!formData.confirmPassword) errors.push('Confirm password is required');

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match');
    }

    if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (!acceptTerms) {
      errors.push('Please accept the terms and conditions');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);

      if (result.success) {
        toast.success('🎉 Account created successfully! Welcome aboard!');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        toast.error(result.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    setIsLoading(true);
    toast.loading(`Connecting with ${provider}...`);
    setTimeout(() => {
      toast.error(`${provider} registration is not configured yet. Please use email registration.`);
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
        ease: "easeOut"
      }
    }
  };

  const getPasswordStrengthColor = () => {
    const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
    return colors[passwordStrength] || '#ef4444';
  };

  const getStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return labels[passwordStrength] || 'Very Weak';
  };

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {/* Navbar added at the top for full-page consistency */}
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
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
                ease: "easeInOut"
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
              className="text-xl lg:text-2xl text-gray-600 mb-8 lg:mb-12 max-w-xl"
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
                { icon: '🚀', text: 'AI-Powered Builder', desc: 'Create professional resumes in minutes' },
                { icon: '📊', text: 'Smart Analytics', desc: 'Get instant feedback on your resume' },
                { icon: '🎨', text: 'Premium Templates', desc: '10+ professional designs' },
                { icon: '🔒', text: 'Secure & Private', desc: 'Your data is always protected' },
                { icon: '📈', text: 'ATS Optimization', desc: 'Pass through applicant tracking systems' },
                { icon: '📥', text: 'Multiple Formats', desc: 'Export as PDF, DOCX, or JSON' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.text}
                  className="bg-white/50 backdrop-blur-sm p-4 lg:p-5 rounded-xl border border-gray-200/50 hover:border-blue-200 transition-all duration-300 hover:shadow-lg"
                  variants={itemVariants}
                  custom={index}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="flex items-start space-x-3 lg:space-x-4">
                    <span className="text-2xl lg:text-3xl flex-shrink-0">{feature.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm lg:text-base">{feature.text}</h3>
                      <p className="text-gray-600 text-xs lg:text-sm mt-1">{feature.desc}</p>
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
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors text-sm lg:text-base"
              >
                <FaArrowLeft className="text-sm" />
                <span>Back to Home</span>
              </Link>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 xl:p-10 border border-gray-100 w-full max-w-md mx-auto lg:mx-0 lg:max-w-lg"
            >
              <div className="text-center mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 lg:mb-3">
                  Create Account
                </h2>
                <p className="text-gray-600 text-sm lg:text-base">
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

              {/* Facebook OAuth (not implemented) */}
              <button
                onClick={() => handleSocialRegister('facebook')}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 mb-6 lg:mb-8 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base active:scale-95"
              >
                <FaFacebook className="text-lg lg:text-xl text-blue-600" />
                <span>Continue with Facebook</span>
              </button>

              <div className="flex items-center mb-6 lg:mb-8">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-sm lg:text-base text-gray-500">Or with email</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
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
                      required
                      className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 hover:border-gray-400"
                      placeholder="Enter your full name"
                      disabled={isLoading}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
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
                      required
                      className="w-full pl-10 lg:pl-12 pr-4 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 hover:border-gray-400"
                      placeholder="your.email@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">We'll never share your email with anyone else</p>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
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
                      required
                      className="w-full pl-10 lg:pl-12 pr-12 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 hover:border-gray-400"
                      placeholder="Create a strong password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, password: !prev.password }))}
                      className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      disabled={isLoading}
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
                        <span className="text-xs text-gray-600">Password strength:</span>
                        <span
                          className="text-xs font-medium"
                          style={{ color: getPasswordStrengthColor() }}
                        >
                          {getStrengthLabel()}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: getPasswordStrengthColor() }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>

                      {/* Password Requirements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                        {[
                          { key: 'length', text: '8+ characters' },
                          { key: 'uppercase', text: 'Uppercase letter' },
                          { key: 'lowercase', text: 'Lowercase letter' },
                          { key: 'number', text: 'Number' },
                          { key: 'special', text: 'Special character' }
                        ].map(req => (
                          <div key={req.key} className="flex items-center space-x-2">
                            {passwordRequirements[req.key] ? (
                              <FaCheckCircle className="text-green-500 text-xs flex-shrink-0" />
                            ) : (
                              <div className="w-3 h-3 rounded-full bg-gray-300 flex-shrink-0"></div>
                            )}
                            <span className={`text-xs ${passwordRequirements[req.key] ? 'text-green-600' : 'text-gray-500'}`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-sm lg:text-base font-medium text-gray-700 mb-2">
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
                      required
                      className="w-full pl-10 lg:pl-12 pr-12 py-3 lg:py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-sm lg:text-base placeholder-gray-400 hover:border-gray-400"
                      placeholder="Re-enter your password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                      className="absolute right-3 lg:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword.confirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-500 text-xs mt-1"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                </motion.div>

                <motion.div className="flex items-start space-x-3" variants={itemVariants}>
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-5 w-5 mt-1 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-300 flex-shrink-0"
                    disabled={isLoading}
                    required
                  />
                  <label htmlFor="accept-terms" className="text-sm lg:text-base text-gray-700 select-none">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-500 hover:underline font-medium">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-500 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                    {' '}*
                  </label>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isLoading || !acceptTerms}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 lg:py-4 px-4 rounded-xl font-semibold text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  variants={itemVariants}
                  whileHover={!isLoading ? { scale: 1.02 } : {}}
                  whileTap={!isLoading ? { scale: 0.98 } : {}}
                >
                  {isLoading ? (
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
                className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl"
                variants={itemVariants}
              >
                <p className="text-sm text-gray-700 text-center">
                  Want to try first?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Use Demo Account on Login page
                  </Link>
                </p>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="text-center mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-gray-200"
                variants={itemVariants}
              >
                <p className="text-gray-600 text-sm lg:text-base">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline"
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
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors hover:underline"
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