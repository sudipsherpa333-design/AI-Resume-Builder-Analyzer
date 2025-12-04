import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

// Hidden admin credentials
const HIDDEN_ADMIN_CREDENTIALS = {
  username: 'resume100@test.com',
  password: 'resumetest123',
};

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
  const [socialLoading, setSocialLoading] = useState({ google: false, facebook: false });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register, socialLogin } = useAuth();
  const navigate = useNavigate();

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

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    // Prevent registration with admin email
    if (formData.email.toLowerCase() === HIDDEN_ADMIN_CREDENTIALS.username.toLowerCase()) {
      toast.error('This email is reserved for administrators. Please use a different email address.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.name, formData.email, formData.password);

      if (result.success) {
        toast.success('🎉 Account created successfully!');
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers (same as Login.jsx)
  const handleGoogleLogin = () => {
    // Google login implementation
  };

  const handleFacebookLogin = () => {
    // Facebook login implementation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Brand Section */}
        <motion.div
          className="hidden lg:flex flex-col items-center justify-center text-center p-8"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="text-6xl mb-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🎯
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Start Building Your Future
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Create professional resumes that get you noticed
          </p>
          <div className="space-y-4 text-left max-w-sm">
            {[
              { icon: '⚡', text: 'Create resumes in minutes' },
              { icon: '🎨', text: 'Multiple professional templates' },
              { icon: '🔒', text: 'Secure and private' },
              { icon: '📈', text: 'AI-powered analytics' }
            ].map((feature, index) => (
              <div key={feature.text} className="flex items-center space-x-3 text-gray-700 text-lg">
                <span className="text-2xl flex-shrink-0">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 w-full max-w-md mx-auto"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600">
              Join thousands of professionals using our platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
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
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword.password ? 'text' : 'password'}
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
                  onClick={() => setShowPassword(prev => ({ ...prev, password: !prev.password }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword.password ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {showPassword.confirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="accept-terms"
                name="accept-terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isLoading}
              />
              <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-700">
                I accept the{' '}
                <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms & Conditions
                </Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">Or sign up with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={socialLoading.google || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FcGoogle className="text-xl" />
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={socialLoading.facebook || isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <FaFacebook className="text-xl text-blue-600" />
              <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="text-center mt-8 pt-6 border-t border-gray-200">
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
              className="inline-block mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;