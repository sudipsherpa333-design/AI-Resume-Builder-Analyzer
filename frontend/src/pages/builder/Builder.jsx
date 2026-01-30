import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Context & Hooks - FIXED: Changed from useResume to useResumes
import { useAuth } from '../../context/AuthContext';
import { useResumes } from '../../context/ResumeContext'; // ✅ Changed to useResumes
import useResumeCompletion from '../../hooks/useResumeCompletion';

// Utilities
import socketManager from '../../utils/socket';
import api from '../../services/api';

// Components
import Navbar from '../../components/Navbar';
import TemplateSelector from '../../components/templates/TemplateSelector';
import AIAssistant from '../../components/ai/AIAssistant';
import StatsDashboard from '../../components/ui/StatsDashboard';
import SectionManager from '../../components/section/SectionManager';
import BuilderSidebar from '../../components/ui/BuilderSidebar';
import FloatingActionButtons from '../../components/ui/FloatingActionButtons';
import ResumeTitleEditor from '../../components/ui/ResumeTitleEditor';

// Section Components
import PersonalInfoPage from '../../components/section/PersonalInfoPage';
import SummaryPage from '../../components/section/SummaryPage';
import ExperiencePage from '../../components/section/ExperiencePage';
import EducationPage from '../../components/section/EducationPage';
import SkillsPage from '../../components/section/SkillsPage';
import ProjectsPage from '../../components/section/ProjectsPage';
import CertificationsPage from '../../components/section/CertificationsPage';
import LanguagesPage from '../../components/section/LanguagesPage';
import ReferencesPage from '../../components/section/ReferencesPage';
import CustomSectionsPage from '../../components/section/CustomSectionsPage';

// Icons
import {
    Save,
    Eye,
    Download,
    User,
    FileText,
    Briefcase,
    GraduationCap,
    Code,
    Layers,
    Award,
    Globe,
    Users,
    Sparkles,
    BarChart,
    Palette,
    CheckCircle,
    AlertCircle,
    Loader2,
    Maximize2,
    Minimize2,
    Share2,
    Printer,
    Upload,
    ArrowLeft,
    PanelLeftClose,
    PanelLeftOpen,
    X,
    Type,
    Wifi,
    WifiOff,
    Cloud,
    CloudOff
} from 'lucide-react';

// Constants
const SECTION_CONFIG = [
    { id: 'personalInfo', label: 'Personal Info', icon: User, required: true, color: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
    { id: 'summary', label: 'Summary', icon: FileText, required: true, color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
    { id: 'experience', label: 'Experience', icon: Briefcase, required: true, color: 'bg-gradient-to-br from-green-500 to-emerald-500' },
    { id: 'education', label: 'Education', icon: GraduationCap, required: true, color: 'bg-gradient-to-br from-amber-500 to-orange-500' },
    { id: 'skills', label: 'Skills', icon: Code, required: true, color: 'bg-gradient-to-br from-red-500 to-rose-500' },
    { id: 'projects', label: 'Projects', icon: Layers, required: false, color: 'bg-gradient-to-br from-indigo-500 to-violet-500' },
    { id: 'certifications', label: 'Certifications', icon: Award, required: false, color: 'bg-gradient-to-br from-pink-500 to-rose-500' },
    { id: 'languages', label: 'Languages', icon: Globe, required: false, color: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
    { id: 'references', label: 'References', icon: Users, required: false, color: 'bg-gradient-to-br from-emerald-500 to-green-500' }
];

const Builder = () => {
    const navigate = useNavigate();
    const { id: resumeId } = useParams();
    const queryClient = useQueryClient();

    // Refs
    const containerRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const hasLoadedRef = useRef(false);
    const isMountedRef = useRef(true);
    const autoSaveTimeoutRef = useRef(null);
    const prevResumeDataRef = useRef(null);
    const saveCooldownRef = useRef(false);
    const socketUpdateCooldownRef = useRef({});

    // Context values - FIXED: Changed from useResume to useResumes
    const { user } = useAuth();
    const {
        currentResume: contextResumeData,
        setCurrentResume: contextSetResumeData,
        updateSection,
        loadResume: contextLoadResume,
        saveResume: contextSaveResume,
        createResume: contextCreateResume
    } = useResumes(); // ✅ Changed to useResumes

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeSection, setActiveSection] = useState(() => {
        const savedSection = localStorage.getItem('builder_active_section');
        return savedSection || 'personalInfo';
    });
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const savedSidebar = localStorage.getItem('builder_sidebar_open');
        return savedSidebar !== null ? JSON.parse(savedSidebar) : true;
    });
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isTemplateOpen, setIsTemplateOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isSectionManagerOpen, setIsSectionManagerOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isTitleEditorOpen, setIsTitleEditorOpen] = useState(false);
    const [viewMode, setViewMode] = useState('edit');
    const [collaborators, setCollaborators] = useState([]);
    const [lastSaved, setLastSaved] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [socketStatus, setSocketStatus] = useState({
        isConnected: false,
        isConnecting: false,
        resumeId: null
    });

    // Check if it's a temp ID
    const isTempId = useMemo(() => {
        return resumeId && resumeId.startsWith('temp_');
    }, [resumeId]);

    // Hook at top level
    const completionData = useResumeCompletion(contextResumeData || {});

    // Save sidebar state to localStorage
    useEffect(() => {
        localStorage.setItem('builder_sidebar_open', JSON.stringify(isSidebarOpen));
    }, [isSidebarOpen]);

    // Save active section to localStorage
    useEffect(() => {
        localStorage.setItem('builder_active_section', activeSection);
    }, [activeSection]);

    // TanStack Query for resume data
    const {
        data: queryResumeData,
        isLoading: isQueryLoading,
        isError: isQueryError,
        refetch: refetchQuery
    } = useQuery({
        queryKey: ['resume', resumeId],
        queryFn: async () => {
            console.log('📥 Query fetching resume:', resumeId);

            // Don't fetch for new resumes or temp IDs
            if (!resumeId || resumeId === 'new' || isTempId) {
                console.log('⏭️ Skipping API fetch for:', resumeId);
                return Promise.resolve(null);
            }

            // If we already have it in context, use that
            if (contextResumeData?.id === resumeId || contextResumeData?._id === resumeId) {
                console.log('✅ Using context data for query');
                return Promise.resolve(contextResumeData);
            }

            // Otherwise fetch from API
            try {
                console.log('🌐 Making API call for resume:', resumeId);
                const response = await api.resume.getOne(resumeId);
                if (response && response.success) {
                    return response.data;
                }
                throw new Error('Failed to fetch resume');
            } catch (error) {
                console.error('API fetch error:', error);
                // Don't throw error for network issues
                return null;
            }
        },
        enabled: !!resumeId && resumeId !== 'new' && !isTempId && !hasLoadedRef.current,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        retry: 1,
        retryDelay: 1000
    });

    // Debug query states
    useEffect(() => {
        console.log('🔍 Query State:', {
            resumeId,
            isTempId,
            isQueryLoading,
            isQueryError,
            queryResumeData: !!queryResumeData,
            contextResumeData: !!contextResumeData?.id
        });
    }, [resumeId, isTempId, isQueryLoading, isQueryError, queryResumeData, contextResumeData]);

    // Use context data primarily, fallback to query data
    const currentResumeData = useMemo(() => {
        console.log('📊 Determining current resume data:', {
            resumeId,
            isTempId,
            hasContextData: !!contextResumeData?.id || !!contextResumeData?._id,
            contextId: contextResumeData?.id || contextResumeData?._id,
            hasQueryData: !!queryResumeData?.id || !!queryResumeData?._id
        });

        // Always prefer context data first
        if (contextResumeData?.id || contextResumeData?._id) {
            const contextId = contextResumeData.id || contextResumeData._id;
            if (contextId === resumeId || !resumeId || resumeId === 'new') {
                console.log('✅ Using context data');
                return contextResumeData;
            }
        }

        // Fallback to query data (only for non-temp resumes)
        if (queryResumeData && !isTempId) {
            console.log('📥 Using query data');
            return queryResumeData;
        }

        // Return empty object as last resort
        console.log('📭 No resume data available');
        return {};
    }, [contextResumeData, queryResumeData, resumeId, isTempId]);

    // Load resume ONCE when component mounts
    useEffect(() => {
        isMountedRef.current = true;
        hasLoadedRef.current = false;

        const loadResumeData = async () => {
            console.log('🚀 Starting resume load:', resumeId, 'Temp:', isTempId);

            // Prevent multiple loads
            if (hasLoadedRef.current || !isMountedRef.current) {
                console.log('⏸️ Skipping load - already loaded or unmounted');
                return;
            }

            try {
                if (resumeId && resumeId !== 'new') {
                    console.log('🔍 Loading existing resume:', resumeId);

                    // Check if we already have this resume loaded in context
                    const contextId = contextResumeData?.id || contextResumeData?._id;
                    if (contextId === resumeId) {
                        console.log('✅ Resume already loaded in context');
                        hasLoadedRef.current = true;
                        return;
                    }

                    // Load existing resume from context
                    const loadedResume = await contextLoadResume(resumeId);

                    if (!isMountedRef.current) {
                        console.log('⚠️ Component unmounted during load');
                        return;
                    }

                    if (!loadedResume) {
                        console.warn('⚠️ Resume not found in context');
                        if (!isTempId) {
                            console.log('🔄 Will rely on query to fetch');
                        }
                    } else {
                        console.log('✅ Resume loaded from context:', loadedResume.title);
                        hasLoadedRef.current = true;
                    }
                } else {
                    console.log('🆕 Creating new resume');
                    // Only create new if we don't have any resume in context
                    if (!contextResumeData?.id && !contextResumeData?._id) {
                        const newResumeData = {
                            title: `${user?.name?.split(' ')[0] || 'My'}'s Resume`,
                            template: 'modern',
                            data: {
                                personalInfo: {
                                    fullName: user?.name || '',
                                    email: user?.email || '',
                                    phone: user?.phone || '',
                                    location: '',
                                    linkedin: '',
                                    github: '',
                                    website: '',
                                    jobTitle: '',
                                    summary: ''
                                },
                                summary: '',
                                experience: [],
                                education: [],
                                skills: [],
                                projects: [],
                                certifications: [],
                                languages: [],
                                references: []
                            },
                            status: 'draft',
                            isPublic: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                            version: 1
                        };

                        const createdResume = await contextCreateResume(newResumeData);
                        if (isMountedRef.current && createdResume) {
                            console.log('✅ New resume created:', createdResume.title);
                            hasLoadedRef.current = true;
                            // Navigate to the new resume ID
                            const newResumeId = createdResume.id || createdResume._id;
                            if (newResumeId && newResumeId !== 'new') {
                                navigate(`/builder/edit/${newResumeId}`, { replace: true });
                            }
                        }
                    } else {
                        console.log('✅ Using existing context resume');
                        hasLoadedRef.current = true;
                    }
                }
            } catch (error) {
                console.error('❌ Load error:', error);
                if (isMountedRef.current) {
                    toast.error('Failed to load resume');
                }
            } finally {
                if (isMountedRef.current) {
                    console.log('🏁 Load process completed');
                    // Small delay to ensure everything settles
                    setTimeout(() => {
                        setIsLoading(false);
                        console.log('📊 Final isLoading:', false);
                    }, 300);
                }
            }
        };

        // Add a small delay before starting load
        const timer = setTimeout(() => {
            loadResumeData();
        }, 100);

        // Safety timeout
        const safetyTimer = setTimeout(() => {
            if (isMountedRef.current && isLoading) {
                console.warn('⏰ Safety timeout triggered - forcing load complete');
                setIsLoading(false);
                hasLoadedRef.current = true;
            }
        }, 10000); // 10 second timeout

        return () => {
            console.log('🧹 Cleaning up builder load effects');
            isMountedRef.current = false;
            clearTimeout(timer);
            clearTimeout(safetyTimer);
        };
    }, [resumeId, user?.id, isTempId]);

    // Socket connection management
    useEffect(() => {
        if (!user?.id || !resumeId || resumeId === 'new' || isTempId) {
            return;
        }

        const connectSocket = async () => {
            try {
                setSocketStatus(prev => ({ ...prev, isConnecting: true }));

                await socketManager.connect(user.id);

                socketManager.joinResume(resumeId, {
                    userId: user.id,
                    userName: user.name || 'Anonymous',
                    userEmail: user.email
                });

                socketManager.onUpdate((updateData) => {
                    if (updateData.resumeId === resumeId && updateData.userId !== user.id) {
                        const now = Date.now();
                        const lastUpdate = socketUpdateCooldownRef.current[updateData.section] || 0;

                        // Debounce updates (300ms cooldown per section)
                        if (now - lastUpdate > 300) {
                            socketUpdateCooldownRef.current[updateData.section] = now;

                            toast.info(`${updateData.userName || 'Someone'} updated ${updateData.section}`);
                            if (updateData.section === activeSection) {
                                // Refresh the section if it's active
                                refetchQuery();
                            }
                        }
                    }
                });

                socketManager.onCollaboratorsUpdate((collaboratorsList) => {
                    setCollaborators(collaboratorsList);
                });

                socketManager.onConnect(() => {
                    setSocketStatus({
                        isConnected: true,
                        isConnecting: false,
                        resumeId
                    });
                });

                socketManager.onDisconnect(() => {
                    setSocketStatus({
                        isConnected: false,
                        isConnecting: false,
                        resumeId: null
                    });
                });

            } catch (error) {
                console.error('Socket connection error:', error);
                setSocketStatus(prev => ({ ...prev, isConnecting: false }));
            }
        };

        connectSocket();

        return () => {
            if (socketManager.isConnected()) {
                socketManager.leaveResume(resumeId);
            }
        };
    }, [user?.id, resumeId, activeSection, refetchQuery, isTempId]);

    // Auto-save effect
    useEffect(() => {
        if (!currentResumeData || !currentResumeData.id || isSaving) {
            return;
        }

        const autoSave = async () => {
            if (saveCooldownRef.current) {
                return;
            }

            const hasChanges = JSON.stringify(currentResumeData) !== JSON.stringify(prevResumeDataRef.current);

            if (hasChanges) {
                setHasUnsavedChanges(true);
                setIsAutoSaving(true);

                try {
                    await contextSaveResume(currentResumeData, false);
                    setLastSaved(new Date());
                    setHasUnsavedChanges(false);
                    toast.success('Auto-saved');
                } catch (error) {
                    console.error('Auto-save error:', error);
                } finally {
                    setIsAutoSaving(false);
                }

                prevResumeDataRef.current = JSON.parse(JSON.stringify(currentResumeData));
            }
        };

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(autoSave, 3000);

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
    }, [currentResumeData, contextSaveResume, isSaving]);

    // Update section data with socket support
    const updateSectionData = useCallback((sectionId, data) => {
        if (!currentResumeData) return;

        const updated = {
            ...currentResumeData,
            data: {
                ...currentResumeData.data,
                [sectionId]: data
            },
            updatedAt: new Date().toISOString(),
            version: (currentResumeData.version || 0) + 1
        };

        contextSetResumeData(updated);

        // Emit socket update if connected
        if (socketStatus.isConnected && user?.id && resumeId && !isTempId) {
            socketManager.emitUpdate({
                resumeId,
                userId: user.id,
                userName: user.name || 'Anonymous',
                section: sectionId,
                data: data,
                timestamp: new Date().toISOString()
            });
        }
    }, [currentResumeData, contextSetResumeData, socketStatus.isConnected, user, resumeId, isTempId]);

    // Save resume
    const handleSave = useCallback(async () => {
        if (isSaving || isAutoSaving || saveCooldownRef.current || !currentResumeData) {
            return;
        }

        saveCooldownRef.current = true;
        setIsSaving(true);

        try {
            const savedResume = await contextSaveResume(currentResumeData, true);

            if (savedResume) {
                setLastSaved(new Date());
                setHasUnsavedChanges(false);

                // If it's a temp resume that got a real ID, update the URL
                if (isTempId && savedResume.id && savedResume.id !== resumeId) {
                    navigate(`/builder/edit/${savedResume.id}`, { replace: true });
                }

                // Invalidate query cache
                queryClient.invalidateQueries({ queryKey: ['resume', savedResume.id || savedResume._id] });

                toast.success('Resume saved!');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save resume');
        } finally {
            setIsSaving(false);

            // Reset cooldown after 2 seconds
            setTimeout(() => {
                saveCooldownRef.current = false;
            }, 2000);
        }
    }, [currentResumeData, contextSaveResume, isSaving, isAutoSaving, isTempId, resumeId, navigate, queryClient]);

    // Save & Exit
    const handleSaveAndExit = useCallback(async () => {
        if (!currentResumeData) return;

        try {
            await contextSaveResume(currentResumeData, true);
            setLastSaved(new Date());
            toast.success('Resume saved!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Save & Exit error:', error);
            toast.error('Failed to save resume');
        }
    }, [contextSaveResume, currentResumeData, navigate]);

    // Export resume
    const handleExport = useCallback(async (format) => {
        try {
            if (!currentResumeData) {
                toast.error('No resume data to export');
                return;
            }

            const resumeId = currentResumeData.id || currentResumeData._id;

            if (format === 'pdf') {
                // For temp resumes or when offline, show message
                if (isTempId || !resumeId || resumeId.startsWith('temp_')) {
                    toast.error('Please save the resume first to export as PDF');
                    return;
                }

                try {
                    const response = await api.resume.export(resumeId, format);

                    // Create download link
                    const url = window.URL.createObjectURL(response);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${currentResumeData.title || 'resume'}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    toast.success('PDF exported');
                } catch (error) {
                    console.error('PDF export error:', error);
                    toast.error('PDF export failed. Please try again later.');
                }
            } else {
                // For JSON, use the context data directly
                const dataStr = JSON.stringify(currentResumeData, null, 2);
                const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
                const link = document.createElement('a');
                link.href = dataUri;
                link.download = `${currentResumeData.title || 'resume'}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success('JSON exported');
            }

            setIsExportMenuOpen(false);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Export failed');
        }
    }, [currentResumeData, isTempId]);

    // AI improvement
    const handleAIImprovement = useCallback(async (sectionId) => {
        try {
            toast.loading('AI is working...');

            // For now, we'll use a mock AI improvement
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock AI suggestions based on section
            const mockSuggestions = {
                summary: [
                    "Make your summary more impactful by starting with your most significant achievement.",
                    "Quantify your results with specific numbers and metrics.",
                    "Tailor your summary to the specific industry you're targeting."
                ],
                experience: [
                    "Use action verbs like 'Led', 'Managed', 'Developed' instead of 'Responsible for'.",
                    "Include specific metrics: increased revenue by X%, reduced costs by Y%.",
                    "Focus on achievements rather than just responsibilities."
                ],
                skills: [
                    "Group similar skills together (e.g., 'Frontend: React, Vue, Angular').",
                    "Include both technical and soft skills.",
                    "Prioritize skills mentioned in the job description."
                ]
            };

            const suggestions = mockSuggestions[sectionId] || [
                "Add more specific details to this section.",
                "Use industry-standard terminology.",
                "Focus on results and achievements."
            ];

            // Apply first suggestion as an example
            if (suggestions.length > 0) {
                toast.success('AI improvements generated');
                // You would update the section with AI suggestions here
                // updateSectionData(sectionId, improvedData);
            } else {
                toast.error('No suggestions generated');
            }
        } catch (error) {
            console.error('AI improvement error:', error);
            toast.error('AI improvement failed');
        }
    }, [currentResumeData, updateSectionData]);

    // Handle template change
    const handleTemplateChange = useCallback((templateId) => {
        if (!currentResumeData) return;

        const updated = {
            ...currentResumeData,
            template: templateId,
            updatedAt: new Date().toISOString(),
            version: (currentResumeData.version || 0) + 1
        };

        contextSetResumeData(updated);
        toast.success(`Template changed to ${templateId}`);
        setIsTemplateOpen(false);
    }, [contextSetResumeData, currentResumeData]);

    // Navigate to preview
    const handleGoToPreview = useCallback(() => {
        if (!currentResumeData) return;

        const resumeId = currentResumeData.id || currentResumeData._id;
        if (!resumeId || resumeId === 'new') {
            toast.error('Please save the resume first to preview');
            return;
        }

        navigate(`/preview/${resumeId}`);
    }, [currentResumeData, navigate]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Save: Ctrl/Cmd + S
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }

            // Preview: Ctrl/Cmd + P
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                handleGoToPreview();
            }

            // Toggle sidebar: Ctrl/Cmd + B
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                setIsSidebarOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSave, handleGoToPreview]);

    // Before unload warning
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges && !isAutoSaving) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, isAutoSaving]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Builder unmounting');
            isMountedRef.current = false;

            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);

            // Check if socket is connected before disconnecting
            if (socketManager.isConnected()) {
                socketManager.disconnect();
            }
        };
    }, []);

    // Render active section
    const renderActiveSection = useMemo(() => {
        if (!currentResumeData?.data) {
            return (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            );
        }

        const sectionData = currentResumeData.data[activeSection] || {};
        const sectionProps = {
            data: sectionData,
            onChange: (newData) => updateSectionData(activeSection, newData),
            onImprove: () => handleAIImprovement(activeSection),
            isSaving: isSaving || isAutoSaving
        };

        switch (activeSection) {
            case 'personalInfo':
                return <PersonalInfoPage {...sectionProps} />;
            case 'summary':
                return <SummaryPage {...sectionProps} />;
            case 'experience':
                return <ExperiencePage {...sectionProps} />;
            case 'education':
                return <EducationPage {...sectionProps} />;
            case 'skills':
                return <SkillsPage {...sectionProps} />;
            case 'projects':
                return <ProjectsPage {...sectionProps} />;
            case 'certifications':
                return <CertificationsPage {...sectionProps} />;
            case 'languages':
                return <LanguagesPage {...sectionProps} />;
            case 'references':
                return <ReferencesPage {...sectionProps} />;
            default:
                if (activeSection.startsWith('custom_')) {
                    return <CustomSectionsPage
                        {...sectionProps}
                        sectionName={activeSection}
                        customSections={currentResumeData.data.customSections || {}}
                    />;
                }
                return (
                    <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Section Not Found
                        </h3>
                        <p className="text-gray-600">
                            The selected section is not available.
                        </p>
                    </div>
                );
        }
    }, [activeSection, currentResumeData, updateSectionData, handleAIImprovement, isSaving, isAutoSaving]);

    // Handle completion data safely
    const safeCompletionData = completionData || { percentage: 0, sections: {} };

    // Combined loading state
    const isActuallyLoading = isLoading || (isQueryLoading && !isTempId);

    // Loading state
    if (isActuallyLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading resume editor...</p>
                    <p className="text-sm text-gray-500 mt-2">Getting everything ready</p>
                </div>
            </div>
        );
    }

    // Check if we have valid resume data
    if (!currentResumeData || Object.keys(currentResumeData).length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Resume Data
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Unable to load resume data.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
        >
            {/* Navbar */}
            <Navbar />

            {/* Main Layout */}
            <div className="flex h-screen pt-16">
                {/* Sidebar Toggle Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="fixed z-40 top-24 left-4 p-3 bg-white shadow-lg rounded-xl hover:shadow-xl transition-all duration-200 hover:scale-105 border border-gray-200"
                    style={{ marginLeft: isSidebarOpen ? '280px' : '0' }}
                >
                    {isSidebarOpen ? (
                        <PanelLeftClose className="w-5 h-5 text-gray-700" />
                    ) : (
                        <PanelLeftOpen className="w-5 h-5 text-gray-700" />
                    )}
                </motion.button>

                {/* Sidebar */}
                <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                        <motion.div
                            key="sidebar"
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{
                                type: 'spring',
                                damping: 30,
                                stiffness: 300,
                                mass: 0.5
                            }}
                            className="fixed z-30 h-full"
                        >
                            <div className="w-72 h-full bg-white border-r border-gray-200 shadow-xl">
                                <BuilderSidebar
                                    isOpen={isSidebarOpen}
                                    sections={SECTION_CONFIG}
                                    activeSection={activeSection}
                                    onSectionClick={(section) => {
                                        setActiveSection(section);
                                        if (window.innerWidth < 1024) {
                                            setIsSidebarOpen(false);
                                        }
                                    }}
                                    completionData={safeCompletionData}
                                    isMobile={window.innerWidth < 1024}
                                    resumeData={currentResumeData}
                                    onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                                    socketStatus={socketStatus}
                                    collaborators={collaborators}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <div
                    className="flex-1 transition-all duration-200 ease-in-out"
                    style={{ marginLeft: isSidebarOpen ? '280px' : '0' }}
                >
                    <div className="h-full overflow-hidden">
                        {/* Editor Panel */}
                        <div className={`h-full overflow-y-auto transition-all duration-200 ${viewMode === 'edit' ? 'w-full' : viewMode === 'split' ? 'w-1/2' : 'w-0'}`}>
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                                {/* Resume Header */}
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-100"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                                        <div className="flex-1">
                                            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                                                {currentResumeData?.title || 'Untitled Resume'}
                                            </h1>
                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <FileText className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {SECTION_CONFIG.find(s => s.id === activeSection)?.label || 'Section'}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-sm">
                                                    {lastSaved ? `Last saved: ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Never saved'}
                                                </span>
                                                {(isSaving || isAutoSaving) && (
                                                    <span className="flex items-center gap-1 text-blue-600">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span>{isAutoSaving ? 'Auto-saving...' : 'Saving...'}</span>
                                                    </span>
                                                )}
                                                {socketStatus.isConnected && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <Wifi className="w-3 h-3" />
                                                        <span>Live</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => setIsTitleEditorOpen(true)}
                                                className="px-4 py-2 text-sm font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 border border-gray-200"
                                            >
                                                <Type className="w-4 h-4" />
                                                Edit Title
                                            </button>
                                            <button
                                                onClick={() => setIsTemplateOpen(true)}
                                                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg hover:shadow-sm transition-all duration-200 flex items-center gap-2 border border-purple-100"
                                            >
                                                <Palette className="w-4 h-4" />
                                                Template
                                            </button>
                                            <button
                                                onClick={() => navigate('/dashboard')}
                                                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg hover:shadow-sm transition-all duration-200 flex items-center gap-2 border border-blue-100"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Dashboard
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="max-w-3xl mx-auto">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Resume Completion
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                                    {safeCompletionData.percentage}%
                                                </span>
                                                <CheckCircle className={`w-5 h-5 ${safeCompletionData.percentage === 100 ? 'text-green-500' : 'text-gray-400'}`} />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${safeCompletionData.percentage}%` }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Active Section Content */}
                                <motion.div
                                    key={activeSection}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="mb-8 bg-white rounded-xl shadow-md p-6 border border-gray-100"
                                >
                                    <div className="mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2.5 rounded-lg ${SECTION_CONFIG.find(s => s.id === activeSection)?.color || 'bg-gray-500'}`}>
                                                {React.createElement(SECTION_CONFIG.find(s => s.id === activeSection)?.icon || FileText, {
                                                    className: "w-5 h-5 text-white"
                                                })}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {SECTION_CONFIG.find(s => s.id === activeSection)?.label || 'Section'}
                                                </h2>
                                                <p className="text-gray-600 text-sm">
                                                    Fill in your {SECTION_CONFIG.find(s => s.id === activeSection)?.label.toLowerCase() || 'section'} details below
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="min-h-[400px]">
                                        {renderActiveSection}
                                    </div>
                                </motion.div>

                                {/* Action Buttons */}
                                <motion.div
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-wrap gap-3 justify-center lg:justify-start"
                                >
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || isAutoSaving || saveCooldownRef.current}
                                        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:shadow-md disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                                    >
                                        {isSaving || isAutoSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                <span>Save Resume</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={handleSaveAndExit}
                                        disabled={isSaving || isAutoSaving}
                                        className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-md disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save & Exit</span>
                                    </button>

                                    <button
                                        onClick={handleGoToPreview}
                                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-lg hover:shadow-md flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Full Preview</span>
                                    </button>

                                    <button
                                        onClick={() => setIsAIAssistantOpen(true)}
                                        className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:shadow-md flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        <span>AI Assistant</span>
                                    </button>

                                    <button
                                        onClick={() => navigate('/analyzer')}
                                        className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-medium rounded-lg hover:shadow-md flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                                    >
                                        <BarChart className="w-4 h-4" />
                                        <span>Analyze</span>
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Buttons */}
            <FloatingActionButtons
                buttons={[
                    { id: 'ai', icon: Sparkles, label: 'AI Assistant', color: 'from-purple-600 to-pink-600', action: 'toggleAI' },
                    { id: 'save', icon: Save, label: 'Save', color: 'from-green-600 to-emerald-600', action: 'save' },
                    { id: 'preview', icon: Eye, label: 'Full Preview', color: 'from-indigo-600 to-violet-600', action: 'preview' },
                    { id: 'export', icon: Download, label: 'Export', color: 'from-blue-600 to-cyan-600', action: 'export' },
                    { id: 'view', icon: viewMode === 'split' ? Minimize2 : Maximize2, label: viewMode === 'split' ? 'Close Split' : 'Split View', color: 'from-orange-600 to-amber-600', action: 'toggleView' },
                ]}
                onAction={(action) => {
                    switch (action) {
                        case 'toggleAI':
                            setIsAIAssistantOpen(prev => !prev);
                            break;
                        case 'save':
                            handleSave();
                            break;
                        case 'preview':
                            handleGoToPreview();
                            break;
                        case 'export':
                            setIsExportMenuOpen(true);
                            break;
                        case 'toggleView':
                            setViewMode(prev => prev === 'split' ? 'edit' : 'split');
                            break;
                    }
                }}
                isExportMenuOpen={isExportMenuOpen}
                onExportPDF={() => handleExport('pdf')}
                onExportJSON={() => handleExport('json')}
                onPrint={() => window.print()}
                onShare={() => {
                    if (currentResumeData?.id || currentResumeData?._id) {
                        const resumeId = currentResumeData.id || currentResumeData._id;
                        if (resumeId && !resumeId.startsWith('temp_')) {
                            navigator.clipboard.writeText(`${window.location.origin}/preview/${resumeId}`);
                            toast.success('Share link copied!');
                        } else {
                            toast.error('Please save the resume first to share');
                        }
                    } else {
                        toast.error('Save the resume first to share');
                    }
                }}
                isMobile={window.innerWidth < 768}
            />

            {/* Modals */}
            <AIAssistant
                isOpen={isAIAssistantOpen}
                onClose={() => setIsAIAssistantOpen(false)}
                resumeData={currentResumeData}
                activeSection={activeSection}
                onApplySuggestion={(section, suggestion) => {
                    updateSectionData(section, suggestion);
                    toast.success('AI suggestion applied');
                }}
            />

            <TemplateSelector
                isOpen={isTemplateOpen}
                onClose={() => setIsTemplateOpen(false)}
                onSelect={handleTemplateChange}
                currentTemplate={currentResumeData?.template || 'modern'}
            />

            <StatsDashboard
                isOpen={isStatsOpen}
                onClose={() => setIsStatsOpen(false)}
                atsScore={currentResumeData?.atsScore || 0}
                resumes={[currentResumeData]}
                loading={isActuallyLoading}
                sectionBreakdown={safeCompletionData.sections}
                completionPercentage={safeCompletionData.percentage}
            />

            <SectionManager
                isOpen={isSectionManagerOpen}
                onClose={() => setIsSectionManagerOpen(false)}
                sections={SECTION_CONFIG}
                customSections={currentResumeData?.data?.customSections || {}}
                onAddSection={(sectionName) => {
                    const newSectionId = `custom_${Date.now()}`;
                    updateSectionData('customSections', {
                        ...currentResumeData?.data?.customSections,
                        [newSectionId]: {
                            title: sectionName,
                            items: []
                        }
                    });
                    setActiveSection(newSectionId);
                    toast.success(`Custom section "${sectionName}" added`);
                }}
            />

            <ResumeTitleEditor
                isOpen={isTitleEditorOpen}
                onClose={() => setIsTitleEditorOpen(false)}
                currentTitle={currentResumeData?.title || ''}
                onSave={async (newTitle) => {
                    if (newTitle.trim()) {
                        const updatedResume = {
                            ...currentResumeData,
                            title: newTitle.trim(),
                            updatedAt: new Date().toISOString()
                        };
                        contextSetResumeData(updatedResume);
                        await handleSave();
                        setIsTitleEditorOpen(false);
                    }
                }}
                isLoading={isSaving}
            />

            {/* Status Indicators */}
            {/* Socket Status */}
            {socketStatus.isConnecting && (
                <div className="fixed bottom-4 right-4 z-40">
                    <div className="px-3 py-1.5 bg-yellow-500 text-white rounded-lg shadow flex items-center gap-2 text-sm">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Connecting...</span>
                    </div>
                </div>
            )}

            {/* Cloud Save Status */}
            {user && (
                <div className="fixed bottom-16 right-4 z-40">
                    <div className={`px-3 py-1.5 rounded-lg shadow flex items-center gap-2 text-sm ${lastSaved
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-500 text-white'
                        }`}>
                        {lastSaved ? (
                            <>
                                <Cloud className="w-3 h-3" />
                                <span>Synced</span>
                            </>
                        ) : (
                            <>
                                <CloudOff className="w-3 h-3" />
                                <span>Local</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Unsaved Changes */}
            {hasUnsavedChanges && !isAutoSaving && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-amber-500 text-white px-3 py-1.5 rounded-lg shadow flex items-center gap-2 text-sm">
                        <AlertCircle className="w-3 h-3" />
                        <span>Unsaved changes</span>
                        <button
                            onClick={handleSave}
                            className="ml-2 px-2 py-0.5 bg-amber-600 hover:bg-amber-700 rounded text-xs"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Builder;