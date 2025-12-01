import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft,
    FaSave,
    FaEye,
    FaEyeSlash,
    FaDownload,
    FaRobot,
    FaMagic,
    FaTrash,
    FaStepForward,
    FaStepBackward,
    FaCheck,
    FaHome,
    FaGraduationCap,
    FaBriefcase,
    FaCogs,
    FaProjectDiagram,
    FaCertificate,
    FaUser,
    FaFileAlt,
    FaClipboardList
} from 'react-icons/fa';

// Import your page components
import PersonalInfoPage from '../components/builder/PersonalInfoPage';
import SummaryPage from '../components/builder/SummaryPage';
import ExperiencePage from '../components/builder/ExperiencePage';
import EducationPage from '../components/builder/EducationPage';
import SkillsPage from '../components/builder/SkillsPage';
import ProjectsPage from '../components/builder/ProjectsPage';
import CertificationsPage from '../components/builder/CertificationsPage';
import CompletionPage from '../components/builder/CompletionPage';

// Live Preview Component (simplified)
const LivePreview = ({ resumeData }) => {
    const { personalInfo, professionalSummary, experience, education, skills, projects, certifications } = resumeData;

    return (
        <div className="bg-white p-8 min-h-[800px] font-sans">
            {/* Header */}
            <div className="border-b-4 border-blue-600 pb-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {personalInfo?.firstName || 'Your'} {personalInfo?.lastName || 'Name'}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2 text-gray-600">
                    {personalInfo?.email && <div>{personalInfo.email}</div>}
                    {personalInfo?.phone && <div>• {personalInfo.phone}</div>}
                    {personalInfo?.location && <div>• {personalInfo.location}</div>}
                </div>
            </div>

            {/* Summary */}
            {professionalSummary && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Professional Summary</h2>
                    <p className="text-gray-700 leading-relaxed">{professionalSummary}</p>
                </div>
            )}

            {/* Experience */}
            {experience?.length > 0 && experience[0]?.jobTitle && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Experience</h2>
                    {experience.map((exp, idx) => (
                        <div key={idx} className="mb-6">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-gray-900">{exp.jobTitle}</h3>
                                <span className="text-gray-600 text-sm">
                                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                </span>
                            </div>
                            <div className="text-gray-700 mb-2">{exp.company}, {exp.location}</div>
                            <p className="text-gray-600 text-sm">{exp.description}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Education */}
            {education?.length > 0 && education[0]?.degree && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Education</h2>
                    {education.map((edu, idx) => (
                        <div key={idx} className="mb-4">
                            <div className="flex justify-between">
                                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                <span className="text-gray-600 text-sm">
                                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                                </span>
                            </div>
                            <div className="text-gray-700">{edu.institution}, {edu.location}</div>
                            {edu.gpa && <div className="text-gray-600 text-sm">GPA: {edu.gpa}</div>}
                        </div>
                    ))}
                </div>
            )}

            {/* Skills */}
            {skills?.length > 0 && skills[0]?.skills && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                {skill.skills}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Initial state template
const getInitialState = () => ({
    personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
        summary: ''
    },
    professionalSummary: '',
    experience: [{
        id: Date.now(),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
    }],
    education: [{
        id: Date.now(),
        degree: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: '',
        description: ''
    }],
    skills: [{
        id: Date.now(),
        category: 'Technical',
        skills: ''
    }],
    projects: [{
        id: Date.now(),
        name: '',
        description: '',
        technologies: '',
        link: '',
        startDate: '',
        endDate: ''
    }],
    certifications: [{
        id: Date.now(),
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: ''
    }]
});

const Builder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const resumeId = queryParams.get('resumeId');

    const [currentStep, setCurrentStep] = useState(1);
    const [showPreview, setShowPreview] = useState(true);
    const [resumeData, setResumeData] = useState(getInitialState());
    const [lastSaved, setLastSaved] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch resume data if editing existing resume
    useEffect(() => {
        if (resumeId) {
            fetchResumeData(resumeId);
        }

        // Load draft from localStorage
        const savedDraft = localStorage.getItem('resumeDraft');
        const savedStep = localStorage.getItem('currentStep');

        if (savedDraft && !resumeId) {
            try {
                const parsedData = JSON.parse(savedDraft);
                setResumeData(parsedData);
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }

        if (savedStep) {
            setCurrentStep(parseInt(savedStep));
        }
    }, [resumeId]);

    const fetchResumeData = async (id) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/resumes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setResumeData(data);
            } else {
                throw new Error('Failed to fetch resume');
            }
        } catch (error) {
            console.error('Error fetching resume:', error);
            alert('Failed to load resume. Starting with new template.');
        } finally {
            setLoading(false);
        }
    };

    // Auto-save to localStorage
    useEffect(() => {
        localStorage.setItem('resumeDraft', JSON.stringify(resumeData));
        localStorage.setItem('currentStep', currentStep.toString());
        setLastSaved(new Date().toLocaleTimeString());
    }, [resumeData, currentStep]);

    const handleInputChange = (section, field, value, id = null) => {
        setResumeData(prev => {
            if (id) {
                // For array sections
                return {
                    ...prev,
                    [section]: prev[section].map(item =>
                        item.id === id ? { ...item, [field]: value } : item
                    )
                };
            } else if (section.includes('.')) {
                // For nested objects
                const [parent, child] = section.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
            } else {
                // For top-level fields
                return {
                    ...prev,
                    [section]: value
                };
            }
        });
    };

    const handleAddNew = (section) => {
        const defaultItems = {
            experience: {
                id: Date.now(),
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            },
            education: {
                id: Date.now(),
                degree: '',
                institution: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                gpa: '',
                description: ''
            },
            skills: {
                id: Date.now(),
                category: 'Technical',
                skills: ''
            },
            projects: {
                id: Date.now(),
                name: '',
                description: '',
                technologies: '',
                link: '',
                startDate: '',
                endDate: ''
            },
            certifications: {
                id: Date.now(),
                name: '',
                issuer: '',
                date: '',
                expiryDate: '',
                credentialId: '',
                credentialUrl: ''
            }
        };

        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], defaultItems[section]]
        }));
    };

    const handleRemove = (section, id) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter(item => item.id !== id)
        }));
    };

    const saveResume = async () => {
        setIsSaving(true);
        try {
            const url = resumeId ? `/api/resumes/${resumeId}` : '/api/resumes';
            const method = resumeId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(resumeData)
            });

            if (response.ok) {
                const savedResume = await response.json();
                alert('Resume saved successfully!');
                navigate('/dashboard');
            } else {
                throw new Error('Failed to save resume');
            }
        } catch (error) {
            console.error('Error saving resume:', error);
            alert('Failed to save resume. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const analyzeWithAI = async () => {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(resumeData)
            });

            if (response.ok) {
                const suggestions = await response.json();
                alert('AI analysis complete! Check suggestions in the console.');
                console.log('AI Suggestions:', suggestions);
            }
        } catch (error) {
            console.error('AI analysis error:', error);
        }
    };

    const validateCurrentStep = () => {
        switch (currentStep) {
            case 1: // Personal Info
                return resumeData.personalInfo.firstName &&
                    resumeData.personalInfo.lastName &&
                    resumeData.personalInfo.email;
            case 2: // Summary
                return resumeData.professionalSummary &&
                    resumeData.professionalSummary.length >= 50;
            case 3: // Experience
                return resumeData.experience.length > 0 &&
                    resumeData.experience[0].jobTitle &&
                    resumeData.experience[0].company;
            case 4: // Education
                return resumeData.education.length > 0 &&
                    resumeData.education[0].degree &&
                    resumeData.education[0].institution;
            case 5: // Skills
                return resumeData.skills.length > 0 &&
                    resumeData.skills[0].skills;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (currentStep < 8 && validateCurrentStep()) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const resetForm = () => {
        if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            setResumeData(getInitialState());
            setCurrentStep(1);
            localStorage.removeItem('resumeDraft');
            localStorage.removeItem('currentStep');
        }
    };

    const steps = [
        { number: 1, title: 'Personal Info', icon: <FaUser />, color: 'from-blue-500 to-blue-600' },
        { number: 2, title: 'Summary', icon: <FaFileAlt />, color: 'from-purple-500 to-purple-600' },
        { number: 3, title: 'Experience', icon: <FaBriefcase />, color: 'from-green-500 to-green-600' },
        { number: 4, title: 'Education', icon: <FaGraduationCap />, color: 'from-yellow-500 to-yellow-600' },
        { number: 5, title: 'Skills', icon: <FaCogs />, color: 'from-red-500 to-red-600' },
        { number: 6, title: 'Projects', icon: <FaProjectDiagram />, color: 'from-pink-500 to-pink-600' },
        { number: 7, title: 'Certifications', icon: <FaCertificate />, color: 'from-indigo-500 to-indigo-600' },
        { number: 8, title: 'Complete', icon: <FaCheck />, color: 'from-teal-500 to-teal-600' }
    ];

    const renderCurrentStep = () => {
        const commonProps = {
            resumeData,
            onInputChange: handleInputChange,
            onAddNew: handleAddNew,
            onRemove: handleRemove,
            isStepValid: validateCurrentStep()
        };

        const completionProps = {
            ...commonProps,
            onReset: resetForm,
            onSave: saveResume,
            onDownload: () => alert('PDF download would be implemented here')
        };

        switch (currentStep) {
            case 1:
                return <PersonalInfoPage {...commonProps} />;
            case 2:
                return <SummaryPage {...commonProps} />;
            case 3:
                return <ExperiencePage {...commonProps} />;
            case 4:
                return <EducationPage {...commonProps} />;
            case 5:
                return <SkillsPage {...commonProps} />;
            case 6:
                return <ProjectsPage {...commonProps} />;
            case 7:
                return <CertificationsPage {...commonProps} />;
            case 8:
                return <CompletionPage {...completionProps} />;
            default:
                return <PersonalInfoPage {...commonProps} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-900 text-lg font-medium">Loading resume builder...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header with Back to Dashboard Button */}
            <div className="bg-white shadow-lg border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <FaArrowLeft />
                                <span className="font-medium">Back to Dashboard</span>
                            </Link>
                            <div className="h-6 w-px bg-gray-300 hidden sm:block"></div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {resumeId ? 'Edit Resume' : 'Create New Resume'}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={analyzeWithAI}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <FaRobot />
                                AI Enhance
                            </button>
                            <button
                                onClick={saveResume}
                                disabled={isSaving}
                                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                <FaSave />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
                        {steps.map((step) => (
                            <div key={step.number} className="flex flex-col items-center">
                                <button
                                    onClick={() => setCurrentStep(step.number)}
                                    className={`w-full py-3 rounded-xl flex flex-col items-center transition-all duration-300 ${currentStep === step.number
                                        ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg transform scale-105'
                                        : currentStep > step.number
                                            ? 'bg-green-100 text-green-700 border-2 border-green-200'
                                            : 'bg-gray-100 text-gray-600 border-2 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">{step.icon}</span>
                                        <span className="text-sm font-medium">{step.number}</span>
                                    </div>
                                    <span className="text-xs font-medium">{step.title}</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Step {currentStep} of {steps.length}</span>
                        <span>{Math.round(((currentStep - 1) / (steps.length - 1)) * 100)}% Complete</span>
                    </div>
                </div>

                {/* Auto-save Status */}
                {lastSaved && (
                    <div className="mb-6 flex items-center justify-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                            <FaSave className="text-sm" />
                            <span className="text-sm">Auto-saved at {lastSaved}</span>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className={`gap-8 ${showPreview ? 'lg:grid lg:grid-cols-2' : ''}`}>
                    {/* Form Section */}
                    <div className={showPreview ? 'lg:col-span-1' : ''}>
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                            <div className="p-6">
                                {renderCurrentStep()}
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Section */}
                    {showPreview && (
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-8">
                                <div className="p-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="text-sm text-gray-600">Real-time</span>
                                        </div>
                                    </div>
                                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
                                        <LivePreview resumeData={resumeData} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                {currentStep < 8 && (
                    <div className="flex justify-between items-center mt-8 p-6 bg-white rounded-2xl shadow-lg">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${currentStep === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gray-500 text-white hover:bg-gray-600'
                                }`}
                        >
                            <FaStepBackward />
                            Previous
                        </button>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
                            >
                                {showPreview ? <FaEyeSlash /> : <FaEye />}
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>

                            <button
                                onClick={nextStep}
                                disabled={!validateCurrentStep()}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${!validateCurrentStep()
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90'
                                    }`}
                            >
                                {currentStep === 7 ? 'Finish' : 'Next Step'}
                                <FaStepForward />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step Validation Status */}
                <div className="mt-6 text-center">
                    {validateCurrentStep() ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
                            <FaCheck />
                            <span>Step {currentStep} completed ✓</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full">
                            <span>Please complete all required fields to continue</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed bottom-8 right-8 flex flex-col gap-4">
                <button
                    onClick={saveResume}
                    disabled={isSaving}
                    className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
                    title="Save Resume"
                >
                    {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <FaSave />
                    )}
                </button>

                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
                    title={showPreview ? 'Hide Preview' : 'Show Preview'}
                >
                    {showPreview ? <FaEyeSlash /> : <FaEye />}
                </button>

                <button
                    onClick={resetForm}
                    className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
                    title="Reset Form"
                >
                    <FaTrash />
                </button>

                <Link
                    to="/dashboard"
                    className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
                    title="Back to Dashboard"
                >
                    <FaHome />
                </Link>
            </div>
        </div>
    );
};

export default Builder;