// src/components/wizard/PersonalInfoWizard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Globe,
  Linkedin, Github, Upload, CheckCircle,
  Sparkles, Loader2
} from 'lucide-react';

const PersonalInfoWizard = ({
  data,
  onChange,
  onNext,
  onBack,
  isStepValid,
  aiSuggestions = [],
  onGenerateAI,
  isGeneratingAI,
  onApplySuggestion
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const [isValidating, setIsValidating] = useState(false);

  const personalInfo = data.personalInfo || {};

  // Sections for the wizard
  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: User,
      fields: ['name', 'surname']
    },
    {
      id: 'contact',
      title: 'Contact Details',
      icon: Phone,
      fields: ['email', 'phone']
    },
    {
      id: 'location',
      title: 'Location',
      icon: MapPin,
      fields: ['city', 'postcode', 'country']
    },
    {
      id: 'professional',
      title: 'Professional Links',
      icon: Globe,
      fields: ['linkedinUrl', 'githubUrl', 'portfolioUrl']
    }
  ];

  const handleInputChange = (field, value) => {
    const updatedPersonalInfo = {
      ...personalInfo,
      [field]: value
    };

    onChange({
      ...data,
      personalInfo: updatedPersonalInfo
    });
  };

  const handleNextSection = () => {
    if (activeSection < sections.length - 1) {
      setActiveSection(activeSection + 1);
    } else if (isStepValid) {
      onNext();
    }
  };

  const handlePrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    } else {
      onBack();
    }
  };

  // Validate email
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Format phone number
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phone = value.replace(/\D/g, '');

    // Format as: 980-123-4567
    if (phone.length <= 3) return phone;
    if (phone.length <= 6) return `${phone.slice(0, 3)}-${phone.slice(3)}`;
    return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6, 10)}`;
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  // AI Suggestions for this step
  const personalSuggestions = aiSuggestions.filter(s =>
    s.category === 'personal_info' ||
    s.tags?.includes('contact') ||
    s.title.toLowerCase().includes('email') ||
    s.title.toLowerCase().includes('phone') ||
    s.title.toLowerCase().includes('name')
  );

  const renderField = (field) => {
    const value = personalInfo[field] || '';
    const label = field.charAt(0).toUpperCase() + field.slice(1);
    const placeholder = `Enter your ${label.toLowerCase()}`;

    switch (field) {
      case 'name':
      case 'surname':
      case 'city':
      case 'postcode':
      case 'country':
        return (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field === 'surname' ? 'Sur Name' : label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={placeholder}
            />
          </div>
        );

      case 'email':
        return (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
              {value && !validateEmail(value) && (
                <div className="text-sm text-red-500 mt-1">
                  Please enter a valid email address
                </div>
              )}
            </div>
          </div>
        );

      case 'phone':
        return (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {label}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Phone className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={value}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="980-123-4567"
                maxLength="12"
              />
            </div>
          </div>
        );

      case 'linkedinUrl':
      case 'githubUrl':
      case 'portfolioUrl':
        const icon = field === 'linkedinUrl' ? Linkedin :
          field === 'githubUrl' ? Github : Globe;
        const labelText = field === 'linkedinUrl' ? 'LinkedIn URL' :
          field === 'githubUrl' ? 'GitHub URL' :
            'Portfolio Website';

        return (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {labelText}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                {React.createElement(icon, { className: "w-5 h-5 text-gray-400" })}
              </div>
              <input
                type="url"
                value={value}
                onChange={(e) => handleInputChange(field, e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={`https://${field === 'linkedinUrl' ? 'linkedin.com/in/' :
                  field === 'githubUrl' ? 'github.com/' : 'yourportfolio.com'}`}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Section {activeSection + 1} of {sections.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {sections[activeSection].title}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((activeSection + 1) / sections.length) * 100}%` }}
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
          />
        </div>
      </div>

      {/* AI Suggestions Card */}
      {personalSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">AI Suggestions</span>
          </div>
          <div className="space-y-2">
            {personalSuggestions.slice(0, 2).map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white/80 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {suggestion.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.description}
                  </div>
                </div>
                {suggestion.action && (
                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Section Form */}
      <motion.div
        key={sections[activeSection].id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            {React.createElement(sections[activeSection].icon, { className: "w-6 h-6 text-blue-600" })}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {sections[activeSection].title}
          </h2>
        </div>

        {/* Form Grid */}
        <div className={`grid gap-6 ${sections[activeSection].fields.length > 2
          ? 'grid-cols-1 md:grid-cols-2'
          : 'grid-cols-1'
          }`}>
          {sections[activeSection].fields.map(field => renderField(field))}
        </div>

        {/* Field Completion Status */}
        {sections[activeSection].id === 'contact' && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Contact Validation
              </span>
              {validateEmail(personalInfo.email) && personalInfo.phone?.length >= 10 ? (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Valid
                </span>
              ) : (
                <span className="text-sm text-amber-600 font-medium">
                  Needs attention
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              What's the best way for employers to contact you? We suggest including an email and phone number.
            </div>
          </div>
        )}

        {/* AI Generate Button */}
        {sections[activeSection].id === 'basic' && (
          <div className="mt-6">
            <button
              onClick={() => onGenerateAI('personal_info', personalInfo)}
              disabled={isGeneratingAI}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 text-purple-700 rounded-xl hover:border-purple-300 hover:shadow-sm transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI Suggest Professional Details
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-8 border-t border-gray-200">
        <button
          onClick={handlePrevSection}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
        >
          {activeSection === 0 ? 'Back' : 'Previous'}
        </button>

        <div className="flex items-center gap-4">
          {activeSection === sections.length - 1 && isStepValid && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">All required fields complete</span>
            </div>
          )}

          <button
            onClick={handleNextSection}
            disabled={!isStepValid && sections[activeSection].fields.some(f =>
              ['name', 'surname', 'email', 'phone'].includes(f)
            )}
            className={`px-8 py-3.5 rounded-xl font-semibold transition-all ${isStepValid || !sections[activeSection].fields.some(f =>
              ['name', 'surname', 'email', 'phone'].includes(f)
            )
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-[1.02]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
          >
            {activeSection === sections.length - 1 ? 'Save & Continue' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoWizard;