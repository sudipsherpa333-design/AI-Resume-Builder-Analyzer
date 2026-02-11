// src/components/section/PersonalInfoPage.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Globe, Linkedin, Github,
  Briefcase, Save
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PersonalInfoPage = ({ data = {}, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: data.name || '',
    email: data.email || '',
    phone: data.phone || '',
    location: data.location || '',
    website: data.website || '',
    linkedin: data.linkedin || '',
    github: data.github || '',
    title: data.title || ''
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onUpdate(formData);
      toast.success('Personal information saved!');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Fixed size modern card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">

        {/* Header - Simple black text */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-black mb-1">
            Personal Information
          </h2>
          <p className="text-gray-600 text-sm">
            Basic details about yourself
          </p>
        </div>

        {/* Form Grid - Clean and organized */}
        <div className="p-6">
          <div className="space-y-8">

            {/* Row 1: Name & Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 pl-11 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:border-blue-500 text-black`}
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Professional Title
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Row 2: Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className={`w-full px-4 py-3 pl-11 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:outline-none focus:border-blue-500 text-black`}
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Row 3: Location & Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Website
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="yourwebsite.com"
                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Row 4: LinkedIn & GitHub */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  LinkedIn
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleChange('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-700" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  GitHub
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleChange('github', e.target.value)}
                    placeholder="github.com/username"
                    className="w-full px-4 py-3 pl-11 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-black"
                  />
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800" />
                </div>
              </div>
            </div>

          </div>

          {/* Save Button - Fixed at bottom */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Information
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoPage;