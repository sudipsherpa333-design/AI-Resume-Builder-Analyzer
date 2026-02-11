// src/pages/builder/Builder.jsx - UPDATED WITH RESUME CONTEXT INTEGRATION
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResume } from '../../context/ResumeContext';
import { useAI } from '../../context/AIContext';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

// Icons
import {
    ChevronLeft, ChevronRight, Eye, EyeOff, Download,
    Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw,
    Layout, Settings, Sparkles, Save as SaveIcon,
    CheckCircle, AlertCircle, Printer, Brain,
    Copy, Trash2, Plus, X, ArrowRight,
    Menu, User, Building, GraduationCap,
    Briefcase, Award, Globe, Code, Target,
    Clock, Calendar, MapPin, Mail, Phone, ExternalLink,
    Edit2, Check, TrendingUp, Lightbulb, Wand2,
    FileText, Search, Filter, Layers, Star,
    Upload, Image, Palette, Type, Share,
    Grid, Sidebar, SidebarClose, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

// Components
import Navbar from '../../components/Navbar';
import PersonalInfoPage from '../../components/section/PersonalInfoPage';
import SummaryPage from '../../components/section/SummaryPage';
import ExperiencePage from '../../components/section/ExperiencePage';
import SkillsPage from '../../components/section/SkillsPage';
import EducationPage from '../../components/section/EducationPage';
import ProjectsPage from '../../components/section/ProjectsPage';
import CertificationsPage from '../../components/section/CertificationsPage';
import LanguagesPage from '../../components/section/LanguagesPage';
import FloatingActionButtons from '../../components/ui/FloatingActionButtons';
import ResumePreview from '../../components/preview/RealTimePreview';
import BuilderSidebar from '../../components/ui/BuilderSidebar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Builder = ({ isNewResume: propIsNew, resumeId, importedData }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    // ============ STATE MANAGEMENT ============
    const [isNewResume, setIsNewResume] = useState(() => {
        return propIsNew || location.pathname.includes('/builder/new') || !id;
    });
    const [activeView, setActiveView] = useState('editor');
    const [previewZoom, setPreviewZoom] = useState(0.8);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [activeSection, setActiveSection] = useState('personal');
    const [wizardStep, setWizardStep] = useState(0);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [showExportManager, setShowExportManager] = useState(false);
    const [showAIPanel, setShowAIPanel] = useState(false);
    const [jobDescription, setJobDescription] = useState('');
    const [localAiSuggestions, setLocalAiSuggestions] = useState([]);
    const [completion, setCompletion] = useState(0);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'error'

    // ============ REFS ============
    const editorRef = useRef(null);
    const previewRef = useRef(null);
    const autoSaveTimeoutRef = useRef(null);

    // ============ CONTEXT HOOKS ============
    const {
        currentResume,
        saveResume,
        updateCurrentResumeData,
        loadResume,
        loading: resumeLoading,
        error: resumeError,
        isSaving,
        createResume,
        cloudStatus
    } = useResume();

    const {
        analyzeResume,
        optimizeContent,
        generateSummary,
        improveSection,
        isAnalyzing,
        aiSuggestions,
        aiScore
    } = useAI();

    // ============ WIZARD STEPS ============
    const wizardSteps = useMemo(() => [
        { id: 'personal', label: 'Personal Info', icon: '👤', component: PersonalInfoPage, required: true },
        { id: 'summary', label: 'Summary', icon: '📝', component: SummaryPage, required: true },
        { id: 'experience', label: 'Experience', icon: '💼', component: ExperiencePage, required: true },
        { id: 'skills', label: 'Skills', icon: '⚡', component: SkillsPage, required: true },
        { id: 'education', label: 'Education', icon: '🎓', component: EducationPage, required: true },
        { id: 'projects', label: 'Projects', icon: '🚀', component: ProjectsPage, required: false },
        { id: 'certifications', label: 'Certifications', icon: '🏆', component: CertificationsPage, required: false },
        { id: 'languages', label: 'Languages', icon: '🌐', component: LanguagesPage, required: false },
        { id: 'finalize', label: 'Finalize', icon: '✅', component: null, required: true }
    ], []);

    // ============ DEBUG LOGGING ============
    useEffect(() => {
        console.log('🔍 Builder State:', {
            isNewResume,
            currentResumeId: currentResume?._id,
            currentResumeTitle: currentResume?.title,
            routeId: id,
            path: location.pathname,
            resumeLoading,
            isSaving
        });
    }, [isNewResume, currentResume, id, location.pathname, resumeLoading, isSaving]);

    // ============ VALIDATION FUNCTIONS ============
    const validateResumeData = useCallback((resumeData) => {
        const errors = [];

        if (!resumeData) {
            errors.push('No resume data provided');
            return errors;
        }

        // Basic validation
        if (!resumeData.title?.trim()) {
            errors.push('Resume title is required');
        }

        // Personal info validation
        if (!resumeData.personalInfo?.firstName?.trim()) {
            errors.push('First name is required');
        }

        if (!resumeData.personalInfo?.email?.trim()) {
            errors.push('Email is required');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (resumeData.personalInfo?.email && !emailRegex.test(resumeData.personalInfo.email)) {
            errors.push('Please enter a valid email address');
        }

        return errors;
    }, []);

    // ============ COMPLETION CALCULATION ============
    const calculateCompletion = useCallback(() => {
        if (!currentResume) return 0;

        let completed = 0;
        const totalRequired = 5;
        const totalOptional = 3;

        // Personal info (check for required fields)
        if (currentResume.personalInfo?.firstName && currentResume.personalInfo?.email) completed++;

        // Summary (at least 50 characters)
        if (currentResume.summary?.trim() && currentResume.summary.trim().length > 50) completed++;

        // Experience (at least one entry)
        if (currentResume.experience?.length > 0) completed++;

        // Skills (at least 3 skills)
        if (currentResume.skills?.length >= 3) completed++;

        // Education (at least one entry)
        if (currentResume.education?.length > 0) completed++;

        // Optional sections (partial credit)
        if (currentResume.projects?.length > 0) completed += 0.5;
        if (currentResume.certifications?.length > 0) completed += 0.5;
        if (currentResume.languages?.length > 0) completed += 0.5;

        // Cap at total
        completed = Math.min(completed, totalRequired + (totalOptional * 0.5));
        return Math.round((completed / totalRequired) * 100);
    }, [currentResume]);

    // ============ RESUME LOADING ============
    useEffect(() => {
        const loadExistingResume = async () => {
            if (id && !isNewResume && !resumeLoading) {
                console.log('📥 Loading existing resume:', id);
                try {
                    await loadResume(id);
                    console.log('✅ Resume loaded successfully');
                } catch (error) {
                    console.error('❌ Load error:', error);
                    toast.error(`Failed to load resume: ${error.message}`);
                    navigate('/dashboard');
                }
            }
        };

        loadExistingResume();
    }, [id, isNewResume, resumeLoading, loadResume, navigate]);


    // ============ CREATE NEW RESUME ============
    const handleNewResumeCreation = useCallback(async () => {
        console.log('🚀 Creating new resume...');
        console.log('   isNewResume:', isNewResume);
        console.log('   currentResume:', currentResume?._id);

        // If we already have a valid resume, don't create another one
        if (currentResume &&
            currentResume._id &&
            currentResume._id !== 'new' &&
            !currentResume._id.startsWith('local_')) {
            console.log('⏭️ Already have valid resume:', currentResume._id);
            return;
        }

        try {
            // Get user info
            let user = { id: 'demo-user-123', name: 'Demo User', email: 'demo@example.com' };
            try {
                const userDataStr = localStorage.getItem('user_data') || localStorage.getItem('user');
                if (userDataStr) {
                    user = JSON.parse(userDataStr);
                }
            } catch (e) {
                console.warn('Could not parse user data:', e);
            }

            // Create resume data
            const resumeData = {
                title: `${user?.name?.split(' ')[0] || 'My'}'s Resume`,
                personalInfo: {
                    firstName: user?.name?.split(' ')[0] || '',
                    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
                    email: user?.email || 'user@example.com'
                },
                summary: '',
                experience: [],
                education: [],
                skills: [],
                projects: [],
                certifications: [],
                languages: []
            };

            console.log('📝 Creating resume with:', resumeData.title);

            // Create via context
            const newResume = await createResume(resumeData);

            if (newResume && newResume._id) {
                console.log('✅ Resume created:', newResume._id);

                // Update URL
                navigate(`/builder/edit/${newResume._id}`, { replace: true });

                // Update state
                setIsNewResume(false);

                toast.success('Resume created!');
            }
        } catch (error) {
            console.error('❌ Failed to create resume:', error);

            // Create local fallback
            const fallbackResume = {
                ...resumeData,
                _id: `local_${Date.now()}`,
                offline: true
            };

            if (updateCurrentResumeData) {
                updateCurrentResumeData(fallbackResume);
            }

            toast.success('Created locally (offline mode)');
        }
    }, [isNewResume, currentResume, createResume, navigate, updateCurrentResumeData]);
    // Trigger new resume creation
    useEffect(() => {
        handleNewResumeCreation();
    }, [handleNewResumeCreation]);

    // ============ UPDATE COMPLETION PERCENTAGE ============
    useEffect(() => {
        if (currentResume) {
            const newCompletion = calculateCompletion();
            setCompletion(newCompletion);
        }
    }, [currentResume, calculateCompletion]);

    // ============ AUTO-SAVE ============
    useEffect(() => {
        if (!currentResume || isNewResume || !currentResume._id || isSaving) {
            return;
        }

        // Clear existing timeout
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(async () => {
            setSaveStatus('saving');
            try {
                const errors = validateResumeData(currentResume);
                if (errors.length === 0) {
                    await saveResume(currentResume);
                    setSaveStatus('saved');
                } else {
                    setSaveStatus('error');
                    console.warn('Auto-save skipped due to validation errors:', errors);
                }
            } catch (error) {
                console.error('Auto-save failed:', error);
                setSaveStatus('error');
            }
        }, 5000); // 5 seconds debounce

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [currentResume, isNewResume, isSaving, saveResume, validateResumeData]);

    // ============ MANUAL SAVE ============
    const handleManualSave = async () => {
        console.log('💾 handleManualSave triggered', {
            hasCurrentResume: !!currentResume,
            currentId: currentResume?._id,
            currentTitle: currentResume?.title || '(no title)',
            isNew: isNewResume
        });

        // Safety guard: if no resume at all, create one first
        if (!currentResume) {
            console.warn('No currentResume - auto-creating before save');
            toast.loading('Creating resume first...');

            try {
                const newResume = await createResume();
                if (!newResume || !newResume._id) {
                    toast.dismiss();
                    toast.error('Failed to create resume');
                    return;
                }
                toast.dismiss();
                toast.success('Resume created — saving now');

                // Retry save with the newly created resume
                return await handleManualSave(); // recursive call (safe because now we have resume)
            } catch (createErr) {
                toast.dismiss();
                console.error('Auto-create before save failed:', createErr);
                toast.error('Cannot save — failed to create resume');
                return;
            }
        }

        // Now we know currentResume exists
        console.log('Valid resume found - proceeding to save');

        // Validate before saving (unchanged)
        const errors = validateResumeData(currentResume);
        if (errors.length > 0) {
            setValidationErrors(errors);
            toast.error('Please fix validation errors before saving');
            return;
        }

        setValidationErrors([]);
        setSaveStatus('saving');

        try {
            // Always send a fresh copy (prevents stale reference bugs)
            const dataToSave = { ...currentResume };

            console.log('Calling saveResume with:', {
                id: dataToSave._id,
                title: dataToSave.title,
                keys: Object.keys(dataToSave).length
            });

            const savedResume = await saveResume(dataToSave);

            if (savedResume && savedResume._id) {
                setSaveStatus('saved');

                // If this was a new resume, update the URL (unchanged)
                if (isNewResume && savedResume._id) {
                    setIsNewResume(false);
                    navigate(`/builder/edit/${savedResume._id}`, { replace: true });
                }

                toast.success('Resume saved successfully!');
                return savedResume;
            } else {
                throw new Error('Save failed: No resume returned from saveResume');
            }
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('error');
            toast.error(`Failed to save resume: ${error.message || 'Unknown error'}`);
            throw error;
        }
    };

    // ============ UPDATE RESUME DATA ============
    const handleUpdateResumeData = useCallback((updates) => {
        if (!currentResume) return;

        updateCurrentResumeData(updates);

        // Trigger auto-save if we have an ID
        if (currentResume._id && currentResume._id !== 'new' && !currentResume._id.startsWith('local_')) {
            // Reset save status to show unsaved changes
            setSaveStatus('unsaved');
        }
    }, [currentResume, updateCurrentResumeData]);

    // ============ WIZARD NAVIGATION ============
    const handleNextStep = () => {
        if (wizardStep < wizardSteps.length - 1) {
            setWizardStep(wizardStep + 1);
            setActiveSection(wizardSteps[wizardStep + 1].id);
        }
    };

    const handlePrevStep = () => {
        if (wizardStep > 0) {
            setWizardStep(wizardStep - 1);
            setActiveSection(wizardSteps[wizardStep - 1].id);
        }
    };

    const handleJumpToStep = (index) => {
        setWizardStep(index);
        setActiveSection(wizardSteps[index].id);
    };

    // ============ AI FUNCTIONS ============
    const handleAIAnalysis = async () => {
        if (!jobDescription?.trim()) {
            toast.error('Please provide a job description');
            return;
        }

        if (!currentResume) {
            toast.error('No resume data available');
            return;
        }

        try {
            const result = await analyzeResume(currentResume, jobDescription);
            if (result.success) {
                toast.success('AI analysis complete!');
                setLocalAiSuggestions(result.suggestions || []);
            }
        } catch (error) {
            toast.error('Failed to analyze resume');
        }
    };

    const handleOptimizeSection = async (sectionId) => {
        try {
            const sectionData = currentResume?.[sectionId];
            const result = await improveSection(sectionId, sectionData, jobDescription);
            if (result.success && result.optimized) {
                handleUpdateResumeData({ [sectionId]: result.optimized });
                toast.success(`AI improved your ${sectionId} section`);
            }
        } catch (error) {
            toast.error('Failed to optimize section');
        }
    };

    const handleGenerateSummary = async () => {
        try {
            const result = await generateSummary(currentResume);
            if (result.success && result.summary) {
                handleUpdateResumeData({ summary: result.summary });
                toast.success('AI generated a new summary');
            }
        } catch (error) {
            toast.error('Failed to generate summary');
        }
    };

    // ============ VIEW CONTROLS ============
    const getCurrentComponent = () => {
        const step = wizardSteps.find(s => s.id === activeSection);
        return step?.component || null;
    };

    const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleZoomReset = () => setPreviewZoom(0.8);

    const toggleFullScreen = () => {
        if (!isFullScreen && previewRef.current) {
            if (previewRef.current.requestFullscreen) {
                previewRef.current.requestFullscreen();
            }
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullScreen(false);
        }
    };

    // ============ NAVIGATION ============
    const handleBack = () => {
        if (isNewResume) {
            navigate('/dashboard');
        } else {
            navigate('/dashboard');
        }
    };

    // ============ CALCULATE ATS SCORE ============
    const calculateATSScore = () => {
        if (!currentResume) return 0;

        let score = 0;

        // Check for required sections
        if (currentResume.personalInfo?.firstName && currentResume.personalInfo?.email) score += 20;
        if (currentResume.summary?.trim() && currentResume.summary.trim().length > 50) score += 15;
        if (currentResume.experience?.length > 0) score += 20;
        if (currentResume.skills?.length > 3) score += 15;
        if (currentResume.education?.length > 0) score += 10;

        // Optional sections (bonus points)
        if (currentResume.projects?.length > 0) score += 5;
        if (currentResume.certifications?.length > 0) score += 5;
        if (currentResume.languages?.length > 0) score += 5;

        // Keywords check
        const summaryText = currentResume.summary?.toLowerCase() || '';
        const keywords = ['experience', 'skills', 'developed', 'managed', 'improved', 'achieved'];
        const keywordCount = keywords.filter(keyword => summaryText.includes(keyword)).length;
        score += Math.min(keywordCount * 2, 10);

        return Math.min(score, 100);
    };

    // ============ LOADING & ERROR STATES ============
    if (resumeLoading && !currentResume && !isNewResume) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
                <Navbar />
                <div className="pt-20 flex flex-col items-center justify-center p-8">
                    <LoadingSpinner size="lg" text="Loading resume..." />
                </div>
            </div>
        );
    }

    if (resumeError && !isNewResume) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
                <Navbar />
                <div className="pt-20 flex flex-col items-center justify-center p-8">
                    <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 max-w-md text-center shadow-2xl border border-red-200/50">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Resume</h3>
                        <p className="text-gray-600 mb-6">{resumeError}</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl hover:bg-gray-200 shadow-lg"
                            >
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => loadResume(id)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ============ RENDER BUILDER ============
    const CurrentComponent = getCurrentComponent();
    const allAiSuggestions = [...(aiSuggestions || []), ...localAiSuggestions];
    const atsScore = calculateATSScore();
    const getResumeTitle = () => {
        if (isNewResume) return currentResume?.title || 'New Resume';
        return currentResume?.title || 'Untitled Resume';
    };

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case 'saving': return 'Saving...';
            case 'saved': return 'Saved';
            case 'error': return 'Error';
            case 'unsaved': return 'Unsaved';
            default: return 'Idle';
        }
    };

    const getSaveStatusColor = () => {
        switch (saveStatus) {
            case 'saving': return 'from-yellow-500/20 to-amber-500/20 text-yellow-700 border-yellow-200/50';
            case 'saved': return 'from-green-500/20 to-emerald-500/20 text-green-700 border-green-200/50';
            case 'error': return 'from-red-500/20 to-pink-500/20 text-red-700 border-red-200/50';
            case 'unsaved': return 'from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-200/50';
            default: return 'from-gray-500/20 to-slate-500/20 text-gray-700 border-gray-200/50';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/30">
            {/* Navbar */}
            <Navbar />

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-lg border border-red-200/50 rounded-3xl p-4 shadow-lg"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <div>
                                    <h3 className="font-semibold text-red-800">Validation Errors</h3>
                                    <ul className="text-sm text-red-600">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <button
                                onClick={() => setValidationErrors([])}
                                className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Builder Area */}
            <div className="pt-16 lg:pt-20 h-[calc(100vh-4rem)]">
                {/* Top Action Bar */}
                <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-4 w-full sm:w-auto">
                                <button
                                    onClick={handleBack}
                                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 rounded-2xl transition-all duration-300"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className="relative flex-1 min-w-[150px]">
                                        <input
                                            type="text"
                                            value={getResumeTitle()}
                                            onChange={(e) => handleUpdateResumeData({ title: e.target.value })}
                                            className="text-xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 w-full pl-4 pr-12 py-2 rounded-2xl bg-white/50 focus:bg-white focus:shadow-lg transition-all duration-300 placeholder-gray-400"
                                            placeholder={isNewResume ? 'New Resume' : 'Resume Title'}
                                        />
                                        <Edit2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    </div>
                                    {cloudStatus.mode === 'offline' && (
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-medium rounded-full shadow-lg flex-shrink-0">
                                            Offline
                                        </span>
                                    )}
                                    {isNewResume && (
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-medium rounded-full shadow-lg flex-shrink-0">
                                            New
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border ${getSaveStatusColor()}`}>
                                        <span className="flex items-center gap-2">
                                            {saveStatus === 'saving' ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    {getSaveStatusText()}
                                                </>
                                            ) : saveStatus === 'saved' ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    {getSaveStatusText()}
                                                </>
                                            ) : saveStatus === 'error' ? (
                                                <>
                                                    <AlertCircle className="w-4 h-4" />
                                                    {getSaveStatusText()}
                                                </>
                                            ) : (
                                                getSaveStatusText()
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleManualSave}
                                    disabled={isSaving}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 flex items-center gap-2 flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <SaveIcon className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>

                        {/* Mobile Progress */}
                        <div className="mt-3 sm:hidden">
                            <div className="flex items-center justify-between bg-white/50 rounded-2xl p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Progress:</span>
                                    <span className="font-bold">{completion}%</span>
                                </div>
                                <div className="flex-1 max-w-32 bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                                    <motion.div
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${completion}%` }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completion}%` }}
                                    ></motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome Message for New Resumes */}
                {isNewResume && currentResume && (
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 backdrop-blur-lg border border-blue-200/30 rounded-3xl p-5 shadow-xl"
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Welcome to Resume Builder!</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {cloudStatus.mode === 'offline'
                                                ? 'Working offline. Your changes will be saved locally.'
                                                : 'Follow the steps to create your perfect resume. Let\'s get started!'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setWizardStep(0)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                                >
                                    Start Building
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex h-[calc(100vh-8rem)]">
                    {/* Builder Sidebar */}
                    <AnimatePresence>
                        {(isMobileMenuOpen || !sidebarCollapsed) && (
                            <motion.div
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={`fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-64 bg-gradient-to-b from-white/90 via-white/80 to-white/70 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl lg:shadow-lg h-full overflow-y-auto ${sidebarCollapsed ? 'lg:w-20' : ''}`}
                            >
                                {/* Sidebar Header */}
                                <div className="p-5 border-b border-gray-200/50">
                                    <div className="flex items-center justify-between">
                                        {!sidebarCollapsed && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <FileText className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="font-bold text-gray-900">Resume Builder</h2>
                                                    <p className="text-xs text-gray-500">Step-by-step guide</p>
                                                </div>
                                            </div>
                                        )}
                                        {sidebarCollapsed && (
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                                                <FileText className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                            className="hidden lg:flex p-2 hover:bg-gray-100/50 rounded-2xl transition-all duration-300"
                                        >
                                            {sidebarCollapsed ? (
                                                <PanelLeftOpen className="w-5 h-5 text-gray-600" />
                                            ) : (
                                                <PanelLeftClose className="w-5 h-5 text-gray-600" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="lg:hidden p-2 hover:bg-gray-100/50 rounded-2xl"
                                        >
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Resume Name Section */}
                                {!sidebarCollapsed && (
                                    <div className="p-4">
                                        <div className="bg-gradient-to-br from-blue-50/50 to-cyan-50/50 border border-blue-100/50 rounded-2xl p-4">
                                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Resume</h3>
                                            <p className="text-lg font-bold text-gray-900 truncate">{getResumeTitle()}</p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <div className="flex-1 bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                                                    <motion.div
                                                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full"
                                                        style={{ width: `${completion}%` }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${completion}%` }}
                                                    ></motion.div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-700">{completion}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Navigation Steps */}
                                <div className="p-4">
                                    <h3 className={`text-sm font-semibold text-gray-500 mb-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
                                        {sidebarCollapsed ? 'Steps' : 'Build Steps'}
                                    </h3>
                                    <div className="space-y-2">
                                        {wizardSteps.map((step, index) => (
                                            <motion.button
                                                key={step.id}
                                                onClick={() => {
                                                    handleJumpToStep(index);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 ${activeSection === step.id
                                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                                    : 'hover:bg-gray-100/50 text-gray-700'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${activeSection === step.id
                                                    ? 'bg-white/20'
                                                    : index < wizardStep
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {index < wizardStep ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <span className="text-sm">{step.icon}</span>
                                                    )}
                                                </div>
                                                {!sidebarCollapsed && (
                                                    <>
                                                        <div className="flex-1 text-left">
                                                            <div className="font-medium">{step.label}</div>
                                                            {step.required && (
                                                                <div className="text-xs opacity-75">Required</div>
                                                            )}
                                                        </div>
                                                        {activeSection === step.id && (
                                                            <ChevronRight className="w-4 h-4" />
                                                        )}
                                                    </>
                                                )}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Stats Section */}
                                {!sidebarCollapsed && (
                                    <div className="p-4 border-t border-gray-200/50">
                                        <h3 className="text-sm font-semibold text-gray-500 mb-3">Resume Stats</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">ATS Score</span>
                                                <span className={`font-bold ${atsScore >= 80 ? 'text-green-600' :
                                                    atsScore >= 60 ? 'text-yellow-600' :
                                                        'text-red-600'}`}>
                                                    {atsScore}/100
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">AI Score</span>
                                                <span className="font-bold text-purple-600">{aiScore || atsScore}/100</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Completeness</span>
                                                <span className="font-bold text-blue-600">{completion}%</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* View Toggle Buttons */}
                                <div className={`p-4 border-t border-gray-200/50 ${sidebarCollapsed ? 'space-y-2' : 'grid grid-cols-3 gap-2'}`}>
                                    {['editor', 'split', 'preview'].map((view) => (
                                        <motion.button
                                            key={view}
                                            onClick={() => setActiveView(view)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`p-3 rounded-2xl flex flex-col items-center justify-center ${activeView === view
                                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                                                : 'bg-white/50 hover:bg-gray-100/50 text-gray-700'
                                                }`}
                                            title={sidebarCollapsed ? view.charAt(0).toUpperCase() + view.slice(1) : ''}
                                        >
                                            {view === 'editor' && <Edit2 className="w-5 h-5" />}
                                            {view === 'split' && <Layout className="w-5 h-5" />}
                                            {view === 'preview' && <Eye className="w-5 h-5" />}
                                            {!sidebarCollapsed && (
                                                <span className="text-xs mt-1">{view.charAt(0).toUpperCase() + view.slice(1)}</span>
                                            )}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Action Buttons */}
                                {!sidebarCollapsed && (
                                    <div className="p-4 space-y-2">
                                        <motion.button
                                            onClick={() => setShowAIPanel(true)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            AI Assistant
                                        </motion.button>
                                        <div className="grid grid-cols-2 gap-2">
                                            <motion.button
                                                onClick={() => setShowTemplateSelector(true)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="p-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-2xl hover:bg-gray-200 flex items-center justify-center gap-2"
                                            >
                                                <Palette className="w-4 h-4" />
                                                Templates
                                            </motion.button>
                                            <motion.button
                                                onClick={() => setShowExportManager(true)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="p-3 bg-gradient-to-r from-green-100 to-emerald-50 text-green-700 rounded-2xl hover:bg-green-200 flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Export
                                            </motion.button>
                                        </div>
                                    </div>
                                )}

                                {/* Collapsed View Buttons */}
                                {sidebarCollapsed && (
                                    <div className="p-4 space-y-3">
                                        <motion.button
                                            onClick={() => setShowAIPanel(true)}
                                            whileHover={{ scale: 1.1 }}
                                            className="w-full p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg"
                                            title="AI Assistant"
                                        >
                                            <Sparkles className="w-5 h-5 mx-auto" />
                                        </motion.button>
                                        <div className="space-y-2">
                                            <motion.button
                                                onClick={() => setShowTemplateSelector(true)}
                                                whileHover={{ scale: 1.1 }}
                                                className="w-full p-3 bg-gray-100 text-gray-700 rounded-2xl"
                                                title="Templates"
                                            >
                                                <Palette className="w-5 h-5 mx-auto" />
                                            </motion.button>
                                            <motion.button
                                                onClick={() => setShowExportManager(true)}
                                                whileHover={{ scale: 1.1 }}
                                                className="w-full p-3 bg-green-100 text-green-700 rounded-2xl"
                                                title="Export"
                                            >
                                                <Download className="w-5 h-5 mx-auto" />
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content Area */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Editor Area */}
                        {(activeView === 'editor' || activeView === 'split') && (
                            <div className={`${activeView === 'split' ? 'w-full lg:w-1/2' : 'w-full'} overflow-y-auto p-4 lg:p-6`}>
                                <div className="max-w-4xl mx-auto">
                                    {/* Progress Header */}
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
                                                    {wizardSteps[wizardStep].icon} {wizardSteps[wizardStep].label}
                                                </h2>
                                                <p className="text-gray-600 mt-1">
                                                    Step {wizardStep + 1} of {wizardSteps.length}
                                                </p>
                                            </div>
                                            <div className="hidden sm:flex items-center gap-3">
                                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl px-4 py-2">
                                                    <span className="text-sm font-medium text-blue-700">
                                                        {wizardStep + 1}/{wizardSteps.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Steps - Desktop */}
                                        <div className="hidden md:flex items-center justify-between mb-8">
                                            {wizardSteps.map((step, index) => (
                                                <React.Fragment key={step.id}>
                                                    <motion.button
                                                        onClick={() => handleJumpToStep(index)}
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className={`flex flex-col items-center ${index <= wizardStep ? 'text-blue-600' : 'text-gray-400'}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-lg ${index < wizardStep ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                                            index === wizardStep ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                                                'bg-gray-100 text-gray-400'
                                                            }`}>
                                                            {index < wizardStep ? (
                                                                <Check className="w-6 h-6" />
                                                            ) : (
                                                                <span className="text-lg">{step.icon}</span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-medium hidden lg:block">{step.label}</span>
                                                        <span className="text-xs lg:hidden">{step.label.substring(0, 3)}</span>
                                                    </motion.button>
                                                    {index < wizardSteps.length - 1 && (
                                                        <div className="flex-1 h-1.5 mx-4">
                                                            <div className={`h-1.5 rounded-full ${index < wizardStep ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-200'}`} />
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {/* Progress Steps - Mobile */}
                                        <div className="md:hidden mb-6">
                                            <div className="flex items-center gap-2 overflow-x-auto pb-4">
                                                {wizardSteps.map((step, index) => (
                                                    <motion.button
                                                        key={step.id}
                                                        onClick={() => handleJumpToStep(index)}
                                                        whileTap={{ scale: 0.95 }}
                                                        className={`px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap ${index === wizardStep
                                                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                                                            : index < wizardStep
                                                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >
                                                        {step.label}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Section Component */}
                                    <motion.div
                                        key={activeSection}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-200/50 p-6 lg:p-8 mb-8"
                                    >
                                        {activeSection === 'finalize' ? (
                                            <div className="py-8 lg:py-12">
                                                <div className="text-center">
                                                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-2xl">
                                                        <Check className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Resume Complete! 🎉</h3>
                                                    <p className="text-gray-600 text-lg mb-6 lg:mb-8 max-w-2xl mx-auto">
                                                        Your resume is ready to go! You can now preview, download, or continue customizing.
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                        <motion.button
                                                            onClick={() => setActiveView('preview')}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                            Preview Resume
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={() => setShowExportManager(true)}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                            Export Resume
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={handleManualSave}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-2xl hover:bg-gray-200 flex items-center justify-center gap-3 shadow-lg"
                                                        >
                                                            <SaveIcon className="w-5 h-5" />
                                                            Save & Continue
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : CurrentComponent ? (
                                            <CurrentComponent
                                                data={currentResume?.[activeSection] || {}}
                                                onUpdate={(data) => {
                                                    const updates = {};
                                                    updates[activeSection] = data;
                                                    handleUpdateResumeData(updates);
                                                }}
                                                resumeData={currentResume}
                                                onSave={handleManualSave}
                                            />
                                        ) : (
                                            <div className="py-12 text-center text-gray-500 text-lg">
                                                Select a section to start editing
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between items-center">
                                        <motion.button
                                            onClick={handlePrevStep}
                                            disabled={wizardStep === 0}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3.5 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                            Previous
                                        </motion.button>

                                        <div className="flex items-center gap-4">
                                            <motion.button
                                                onClick={handleManualSave}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="px-6 py-3.5 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl hover:bg-gray-200 flex items-center gap-3 shadow-lg"
                                            >
                                                <SaveIcon className="w-5 h-5" />
                                                Save Draft
                                            </motion.button>

                                            {wizardStep < wizardSteps.length - 1 ? (
                                                <motion.button
                                                    onClick={handleNextStep}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    Next
                                                    <ChevronRight className="w-5 h-5" />
                                                </motion.button>
                                            ) : (
                                                <motion.button
                                                    onClick={() => setActiveView('preview')}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-8 py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    Finish & Preview
                                                    <ArrowRight className="w-5 h-5" />
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Suggestions for Current Section */}
                                    {allAiSuggestions.length > 0 && activeSection !== 'finalize' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-8 bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-lg border border-purple-200/50 rounded-3xl p-6 shadow-xl"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                                                    <Brain className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 text-lg">AI Suggestions</h3>
                                                    <p className="text-sm text-gray-600">Personalized recommendations for your resume</p>
                                                </div>
                                            </div>
                                            <ul className="space-y-3">
                                                {allAiSuggestions
                                                    .filter(s => s.section === activeSection)
                                                    .slice(0, 3)
                                                    .map((suggestion, index) => (
                                                        <motion.li
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="flex items-start gap-3 text-sm p-3 bg-white/50 rounded-2xl"
                                                        >
                                                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                                            <span>{suggestion.message}</span>
                                                        </motion.li>
                                                    ))}
                                            </ul>
                                            <motion.button
                                                onClick={() => handleOptimizeSection(activeSection)}
                                                disabled={isAnalyzing}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="mt-4 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                                            >
                                                {isAnalyzing ? (
                                                    <>
                                                        <LoadingSpinner size="sm" />
                                                        Optimizing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Wand2 className="w-4 h-4" />
                                                        Apply AI Improvements
                                                    </>
                                                )}
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Preview Area */}
                        {(activeView === 'preview' || activeView === 'split') && (
                            <div className={`${activeView === 'split' ? 'w-full lg:w-1/2' : 'w-full'} border-l overflow-hidden bg-gradient-to-b from-gray-50/50 to-gray-100/30`}>
                                <div className="h-full flex flex-col">
                                    {/* Preview Controls */}
                                    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-5 py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-gray-900 text-lg">Preview</h3>
                                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 text-xs font-medium rounded-full border border-blue-200/50">
                                                {currentResume?.templateSettings?.templateName || 'modern'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {[
                                                { icon: ZoomOut, action: handleZoomOut, title: 'Zoom Out' },
                                                { icon: ZoomIn, action: handleZoomIn, title: 'Zoom In' },
                                                { icon: RotateCcw, action: handleZoomReset, title: 'Reset Zoom' },
                                                { icon: isFullScreen ? Minimize2 : Maximize2, action: toggleFullScreen, title: 'Full Screen' },
                                                { icon: Download, action: () => setShowExportManager(true), title: 'Export' }
                                            ].map((btn, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    onClick={btn.action}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-2xl transition-all duration-300"
                                                    title={btn.title}
                                                >
                                                    <btn.icon className="w-5 h-5" />
                                                </motion.button>
                                            ))}
                                            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl">
                                                <span className="text-sm font-medium text-blue-700">
                                                    {Math.round(previewZoom * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Content */}
                                    <div className="flex-1 overflow-auto p-6 lg:p-8">
                                        <div className="flex justify-center items-start h-full">
                                            <motion.div
                                                ref={previewRef}
                                                className="bg-white shadow-2xl rounded-3xl overflow-hidden"
                                                style={{
                                                    transform: `scale(${previewZoom})`,
                                                    transformOrigin: 'top center',
                                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                                whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                                            >
                                                <ResumePreview
                                                    resumeData={currentResume}
                                                    template={currentResume?.templateSettings?.templateName || 'modern'}
                                                    scale={previewZoom}
                                                />
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Preview Actions */}
                                    <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 px-5 py-4">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`px-3 py-1.5 rounded-full font-medium ${atsScore >= 80 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-700 border border-green-200/50' :
                                                    atsScore >= 60 ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-700 border border-yellow-200/50' :
                                                        'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 border border-red-200/50'}`}>
                                                    ATS Score: {atsScore}/100
                                                </div>
                                                <div className="text-sm text-gray-600 hidden sm:block">
                                                    Preview updates in real-time
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <motion.button
                                                    onClick={() => setActiveView('editor')}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-5 py-2.5 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl hover:bg-gray-200 flex items-center gap-2 shadow-lg"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Edit Resume
                                                </motion.button>
                                                <motion.button
                                                    onClick={() => setShowExportManager(true)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    Download PDF
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* AI Panel Modal */}
            <AnimatePresence>
                {showAIPanel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAIPanel(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 p-8">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                            <Brain className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold">AI Resume Assistant</h2>
                                            <p className="text-purple-100 text-lg mt-1">Get personalized suggestions and improvements</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAIPanel(false)}
                                        className="text-white hover:text-purple-200 p-2 hover:bg-white/10 rounded-2xl"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 overflow-y-auto max-h-[60vh]">
                                {/* Job Description Input */}
                                <div className="mb-8">
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Job Description (for targeted suggestions)
                                    </label>
                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description you're applying for..."
                                        className="w-full h-32 p-4 border border-gray-300/50 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                                    />
                                    <div className="mt-4 flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            {jobDescription.length} characters
                                        </span>
                                        <motion.button
                                            onClick={handleAIAnalysis}
                                            disabled={!jobDescription.trim() || isAnalyzing}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <LoadingSpinner size="sm" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Analyze Resume
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                {/* AI Suggestions */}
                                {allAiSuggestions.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="font-bold text-gray-900 text-xl mb-6">AI Suggestions</h3>
                                        <div className="space-y-4">
                                            {allAiSuggestions.slice(0, 5).map((suggestion, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 backdrop-blur-lg border border-blue-200/50 rounded-2xl p-6"
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            {suggestion.type === 'improvement' ? (
                                                                <TrendingUp className="w-6 h-6 text-blue-600" />
                                                            ) : (
                                                                <Lightbulb className="w-6 h-6 text-yellow-500" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg">{suggestion.title}</h4>
                                                            <p className="text-gray-600 mt-2">{suggestion.message}</p>
                                                            <div className="flex items-center gap-3 mt-4">
                                                                <span className="px-3 py-1.5 bg-blue-100/50 text-blue-700 text-sm rounded-full">
                                                                    {suggestion.section}
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    Priority: {suggestion.priority}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-xl mb-6">Quick Actions</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { icon: FileText, label: 'Generate Summary', desc: 'AI-powered professional summary', action: handleGenerateSummary, color: 'from-green-500 to-emerald-500' },
                                            { icon: Sparkles, label: 'Optimize Skills', desc: 'Match job requirements', action: () => handleOptimizeSection('skills'), color: 'from-blue-500 to-cyan-500' },
                                            { icon: Wand2, label: 'Improve Experience', desc: 'Enhance bullet points', action: () => handleOptimizeSection('experience'), color: 'from-purple-500 to-pink-500' },
                                            { icon: Eye, label: 'Live Preview', desc: 'Edit with real-time preview', action: () => { setShowAIPanel(false); setActiveView('split'); }, color: 'from-gray-500 to-slate-500' }
                                        ].map((action, idx) => (
                                            <motion.button
                                                key={idx}
                                                onClick={action.action}
                                                disabled={!currentResume || isAnalyzing}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`p-6 bg-gradient-to-r ${action.color}/10 border border-${action.color.split('-')[1]}-200/50 rounded-2xl hover:${action.color}/20 flex items-center gap-4`}
                                            >
                                                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center`}>
                                                    <action.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-gray-900">{action.label}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{action.desc}</div>
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 backdrop-blur-lg px-8 py-6 border-t border-gray-200/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-700 font-medium">AI Score:</span>
                                        <span className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-800 font-bold rounded-2xl">
                                            {aiScore || calculateATSScore()}/100
                                        </span>
                                    </div>
                                    <motion.button
                                        onClick={() => {
                                            setShowAIPanel(false);
                                            handleAIAnalysis();
                                        }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Re-analyze
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Export Manager Modal */}
            <AnimatePresence>
                {showExportManager && (
                    <ExportManager
                        isOpen={showExportManager}
                        onClose={() => setShowExportManager(false)}
                        resumeData={currentResume}
                        onExportComplete={() => {
                            toast.success('Resume exported successfully!');
                            setShowExportManager(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Template Selector Modal */}
            <AnimatePresence>
                {showTemplateSelector && (
                    <TemplateSelector
                        isOpen={showTemplateSelector}
                        onClose={() => setShowTemplateSelector(false)}
                        currentTemplate={currentResume?.settings?.template || 'modern'}
                        onTemplateSelect={(template) => {
                            handleUpdateResume({
                                settings: {
                                    ...currentResume?.settings,
                                    template
                                }
                            });
                            setShowTemplateSelector(false);
                            toast.success(`Template changed to ${template}`);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Floating Action Buttons */}
            <FloatingActionButtons
                onSave={handleManualSave}
                onPreview={() => setActiveView(activeView === 'preview' ? 'editor' : 'preview')}
                onSplitView={() => setActiveView(activeView === 'split' ? 'editor' : 'split')}
                onAI={() => setShowAIPanel(true)}
                onExport={() => setShowExportManager(true)}
                onTemplate={() => setShowTemplateSelector(true)}
                activeView={activeView}
                isLoading={isSaving}
            />
        </div>
    );
};
// Template Selector Component
const TemplateSelector = ({ isOpen, onClose, currentTemplate, onTemplateSelect }) => {
    const templates = [
        { id: 'modern', name: 'Modern', description: 'Clean and professional design', category: 'Professional' },
        { id: 'classic', name: 'Classic', description: 'Traditional resume format', category: 'Traditional' },
        { id: 'creative', name: 'Creative', description: 'Unique and eye-catching', category: 'Creative' },
        { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', category: 'Minimal' },
        { id: 'executive', name: 'Executive', description: 'Senior-level presentation', category: 'Professional' },
        { id: 'ats', name: 'ATS-Friendly', description: 'Optimized for applicant tracking systems', category: 'Professional' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Choose a Template</h2>
                            <p className="text-gray-600 text-lg mt-2">Select a design for your resume</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-2xl"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="p-8 overflow-y-auto max-h-[70vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className={`relative overflow-hidden rounded-3xl cursor-pointer group ${currentTemplate === template.id ? 'ring-4 ring-blue-500 ring-opacity-30' : ''}`}
                                onClick={() => onTemplateSelect(template.id)}
                            >
                                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300">
                                    <div className="text-center">
                                        <Layout className="w-14 h-14 text-gray-400 mx-auto mb-3 group-hover:text-gray-600" />
                                        <span className="font-bold text-gray-700">{template.name}</span>
                                    </div>
                                </div>
                                <div className="p-5 bg-white/80 backdrop-blur-sm">
                                    <h3 className="font-bold text-gray-900 text-lg">{template.name}</h3>
                                    <p className="text-gray-600 mt-2">{template.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                                            {template.category}
                                        </span>
                                        {currentTemplate === template.id && (
                                            <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm rounded-full flex items-center gap-2">
                                                <Check className="w-4 h-4" />
                                                Selected
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="border-t border-gray-200/50 p-8 bg-gradient-to-r from-gray-50/80 to-slate-50/80">
                    <div className="flex justify-between items-center">
                        <div className="text-gray-700">
                            Current: <span className="font-bold">{templates.find(t => t.id === currentTemplate)?.name || 'Modern'}</span>
                        </div>
                        <div className="flex gap-4">
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl hover:bg-gray-200 shadow-lg"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Apply Template
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Export Manager Component
const ExportManager = ({ isOpen, onClose, resumeData, onExportComplete }) => {
    const [exportFormat, setExportFormat] = useState('pdf');
    const [includeAtsReport, setIncludeAtsReport] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [exportQuality, setExportQuality] = useState('high');

    const handleExport = async () => {
        setIsExporting(true);
        // Simulate export process
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsExporting(false);
        onExportComplete();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md border border-white/20"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Export Resume</h2>
                            <p className="text-gray-600 mt-2">Download your resume in various formats</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-2xl"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Format Selection */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Export Format</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {['pdf', 'docx', 'txt'].map((format) => (
                                <motion.button
                                    key={format}
                                    onClick={() => setExportFormat(format)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-5 border rounded-2xl text-center ${exportFormat === format
                                        ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                                        : 'hover:bg-gray-50/50 border-gray-200'
                                        }`}
                                >
                                    <div className="font-bold text-gray-900 text-lg mb-2">
                                        {format.toUpperCase()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {format === 'pdf' && 'Best for printing'}
                                        {format === 'docx' && 'Editable format'}
                                        {format === 'txt' && 'Plain text'}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Quality Settings */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Quality Settings</h3>
                        <div className="space-y-3">
                            {['low', 'medium', 'high'].map((quality) => (
                                <motion.label
                                    key={quality}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center p-5 border border-gray-200 rounded-2xl hover:bg-gray-50/50 cursor-pointer"
                                >
                                    <input
                                        type="radio"
                                        checked={exportQuality === quality}
                                        onChange={() => setExportQuality(quality)}
                                        className="w-5 h-5 text-blue-600"
                                    />
                                    <div className="ml-4">
                                        <div className="font-bold text-gray-900">
                                            {quality.charAt(0).toUpperCase() + quality.slice(1)}
                                        </div>
                                        <div className="text-gray-600 mt-1">
                                            {quality === 'high' && 'Best quality, larger file size'}
                                            {quality === 'medium' && 'Balanced quality and size'}
                                            {quality === 'low' && 'Smallest file size'}
                                        </div>
                                    </div>
                                </motion.label>
                            ))}
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-4">Additional Options</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-5 border border-gray-200 rounded-2xl hover:bg-gray-50/50">
                                <div>
                                    <div className="font-bold text-gray-900">Include ATS Report</div>
                                    <div className="text-gray-600 mt-1">Add ATS optimization report</div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={includeAtsReport}
                                    onChange={(e) => setIncludeAtsReport(e.target.checked)}
                                    className="w-6 h-6 text-blue-600 rounded-lg"
                                />
                            </label>
                            <label className="flex items-center justify-between p-5 border border-gray-200 rounded-2xl hover:bg-gray-50/50">
                                <div>
                                    <div className="font-bold text-gray-900">Watermark Free</div>
                                    <div className="text-gray-600 mt-1">Remove watermark</div>
                                </div>
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="w-6 h-6 text-blue-600 rounded-lg"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200/50 p-8">
                    <div className="flex items-center justify-between">
                        <div className="text-gray-700">
                            <span className="font-bold">Estimated Size:</span>
                            <span className="ml-2">
                                {exportQuality === 'high' ? '2-3 MB' :
                                    exportQuality === 'medium' ? '1-2 MB' :
                                        '500 KB-1 MB'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <motion.button
                                onClick={onClose}
                                disabled={isExporting}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 text-gray-700 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl hover:bg-gray-200 disabled:opacity-50 shadow-lg"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                onClick={handleExport}
                                disabled={isExporting}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                {isExporting ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        Export Resume
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Builder; 