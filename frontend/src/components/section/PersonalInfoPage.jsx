// src/components/section/PersonalInfoPage.jsx - SIMPLIFIED PROFESSIONAL VERSION
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Globe, Github, Linkedin,
  Briefcase, Save, Upload, Camera, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PersonalInfoPage = ({ data, onChange, isSaving }) => {
  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobTitle: '',
    website: '',
    linkedin: '',
    github: '',
    photo: '',
    ...data
  });

  // Update form when props change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...data
    }));
  }, [data]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save changes
  const handleSave = () => {
    // Validate required fields
    if (!formData.fullName?.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Save data
    if (onChange && typeof onChange === 'function') {
      onChange(formData);
      toast.success('Personal information saved');
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or GIF image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        photo: reader.result
      }));
      toast.success('Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  // Input fields configuration
  const inputFields = [
    {
      id: 'fullName',
      label: 'Full Name',
      icon: User,
      placeholder: 'John Doe',
      type: 'text',
      required: true
    },
    {
      id: 'email',
      label: 'Email Address',
      icon: Mail,
      placeholder: 'john@example.com',
      type: 'email',
      required: true
    },
    {
      id: 'phone',
      label: 'Phone Number',
      icon: Phone,
      placeholder: '+1 (555) 123-4567',
      type: 'tel'
    },
    {
      id: 'location',
      label: 'Location',
      icon: MapPin,
      placeholder: 'City, Country',
      type: 'text'
    },
    {
      id: 'jobTitle',
      label: 'Job Title',
      icon: Briefcase,
      placeholder: 'Senior Software Engineer',
      type: 'text'
    }
  ];

  // Social fields configuration
  const socialFields = [
    {
      id: 'linkedin',
      label: 'LinkedIn Profile',
      icon: Linkedin,
      placeholder: 'linkedin.com/in/username',
      color: 'text-blue-600'
    },
    {
      id: 'github',
      label: 'GitHub Profile',
      icon: Github,
      placeholder: 'github.com/username',
      color: 'text-gray-700'
    },
    {
      id: 'website',
      label: 'Personal Website',
      icon: Globe,
      placeholder: 'yourwebsite.com',
      color: 'text-green-600'
    }
  ];

  // Calculate completion percentage
  const completionPercentage = () => {
    const requiredFields = ['fullName', 'email'];
    const completed = requiredFields.filter(field =>
      formData[field]?.trim().length > 0
    ).length;
    return Math.round((completed / requiredFields.length) * 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
          <p className="text-gray-600 mt-1">Your contact details and professional profile</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Progress */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-700">Completion</span>
          <span className="text-sm font-semibold text-blue-700">{completionPercentage()}%</span>
        </div>
        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage()}%` }}
          />
        </div>
      </div>

      {/* Photo Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-300">
              {formData.photo ? (
                <img
                  src={formData.photo}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-300 cursor-pointer hover:bg-gray-50">
              <Camera className="w-4 h-4 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Profile Photo</h4>
            <p className="text-sm text-gray-600 mb-3">
              Add a professional headshot (JPG, PNG, max 2MB)
            </p>
            <label className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <Upload className="w-4 h-4" />
              Upload Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <field.icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Links */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-900">Social Profiles</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {socialFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <field.icon className={`h-5 w-5 ${field.color}`} />
                <label className="text-sm font-medium text-gray-700">
                  {field.label}
                </label>
              </div>
              <input
                type="url"
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Required Fields Note */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Required Information</p>
            <p className="text-sm text-gray-600 mt-1">
              Please ensure your full name and email address are accurate. These fields are required for your resume.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PersonalInfoPage;