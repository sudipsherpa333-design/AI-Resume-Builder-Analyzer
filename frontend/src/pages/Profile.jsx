import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/axiosConfig.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  FaUser, FaEnvelope, FaCamera, FaSave, FaLock, FaShieldAlt,
  FaBell, FaDownload, FaEye, FaEyeSlash, FaCheck, FaTimes, FaCopy
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // Profile Edit State
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || '',
    bio: user?.bio || ''
  });

  const [avatarFile, setAvatarFile] = useState(null);

  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(user?.isEmailVerified || user?.emailVerified || user?.verified));
  const [sendingVerification, setSendingVerification] = useState(false);

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    weeklyDigest: true,
    resumeReminders: true
  });

  // Handle Profile Change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle avatar file selection and set preview as data URL
  const handleAvatarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileData(prev => ({ ...prev, profilePicture: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  // Send verification email (best-effort): call backend if endpoint exists
  const sendVerificationEmail = async () => {
    setSendingVerification(true);
    try {
      await api.post('/auth/verify/send', { email: profileData.email });
      toast.success('Verification email sent — check your inbox');
    } catch (err) {
      console.warn('Verification send failed', err?.response?.data || err.message);
      toast('Verification request submitted (if backend supports it)');
    } finally {
      setSendingVerification(false);
    }
  };

  // Handle Profile Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      // If an avatar file was chosen, profileData.profilePicture contains a base64 data URL
      const payload = { ...profileData };

      const result = await updateProfile(payload);
      if (result.success) {
        toast.success('✅ Profile updated successfully!');
        setIsEditing(false);
        setMessage('Profile updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Error updating profile');
    }
  };

  // Handle Password Change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (result.success) {
        toast.success('✅ Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Error changing password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Get password strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const strengthPercentage = (getPasswordStrength(passwordData.newPassword) / 6) * 100;
  const strengthColor = strengthPercentage < 33 ? 'bg-red-500' : strengthPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500';

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile and security preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 lg:sticky lg:top-8">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden relative">
                  {(profileData.profilePicture || user.profilePicture) ? (
                    <img
                      src={profileData.profilePicture || user.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                  {/* hidden file input for avatar */}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600 text-sm mt-1 break-all">{user.email}</p>
                <div className="mt-2">
                  {isEmailVerified ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                      <FaCheck className="mr-1" /> Email verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendVerificationEmail}
                      disabled={sendingVerification}
                      className="px-3 py-1 bg-yellow-400 text-white rounded-md text-sm hover:bg-yellow-500"
                    >
                      {sendingVerification ? 'Sending...' : 'Verify Email'}
                    </button>
                  )}
                </div>
                {isEditing && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 w-full sm:w-auto"
                    >
                      Upload Avatar
                    </button>
                  </div>
                )}
              </div>

              {/* Account Status */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Type</span>
                  <span className="font-semibold text-blue-600">{user.authProvider || 'Local'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                    <FaCheck className="mr-1" /> Active
                  </span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'security', label: 'Security', icon: '🔒' },
                  { id: 'preferences', label: 'Preferences', icon: '⚙️' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="w-full mt-6 px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all duration-200"
              >
                Sign Out
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-2xl font-bold text-gray-900">Profile Information</h3>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full sm:w-auto text-center"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                      }`}
                  >
                    {message}
                  </motion.div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaUser className="inline mr-2 text-blue-600" />
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your name"
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{profileData.name}</p>
                    )}
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaEnvelope className="inline mr-2 text-blue-600" />
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="flex items-center justify-between py-3">
                        <p className="text-gray-900">{profileData.email}</p>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(profileData.email)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Bio */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bio / About
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows="4"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-gray-900 py-3">{profileData.bio || 'No bio added yet'}</p>
                    )}
                  </motion.div>

                  {/* Profile Picture */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FaCamera className="inline mr-2 text-blue-600" />
                      Profile Picture URL
                    </label>
                    {isEditing ? (
                      <div className="flex gap-3 items-center">
                        <input
                          type="url"
                          name="profilePicture"
                          value={profileData.profilePicture}
                          onChange={handleProfileChange}
                          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          placeholder="Enter image URL"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
                        >
                          Upload
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-900 py-3 break-all">{profileData.profilePicture || 'No profile picture set'}</p>
                    )}
                  </motion.div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col sm:flex-row gap-3 pt-4 w-full"
                    >
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center w-full sm:w-auto justify-center"
                      >
                        <FaSave className="mr-2" />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileData({
                            name: user.name,
                            email: user.email,
                            profilePicture: user.profilePicture || '',
                            bio: user.bio || ''
                          });
                        }}
                        className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold w-full sm:w-auto"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {/* Change Password */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaLock className="mr-3 text-blue-600" />
                    Change Password
                  </h3>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    {/* Current Password */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </motion.div>

                    {/* New Password */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {/* Password Strength */}
                      {passwordData.newPassword && (
                        <motion.div
                          className="mt-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600">Strength</span>
                            <span className={`text-xs font-semibold ${strengthColor === 'bg-red-500' ? 'text-red-600' : strengthColor === 'bg-yellow-500' ? 'text-yellow-600' : 'text-green-600'}`}>
                              {strengthPercentage < 33 ? 'Weak' : strengthPercentage < 66 ? 'Fair' : 'Strong'}
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
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                        >
                          {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>

                      {passwordData.confirmPassword && (
                        <motion.p
                          className={`text-xs mt-2 flex items-center ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          {passwordData.newPassword === passwordData.confirmPassword ? (
                            <><FaCheck className="mr-1" /> Passwords match</>
                          ) : (
                            <><FaTimes className="mr-1" /> Passwords do not match</>
                          )}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isChangingPassword}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {isChangingPassword ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <FaLock className="mr-2" />
                          Change Password
                        </>
                      )}
                    </motion.button>
                  </form>
                </div>

                {/* Security Tips */}
                <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center">
                    <FaShieldAlt className="mr-2" />
                    Security Tips
                  </h4>
                  <ul className="space-y-2 text-blue-900 text-sm">
                    <li>• Change your password regularly (every 3 months)</li>
                    <li>• Use a strong, unique password with mixed characters</li>
                    <li>• Never share your password with anyone</li>
                    <li>• Sign out when using public computers</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaBell className="mr-3 text-blue-600" />
                  Notification Preferences
                </h3>

                <div className="space-y-4">
                  {[
                    {
                      id: 'emailNotifications',
                      title: 'Email Notifications',
                      description: 'Receive email updates about your account activity'
                    },
                    {
                      id: 'marketingEmails',
                      title: 'Marketing Emails',
                      description: 'Receive promotions, new features, and product updates'
                    },
                    {
                      id: 'weeklyDigest',
                      title: 'Weekly Digest',
                      description: 'Get a weekly summary of your activity'
                    },
                    {
                      id: 'resumeReminders',
                      title: 'Resume Reminders',
                      description: 'Get reminded to update your resumes'
                    }
                  ].map((pref) => (
                    <motion.div
                      key={pref.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">{pref.title}</h4>
                        <p className="text-sm text-gray-600">{pref.description}</p>
                      </div>
                      <button
                        onClick={() => setPreferences(prev => ({
                          ...prev,
                          [pref.id]: !prev[pref.id]
                        }))}
                        className={`relative w-14 h-8 rounded-full transition-colors ${preferences[pref.id] ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                      >
                        <motion.div
                          className="absolute w-7 h-7 bg-white rounded-full top-0.5"
                          animate={{
                            left: preferences[pref.id] ? '26px' : '3px'
                          }}
                          transition={{ duration: 0.2 }}
                        />
                      </button>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  onClick={() => toast.success('Preferences saved!')}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save Preferences
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;