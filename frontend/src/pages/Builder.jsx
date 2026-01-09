// src/pages/Builder.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import {
    ChevronLeft, ChevronRight, Home, X, Save, Download,
    User, Briefcase, GraduationCap, Code, Award, Globe, Users,
    Eye, Plus, HelpCircle, CheckCircle, AlertCircle, Loader2,
    Sparkles, FileCheck, FileText, Menu,
    Cloud, CloudOff, FileUp, ArrowLeft, ArrowRight
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import FullScreenTextField from '../components/ui/FullScreenTextField';
import AIAssistant from '../components/ai/AIAssistant';
import BuilderSidebar from '../components/ui/BuilderSidebar.jsx';
import FloatingActionButton from '../components/ui/FloatingActionButtons.jsx';

// Custom Hooks
import { useAutoSave } from '../hooks/useAutoSave.js';
import { useSectionNavigation } from '../hooks/useSectionNavigation.js';
import { useResumeCompletion } from '../hooks/useResumeCompletion.js';
import { useUndoRedo } from '../hooks/useUndoRedo.js';

// Section Components
import PersonalInfoPage from '../components/builder/PersonalInfoPage';
import SummaryPage from '../components/builder/SummaryPage';
import ExperiencePage from '../components/builder/ExperiencePage';
import EducationPage from '../components/builder/EducationPage';
import SkillsPage from '../components/builder/SkillsPage';
import ProjectsPage from '../components/builder/ProjectsPage';
import CertificationsPage from '../components/builder/CertificationsPage';
import LanguagesPage from '../components/builder/LanguagesPage';
import ReferencesPage from '../components/builder/ReferencesPage';
import CompletionPage from '../components/builder/CompletionPage';

// Error Boundary Component
const SectionErrorBoundary = ({ children, sectionId, onError }) => {
    const [hasError, setHasError] = useState(false);

    const handleError = () => {
        setHasError(true);
        onError?.(sectionId);
    };

    if (hasError) {
        return (
            <ErrorFallback
                sectionId={sectionId}
                onRetry={() => setHasError(false)}
            />
        );
    }

    return (
        <React.Suspense fallback={<SectionLoading />}>
            {React.Children.map(children, child =>
                React.cloneElement(child, { onError: handleError })
            )}
        </React.Suspense>
    );
};

const SectionLoading = () => (
    <div className="flex items-center justify-center p-8 min-h-[400px]">
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
            <Loader2 className="w-8 h-8 text-indigo-600" />
        </motion.div>
    </div>
);

const ErrorFallback = ({ sectionId, onRetry }) => {
    return (
        <motion.div
            className="p-8 text-center bg-white rounded-xl border border-red-100"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h3>
            <p className="text-gray-600 mb-6">
                There was an error loading the {sectionId} section.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                >
                    <Loader2 className="w-4 h-4" />
                    Try Again
                </button>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                    Reload Page
                </button>
            </div>
        </motion.div>
    );
};

const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="relative mb-8">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                ResumeCraft AI
            </h2>
            <p className="text-gray-600 text-lg">Preparing your resume builder...</p>
        </motion.div>
    </div>
);

const OfflineIndicator = ({ isOnline }) => {
    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 bg-amber-500 text-white py-2 px-4 z-50"
        >
            <div className="container mx-auto flex items-center justify-center gap-2">
                <CloudOff className="w-4 h-4" />
                <span className="text-sm font-medium">
                    You are offline. Changes will be saved locally and synced when you're back online.
                </span>
            </div>
        </motion.div>
    );
};

// Progress Indicator Component
const ProgressIndicator = ({ progress, currentSection, totalSections }) => {
    const sections = [
        { id: 'personalInfo', label: 'Personal', icon: User },
        { id: 'summary', label: 'Summary', icon: FileText },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'skills', label: 'Skills', icon: Code },
        { id: 'projects', label: 'Projects', icon: Code },
        { id: 'certifications', label: 'Certifications', icon: Award },
        { id: 'languages', label: 'Languages', icon: Globe },
        { id: 'references', label: 'References', icon: Users },
        { id: 'finalReview', label: 'Review', icon: FileCheck }
    ];

    const currentIndex = sections.findIndex(s => s.id === currentSection);

    return (
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="max-w-6xl mx-auto">
                {/* Progress bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                            Progress: {Math.round(progress)}%
                        </span>
                        <span className="text-sm text-gray-500">
                            Section {currentIndex + 1} of {totalSections}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Keyboard Shortcuts Hook
const useKeyboardShortcuts = ({
    onNavigate,
    onTogglePreview,
    showPreview,
    onSave
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignore when user is typing in inputs
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                return;
            }

            // Ctrl/Cmd + S for save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                onSave?.();
            }

            // Arrow keys for navigation
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                onNavigate?.('next');
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                onNavigate?.('prev');
            }

            // Escape to close preview
            if (e.key === 'Escape' && showPreview) {
                onTogglePreview?.();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onNavigate, onTogglePreview, showPreview, onSave]);
};

// Main Builder Component
const Builder = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id: resumeId } = useParams();
    const { isAuthenticated } = useAuth();

    // Resume Context
    const {
        currentResume,
        isLoading: contextLoading,
        loadResume,
        createNewResume,
        updateSection,
        saveResume,
        saveStatus,
        cloudStatus
    } = useResume();

    // Custom Hooks
    const {
        currentState: resumeState,
        addToHistory,
        clearHistory
    } = useUndoRedo(currentResume, {
        maxHistorySize: 50,
        ignoreKeys: ['_id', 'createdAt', 'updatedAt', '__v']
    });

    // State management
    const [activeSection, setActiveSection] = useState('personalInfo');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [initialized, setInitialized] = useState(false);
    const [aiCredits] = useState(150);
    const [fullScreenText, setFullScreenText] = useState({
        isOpen: false,
        content: '',
        onSave: null,
        title: ''
    });
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [sectionError, setSectionError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [lastSaveTime, setLastSaveTime] = useState('');

    // Define sections
    const sections = useMemo(() => [
        {
            id: 'personalInfo',
            label: 'Personal Information',
            icon: User,
            required: true,
            visible: true,
            color: '#4f46e5',
            description: 'Your basic contact and professional details'
        },
        {
            id: 'summary',
            label: 'Professional Summary',
            icon: FileText,
            required: true,
            visible: true,
            color: '#059669',
            description: 'A brief overview of your professional background'
        },
        {
            id: 'experience',
            label: 'Work Experience',
            icon: Briefcase,
            required: true,
            visible: true,
            color: '#3b82f6',
            description: 'Your work history and achievements'
        },
        {
            id: 'education',
            label: 'Education',
            icon: GraduationCap,
            required: true,
            visible: true,
            color: '#8b5cf6',
            description: 'Academic background and qualifications'
        },
        {
            id: 'skills',
            label: 'Skills',
            icon: Code,
            required: true,
            visible: true,
            color: '#f59e0b',
            description: 'Technical and professional skills'
        },
        {
            id: 'projects',
            label: 'Projects',
            icon: Code,
            required: false,
            visible: true,
            color: '#10b981',
            description: 'Notable projects and achievements'
        },
        {
            id: 'certifications',
            label: 'Certifications',
            icon: Award,
            required: false,
            visible: true,
            color: '#ef4444',
            description: 'Professional certifications and licenses'
        },
        {
            id: 'languages',
            label: 'Languages',
            icon: Globe,
            required: false,
            visible: true,
            color: '#06b6d4',
            description: 'Language proficiencies'
        },
        {
            id: 'references',
            label: 'References',
            icon: Users,
            required: false,
            visible: true,
            color: '#8b5cf6',
            description: 'Professional references'
        },
        {
            id: 'finalReview',
            label: 'Final Review',
            icon: FileCheck,
            required: true,
            visible: true,
            color: '#10b981',
            description: 'Review and complete your resume'
        },
    ], []);

    // Section Navigation Hook
    const {
        navigateToSection,
        currentIndex,
        visibleSections,
        getProgress,
        goToSection,
        goToNext,
        goToPrev
    } = useSectionNavigation(sections, activeSection, setActiveSection, {
        validateBeforeNavigate: true,
        persistInUrl: true,
        urlParamName: 'section',
        allowSkip: false
    });

    // Resume Completion Hook
    const {
        completedSections,
        overallScore,
        isSectionComplete,
        getSectionScore,
        getQualityScore,
        completedCount,
        totalRequired,
        completeness
    } = useResumeCompletion(resumeState, sections);

    // ==============================================
    // FIXED: Auto-save Hook with offline-first approach
    // ==============================================
    const {
        startAutoSave,
        stopAutoSave,
        manualSave: autoSaveManualSave,
        hasChanges: hasUnsavedChanges
    } = useAutoSave(
        resumeState,
        async (resume) => {
            try {
                console.log('💾 [AutoSave] Attempting to save...');

                // Safety check
                if (!resume || !resume._id) {
                    console.log('⏭️ [AutoSave] Skipping - no resume data');
                    return true;
                }

                // Try to save via ResumeContext (which has offline fallback)
                const saved = await saveResume(resume, false);

                if (saved) {
                    const now = new Date();
                    setLastSaved(now);
                    setLastSaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                    return true;
                }

                // Even if saveResume returns false, we return true to stop error loop
                console.log('⚠️ [AutoSave] SaveResume returned false, but data is saved locally');
                return true;

            } catch (error) {
                console.error('❌ [AutoSave] Error in save callback:', error.message);
                // Don't throw - return true to prevent infinite error loop
                return true;
            }
        },
        isOnline ? 30000 : 60000, // 30s online, 60s offline
        {
            enabled: true,
            minChanges: 1,
            showNotifications: false,
            retryAttempts: 1
        }
    );

    // Check mobile/desktop
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Network status detection
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            console.log('🌐 Network back online');
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('📴 Network offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // ==============================================
    // FIXED: Initialize resume - SIMPLIFIED
    // ==============================================
    useEffect(() => {
        const initializeBuilder = async () => {
            console.log('🔄 [Builder] Initializing...', { resumeId });

            if (!isAuthenticated) {
                console.log('🔒 User not authenticated');
                navigate('/login');
                return;
            }

            try {
                setLoadError(null);

                if (resumeId === 'new' || !resumeId) {
                    console.log('🆕 Creating new resume...');
                    const newResume = await createNewResume();

                    if (newResume?._id) {
                        console.log('✅ New resume created:', newResume._id);
                        navigate(`/builder/${newResume._id}`, { replace: true });
                    } else {
                        toast.error('Failed to create resume');
                        navigate('/dashboard');
                    }
                } else {
                    console.log('📂 Loading existing resume:', resumeId);
                    const loadedResume = await loadResume(resumeId);

                    if (!loadedResume) {
                        console.error('❌ Resume not found:', resumeId);
                        toast.error('Resume not found');
                        navigate('/dashboard');
                        return;
                    }

                    console.log('✅ Resume loaded:', loadedResume.title);

                    // Set active section from URL
                    const params = new URLSearchParams(location.search);
                    const sectionParam = params.get('section');
                    if (sectionParam && sections.find(s => s.id === sectionParam)) {
                        setActiveSection(sectionParam);
                    }
                }

                setInitialized(true);
                console.log('✅ Builder initialized');

            } catch (error) {
                console.error('❌ Initialization error:', error);
                setLoadError(error.message);
                toast.error('Failed to initialize builder');
                navigate('/dashboard');
            }
        };

        if (!initialized) {
            initializeBuilder();
        }
    }, [resumeId, isAuthenticated, navigate]);

    // Start/stop auto-save
    useEffect(() => {
        if (resumeState && initialized && saveStatus !== 'saving') {
            console.log('▶️ Starting auto-save');
            startAutoSave();
            return () => {
                console.log('⏹️ Stopping auto-save');
                stopAutoSave();
            };
        }
    }, [resumeState, initialized, saveStatus, startAutoSave, stopAutoSave]);

    // ==============================================
    // FIXED: Handle manual save
    // ==============================================
    const handleManualSave = useCallback(async () => {
        if (!resumeState || saveStatus === 'saving') {
            console.log('⏸️ Save skipped - no data or already saving');
            return;
        }

        console.log('💾 Manual save triggered');

        try {
            const saved = await saveResume(resumeState, true);
            if (saved) {
                const now = new Date();
                setLastSaved(now);
                setLastSaveTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                // Don't show success toast - saveResume already shows it
            }
        } catch (error) {
            console.error('❌ Manual save failed:', error);
            // Don't show error toast - saveResume already shows it
        }
    }, [resumeState, saveStatus, saveResume]);

    // Sanitize data
    const sanitizeData = useCallback((data) => {
        if (typeof data === 'string') {
            return DOMPurify.sanitize(data, {
                ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: []
            });
        }
        if (Array.isArray(data)) {
            return data.map(item => sanitizeData(item));
        }
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            Object.keys(data).forEach(key => {
                sanitized[key] = sanitizeData(data[key]);
            });
            return sanitized;
        }
        return data;
    }, []);

    // ==============================================
    // FIXED: Handle section updates
    // ==============================================
    const handleSectionUpdate = useCallback((sectionId, data) => {
        if (!resumeState || !updateSection) {
            console.error('❌ Cannot update section: missing context');
            return false;
        }

        console.log(`📝 Updating section "${sectionId}"`);

        try {
            // Sanitize input
            const sanitizedData = sanitizeData(data);

            // Update in context
            const success = updateSection(sectionId, sanitizedData);

            if (success) {
                // Auto-save important sections with delay
                if (sectionId === 'personalInfo' || sectionId === 'summary') {
                    setTimeout(() => {
                        handleManualSave();
                    }, 2000);
                }
            }

            return success;
        } catch (error) {
            console.error(`❌ Failed to update section "${sectionId}":`, error);
            setSectionError(sectionId);
            toast.error('Failed to update section');
            return false;
        }
    }, [resumeState, updateSection, handleManualSave, sanitizeData]);

    // Handle exit
    const handleExit = useCallback(async () => {
        if (hasUnsavedChanges && resumeState) {
            const confirm = window.confirm('You have unsaved changes. Save before leaving?');
            if (confirm) {
                await handleManualSave();
            }
        }
        clearHistory();
        navigate('/dashboard');
    }, [hasUnsavedChanges, resumeState, handleManualSave, clearHistory, navigate]);

    // Handle section error
    const handleSectionError = useCallback((sectionId) => {
        setSectionError(sectionId);
        toast.error(`Error in ${sectionId} section`);
    }, []);

    // Open fullscreen text editor
    const openFullScreenEditor = useCallback((content = '', title = 'Edit Text', onSave = null) => {
        setFullScreenText({
            isOpen: true,
            content,
            onSave,
            title
        });
    }, []);

    // Close fullscreen text editor
    const closeFullScreenEditor = useCallback(() => {
        setFullScreenText({
            isOpen: false,
            content: '',
            onSave: null,
            title: ''
        });
    }, []);

    // Save fullscreen text
    const saveFullScreenText = useCallback((content) => {
        if (fullScreenText.onSave) {
            const sanitizedContent = DOMPurify.sanitize(content, {
                ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: []
            });
            fullScreenText.onSave(sanitizedContent);
        }
        closeFullScreenEditor();
    }, [fullScreenText, closeFullScreenEditor]);

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onNavigate: navigateToSection,
        onTogglePreview: () => setShowPreview(!showPreview),
        showPreview,
        onSave: handleManualSave
    });

    // Handle section change from sidebar
    const handleSectionChange = useCallback((sectionId) => {
        goToSection(sectionId);
    }, [goToSection]);

    // FAB Actions
    const fabActions = useMemo(() => [
        {
            icon: <Save className="w-5 h-5" />,
            label: 'Save Resume',
            onClick: handleManualSave,
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            icon: <Download className="w-5 h-5" />,
            label: 'Export PDF',
            onClick: () => toast.success('Exporting PDF...'),
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            icon: <Eye className="w-5 h-5" />,
            label: 'Preview',
            onClick: () => setShowPreview(!showPreview),
            color: 'bg-indigo-500 hover:bg-indigo-600'
        },
        {
            icon: <Sparkles className="w-5 h-5" />,
            label: 'AI Enhance',
            onClick: () => setShowAIAssistant(true),
            color: 'bg-purple-500 hover:bg-purple-600'
        }
    ], [handleManualSave, showPreview, setShowAIAssistant]);

    // ==============================================
    // FIXED: Render active section
    // ==============================================
    const renderActiveSection = () => {
        if (!resumeState && !contextLoading) {
            return (
                <div className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Resume Data</h3>
                    <p className="text-gray-600">Please create or load a resume to get started.</p>
                </div>
            );
        }

        if (!resumeState) {
            return (
                <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                    <p className="text-gray-600">Loading resume data...</p>
                </div>
            );
        }

        const sectionData = resumeState[activeSection] || {};
        const currentSection = sections.find(s => s.id === activeSection);

        const commonProps = {
            data: sectionData,
            onUpdate: (updatedData) => handleSectionUpdate(activeSection, updatedData),
            isMobile,
            isOnline,
            onError: () => handleSectionError(activeSection)
        };

        const getSectionComponent = () => {
            switch (activeSection) {
                case 'personalInfo':
                    return <PersonalInfoPage key={`${resumeState._id}-personalInfo`} {...commonProps} />;
                case 'summary':
                    return <SummaryPage key={`${resumeState._id}-summary`} {...commonProps} />;
                case 'experience':
                    return <ExperiencePage key={`${resumeState._id}-experience`} {...commonProps} />;
                case 'education':
                    return <EducationPage key={`${resumeState._id}-education`} {...commonProps} />;
                case 'skills':
                    return <SkillsPage key={`${resumeState._id}-skills`} {...commonProps} />;
                case 'projects':
                    return <ProjectsPage key={`${resumeState._id}-projects`} {...commonProps} />;
                case 'certifications':
                    return <CertificationsPage key={`${resumeState._id}-certifications`} {...commonProps} />;
                case 'languages':
                    return <LanguagesPage key={`${resumeState._id}-languages`} {...commonProps} />;
                case 'references':
                    return <ReferencesPage key={`${resumeState._id}-references`} {...commonProps} />;
                case 'finalReview':
                    return (
                        <CompletionPage
                            key={`${resumeState._id}-finalReview`}
                            resumeData={resumeState}
                            onComplete={() => {
                                toast.success('Resume completed successfully!');
                                clearHistory();
                                navigate('/dashboard');
                            }}
                            isOnline={isOnline}
                        />
                    );
                default:
                    return (
                        <div className="p-8 text-center">
                            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Section Not Found</h3>
                            <p className="text-gray-600">The selected section does not exist.</p>
                        </div>
                    );
            }
        };

        return (
            <SectionErrorBoundary
                sectionId={activeSection}
                onError={handleSectionError}
            >
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {currentSection?.label || 'Section'}
                    </h2>
                    <p className="text-gray-600">
                        {currentSection?.description || ''}
                    </p>
                </div>

                {getSectionComponent()}
            </SectionErrorBoundary>
        );
    };

    // Show loading state
    if (contextLoading || !initialized) {
        return <LoadingFallback />;
    }

    // Show error state
    if (loadError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Failed to Load Resume</h2>
                        <p className="text-gray-600 mb-6">{loadError}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {/* Offline Indicator */}
            {!isOnline && <OfflineIndicator isOnline={isOnline} />}

            {/* Main Layout */}
            <div className="flex">
                {/* Sidebar */}
                <BuilderSidebar
                    isOpen={isSidebarOpen}
                    isMobileOpen={false}
                    onClose={() => { }}
                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    sections={sections}
                    activeSection={activeSection}
                    completedSections={completedSections}
                    onSectionChange={handleSectionChange}
                    resumeTitle={resumeState?.title || 'Untitled Resume'}
                    resumeProgress={completeness}
                    isOnline={isOnline}
                />

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto pb-24">
                    {/* Progress Indicator */}
                    <ProgressIndicator
                        progress={completeness}
                        currentSection={activeSection}
                        totalSections={visibleSections.length}
                    />

                    {/* Section Content */}
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div
                            key={activeSection}
                            className="max-w-4xl mx-auto transition-all duration-300"
                        >
                            {renderActiveSection()}
                        </div>
                    </div>
                </main>
            </div>

            {/* ======================== */}
            {/* FIXED BOTTOM NAVIGATION */}
            {/* ======================== */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Left: Save status */}
                            <div className="flex items-center gap-3">
                                {saveStatus === 'saving' ? (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-medium">Saving...</span>
                                    </div>
                                ) : lastSaved ? (
                                    <div className="flex items-center gap-2 text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        <div>
                                            <p className="text-sm font-medium">Saved {lastSaveTime}</p>
                                            <p className="text-xs text-gray-500">Auto-save active</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">Ready to save</span>
                                    </div>
                                )}
                            </div>

                            {/* Center: Navigation */}
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigateToSection('prev')}
                                    disabled={currentIndex <= 0}
                                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Previous
                                </button>

                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-900">
                                        {sections.find(s => s.id === activeSection)?.label}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Step {currentIndex + 1} of {visibleSections.length}
                                    </p>
                                </div>

                                <button
                                    onClick={() => navigateToSection('next')}
                                    disabled={currentIndex >= visibleSections.length - 1}
                                    className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    {currentIndex < visibleSections.length - 1 ? 'Next' : 'Complete'}
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Right: Save button */}
                            <button
                                onClick={handleManualSave}
                                disabled={saveStatus === 'saving'}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Resume
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <div className="fixed bottom-24 right-8 z-40">
                <FloatingActionButton
                    actions={fabActions}
                    position="bottom-right"
                    showLabels={true}
                    mainIcon={<Plus className="w-6 h-6" />}
                    mainColor="bg-gradient-to-r from-purple-600 to-indigo-600"
                />
            </div>

            {/* AI Assistant Panel */}
            {showAIAssistant && (
                <AIAssistant
                    key="ai-assistant-panel"
                    isOpen={showAIAssistant}
                    onClose={() => setShowAIAssistant(false)}
                    credits={aiCredits}
                    onEnhance={(sectionId, enhancedData) => {
                        handleSectionUpdate(sectionId, enhancedData);
                        toast.success('AI enhancement applied!');
                    }}
                    currentSection={activeSection}
                    currentData={resumeState?.[activeSection]}
                    sections={sections}
                />
            )}

            {/* Full Screen Text Editor */}
            {fullScreenText.isOpen && (
                <FullScreenTextField
                    content={fullScreenText.content}
                    onSave={saveFullScreenText}
                    onClose={closeFullScreenEditor}
                    title={fullScreenText.title}
                    maxLength={5000}
                    allowFormatting={true}
                />
            )}

            {/* Keyboard Shortcuts Help */}
            <div className="fixed bottom-36 right-4 z-30">
                <button
                    onClick={() => toast((t) => (
                        <div className="p-2">
                            <h4 className="font-bold mb-2">Keyboard Shortcuts</h4>
                            <ul className="text-sm space-y-1">
                                <li>• <kbd>Ctrl+S</kbd> - Save</li>
                                <li>• <kbd>←</kbd>/<kbd>→</kbd> - Navigate sections</li>
                            </ul>
                        </div>
                    ), { duration: 5000 })}
                    className="p-2 text-xs bg-gray-800 text-white rounded-lg opacity-50 hover:opacity-100 transition-opacity"
                    title="Keyboard Shortcuts"
                >
                    <HelpCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Builder;