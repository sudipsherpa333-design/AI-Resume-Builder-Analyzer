// src/components/builder/PersonalInfoPage.jsx (Enhanced)
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Link, Briefcase, Check,
  Sparkles, Eye, EyeOff, Copy, ExternalLink, AlertCircle,
  Loader2
} from 'lucide-react';
import { debounce } from 'lodash';

const PersonalInfoPage = ({ data, onUpdate, isSectionComplete, onAIEnhance }) => {
  const [formData, setFormData] = useState({
    fullName: data?.fullName || '',
    email: data?.email || '',
    phone: data?.phone || '',
    location: data?.location || '',
    title: data?.title || '',
    linkedin: data?.linkedin || '',
    github: data?.github || '',
    portfolio: data?.portfolio || '',
  });

  const [showPreview, setShowPreview] = useState(true);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Debounced update to prevent too many re-renders
  const debouncedUpdate = useCallback(
    debounce((data) => onUpdate(data), 500),
    [onUpdate]
  );

  useEffect(() => {
    debouncedUpdate(formData);
    validateFields();
  }, [formData, debouncedUpdate]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateFields = () => {
    const errors = {};

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (formData.linkedin && !formData.linkedin.includes('linkedin.com')) {
      errors.linkedin = 'Please enter a valid LinkedIn URL';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAIEnhance = async () => {
    setIsEnhancing(true);
    try {
      await onAIEnhance();
    } finally {
      setTimeout(() => setIsEnhancing(false), 1000);
    }
  };

  const fields = [
    {
      id: 'fullName',
      icon: User,
      label: 'Full Name',
      placeholder: 'John Doe',
      required: true,
      type: 'text'
    },
    {
      id: 'email',
      icon: Mail,
      label: 'Email',
      placeholder: 'john@example.com',
      required: true,
      type: 'email'
    },
    {
      id: 'phone',
      icon: Phone,
      label: 'Phone',
      placeholder: '+1 (555) 123-4567',
      type: 'tel'
    },
    {
      id: 'location',
      icon: MapPin,
      label: 'Location',
      placeholder: 'New York, NY',
      type: 'text'
    },
    {
      id: 'title',
      icon: Briefcase,
      label: 'Title',
      placeholder: 'Software Engineer',
      type: 'text'
    },
    {
      id: 'linkedin',
      icon: Link,
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/in/username',
      type: 'url'
    },
    {
      id: 'github',
      icon: Link,
      label: 'GitHub',
      placeholder: 'https://github.com/username',
      type: 'url'
    },
    {
      id: 'portfolio',
      icon: Link,
      label: 'Portfolio',
      placeholder: 'https://yourwebsite.com',
      type: 'url'
    },
  ];

  const requiredFields = fields.filter(f => f.required);
  const filledRequired = requiredFields.filter(f => formData[f.id].trim()).length;
  const progress = (filledRequired / requiredFields.length) * 100;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8 p-4 md:p-6"
    >
      {/* Header with Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Personal Information</h2>
          <p className="text-gray-600 mt-1 md:mt-2">Let's start with the basics</p>
        </div>

        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors self-start md:self-auto"
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      {/* Progress Card */}
      <motion.div
        layout
        className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Resume Progress</h3>
            <p className="text-sm text-gray-600">Personal Information Section</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700">Completion</span>
              <span className="text-lg font-bold text-blue-600 ml-2">{Math.round(progress)}%</span>
            </div>

            <div className={`px-3 py-1 rounded-full text-sm font-medium ${filledRequired === requiredFields.length
                ? 'bg-green-100 text-green-800'
                : 'bg-amber-100 text-amber-800'
              }`}>
              {filledRequired}/{requiredFields.length}
            </div>
          </div>
        </div>

        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, type: "spring" }}
            className={`h-full rounded-full ${progress === 100
                ? 'bg-gradient-to-r from-green-400 to-green-500'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
              }`}
          />
        </div>

        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Form Section */}
        <motion.div
          layout
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Your Details</h3>
            <span className="text-sm text-gray-500">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`space-y-2 ${field.id === 'fullName' || field.id === 'title' ? 'sm:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {formData[field.id] && (
                    <button
                      onClick={() => copyToClipboard(formData[field.id])}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  )}
                </div>

                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <field.icon className="w-5 h-5" />
                  </div>

                  <input
                    type={field.type}
                    value={formData[field.id]}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    className={`w-full pl-11 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${fieldErrors[field.id]
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder={field.placeholder}
                  />

                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {fieldErrors[field.id] && (
                      <div className="group relative">
                        <AlertCircle className="w-5 h-5 text-red-500 cursor-help" />
                        <div className="absolute right-0 top-full mt-1 hidden group-hover:block">
                          <div className="bg-red-500 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {fieldErrors[field.id]}
                          </div>
                        </div>
                      </div>
                    )}

                    {formData[field.id] && !fieldErrors[field.id] && (
                      <Check className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Preview Section */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg">Live Preview</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm text-gray-600">Auto-saving</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Name & Title */}
                <div className="text-center">
                  {formData.fullName ? (
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{formData.fullName}</h3>
                  ) : (
                    <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto max-w-xs" />
                  )}

                  {formData.title ? (
                    <p className="text-lg text-blue-600 mt-2 font-medium">{formData.title}</p>
                  ) : (
                    <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto max-w-xs mt-2" />
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4">
                  {formData.email && (
                    <a
                      href={`mailto:${formData.email}`}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm md:text-base truncate max-w-[200px]">{formData.email}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}

                  {formData.phone && (
                    <a
                      href={`tel:${formData.phone.replace(/\D/g, '')}`}
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors group"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm md:text-base">{formData.phone}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  )}

                  {formData.location && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm md:text-base">{formData.location}</span>
                    </div>
                  )}
                </div>

                {/* Links */}
                {(formData.linkedin || formData.github || formData.portfolio) && (
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap justify-center gap-3">
                      {formData.linkedin && (
                        <a
                          href={formData.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-all group"
                        >
                          <Link className="w-4 h-4" />
                          <span className="font-medium">LinkedIn</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {formData.github && (
                        <a
                          href={formData.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all group"
                        >
                          <Link className="w-4 h-4" />
                          <span className="font-medium">GitHub</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}

                      {formData.portfolio && (
                        <a
                          href={formData.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-all group"
                        >
                          <Link className="w-4 h-4" />
                          <span className="font-medium">Portfolio</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Footer */}
      <motion.div
        layout
        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200"
      >
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${filledRequired === requiredFields.length
              ? 'bg-green-500'
              : 'bg-amber-500'
            }`}>
            {filledRequired === requiredFields.length && (
              <Check className="w-3 h-3 text-white" />
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-900">
              {filledRequired === requiredFields.length
                ? '✓ All required fields completed!'
                : 'Complete required fields to continue'}
            </p>
            <p className="text-sm text-gray-600">
              {filledRequired === requiredFields.length
                ? 'Your personal information is ready'
                : `${requiredFields.length - filledRequired} more required ${requiredFields.length - filledRequired === 1 ? 'field' : 'fields'} to go`
              }
            </p>
          </div>
        </div>

        <button
          onClick={handleAIEnhance}
          disabled={isEnhancing}
          className="group relative px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />

          <div className="flex items-center gap-2 relative">
            {isEnhancing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span className="font-medium">
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </span>
          </div>
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PersonalInfoPage;