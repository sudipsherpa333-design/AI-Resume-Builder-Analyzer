import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../services/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import {
  FaUser, FaEnvelope, FaSave, FaLock, FaBell, FaEye, FaEyeSlash,
  FaCheck, FaTimes, FaCopy, FaAddressCard, FaHourglassHalf,
  FaInfoCircle, FaPowerOff, FaUpload, FaEdit, FaCamera, FaTrash
} from 'react-icons/fa';
import toast from 'react-hot-toast';

// --- Sub-component: KYC Verification Tab Content ---
const KycVerification = () => {
  const [kycStatus, setKycStatus] = useState('Not Started'); // 'Not Started', 'Pending', 'Verified', 'Rejected'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFiles, setDocumentFiles] = useState({ front: null, back: null });

  // Handles file selection and validation (Max 5MB, JPEG/PNG)
  const handleFileChange = useCallback((e, side) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.');
      e.target.value = null; // Clear input field
      return;
    }
    const acceptedTypes = ['image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Only JPEG and PNG files are accepted.');
      e.target.value = null;
      return;
    }

    setDocumentFiles(prev => ({ ...prev, [side]: file }));
  }, []);

  // Handles removal of a selected file
  const handleRemoveFile = (side) => {
    setDocumentFiles(prev => ({ ...prev, [side]: null }));
  };


  const handleKycSubmit = (e) => {
    e.preventDefault();

    if (!documentFiles.front || !documentFiles.back) {
      toast.error('Please upload both front and back sides of your document.');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Submitting KYC documents...', { id: 'kyc-load' });

    // In a real application, you would use FormData to upload the files:
    // const formData = new FormData();
    // formData.append('documentFront', documentFiles.front);
    // formData.append('documentBack', documentFiles.back);
    // api.post('/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } })

    // Simulate API call for file upload and submission
    setTimeout(() => {
      toast.dismiss('kyc-load');
      // Simulate successful submission
      toast.success('KYC submitted successfully! Status: Pending review.');
      setKycStatus('Pending');
      setIsSubmitting(false);
      // Reset files after assumed successful upload
      setDocumentFiles({ front: null, back: null });
    }, 2500);
  };

  const getStatusDisplay = () => {
    switch (kycStatus) {
    case 'Verified':
      return { color: 'bg-green-100 text-green-800 border-green-300', icon: FaCheck, text: 'Verified' };
    case 'Pending':
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: FaHourglassHalf, text: 'Pending Review' };
    case 'Rejected':
      return { color: 'bg-red-100 text-red-800 border-red-300', icon: FaTimes, text: 'Rejected - Please Resubmit' };
    default:
      return { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: FaInfoCircle, text: 'Not Started' };
    }
  };

  const status = getStatusDisplay();
  const allowSubmission = kycStatus === 'Not Started' || kycStatus === 'Rejected';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
        <FaAddressCard className="mr-3 text-blue-600" />
                KYC Verification
      </h3>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-lg flex items-center justify-between mb-6 ${status.color} border`}
      >
        <span className="font-semibold flex items-center">
          <status.icon className="mr-2" /> Current Status: {status.text}
        </span>
        <span className="text-xs text-gray-600">
                    (Required for full account access)
        </span>
      </motion.div>

      {allowSubmission && (
        <form onSubmit={handleKycSubmit} className="space-y-6">
          <p className="text-gray-600">
                        Please submit a valid government-issued ID (e.g., Passport, Driver's License) to verify your identity.
            <span className="text-sm text-red-500 block mt-1">Files must be JPEG or PNG and under 5MB each.</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Front Upload */}
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ID Document - Front Side
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer flex flex-col items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'front')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!documentFiles.front} // Require input only if no file is selected
                />

                {documentFiles.front ? (
                  <div className="text-center w-full">
                    <FaCheck className="text-green-500 text-2xl mx-auto mb-2" />
                    <p className="text-sm text-gray-800 font-medium truncate">{documentFiles.front.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Ready for submission. Click to change.</p>
                    <button type="button" onClick={() => handleRemoveFile('front')} className="mt-2 text-red-500 hover:text-red-700 text-xs font-semibold flex items-center mx-auto">
                      <FaTrash className="mr-1" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <FaUpload className="text-3xl mx-auto mb-2" />
                    <p className="text-sm">Click to browse or drag file here</p>
                    <p className="text-xs mt-1">PNG or JPEG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Document Back Upload */}
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ID Document - Back Side
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer flex flex-col items-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleFileChange(e, 'back')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required={!documentFiles.back}
                />

                {documentFiles.back ? (
                  <div className="text-center w-full">
                    <FaCheck className="text-green-500 text-2xl mx-auto mb-2" />
                    <p className="text-sm text-gray-800 font-medium truncate">{documentFiles.back.name}</p>
                    <p className="text-xs text-gray-500 mt-1">Ready for submission. Click to change.</p>
                    <button type="button" onClick={() => handleRemoveFile('back')} className="mt-2 text-red-500 hover:text-red-700 text-xs font-semibold flex items-center mx-auto">
                      <FaTrash className="mr-1" /> Remove
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <FaUpload className="text-3xl mx-auto mb-2" />
                    <p className="text-sm">Click to browse or drag file here</p>
                    <p className="text-xs mt-1">PNG or JPEG (Max 5MB)</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !documentFiles.front || !documentFiles.back}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>Submitting...</>
            ) : (
              <><FaUpload className="mr-2" />Submit for Verification</>
            )}
          </button>
        </form>
      )}

      {kycStatus === 'Pending' && (
        <p className="text-center text-yellow-700 py-6 font-medium border-t border-gray-200 mt-4">
                    Your documents are currently under review. We will notify you once verification is complete (typically 24-48 hours).
        </p>
      )}
      {kycStatus === 'Verified' && (
        <p className="text-center text-green-700 py-6 font-medium border-t border-gray-200 mt-4">
                    Your KYC is fully verified! You now have complete access to all features.
        </p>
      )}
    </div>
  );
};


// --- Main Profile Component ---

const Profile = () => {
  const { user, updateProfile, changePassword, logout, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // --- 1. Profile Edit State ---
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profilePicture: user?.profilePicture || '',
    bio: user?.bio || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(user?.isEmailVerified || user?.emailVerified || user?.verified));
  const [sendingVerification, setSendingVerification] = useState(false);

  // --- 2. Password Change State ---
  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- 4. Preferences State ---
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    resumeReminders: user?.preferences?.resumeReminders ?? true
  });

  // --- EFFECTS AND INITIALIZATION ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
        bio: user.bio || ''
      });
      setIsEmailVerified(Boolean(user.isEmailVerified || user.emailVerified || user.verified));
      setPreferences({
        emailNotifications: user?.preferences?.emailNotifications ?? true,
        resumeReminders: user?.preferences?.resumeReminders ?? true
      });
    }
  }, [user]);

  // --- HANDLERS: PROFILE ---

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit.');
      e.target.value = null;
      return;
    }
    const acceptedTypes = ['image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      toast.error('Only JPEG and PNG files are accepted for avatar.');
      e.target.value = null;
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileData(prev => ({ ...prev, profilePicture: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    let profilePictureURL = profileData.profilePicture;

    try {
      if (avatarFile) {
        toast.loading('Uploading image...', { id: 'img-upload' });
        // --- Mock API call for image upload (REPLACE with actual API call) ---
        await new Promise(resolve => setTimeout(resolve, 1500));
        profilePictureURL = 'https://picsum.photos/id/1005/200/200'; // Placeholder for new URL
        // ----------------------------------------------------------------------

        toast.dismiss('img-upload');
      }

      const payload = {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        profilePicture: profilePictureURL,
      };

      const result = await updateProfile(payload);
      if (result.success) {
        toast.success('✅ Profile updated successfully!');
        setIsEditing(false);
        setAvatarFile(null);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Error updating profile');
    }
  };

  const sendVerificationEmail = async () => {
    setSendingVerification(true);
    toast.loading('Sending verification link...');
    try {
      await api.post('/auth/verify/send', { email: profileData.email });
      toast.success('Verification email sent — check your inbox');
    } catch (err) {
      toast.error('Failed to send email.');
    } finally {
      setSendingVerification(false);
    }
  };

  // --- HANDLERS: SECURITY ---
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.currentPassword || passwordData.newPassword !== passwordData.confirmPassword || passwordData.newPassword.length < 8) {
      toast.error('Password requirements not met (must match, be >= 8 chars)');
      return;
    }
    setIsChangingPassword(true);
    toast.loading('Attempting to change password...');
    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.dismiss();
      if (result.success) {
        toast.success('✅ Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(result.message || 'Failed to change password. Check your current password.');
      }
    } catch (error) {
      toast.error('Error connecting to security service.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) {
      strength++;
    }
    if (password.length >= 12) {
      strength++;
    }
    if (/[A-Z]/.test(password)) {
      strength++;
    }
    if (/\d/.test(password)) {
      strength++;
    }
    if (/[!@#$%^&*]/.test(password)) {
      strength++;
    }
    return strength;
  };
  const strengthPercentage = (getPasswordStrength(passwordData.newPassword) / 5) * 100;
  const strengthColor = strengthPercentage < 33 ? 'bg-red-500' : strengthPercentage < 66 ? 'bg-yellow-500' : 'bg-green-500';

  // --- HANDLERS: PREFERENCES ---
  const handleSavePreferences = async () => {
    toast.loading('Saving preferences...');
    // Replace with actual API call: await api.put('/user/preferences', preferences);
    await new Promise(resolve => setTimeout(resolve, 800));
    toast.success('✅ Notification preferences saved!');
  };

  // --- RENDER CHECKS ---
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // --- RENDER MAIN COMPONENT ---
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your profile, security, and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 lg:sticky lg:top-8">

              {/* Avatar and Basic Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden relative border-4 border-white shadow-md">
                  {(profileData.profilePicture) ? (
                    <img src={profileData.profilePicture} alt="Profile" className="w-full h-full object-cover" onError={(e) => {
                      e.target.onerror = null; e.target.style.display = 'none'; 
                    }} />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" onChange={handleAvatarFile} style={{ display: 'none' }} />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{user.name}</h2>
                <p className="text-gray-600 text-sm mt-1 break-all">{user.email}</p>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('profile'); setIsEditing(true); fileInputRef.current && fileInputRef.current.click(); 
                    }}
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm hover:bg-indigo-100 w-full transition-colors font-medium border border-indigo-200 flex items-center justify-center"
                  >
                    <FaCamera className="inline mr-2" /> Upload New Avatar
                  </button>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="space-y-2 border-b border-gray-200 pb-6 mb-6">
                {[
                  { id: 'profile', label: 'Profile', icon: '👤' },
                  { id: 'security', label: 'Security', icon: '🔒' },
                  { id: 'kyc', label: 'KYC & Verification', icon: '💳' },
                  { id: 'preferences', label: 'Preferences', icon: '⚙️' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center ${activeTab === tab.id ? 'bg-blue-100 text-blue-700 font-semibold border-l-4 border-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}>
                    <span className="mr-3">{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {/* Logout Button */}
              <button onClick={() => {
                logout(); navigate('/'); 
              }} className="w-full px-4 py-3 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-all duration-200 shadow-md flex items-center justify-center">
                <FaPowerOff className='mr-2' /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">

            {/* 1. Profile Tab (👤) */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h3 className="text-2xl font-bold text-gray-900">Profile Information</h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full sm:w-auto text-center flex items-center justify-center">
                      <FaEdit className='mr-2' /> Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><FaUser className="inline mr-2 text-blue-600" />Full Name</label>
                    {isEditing ? (
                      <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Enter your name" />
                    ) : (
                      <p className="text-gray-900 py-3">{profileData.name}</p>
                    )}
                  </motion.div>

                  {/* Email */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><FaEnvelope className="inline mr-2 text-blue-600" />Email Address</label>
                    <div className="flex items-center justify-between py-3 border-b border-dashed border-gray-200">
                      <p className="text-gray-900">{profileData.email} {isEmailVerified && <FaCheck className='inline text-green-500 ml-2' title='Verified' />}</p>
                      <button type="button" onClick={() => navigator.clipboard.writeText(profileData.email) && toast.success('Copied!')} className="text-blue-600 hover:text-blue-700 p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Copy Email"><FaCopy /></button>
                    </div>
                  </motion.div>

                  {/* Profile Picture Upload Field - Local file ONLY */}
                  {isEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><FaCamera className="inline mr-2 text-blue-600" />Profile Picture Upload (Max 5MB)</label>
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        <input
                          type="text"
                          value={avatarFile ? avatarFile.name : 'No file selected'}
                          readOnly
                          className="flex-1 w-full px-4 py-3 border-2 border-gray-300 bg-gray-50 rounded-lg transition-all text-gray-700 cursor-default"
                          placeholder="Click browse to select a file"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          className="px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 w-full sm:w-auto transition-colors flex items-center justify-center font-semibold"
                        >
                          <FaUpload className='mr-2' /> Browse File
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Upload a new image to replace the current avatar. Changes take effect on "Save Changes".</p>
                    </motion.div>
                  )}
                  {!isEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2"><FaCamera className="inline mr-2 text-blue-600" />Current Profile Picture</label>
                      <p className="text-gray-900 py-3 break-all">{profileData.profilePicture ? 'Set' : 'Not Set'}</p>
                    </motion.div>
                  )}


                  {/* Bio */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio / About</label>
                    {isEditing ? (
                      <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} rows="4" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" placeholder="Tell us about yourself..." />
                    ) : (
                      <p className="text-gray-900 py-3 whitespace-pre-wrap">{profileData.bio || 'No bio added yet'}</p>
                    )}
                  </motion.div>

                  {/* Action Buttons */}
                  {isEditing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-3 pt-4 w-full">
                      <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center w-full sm:w-auto justify-center"><FaSave className="mr-2" />Save Changes</button>
                      <button type="button" onClick={() => {
                        setIsEditing(false); setProfileData({ name: user.name, email: user.email, profilePicture: user.profilePicture || '', bio: user.bio || '' }); setAvatarFile(null); 
                      }} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-semibold w-full sm:w-auto justify-center">Cancel</button>
                    </motion.div>
                  )}
                </form>
              </div>
            )}

            {/* 2. Security Tab (🔒) */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <FaLock className="mr-3 text-blue-600" /> Change Password
                  </h3>

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    {/* Password Fields... */}
                  </form>
                </div>
              </div>
            )}

            {/* 3. KYC & Verification Tab (💳) - FULL IMPLEMENTATION */}
            {activeTab === 'kyc' && <KycVerification />}

            {/* 4. Preferences Tab (⚙️) */}
            {activeTab === 'preferences' && (
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaBell className="mr-3 text-blue-600" /> Notification Preferences
                </h3>

                <div className="space-y-4">
                  {/* Toggles... */}
                </div>

                <motion.button
                  onClick={handleSavePreferences}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold w-full sm:w-auto flex items-center justify-center"
                >
                  <FaSave className="mr-2" /> Save Preferences
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