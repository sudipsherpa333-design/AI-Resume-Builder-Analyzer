// ------------------- PersonalInfoWizard.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Globe,
    Linkedin,
    Github,
    Briefcase,
    Calendar,
    ChevronRight,
    ChevronLeft,
    Check,
    Upload,
    X,
    AlertCircle,
    Zap,
    Target,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PersonalInfoWizard = ({
    data = {},
    onChange = () => { },
    onComplete = () => { },
    onBack = () => { },
    isLoading = false,
    aiSuggestions = [],
    onApplySuggestion = () => { }
}) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        location: '',
        portfolioUrl: '',
        linkedinUrl: '',
        githubUrl: '',
        jobTitle: '',
        yearsOfExperience: '',
        ...data // Merge with provided data
    });

    const [errors, setErrors] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);

    const totalSteps = 3;

    // Update form data when prop changes
    useEffect(() => {
        if (data && Object.keys(data).length > 0) {
            setFormData(prev => ({
                ...prev,
                ...data
            }));
        }
    }, [data]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }

        // Call onChange callback with updated data
        onChange({
            ...formData,
            [field]: value
        });
    };

    const validateStep = () => {
        const newErrors = {};
        setIsValidating(true);

        switch (step) {
            case 1: // Contact Info
                if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
                if (!formData.email?.trim()) newErrors.email = 'Email is required';
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    newErrors.email = 'Please enter a valid email';
                }
                if (!formData.phone?.trim()) newErrors.phone = 'Phone number is required';
                break;

            case 2: // Professional Info
                if (!formData.jobTitle?.trim()) newErrors.jobTitle = 'Current job title is required';
                if (!formData.yearsOfExperience?.trim()) newErrors.yearsOfExperience = 'Years of experience is required';
                else if (isNaN(formData.yearsOfExperience) || parseInt(formData.yearsOfExperience) < 0) {
                    newErrors.yearsOfExperience = 'Please enter a valid number';
                }
                break;

            case 3: // Links & Portfolio
                // Optional fields, no validation required
                break;
        }

        setErrors(newErrors);
        setIsValidating(false);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < totalSteps) {
                setStep(step + 1);
            } else {
                handleComplete();
            }
        }
    };

    const handlePrevious = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onBack();
        }
    };

    const handleComplete = () => {
        if (validateStep()) {
            const completeData = {
                ...formData,
                lastUpdated: new Date().toISOString()
            };

            onComplete(completeData);
            toast.success('Personal information saved successfully!');
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
                toast.success('Profile photo uploaded');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setUploadedImage(null);
        toast.success('Profile photo removed');
    };

    const handleApplySuggestion = (suggestion) => {
        onApplySuggestion(suggestion);
        toast.success('AI suggestion applied');
    };

    const steps = [
        {
            id: 1,
            title: 'Contact Information',
            description: 'Basic details for employers to reach you',
            icon: User
        },
        {
            id: 2,
            title: 'Professional Details',
            description: 'Your current role and experience',
            icon: Briefcase
        },
        {
            id: 3,
            title: 'Links & Portfolio',
            description: 'Online presence and profiles',
            icon: Globe
        }
    ];

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                                <p className="text-sm text-gray-600">How employers can reach you</p>
                            </div>
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center mb-6">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                    {uploadedImage ? (
                                        <img
                                            src={uploadedImage}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-blue-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <Upload className="w-4 h-4 text-white" />
                                </label>
                                {uploadedImage && (
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-0 right-0 p-1 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                                    >
                                        <X className="w-3 h-3 text-red-600" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                Optional profile photo (Max 5MB)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.fullName || ''}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? 'border-red-300' : 'border-gray-300'}`}
                                    placeholder="John Doe"
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.fullName}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email Address *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number *
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone || ''}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.phone}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.location || ''}
                                        onChange={(e) => handleChange('location', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="City, State/Country"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Professional Details</h3>
                                <p className="text-sm text-gray-600">Your current role and experience</p>
                            </div>
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Briefcase className="w-5 h-5 text-green-600" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Current Job Title *
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.jobTitle || ''}
                                        onChange={(e) => handleChange('jobTitle', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.jobTitle ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Senior Software Engineer"
                                    />
                                </div>
                                {errors.jobTitle && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.jobTitle}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Years of Experience *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={formData.yearsOfExperience || ''}
                                        onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.yearsOfExperience ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="5"
                                    />
                                </div>
                                {errors.yearsOfExperience && (
                                    <p className="text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.yearsOfExperience}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start gap-3">
                                <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-gray-900">AI Tip</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Be specific with your job title. Instead of "Developer," use "Full Stack Developer with React & Node.js Expertise."
                                    </p>
                                </div>
                            </div>
                        </div>

                        {aiSuggestions && aiSuggestions.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-600" />
                                    AI Suggestions
                                </h4>
                                {aiSuggestions.map((suggestion, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{suggestion.title}</p>
                                                <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleApplySuggestion(suggestion)}
                                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Links & Portfolio</h3>
                                <p className="text-sm text-gray-600">Showcase your online presence</p>
                            </div>
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Globe className="w-5 h-5 text-purple-600" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    LinkedIn Profile
                                </label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                                    <input
                                        type="url"
                                        value={formData.linkedinUrl || ''}
                                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    GitHub Profile
                                </label>
                                <div className="relative">
                                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800" />
                                    <input
                                        type="url"
                                        value={formData.githubUrl || ''}
                                        onChange={(e) => handleChange('githubUrl', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Portfolio Website
                                </label>
                                <div className="relative">
                                    <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={formData.portfolioUrl || ''}
                                        onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="https://yourportfolio.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-gray-900">Almost There!</h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Adding links to your professional profiles can increase your chances of getting hired by 40%.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Personal Information</h3>
                <p className="text-gray-600 text-center">AI is analyzing your data...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <span className="text-sm font-medium text-blue-600">
                        Step {step} of {totalSteps}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mt-4">
                    {steps.map((stepItem) => (
                        <div
                            key={stepItem.id}
                            className={`flex flex-col items-center ${stepItem.id <= step ? 'text-blue-600' : 'text-gray-400'}`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${stepItem.id <= step ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'}`}>
                                <stepItem.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium">{stepItem.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {renderStepContent()}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={handlePrevious}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {step === 1 ? 'Back to Sections' : 'Previous'}
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (validateStep()) {
                                    onComplete(formData);
                                    toast.success('Saved as draft');
                                }
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Save Draft
                        </button>

                        <button
                            onClick={handleNext}
                            disabled={isValidating}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {step === totalSteps ? 'Complete Setup' : 'Continue'}
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Step Indicator Dots */}
            <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: totalSteps }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (index + 1 <= step) {
                                setStep(index + 1);
                            }
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${index + 1 === step ? 'bg-blue-600 w-8' : 'bg-gray-300'}`}
                        aria-label={`Go to step ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default PersonalInfoWizard;