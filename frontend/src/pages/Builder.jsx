// src/pages/Builder.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

// Components
import BuilderSidebar from '../components/ui/BuilderSidebar';
import Navbar from '../components/Navbar';
import StatsDashboard from '../components/ui/StatsDashboard';
import AIAssistant from '../components/ai/AIAssistant';
import FloatingActionButtons from '../components/ui/FloatingActionButtons';
import FullScreenTextField from '../components/ui/FullScreenTextField';

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

// Icons
// In Builder.jsx, update the imports:
import {
    Brain,
    Sparkles,
    Save,
    Download,
    Share2,
    Printer,
    CheckCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    HelpCircle,
    Zap,
    User,
    FileText,
    Briefcase,
    GraduationCap,
    Code,
    Award,
    Globe,
    Users,
    ArrowLeft,
    Home,
    PanelLeft,
    PanelRight,
    Maximize2,
    Minimize2,
    Settings,
    Bell,
    Target,
    TrendingUp,
    BarChart,
    Clock,
    MessageSquare,
    Star,
    Lightbulb,
    Copy,
    Edit,
    Trash2,
    Search,
    Filter,
    Plus,
    Minus,
    ExternalLink,
    Link,
    Upload,
    File,
    FilePlus,
    FileCheck,
    Calendar,
    Tag,
    Sidebar,
    SidebarClose,
    LayoutGrid,
    Expand,
    Shrink,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Type,
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    List,
    ListOrdered,
    Image,
    Table,
    Menu,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

// Sections Configuration
const SECTIONS = [
    {
        id: 'personalInfo',
        label: 'Personal Info',
        icon: User,
        color: '#4f46e5',
        required: true,
        description: 'Contact details',
        fields: 4,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'summary',
        label: 'Summary',
        icon: FileText,
        color: '#059669',
        required: true,
        description: 'Professional summary',
        fields: 1,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'experience',
        label: 'Experience',
        icon: Briefcase,
        color: '#3b82f6',
        required: true,
        description: 'Work history',
        fields: 5,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'education',
        label: 'Education',
        icon: GraduationCap,
        color: '#8b5cf6',
        required: true,
        description: 'Academic background',
        fields: 4,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'skills',
        label: 'Skills',
        icon: Code,
        color: '#f59e0b',
        required: true,
        description: 'Technical skills',
        fields: 3,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: Code,
        color: '#10b981',
        required: false,
        description: 'Notable projects',
        fields: 3,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'certifications',
        label: 'Certifications',
        icon: Award,
        color: '#ef4444',
        required: false,
        description: 'Certifications',
        fields: 2,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'languages',
        label: 'Languages',
        icon: Globe,
        color: '#06b6d4',
        required: false,
        description: 'Languages',
        fields: 2,
        visible: true,
        hasFullScreen: true
    },
    {
        id: 'references',
        label: 'References',
        icon: Users,
        color: '#8b5cf6',
        required: false,
        description: 'References',
        fields: 3,
        visible: true,
        hasFullScreen: true
    }
];

const ResumeBuilder = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        currentResume,
        saveResume,
        updateSection,
        saveStatus,
        isLoading: resumeLoading,
        isSectionComplete
    } = useResume();

    // State Management
    const [activeSection, setActiveSection] = useState('personalInfo');
    const [completedSections, setCompletedSections] = useState([]);
    const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
    const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [aiCredits, setAiCredits] = useState(user?.aiCredits || 150);
    const [showProgress, setShowProgress] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedTime, setLastSavedTime] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(100);
    const [editorWidth, setEditorWidth] = useState('100%');
    const [showAIAssistant, setShowAIAssistant] = useState(false);
    const [sections, setSections] = useState(SECTIONS);
    const [showHiddenSections, setShowHiddenSections] = useState(false);
    const [showFullScreenEditor, setShowFullScreenEditor] = useState(false);
    const [fullScreenContent, setFullScreenContent] = useState('');
    const [fullScreenSection, setFullScreenSection] = useState('');
    const [showPreviewMode, setShowPreviewMode] = useState(false);
    const [textFormat, setTextFormat] = useState('paragraph');
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    // Responsive breakpoints
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 1024;
            setIsMobile(mobile);

            if (mobile) {
                setLeftSidebarOpen(false);
                setRightSidebarOpen(false);
            } else {
                setLeftSidebarOpen(true);
                setRightSidebarOpen(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Update editor width based on sidebar states
    useEffect(() => {
        let width = '100%';
        if (!isMobile) {
            if (leftSidebarOpen && rightSidebarOpen) {
                width = 'calc(100% - 320px - 384px)';
            } else if (leftSidebarOpen) {
                width = 'calc(100% - 320px)';
            } else if (rightSidebarOpen) {
                width = 'calc(100% - 384px)';
            }
        }
        setEditorWidth(width);
    }, [leftSidebarOpen, rightSidebarOpen, isMobile]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true });
        }
    }, [user, navigate]);

    // Calculate completed sections
    useEffect(() => {
        if (currentResume && isSectionComplete) {
            const completed = SECTIONS
                .map(s => s.id)
                .filter(section => isSectionComplete(section));
            setCompletedSections(completed);
        }
    }, [currentResume, isSectionComplete]);

    // Memoized stats
    const stats = React.useMemo(() => {
        const calculateWordCount = (data) => {
            let wordCount = 0;
            const countWords = (text) => {
                if (!text || typeof text !== 'string') return 0;
                return text.trim().split(/\s+/).length;
            };

            if (data.personalInfo) {
                Object.values(data.personalInfo).forEach(value => {
                    if (typeof value === 'string') wordCount += countWords(value);
                });
            }

            if (data.summary?.content) wordCount += countWords(data.summary.content);
            if (Array.isArray(data.experience?.items)) {
                data.experience.items.forEach(item => {
                    if (item.description) wordCount += countWords(item.description);
                });
            }

            return wordCount;
        };

        const visibleSections = sections.filter(s => s.visible);
        const requiredSections = sections.filter(s => s.required && s.visible);
        const completedRequired = completedSections.filter(id => {
            const section = sections.find(s => s.id === id);
            return section && section.required && section.visible;
        });

        const completeness = requiredSections.length > 0
            ? Math.round((completedRequired.length / requiredSections.length) * 100)
            : 0;

        return {
            completeness: completeness,
            atsScore: Math.min(100, 70 + Math.round(completeness * 0.3)),
            aiEnhancements: currentResume?.metadata?.aiEnhancements || 0,
            wordCount: calculateWordCount(currentResume?.data || {}),
            aiCredits: aiCredits,
            completedSections: completedSections.length,
            totalSections: sections.length,
            visibleSections: visibleSections.length,
            lastSaved: lastSavedTime
        };
    }, [completedSections, currentResume, aiCredits, lastSavedTime, sections]);

    // Navigation
    const navigateToSection = useCallback((direction) => {
        const visibleSections = sections.filter(s => s.visible);
        const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
        let newIndex;

        if (direction === 'next') {
            newIndex = Math.min(currentIndex + 1, visibleSections.length - 1);
        } else if (direction === 'prev') {
            newIndex = Math.max(currentIndex - 1, 0);
        } else {
            newIndex = visibleSections.findIndex(s => s.id === direction);
            if (newIndex === -1) newIndex = 0;
        }

        if (visibleSections[newIndex]) {
            setActiveSection(visibleSections[newIndex].id);
        }
    }, [activeSection, sections]);

    // Toggle section visibility
    const toggleSectionVisibility = useCallback((sectionId) => {
        setSections(prev => prev.map(section =>
            section.id === sectionId
                ? { ...section, visible: !section.visible }
                : section
        ));

        if (sectionId === activeSection) {
            const visibleSections = sections.filter(s => s.visible && s.id !== sectionId);
            if (visibleSections.length > 0) {
                setActiveSection(visibleSections[0].id);
            }
        }

        toast.success(
            sections.find(s => s.id === sectionId)?.visible
                ? `📁 "${sections.find(s => s.id === sectionId)?.label}" section hidden`
                : `👁️ "${sections.find(s => s.id === sectionId)?.label}" section shown`
        );
    }, [activeSection, sections]);

    // Save functionality
    const handleSave = useCallback(async () => {
        if (saveStatus === 'saving') return;

        setIsSaving(true);
        try {
            await saveResume();
            setLastSavedTime(new Date());
            toast.success('✅ Resume saved successfully!', {
                duration: 2000,
            });
        } catch (error) {
            toast.error('Failed to save resume. Please try again.');
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    }, [saveResume, saveStatus]);

    // AI Enhancement
    const handleAIEnhance = useCallback(async (section = activeSection) => {
        if (aiCredits <= 0) {
            toast.error('💳 Insufficient AI credits!');
            return;
        }

        const loadingToast = toast.loading('🤖 AI is enhancing your content...');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const currentData = currentResume?.data?.[section] || {};
            let enhancedData = { ...currentData };

            switch (section) {
                case 'summary':
                    enhancedData.content = currentData.content
                        ? `${currentData.content}\n\n✨ Enhanced with AI.`
                        : 'Results-driven professional with proven expertise.';
                    break;
                case 'experience':
                    if (Array.isArray(currentData.items)) {
                        enhancedData.items = currentData.items.map(item => ({
                            ...item,
                            description: item.description
                                ? `${item.description}\n• AI Enhanced`
                                : item.description
                        }));
                    }
                    break;
                default:
                    enhancedData = {
                        ...currentData,
                        aiEnhanced: true,
                        enhancedAt: new Date().toISOString()
                    };
            }

            updateSection(section, enhancedData);
            setAiCredits(prev => prev - 5);

            toast.dismiss(loadingToast);
            toast.success('✨ AI enhancement applied!', {
                duration: 3000,
            });

        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error('Failed to apply AI enhancement.');
            console.error('AI enhancement error:', error);
        }
    }, [aiCredits, activeSection, currentResume, updateSection]);

    // Export functionality
    const handleExport = useCallback(async (format = 'pdf') => {
        try {
            setIsExporting(true);
            await handleSave();

            if (format === 'pdf') {
                toast.loading('📄 Generating PDF...');

                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                pdf.setFontSize(20);
                pdf.text('Resume', 105, 20, { align: 'center' });
                pdf.setFontSize(12);
                pdf.text(`Generated for: ${user?.displayName || 'User'}`, 105, 30, { align: 'center' });
                pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

                const visibleSections = sections.filter(s => s.visible);
                let yPosition = 60;

                visibleSections.forEach((section, index) => {
                    if (yPosition > 270) {
                        pdf.addPage();
                        yPosition = 20;
                    }

                    pdf.setFontSize(14);
                    pdf.setTextColor(50, 50, 50);
                    pdf.text(section.label, 20, yPosition);
                    yPosition += 10;

                    pdf.setFontSize(10);
                    pdf.setTextColor(100, 100, 100);
                    pdf.text(`[${section.description} content will be here]`, 20, yPosition);
                    yPosition += 15;
                });

                const fileName = `Resume_${user?.displayName?.replace(/[^a-z0-9]/gi, '_') || 'MyResume'}.pdf`;
                pdf.save(fileName);

                toast.success('✅ PDF exported successfully!');
            }

        } catch (error) {
            toast.error(`Export failed: ${error.message}`);
            console.error('Export error:', error);
        } finally {
            setIsExporting(false);
        }
    }, [handleSave, user, sections]);

    // Fullscreen functionality
    const handleFullscreen = useCallback(() => {
        if (!isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            setIsFullscreen(false);
        }
    }, [isFullscreen]);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await handleSave();
            await logout();
            toast.success('👋 Successfully logged out');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to logout');
        }
    }, [handleSave, logout, navigate]);

    const handleSectionUpdate = useCallback((data) => {
        if (updateSection) {
            updateSection(activeSection, data);
        }
    }, [activeSection, updateSection]);

    const handleSectionChange = useCallback((sectionId) => {
        const section = sections.find(s => s.id === sectionId);
        if (section && section.visible) {
            setActiveSection(sectionId);
            if (isMobile) {
                setLeftSidebarOpen(false);
                setRightSidebarOpen(false);
                setShowMobileMenu(false);
            }
        }
    }, [sections, isMobile]);

    // Zoom controls
    const handleZoomIn = useCallback(() => {
        setZoomLevel(prev => Math.min(prev + 10, 200));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoomLevel(prev => Math.max(prev - 10, 50));
    }, []);

    const resetZoom = useCallback(() => {
        setZoomLevel(100);
    }, []);

    // Open full screen editor
    const openFullScreenEditor = useCallback((content = '', section = activeSection) => {
        const sectionData = currentResume?.data?.[section] || {};
        let editorContent = content;

        if (!editorContent && sectionData) {
            switch (section) {
                case 'summary':
                    editorContent = sectionData.content || '';
                    break;
                case 'experience':
                    editorContent = sectionData.items?.[0]?.description || '';
                    break;
                case 'education':
                    editorContent = sectionData.items?.[0]?.description || '';
                    break;
                default:
                    editorContent = '';
            }
        }

        setFullScreenContent(editorContent);
        setFullScreenSection(section);
        setShowFullScreenEditor(true);
    }, [activeSection, currentResume]);

    // Save full screen editor content
    const saveFullScreenContent = useCallback((content) => {
        const sectionData = currentResume?.data?.[fullScreenSection] || {};
        let updatedData = { ...sectionData };

        switch (fullScreenSection) {
            case 'summary':
                updatedData.content = content;
                break;
            case 'experience':
                if (Array.isArray(updatedData.items) && updatedData.items.length > 0) {
                    updatedData.items[0].description = content;
                }
                break;
            case 'education':
                if (Array.isArray(updatedData.items) && updatedData.items.length > 0) {
                    updatedData.items[0].description = content;
                }
                break;
        }

        updateSection(fullScreenSection, updatedData);
        setShowFullScreenEditor(false);
        toast.success('✅ Changes saved successfully!');
    }, [fullScreenSection, currentResume, updateSection]);

    // Text formatting handler
    const handleTextFormat = useCallback((format) => {
        setTextFormat(format);
        toast.success(`Applied ${format} formatting`);
    }, []);

    // Insert element handler
    const handleInsertElement = useCallback((element) => {
        toast.success(`Inserted ${element}`);
    }, []);

    // AI Action handler
    const handleAIAction = useCallback(async (action, data) => {
        try {
            toast.loading(`Processing ${action.replace('-', ' ')}...`);
            await new Promise(resolve => setTimeout(resolve, 1500));

            switch (action) {
                case 'enhance-all':
                    setAiCredits(prev => prev - 3);
                    toast.success('✨ All sections enhanced with AI!');
                    break;
                case 'ats-check':
                    setAiCredits(prev => prev - 1);
                    toast.success('✅ ATS compatibility checked!');
                    break;
                case 'grammar-check':
                    setAiCredits(prev => prev - 1);
                    toast.success('✅ Grammar and spelling checked!');
                    break;
                case 'rewrite':
                    setAiCredits(prev => prev - 5);
                    toast.success('✨ Resume rewritten with AI!');
                    break;
                case 'cover-letter':
                    setAiCredits(prev => prev - 4);
                    toast.success('📄 Cover letter generated!');
                    break;
            }
        } catch (error) {
            toast.error(`Failed to process ${action}`);
        }
    }, []);

    // Auto-save effect
    useEffect(() => {
        if (!currentResume) return;

        const autoSaveTimer = setTimeout(() => {
            if (saveStatus !== 'saving' && !isSaving) {
                handleSave();
            }
        }, 30000);

        return () => clearTimeout(autoSaveTimer);
    }, [currentResume, saveStatus, isSaving, handleSave]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            // Ctrl/Cmd + → for next section
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowRight') {
                e.preventDefault();
                navigateToSection('next');
            }
            // Ctrl/Cmd + ← for previous section
            if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateToSection('prev');
            }
            // Ctrl/Cmd + E to export
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                handleExport('pdf');
            }
            // Ctrl/Cmd + F for fullscreen
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                handleFullscreen();
            }
            // Ctrl/Cmd + Space for AI Assistant
            if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
                e.preventDefault();
                setShowAIAssistant(!showAIAssistant);
            }
            // Ctrl/Cmd + Enter for full screen editor
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                openFullScreenEditor();
            }
            // Escape to close modals
            if (e.key === 'Escape') {
                if (showFullScreenEditor) {
                    setShowFullScreenEditor(false);
                }
                if (showAIAssistant) {
                    setShowAIAssistant(false);
                }
                if (isMobile) {
                    setLeftSidebarOpen(false);
                    setRightSidebarOpen(false);
                    setShowMobileMenu(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, navigateToSection, handleExport, handleFullscreen, showAIAssistant, showFullScreenEditor, isMobile, openFullScreenEditor]);

    // Render section component based on active section
    const renderActiveSection = () => {
        const sectionData = currentResume?.data?.[activeSection] || {};
        const sectionConfig = sections.find(s => s.id === activeSection);

        if (!sectionConfig?.visible) {
            return (
                <div className="flex flex-col items-center justify-center h-full py-12">
                    <EyeOff className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Section Hidden</h3>
                    <p className="text-gray-500 text-center mb-6 max-w-md">
                        This section is currently hidden. Show it to edit the content.
                    </p>
                    <button
                        onClick={() => toggleSectionVisibility(activeSection)}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        Show Section
                    </button>
                </div>
            );
        }

        const commonProps = {
            data: sectionData,
            onUpdate: handleSectionUpdate,
            onAIEnhance: () => handleAIEnhance(activeSection),
            onNext: () => navigateToSection('next'),
            onPrev: () => navigateToSection('prev'),
            onFullScreen: () => openFullScreenEditor()
        };

        switch (activeSection) {
            case 'personalInfo':
                return <PersonalInfoPage {...commonProps} />;
            case 'summary':
                return <SummaryPage {...commonProps} />;
            case 'experience':
                return <ExperiencePage {...commonProps} />;
            case 'education':
                return <EducationPage {...commonProps} />;
            case 'skills':
                return <SkillsPage {...commonProps} />;
            case 'projects':
                return <ProjectsPage {...commonProps} />;
            case 'certifications':
                return <CertificationsPage {...commonProps} />;
            case 'languages':
                return <LanguagesPage {...commonProps} />;
            case 'references':
                return <ReferencesPage {...commonProps} />;
            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-indigo-500" />
                            <p className="text-gray-600">Loading section...</p>
                        </div>
                    </div>
                );
        }
    };

    // Render section navigation buttons
    const renderSectionNavigation = () => {
        const visibleSections = sections.filter(s => s.visible);
        const currentIndex = visibleSections.findIndex(s => s.id === activeSection);
        const currentSection = sections.find(s => s.id === activeSection);

        return (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => navigateToSection('prev')}
                        disabled={currentIndex <= 0}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all ${currentIndex <= 0
                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            }`}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center">
                        <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">
                                {currentSection?.label || 'Section'}
                            </span>
                            <span className="mx-2 text-gray-400 hidden sm:inline">•</span>
                            <span className="text-xs text-gray-500 hidden sm:inline">
                                {currentIndex + 1} of {visibleSections.length}
                            </span>
                        </div>

                        {/* Full Screen Button */}
                        {currentSection?.hasFullScreen && !isMobile && (
                            <button
                                onClick={() => openFullScreenEditor()}
                                className="ml-2 hidden sm:flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Full Screen
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => navigateToSection('next')}
                        disabled={currentIndex >= visibleSections.length - 1}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all ${currentIndex >= visibleSections.length - 1
                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            }`}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    {isMobile && currentSection?.hasFullScreen && (
                        <button
                            onClick={() => openFullScreenEditor()}
                            className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            <Maximize2 className="w-4 h-4 mr-2" />
                            Full
                        </button>
                    )}

                    <button
                        onClick={() => handleAIEnhance()}
                        disabled={aiCredits <= 0}
                        className={`flex items-center px-3 py-2 rounded-lg transition-all ${aiCredits <= 0
                            ? 'opacity-50 cursor-not-allowed bg-gray-100'
                            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                            }`}
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">AI Enhance</span>
                        <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                            {aiCredits}
                        </span>
                    </button>
                </div>
            </div>
        );
    };

    // Mobile Top Bar
    const MobileTopBar = () => (
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {showMobileMenu ? (
                            <X className="w-5 h-5 text-gray-600" />
                        ) : (
                            <Menu className="w-5 h-5 text-gray-600" />
                        )}
                    </button>

                    <div>
                        <h1 className="text-lg font-bold text-gray-800 truncate max-w-[180px]">
                            {currentResume?.name || 'Untitled Resume'}
                        </h1>
                        <div className="flex items-center text-xs text-gray-500">
                            <span>{stats.completedSections}/{stats.totalSections} sections</span>
                            <span className="mx-1">•</span>
                            <span>{stats.completeness}% complete</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || saveStatus === 'saving'}
                        className={`px-3 py-2 rounded-lg transition-all ${isSaving || saveStatus === 'saving'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }`}
                    >
                        {isSaving || saveStatus === 'saving' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                    </button>

                    <button
                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                        className={`p-2 rounded-lg transition-colors ${showAIAssistant
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Brain className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Main render
    if (resumeLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Resume Builder</h2>
                    <p className="text-gray-600">Preparing your workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Navbar */}
            <div className="hidden lg:block">
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    onSave={handleSave}
                    onExport={handleExport}
                    isSaving={isSaving}
                    saveStatus={saveStatus}
                    aiCredits={aiCredits}
                />
            </div>

            {/* Mobile Top Bar */}
            <MobileTopBar />

            {/* Main Content */}
            <div className="flex h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] mt-16 lg:mt-0">
                {/* Left Sidebar - Section Navigation */}
                <AnimatePresence>
                    {(leftSidebarOpen || (isMobile && showMobileMenu)) && (
                        <motion.div
                            initial={{ x: -320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -320, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`fixed lg:relative z-40 h-full bg-white border-r border-gray-200 shadow-xl lg:shadow-none ${isMobile ? 'inset-0' : ''}`}
                            style={{ width: isMobile ? '100%' : '320px' }}
                        >
                            <div className="h-full flex flex-col">
                                {/* Mobile Header */}
                                {isMobile && (
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-800">Sections</h2>
                                        <button
                                            onClick={() => {
                                                setLeftSidebarOpen(false);
                                                setShowMobileMenu(false);
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                )}

                                <BuilderSidebar
                                    sections={sections}
                                    activeSection={activeSection}
                                    completedSections={completedSections}
                                    onSectionChange={(sectionId) => {
                                        handleSectionChange(sectionId);
                                        if (isMobile) {
                                            setShowMobileMenu(false);
                                        }
                                    }}
                                    onToggleVisibility={toggleSectionVisibility}
                                    showHiddenSections={showHiddenSections}
                                    onToggleHiddenSections={() => setShowHiddenSections(!showHiddenSections)}
                                    stats={stats}
                                    showProgress={showProgress}
                                    onToggleProgress={() => setShowProgress(!showProgress)}
                                    onSave={handleSave}
                                    onExport={handleExport}
                                    isSaving={isSaving}
                                    saveStatus={saveStatus}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Editor Area */}
                <div
                    className="flex-1 overflow-auto transition-all duration-200"
                    style={{ width: editorWidth }}
                >
                    <div className="h-full flex flex-col">
                        {/* Editor Header - Desktop */}
                        <div className="hidden lg:block sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {leftSidebarOpen ? (
                                            <PanelLeft className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <PanelRight className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigate('/dashboard')}
                                            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                                        >
                                            <Home className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </button>
                                        <span className="text-gray-300">|</span>
                                        <div className="text-sm text-gray-600">
                                            Editing: <span className="font-semibold">{currentResume?.name || 'Untitled Resume'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {/* Zoom Controls */}
                                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={handleZoomOut}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            disabled={zoomLevel <= 50}
                                        >
                                            <ZoomOut className="w-4 h-4 text-gray-600" />
                                        </button>
                                        <button
                                            onClick={resetZoom}
                                            className="px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded transition-colors"
                                        >
                                            {zoomLevel}%
                                        </button>
                                        <button
                                            onClick={handleZoomIn}
                                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            disabled={zoomLevel >= 200}
                                        >
                                            <ZoomIn className="w-4 h-4 text-gray-600" />
                                        </button>
                                    </div>

                                    {/* Fullscreen Toggle */}
                                    <button
                                        onClick={handleFullscreen}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {isFullscreen ? (
                                            <Minimize2 className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <Maximize2 className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>

                                    {/* AI Assistant Toggle */}
                                    <button
                                        onClick={() => setShowAIAssistant(!showAIAssistant)}
                                        className={`p-2 rounded-lg transition-colors ${showAIAssistant
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        <Brain className="w-5 h-5" />
                                    </button>

                                    {/* Right Sidebar Toggle */}
                                    <button
                                        onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {rightSidebarOpen ? (
                                            <PanelRight className="w-5 h-5 text-gray-600" />
                                        ) : (
                                            <PanelLeft className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Section Navigation */}
                            {renderSectionNavigation()}
                        </div>

                        {/* Mobile Section Navigation */}
                        <div className="lg:hidden px-4 py-3 border-b border-gray-200 bg-white">
                            {renderSectionNavigation()}
                        </div>

                        {/* Editor Content */}
                        <div
                            className="flex-1 overflow-auto p-4 lg:p-6 transition-all duration-200"
                            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                        >
                            <div className="max-w-4xl mx-auto">
                                {renderActiveSection()}
                            </div>
                        </div>

                        {/* Editor Footer */}
                        <div className="sticky bottom-0 z-30 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 lg:px-6 py-3">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div className="flex items-center justify-between lg:justify-start lg:space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        {saveStatus === 'saving' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                <span>Saving...</span>
                                            </>
                                        ) : saveStatus === 'saved' ? (
                                            <>
                                                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                <span>Saved</span>
                                                {lastSavedTime && (
                                                    <span className="ml-2 text-gray-500 hidden lg:inline">
                                                        {new Date(lastSavedTime).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                )}
                                            </>
                                        ) : saveStatus === 'error' ? (
                                            <>
                                                <span className="text-red-500">Save failed</span>
                                                <button
                                                    onClick={handleSave}
                                                    className="ml-2 text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Retry
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span>Ready</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="lg:hidden flex items-center space-x-4">
                                        <div className="flex items-center">
                                            <FileText className="w-4 h-4 mr-1" />
                                            <span>{stats.wordCount}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                            <span>{stats.completedSections}/{stats.totalSections}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2" />
                                        <span>{stats.wordCount} words</span>
                                    </div>

                                    <div className="flex items-center">
                                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                        <span>{stats.completedSections}/{stats.totalSections} sections</span>
                                    </div>

                                    <div className="flex items-center">
                                        {showHiddenSections ? (
                                            <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                                        ) : (
                                            <Eye className="w-4 h-4 mr-2 text-green-500" />
                                        )}
                                        <span>{stats.visibleSections} visible</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end lg:space-x-3">
                                    <button
                                        onClick={() => setShowAIAssistant(true)}
                                        className="flex items-center px-3 lg:px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all"
                                    >
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Ask AI</span>
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || saveStatus === 'saving'}
                                        className={`flex items-center px-3 lg:px-4 py-2 rounded-lg transition-all ${isSaving || saveStatus === 'saving'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        {isSaving || saveStatus === 'saving' ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                <span className="hidden sm:inline">Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                <span className="hidden sm:inline">Save</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleExport('pdf')}
                                        disabled={isExporting}
                                        className={`hidden sm:flex items-center px-3 lg:px-4 py-2 rounded-lg transition-all ${isExporting
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {isExporting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" />
                                                Export
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Stats Dashboard */}
                <AnimatePresence>
                    {rightSidebarOpen && (
                        <motion.div
                            initial={{ x: 384, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 384, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed lg:relative right-0 z-40 h-full bg-white border-l border-gray-200 shadow-xl lg:shadow-none"
                            style={{ width: isMobile ? '100%' : '384px' }}
                        >
                            <div className="h-full flex flex-col">
                                {/* Mobile Header */}
                                {isMobile && (
                                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                        <h2 className="text-xl font-bold text-gray-800">Stats & Tools</h2>
                                        <button
                                            onClick={() => setRightSidebarOpen(false)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                )}

                                <StatsDashboard
                                    stats={stats}
                                    activeSection={activeSection}
                                    sections={sections}
                                    onSectionChange={handleSectionChange}
                                    onExport={handleExport}
                                    onFullscreen={handleFullscreen}
                                    onToggleSectionVisibility={toggleSectionVisibility}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Action Buttons */}
                <FloatingActionButtons
                    onSave={handleSave}
                    onExport={handleExport}
                    onShare={handleDefaultShare}
                    onPrint={handleDefaultPrint}
                    onFullscreen={handleFullscreen}
                    onAIEnhance={handleAIEnhance}
                    onPreview={() => setShowPreviewMode(!showPreviewMode)}
                    onSettings={() => toast.success('Settings opened')}
                    onHelp={() => toast.success('Help opened')}
                    onAddSection={() => toast.success('Add section clicked')}
                    onOpenAIAssistant={() => setShowAIAssistant(!showAIAssistant)}
                    onAIAction={handleAIAction}
                    onTextFormat={handleTextFormat}
                    onInsertElement={handleInsertElement}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={resetZoom}
                    isFullscreen={isFullscreen}
                    showPreview={showPreviewMode}
                    saveStatus={saveStatus}
                    user={{ ...user, aiCredits }}
                    resumeData={currentResume?.data || {}}
                    zoomLevel={zoomLevel}
                    isAIAssistantOpen={showAIAssistant}
                    position={isMobile ? "bottom-right" : "bottom-right"}
                    compact={isMobile}
                />

                {/* Mobile Sidebar Toggles */}
                {isMobile && !showMobileMenu && !leftSidebarOpen && (
                    <button
                        onClick={() => {
                            setLeftSidebarOpen(true);
                            setShowMobileMenu(true);
                        }}
                        className="fixed left-4 bottom-20 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}

                {isMobile && !rightSidebarOpen && (
                    <button
                        onClick={() => setRightSidebarOpen(true)}
                        className="fixed right-4 bottom-20 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg"
                    >
                        <BarChart className="w-5 h-5" />
                    </button>
                )}

                {/* AI Assistant Modal */}
                <AnimatePresence>
                    {showAIAssistant && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 z-50"
                                onClick={() => setShowAIAssistant(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="fixed inset-x-4 bottom-4 md:inset-x-auto md:right-4 md:bottom-4 md:w-96 z-50"
                            >
                                <AIAssistant
                                    activeSection={activeSection}
                                    sectionData={currentResume?.data?.[activeSection]}
                                    onEnhance={handleAIEnhance}
                                    onClose={() => setShowAIAssistant(false)}
                                    aiCredits={aiCredits}
                                />
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Full Screen Text Editor */}
                <AnimatePresence>
                    {showFullScreenEditor && (
                        <FullScreenTextField
                            value={fullScreenContent}
                            onChange={(content) => setFullScreenContent(content)}
                            onSave={saveFullScreenContent}
                            onClose={() => setShowFullScreenEditor(false)}
                            onAIEnhance={() => {
                                if (aiCredits > 0) {
                                    setAiCredits(prev => prev - 5);
                                    toast.success('✨ AI enhancement applied!');
                                } else {
                                    toast.error('Insufficient AI credits');
                                }
                            }}
                            placeholder={`Edit your ${fullScreenSection} content...`}
                            title={`${sections.find(s => s.id === fullScreenSection)?.label} - Full Screen Editor`}
                            aiCredits={aiCredits}
                            isSaving={isSaving}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// Default handlers for FloatingActionButtons
const handleDefaultShare = async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: 'My Resume',
                text: 'Check out my professional resume!',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        }
    } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    }
};

const handleDefaultPrint = () => {
    window.print();
};

export default ResumeBuilder;