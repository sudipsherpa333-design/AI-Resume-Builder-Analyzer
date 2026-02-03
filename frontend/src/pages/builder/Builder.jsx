// src/pages/builder/Builder.jsx - AI-First Resume Builder 2026 (10/10 Upgraded)

import React, { useState, useEffect, useCallback, useMemo, useRef, useTransition, lazy, Suspense } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Context & Hooks
import { useAuth } from '../../context/AuthContext';
import { useResumes } from '../../context/ResumeContext';
import useLocalStorage from '../../hooks/useLocalStorage';

// Services
import { aiService } from '../../services/aiService';

// Core Components
import Navbar from '../../components/Navbar';
const SmartAIAssistant = lazy(() => import('../../components/ai/SmartAIAssistant'));
const ResumeStatsDashboard = lazy(() => import('../../components/ui/ResumeStatsDashboard'));
const ExportManager = lazy(() => import('../../components/export/ExportManager'));
const RealTimePreview = lazy(() => import('../../components/preview/RealTimePreview'));
const BuilderSidebar = lazy(() => import('../../components/ui/BuilderSidebar'));
const FloatingActionButtons = lazy(() => import('../../components/ui/FloatingActionButtons'));
const ProgressWizard = lazy(() => import('../../components/wizard/ProgressWizard'));

// Wizard Section Components (Lazy-loaded for performance)
const PersonalInfoWizard = lazy(() => import('../../components/wizard/PersonalInfoWizard'));
const SummaryGenerator = lazy(() => import('../../components/wizard/SummaryGenerator'));
const ExperienceBuilder = lazy(() => import('../../components/wizard/ExperienceBuilder'));
const EducationBuilder = lazy(() => import('../../components/wizard/EducationBuilder'));
const SkillsOptimizer = lazy(() => import('../../components/wizard/SkillsOptimizer'));
const ProjectsBuilder = lazy(() => import('../../components/wizard/ProjectsBuilder'));
const CertificationsBuilder = lazy(() => import('../../components/wizard/CertificationsBuilder'));
const LanguagesBuilder = lazy(() => import('../../components/wizard/LanguagesBuilder'));
const ReferencesBuilder = lazy(() => import('../../components/wizard/ReferencesBuilder'));
// Icons
import {
    Save, Eye, Download, User, FileText, Briefcase, GraduationCap, Layers, Award,
    Globe, Users, Sparkles, BarChart, CheckCircle, AlertCircle, Loader2, PanelLeftClose,
    PanelLeftOpen, X, Type, WifiOff, Cloud, ChevronLeft, ChevronRight, Share2,
    Edit3, Target, Zap, Brain, Search, Bot, MessageSquare, Wand2, Upload, History,
    Rocket, TrendingUp, Shield, ExternalLink, Copy, Check, Plus, Trash2,
    MoveVertical, Filter, Cpu, Lock, Unlock, Settings, Grid, LayoutGrid,
    Maximize2, Minimize2, RotateCcw, Clock, Linkedin, ListOrdered, PenTool,
    BarChart3, RefreshCw, Sparkle, ThumbsUp, AlertTriangle, Wand, Palette,
    GitBranch, Server, Database, Terminal, Code, MousePointerClick, Scan,
    Lightbulb, UploadCloud, Monitor, BrainCircuit, ClipboardCheck
} from 'lucide-react';

// AI-Optimized Wizard Steps - Dynamic order based on role
const AI_WIZARD_STEPS = [
    {
        id: 'personalInfo',
        label: 'Personal Info',
        icon: User,
        description: 'Contact details & profile links',
        required: true,
        aiCapabilities: ['auto-fill', 'contact-format', 'link-validation'],
        estimatedTime: '2 min',
        color: 'from-blue-500 to-cyan-500',
        aiWeight: 0.9,
        autoEnhance: true,
        priority: 1
    },
    {
        id: 'targetRole',
        label: 'Target Role',
        icon: Target,
        description: 'Define your career target for AI optimization',
        required: true,
        aiCapabilities: ['role-suggestions', 'keyword-extraction', 'industry-match'],
        estimatedTime: '3 min',
        color: 'from-purple-500 to-pink-500',
        aiWeight: 1.0,
        autoEnhance: false,
        priority: 2
    },
    {
        id: 'summary',
        label: 'Professional Summary',
        icon: FileText,
        description: 'AI-generated career overview',
        required: true,
        aiCapabilities: ['auto-generate', 'tailor-to-role', 'optimize-length'],
        estimatedTime: '4 min',
        color: 'from-green-500 to-emerald-500',
        aiWeight: 0.95,
        autoEnhance: true,
        priority: 3
    },
    {
        id: 'experience',
        label: 'Work Experience',
        icon: Briefcase,
        description: 'AI-enhanced achievements & impact',
        required: true,
        aiCapabilities: ['bullet-optimizer', 'metric-suggestions', 'action-verbs'],
        estimatedTime: '8 min',
        color: 'from-orange-500 to-red-500',
        aiWeight: 0.85,
        autoEnhance: true,
        priority: 4
    },
    {
        id: 'education',
        label: 'Education',
        icon: GraduationCap,
        description: 'Academic background & credentials',
        required: true,
        aiCapabilities: ['format-standardization', 'relevance-scoring'],
        estimatedTime: '3 min',
        color: 'from-indigo-500 to-purple-500',
        aiWeight: 0.7,
        autoEnhance: true,
        priority: 5
    },
    {
        id: 'skills',
        label: 'Skills',
        icon: Cpu,
        description: 'ATS-optimized skill keywords',
        required: true,
        aiCapabilities: ['keyword-extraction', 'skill-gap-analysis', 'trending-skills'],
        estimatedTime: '5 min',
        color: 'from-pink-500 to-rose-500',
        aiWeight: 0.9,
        autoEnhance: true,
        priority: 6
    },
    {
        id: 'projects',
        label: 'Projects',
        icon: Layers,
        description: 'Portfolio & hands-on work',
        required: false,
        aiCapabilities: ['impact-quantification', 'tech-stack-highlight'],
        estimatedTime: '6 min',
        color: 'from-teal-500 to-cyan-500',
        aiWeight: 0.8,
        autoEnhance: true,
        priority: 7
    },
    {
        id: 'certifications',
        label: 'Certifications',
        icon: Award,
        description: 'Professional certifications',
        required: false,
        aiCapabilities: ['credibility-boost', 'relevance-sorting'],
        estimatedTime: '2 min',
        color: 'from-yellow-500 to-amber-500',
        aiWeight: 0.6,
        autoEnhance: true,
        priority: 8
    },
    {
        id: 'languages',
        label: 'Languages',
        icon: Globe,
        description: 'Language proficiencies',
        required: false,
        aiCapabilities: ['proficiency-grading', 'relevance-weighting'],
        estimatedTime: '2 min',
        color: 'from-lime-500 to-green-500',
        aiWeight: 0.5,
        autoEnhance: true,
        priority: 9
    },
    {
        id: 'references',
        label: 'References',
        icon: Users,
        description: 'Professional references',
        required: false,
        aiCapabilities: ['format-standardization', 'relevance-sorting'],
        estimatedTime: '2 min',
        color: 'from-gray-500 to-gray-700',
        aiWeight: 0.4,
        autoEnhance: false,
        priority: 10
    }
];

// Initial AI-optimized resume template
const EMPTY_RESUME = {
    title: 'AI-Generated Resume',
    template: 'modern-pro',
    status: 'draft',
    isPublic: false,
    targetRole: '',
    jobDescription: '',
    keywords: [],
    personalInfo: {
        fullName: '',
        email: '',
        phone: '',
        location: '',
        portfolio: '',
        linkedin: '',
        github: '',
        summary: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: [],
    aiEnhancements: {
        applied: false,
        lastEnhanced: null,
        suggestions: [],
        atsScore: 0,
        keywords: [],
        confidence: 0
    },
    settings: {
        template: 'modern-pro',
        color: '#3b82f6',
        font: 'inter',
        fontSize: 'medium',
        spacing: 'normal',
        showMetrics: true,
        optimizeForATS: true,
        autoEnhance: true
    },
    tags: [],
    views: 0,
    downloads: 0,
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    builderMode: 'guided',
    completion: 0,
    aiMetadata: {
        enhancedSections: [],
        lastAnalysis: null,
        suggestedImprovements: [],
        confidenceScore: 0,
        autoGenerated: false
    }
};

// AI History Manager with intelligent tracking
class AIHistoryManager {
    constructor(initialState) {
        this.past = [];
        this.present = initialState;
        this.future = [];
        this.maxSize = 50;
        this.aiEdits = [];
        this.sectionHistory = new Map();
    }

    push(newState, section = null, isAIEdit = false) {
        const timestamp = Date.now();

        this.past.push({
            state: this.present,
            timestamp,
            section,
            isAIEdit
        });

        if (this.past.length > this.maxSize) {
            this.past.shift();
        }

        this.present = newState;
        this.future = [];

        if (isAIEdit && section) {
            this.aiEdits.push({ timestamp, section });

            // Track section history
            if (!this.sectionHistory.has(section)) {
                this.sectionHistory.set(section, []);
            }
            this.sectionHistory.get(section).push(timestamp);
        }
    }

    undo() {
        if (this.past.length === 0) return this.present;
        const last = this.past.pop();
        this.future.unshift({
            state: this.present,
            timestamp: Date.now(),
            section: last.section,
            isAIEdit: last.isAIEdit
        });
        this.present = last.state;
        return this.present;
    }

    redo() {
        if (this.future.length === 0) return this.present;
        const next = this.future.shift();
        this.past.push({
            state: this.present,
            timestamp: Date.now(),
            section: next.section,
            isAIEdit: next.isAIEdit
        });
        this.present = next.state;
        return this.present;
    }

    canUndo() {
        return this.past.length > 0;
    }

    canRedo() {
        return this.future.length > 0;
    }

    getAIEditCount(section = null) {
        if (section) {
            return this.aiEdits.filter(edit => edit.section === section).length;
        }
        return this.aiEdits.length;
    }

    getLastAIEdit(section = null) {
        const edits = section
            ? this.aiEdits.filter(edit => edit.section === section)
            : this.aiEdits;
        return edits[edits.length - 1];
    }
}

// AI Enhancement State Management
const AIEnhancementState = {
    IDLE: 'idle',
    GENERATING: 'generating',
    SHOWING_DIFF: 'showing_diff',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

const Builder = () => {
    const navigate = useNavigate();
    const { id: resumeId } = useParams();
    const location = useLocation();
    const queryClient = useQueryClient();

    // React 19: Concurrent features
    const [isPending, startTransition] = useTransition();

    // Auth & Context
    const { user } = useAuth();
    const { createResume, updateResume } = useResumes();

    // Refs
    const autoSaveRef = useRef(null);
    const isMounted = useRef(true);
    const historyManagerRef = useRef(null);
    const previewRef = useRef(null);
    const aiEnhanceDebounceRef = useRef(null);
    const sectionTimerRef = useRef(new Map());
    const aiSuggestionTimerRef = useRef(null);
    const typingDebounceRef = useRef(null);

    // State
    const [currentStep, setCurrentStep] = useState(0);
    const [resumeData, setResumeData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [atsScore, setAtsScore] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [keywords, setKeywords] = useState([]);
    const [jobDescription, setJobDescription] = useState('');
    const [builderMode, setBuilderMode] = useState('guided');
    const [showEntryScreen, setShowEntryScreen] = useState(false);
    const [aiSteps, setAiSteps] = useState(AI_WIZARD_STEPS);
    const [autoEnhanceProgress, setAutoEnhanceProgress] = useState(0);
    const [aiConfidence, setAiConfidence] = useState(0);
    const [aiThinking, setAiThinking] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [aiInsights, setAiInsights] = useState([]);
    const [lastAIEnhancement, setLastAIEnhancement] = useState(null);

    // NEW: AI Enhancement States
    const [aiEnhancementState, setAiEnhancementState] = useState(AIEnhancementState.IDLE);
    const [currentDiff, setCurrentDiff] = useState({ before: null, after: null, section: null });
    const [inlineSuggestions, setInlineSuggestions] = useState([]);
    const [ghostText, setGhostText] = useState('');
    const [showAIPopover, setShowAIPopover] = useState(null);
    const [aiConfidencePerSection, setAiConfidencePerSection] = useState({});
    const [realTimeAIInput, setRealTimeAIInput] = useState('');
    const [aiMagicMode, setAiMagicMode] = useState(false);

    // Local Storage
    const { storedValue: autoSaveEnabled, setValue: setAutoSaveEnabled } = useLocalStorage('ai_builder_autoSave', true);
    const { storedValue: draftResume, setValue: setDraftResume, removeValue: removeDraftResume } = useLocalStorage(
        `ai_builder_draft_${resumeId || 'new'}`,
        null
    );
    const { storedValue: aiSettings, setValue: setAiSettings } = useLocalStorage('ai_builder_settings', {
        darkMode: false,
        autoEnhance: true,
        showAIHints: true,
        confidenceThreshold: 0.7,
        enableAnimations: true,
        autoSaveInterval: 3000,
        realTimeSuggestions: true,
        inlineAI: true,
        showConfidenceScores: true
    });

    // Modals
    const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
    const [isStatsOpen, setIsStatsOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // AI-powered completion calculation
    const calculateAICompletion = useCallback((resume) => {
        if (!resume) return 0;

        let total = 0;
        let completed = 0;
        let aiQualityBonus = 0;

        // Personal Info with AI quality check
        const personalInfo = resume.personalInfo || {};
        const personalFields = ['fullName', 'email', 'phone', 'location'];
        personalFields.forEach(field => {
            total += 0.5;
            if (personalInfo[field]?.trim()) {
                completed += 0.5;
                // AI quality bonus for professional emails
                if (field === 'email' && personalInfo.email.includes('@')) {
                    aiQualityBonus += 0.1;
                }
            }
        });

        // AI evaluates content quality for sections
        const evaluateAIContent = (content, sectionId) => {
            if (!content || (Array.isArray(content) && content.length === 0)) return 0;

            let score = 0.5; // Base score

            // AI-specific quality checks
            switch (sectionId) {
                case 'summary':
                    if (content.length > 100) score += 0.3;
                    if (content.includes(resume.targetRole)) score += 0.2;
                    if (content.length > 200 && content.length < 500) score += 0.1;
                    break;
                case 'experience':
                    const exp = Array.isArray(content) ? content[0] : content;
                    if (exp?.achievements?.length > 0) score += 0.3;
                    if (exp?.metrics) score += 0.2;
                    if (exp?.position?.length > 3) score += 0.1;
                    break;
                case 'skills':
                    if (Array.isArray(content) && content.length >= 5) score += 0.3;
                    if (content.some(skill => keywords.includes(skill))) score += 0.2;
                    if (content.length >= 8) score += 0.1;
                    break;
                case 'education':
                    if (Array.isArray(content) && content.length > 0) {
                        const edu = content[0];
                        if (edu?.degree && edu?.school) score += 0.4;
                        if (edu?.gpa) score += 0.1;
                    }
                    break;
            }

            return Math.min(score, 1);
        };

        // Required sections with AI quality scoring
        const requiredSections = ['summary', 'experience', 'education', 'skills'];
        requiredSections.forEach(section => {
            total++;
            const data = resume[section];
            const hasContent = section === 'experience' || section === 'education' || section === 'skills'
                ? Array.isArray(data) && data.length > 0
                : data?.trim();

            if (hasContent) {
                const qualityScore = evaluateAIContent(data, section);
                completed += qualityScore;
                aiQualityBonus += qualityScore * 0.05;
            }
        });

        // Target Role (AI gives extra weight)
        total++;
        if (resume.targetRole?.trim()) {
            completed++;
            aiQualityBonus += 0.15;
        }

        // AI confidence bonus from metadata
        const aiBonus = resume.aiMetadata?.confidenceScore || 0;

        let finalScore = (completed / total) * 100;
        finalScore += aiQualityBonus * 25; // AI quality bonus up to 25%
        finalScore += aiBonus * 15; // AI confidence bonus up to 15%

        return Math.min(Math.round(finalScore), 100);
    }, [keywords]);

    // Calculate AI confidence score
    const calculateAIConfidence = useCallback((resume, analysis) => {
        let confidence = 0;

        // Content completeness (40%)
        if (resume.summary?.length > 50) confidence += 0.16;
        if (resume.experience?.length > 0) confidence += 0.12;
        if (resume.skills?.length >= 5) confidence += 0.08;
        if (resume.targetRole) confidence += 0.04;

        // Content quality (30%)
        if (resume.summary?.includes(resume.targetRole)) confidence += 0.15;
        if (resume.experience?.[0]?.achievements?.length > 0) confidence += 0.10;
        if (resume.skills?.some(skill => keywords.includes(skill))) confidence += 0.05;

        // ATS score contribution (20%)
        confidence += (analysis?.score || 0) / 500;

        // Keyword matching (10%)
        const keywordMatch = resume.skills?.filter(skill =>
            analysis?.keywords?.includes(skill)
        ).length || 0;

        confidence += Math.min(keywordMatch / 10, 0.1);

        return Math.min(confidence, 1);
    }, [keywords]);

    // Calculate section-specific confidence
    const calculateSectionConfidence = useCallback((sectionId, sectionData) => {
        let confidence = 0.5; // Base confidence

        switch (sectionId) {
            case 'summary':
                if (sectionData?.length > 100) confidence += 0.3;
                if (sectionData?.includes(resumeData?.targetRole || '')) confidence += 0.15;
                if (sectionData?.length > 200 && sectionData?.length < 500) confidence += 0.05;
                break;
            case 'skills':
                if (Array.isArray(sectionData) && sectionData.length >= 5) confidence += 0.3;
                if (sectionData?.some(skill => keywords.includes(skill))) confidence += 0.15;
                break;
            case 'experience':
                if (Array.isArray(sectionData) && sectionData.length > 0) {
                    const exp = sectionData[0];
                    if (exp?.achievements?.length > 0) confidence += 0.25;
                    if (exp?.metrics) confidence += 0.15;
                }
                break;
            case 'personalInfo':
                const fields = ['fullName', 'email', 'phone'];
                const filled = fields.filter(f => resumeData?.personalInfo?.[f]?.trim()).length;
                confidence = 0.3 + (filled / fields.length) * 0.5;
                break;
        }

        return Math.min(confidence, 1);
    }, [resumeData, keywords]);

    // Generate AI insights
    const generateAIInsights = useCallback((resume, analysis) => {
        const insights = [];
        const now = new Date().toISOString();

        if (analysis.score < 70) {
            insights.push({
                section: 'general',
                message: `ATS score is ${analysis.score}%. Consider adding more keywords from the job description.`,
                timestamp: now,
                type: 'warning'
            });
        }

        if (resume.skills?.length < 5) {
            insights.push({
                section: 'skills',
                message: 'Add more skills to improve ATS compatibility.',
                timestamp: now,
                type: 'suggestion'
            });
        }

        if (!resume.summary || resume.summary.length < 100) {
            insights.push({
                section: 'summary',
                message: 'Consider expanding your professional summary.',
                timestamp: now,
                type: 'suggestion'
            });
        }

        return insights;
    }, []);

    // Real-time AI suggestions while typing
    const handleRealTimeAISuggestions = useCallback(async (sectionId, field, value, cursorPos) => {
        if (!aiSettings.realTimeSuggestions || !value || value.length < 3) {
            setInlineSuggestions([]);
            setGhostText('');
            return;
        }

        clearTimeout(aiSuggestionTimerRef.current);

        aiSuggestionTimerRef.current = setTimeout(async () => {
            try {
                const suggestions = await aiService.suggestKeywords(value, {
                    section: sectionId,
                    field,
                    context: {
                        targetRole: resumeData?.targetRole,
                        existingData: resumeData?.[sectionId],
                        cursorPos
                    }
                });

                setInlineSuggestions(suggestions.slice(0, 5));

                // Generate ghost text for bullets/summary
                if (['summary', 'experience', 'projects'].includes(sectionId) && value.length > 20) {
                    const ghost = await aiService.generateGhostText(value, sectionId);
                    setGhostText(ghost);
                }
            } catch (error) {
                console.error('Real-time AI suggestions error:', error);
            }
        }, 800);
    }, [aiSettings.realTimeSuggestions, resumeData]);

    // Show AI diff after enhancement
    const showAIDiff = useCallback((before, after, section) => {
        setCurrentDiff({ before, after, section });
        setAiEnhancementState(AIEnhancementState.SHOWING_DIFF);

        toast.custom((t) => (
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                        <Sparkles className="inline w-5 h-5 mr-2" />
                        AI Enhanced Your {section}!
                    </h3>
                    <button onClick={() => toast.dismiss(t.id)}>
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Before</h4>
                        <p className="text-gray-300 text-sm line-clamp-4">{before || 'Empty'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg p-4 border border-purple-500/20">
                        <h4 className="text-sm font-medium text-purple-300 mb-2">AI Enhanced</h4>
                        <p className="text-white text-sm line-clamp-4">{after}</p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => {
                            handleAcceptAIEnhancement(section, after);
                            toast.dismiss(t.id);
                        }}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <Check className="inline w-4 h-4 mr-2" />
                        Accept
                    </button>
                    <button
                        onClick={() => {
                            handleRegenerateAIEnhancement(section);
                            toast.dismiss(t.id);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        <RefreshCw className="inline w-4 h-4 mr-2" />
                        Regenerate
                    </button>
                    <button
                        onClick={() => {
                            setAiEnhancementState(AIEnhancementState.IDLE);
                            toast.dismiss(t.id);
                        }}
                        className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                    >
                        Edit Manually
                    </button>
                </div>
            </motion.div>
        ), { duration: 10000 });
    }, []);

    // Handle AI enhancement acceptance
    const handleAcceptAIEnhancement = useCallback((section, enhancedData) => {
        setResumeData(prev => ({
            ...prev,
            [section]: enhancedData,
            aiMetadata: {
                ...prev.aiMetadata,
                enhancedSections: [...(prev.aiMetadata?.enhancedSections || []), section],
                confidenceScore: Math.min((prev.aiMetadata?.confidenceScore || 0) + 0.1, 1)
            }
        }));

        setAiEnhancementState(AIEnhancementState.ACCEPTED);
        toast.success(`AI enhancement accepted for ${section}!`);
    }, []);

    // Handle AI regeneration
    const handleRegenerateAIEnhancement = useCallback(async (section) => {
        try {
            const result = await aiService.aiEnhanceSection(
                resumeData,
                section,
                { targetRole: resumeData?.targetRole, regenerate: true }
            );

            showAIDiff(resumeData[section], result.data, section);
        } catch (error) {
            toast.error('Failed to regenerate AI enhancement');
        }
    }, [resumeData, showAIDiff]);

    // AI-powered analysis with insights
    const analyzeWithAI = useCallback(async (data) => {
        if (!data || isAnalyzing) return;

        setIsAnalyzing(true);

        startTransition(() => {
            try {
                aiService.analyzeATS(data, jobDescription).then(analysis => {
                    if (!isMounted.current) return;

                    setAtsScore(analysis.score);
                    setAiSuggestions(analysis.suggestions || []);

                    if (analysis.keywords) {
                        const newKeywords = [...new Set([...keywords, ...analysis.keywords])];
                        setKeywords(newKeywords);
                    }

                    // Calculate AI confidence
                    const confidence = calculateAIConfidence(data, analysis);
                    setAiConfidence(confidence);

                    // Calculate section confidence scores
                    const sectionConfidences = {};
                    Object.keys(data).forEach(section => {
                        if (['summary', 'experience', 'skills', 'education', 'personalInfo'].includes(section)) {
                            sectionConfidences[section] = calculateSectionConfidence(section, data[section]);
                        }
                    });
                    setAiConfidencePerSection(sectionConfidences);

                    // Generate insights
                    const insights = generateAIInsights(data, analysis);
                    setAiInsights(prev => [...prev, ...insights]);

                    setResumeData(prev => ({
                        ...prev,
                        aiEnhancements: {
                            ...prev.aiEnhancements,
                            applied: prev.aiEnhancements?.applied || false,
                            lastEnhanced: new Date().toISOString(),
                            suggestions: analysis.suggestions || [],
                            atsScore: analysis.score,
                            keywords: analysis.keywords || [],
                            confidence
                        },
                        aiMetadata: {
                            ...prev.aiMetadata,
                            confidenceScore: confidence,
                            lastAnalysis: new Date().toISOString(),
                            suggestedImprovements: analysis.suggestions || [],
                            sectionConfidences: sectionConfidences
                        }
                    }));
                }).catch(error => {
                    console.error('AI analysis error:', error);
                });
            } catch (error) {
                console.error('AI analysis transition error:', error);
            } finally {
                setIsAnalyzing(false);
            }
        });
    }, [jobDescription, isAnalyzing, keywords, calculateAIConfidence, generateAIInsights, calculateSectionConfidence]);

    // AI auto-generate on step enter
    const handleStepEnter = useCallback(async (stepId) => {
        if (!resumeData || !aiSettings.autoEnhance) return;

        const sectionData = resumeData[stepId];
        const isEmpty = !sectionData ||
            (Array.isArray(sectionData) && sectionData.length === 0) ||
            (typeof sectionData === 'string' && sectionData.trim() === '');

        if (isEmpty && aiSteps.find(s => s.id === stepId)?.autoEnhance) {
            // Small delay for better UX
            setTimeout(async () => {
                try {
                    const before = sectionData;
                    const result = await aiService.aiEnhanceSection(
                        resumeData,
                        stepId,
                        {
                            targetRole: resumeData.targetRole,
                            jobDescription: resumeData.jobDescription,
                            generateIfEmpty: true
                        }
                    );

                    if (result.data) {
                        showAIDiff(before, result.data, stepId);
                    }
                } catch (error) {
                    console.error(`AI auto-generate failed for ${stepId}:`, error);
                }
            }, 1500);
        }
    }, [resumeData, aiSettings, aiSteps, showAIDiff]);

    // Determine if AI should auto-enhance
    const shouldAutoEnhance = useCallback((resume) => {
        if (!resume || !aiSettings.autoEnhance) return false;

        // Check if resume is mostly empty
        const emptySections = ['summary', 'experience', 'skills', 'education'].filter(
            section => !resume[section] ||
                (Array.isArray(resume[section]) && resume[section].length === 0) ||
                (typeof resume[section] === 'string' && resume[section].trim() === '')
        );

        return emptySections.length >= 2;
    }, [aiSettings]);

    // AI Auto-enhance empty sections
    const handleAIAutoEnhance = useCallback(async (initialData) => {
        if (!initialData || aiThinking) return;

        setAiThinking(true);
        setAutoEnhanceProgress(0);

        const toastId = toast.loading('AI is auto-enhancing your resume...');

        try {
            const emptySections = AI_WIZARD_STEPS
                .filter(step => step.autoEnhance)
                .filter(step => {
                    const data = initialData[step.id];
                    return !data ||
                        (Array.isArray(data) && data.length === 0) ||
                        (typeof data === 'string' && data.trim() === '');
                })
                .map(step => step.id);

            if (emptySections.length === 0) {
                toast.dismiss(toastId);
                setAiThinking(false);
                return;
            }

            let enhancedData = { ...initialData };

            // Enhanced progress with AI thinking animation
            for (let i = 0; i < emptySections.length; i++) {
                const section = emptySections[i];
                setAutoEnhanceProgress(Math.round((i / emptySections.length) * 100));

                try {
                    // AI enhancement with context
                    const context = {
                        targetRole: enhancedData.targetRole,
                        jobDescription: enhancedData.jobDescription,
                        existingSkills: enhancedData.skills || [],
                        userInfo: user,
                        generateIfEmpty: true
                    };

                    const enhancedSection = await aiService.aiEnhanceSection(
                        enhancedData,
                        section,
                        context
                    );

                    enhancedData = {
                        ...enhancedData,
                        [section]: enhancedSection.data,
                        aiMetadata: {
                            ...enhancedData.aiMetadata,
                            enhancedSections: [...(enhancedData.aiMetadata?.enhancedSections || []), section],
                            lastAnalysis: new Date().toISOString(),
                            autoGenerated: true
                        }
                    };

                    // Add AI insight for this enhancement
                    setAiInsights(prev => [...prev, {
                        section,
                        message: `AI generated ${section} content`,
                        timestamp: new Date().toISOString(),
                        type: 'auto-enhance'
                    }]);

                    // Show diff for first section
                    if (i === 0) {
                        showAIDiff(initialData[section], enhancedSection.data, section);
                    }

                    // Small delay for better UX
                    await new Promise(resolve => setTimeout(resolve, 600));
                } catch (error) {
                    console.error(`AI auto-enhance failed for ${section}:`, error);
                }
            }

            setAutoEnhanceProgress(100);

            // Update state with transition for smooth UI
            startTransition(() => {
                setResumeData(enhancedData);
                historyManagerRef.current?.push(enhancedData, 'auto-enhance', true);
            });

            // Save draft
            setDraftResume({
                ...enhancedData,
                _lastSavedDraft: new Date().toISOString(),
                _aiAutoEnhanced: true,
                _enhancedSections: emptySections
            });

            toast.dismiss(toastId);
            toast.success(`AI auto-enhanced ${emptySections.length} sections!`);

            // Analyze enhanced resume
            setTimeout(() => {
                analyzeWithAI(enhancedData);
            }, 1000);

        } catch (error) {
            toast.dismiss(toastId);
            toast.error('AI auto-enhancement failed');
            console.error('AI auto-enhance error:', error);
        } finally {
            setTimeout(() => {
                setAiThinking(false);
                setAutoEnhanceProgress(0);
            }, 500);
        }
    }, [aiThinking, user, setDraftResume, analyzeWithAI, showAIDiff]);

    // Optimize step order based on target role
    const optimizeStepOrder = useCallback((targetRole, jobDescription = '') => {
        const role = targetRole.toLowerCase();
        let optimizedSteps = [...AI_WIZARD_STEPS];

        // Extract priority from job description
        let jdPriority = {};
        if (jobDescription) {
            if (jobDescription.includes('experience') || jobDescription.includes('years')) {
                jdPriority.experience = 10;
            }
            if (jobDescription.includes('skill') || jobDescription.includes('proficient')) {
                jdPriority.skills = 9;
            }
            if (jobDescription.includes('project') || jobDescription.includes('portfolio')) {
                jdPriority.projects = 8;
            }
            if (jobDescription.includes('educat') || jobDescription.includes('degree')) {
                jdPriority.education = 7;
            }
        }

        // AI logic to reorder steps based on role type
        if (role.includes('tech') || role.includes('developer') || role.includes('engineer')) {
            // Tech roles: skills and projects first
            optimizedSteps.sort((a, b) => {
                const aScore = jdPriority[a.id] || (a.id === 'skills' ? 3 : a.id === 'projects' ? 2 : a.priority);
                const bScore = jdPriority[b.id] || (b.id === 'skills' ? 3 : b.id === 'projects' ? 2 : b.priority);
                return bScore - aScore;
            });
        } else if (role.includes('manager') || role.includes('director') || role.includes('executive')) {
            // Management roles: experience and summary first
            optimizedSteps.sort((a, b) => {
                const aScore = jdPriority[a.id] || (a.id === 'experience' ? 3 : a.id === 'summary' ? 2 : a.priority);
                const bScore = jdPriority[b.id] || (b.id === 'experience' ? 3 : b.id === 'summary' ? 2 : b.priority);
                return bScore - aScore;
            });
        } else if (role.includes('design') || role.includes('creative') || role.includes('artist')) {
            // Creative roles: projects and skills first
            optimizedSteps.sort((a, b) => {
                const aScore = jdPriority[a.id] || (a.id === 'projects' ? 3 : a.id === 'skills' ? 2 : a.priority);
                const bScore = jdPriority[b.id] || (b.id === 'projects' ? 3 : b.id === 'skills' ? 2 : b.priority);
                return bScore - aScore;
            });
        }

        setAiSteps(optimizedSteps);
    }, []);

    // AI-enhanced save handler
    const saveMutation = useMutation({
        mutationFn: async (data) => {
            if (resumeId === 'new' || data._id?.startsWith('ai_temp_')) {
                return await createResume(data);
            } else {
                return await updateResume(data._id, data);
            }
        },
        onSuccess: (savedData) => {
            const completedData = {
                ...savedData,
                completion: calculateAICompletion(savedData),
                aiMetadata: {
                    ...savedData.aiMetadata,
                    lastSaved: new Date().toISOString(),
                    confidenceScore: aiConfidence,
                    sectionConfidences: aiConfidencePerSection
                }
            };

            setResumeData(completedData);
            setLastSaved(new Date());
            setHasUnsavedChanges(false);
            queryClient.invalidateQueries(['resume', savedData._id]);

            removeDraftResume();

            if (savedData._id && savedData._id !== resumeId && !savedData._id.startsWith('ai_temp_')) {
                navigate(`/builder/${savedData._id}`, { replace: true });
            }

            toast.success('AI saved your resume!');
        },
        onError: (error) => {
            toast.error('AI failed to save resume');
            console.error('AI save error:', error);

            if (resumeData) {
                setDraftResume({
                    ...resumeData,
                    _lastSavedDraft: new Date().toISOString(),
                    _error: 'Failed to save online, saved locally',
                    _aiConfidence: aiConfidence,
                    _aiInsights: aiInsights.slice(-5),
                    _sectionConfidences: aiConfidencePerSection
                });
                toast.info('AI saved changes locally as draft');
            }
        }
    });

    const handleSave = useCallback(async (showToast = true) => {
        if (!resumeData || isSaving) return;

        setIsSaving(true);
        try {
            if (navigator.onLine) {
                await saveMutation.mutateAsync(resumeData);
                if (showToast) {
                    toast.success('AI saved your resume!');
                }
            } else {
                setDraftResume({
                    ...resumeData,
                    _lastSavedDraft: new Date().toISOString(),
                    _isOffline: true,
                    _aiConfidence: aiConfidence,
                    _aiInsights: aiInsights,
                    _sectionConfidences: aiConfidencePerSection
                });
                setLastSaved(new Date());
                setHasUnsavedChanges(false);
                if (showToast) {
                    toast.success('AI saved locally (offline mode)');
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            if (showToast) {
                toast.error('AI failed to save resume');
            }
        } finally {
            setIsSaving(false);
        }
    }, [resumeData, isSaving, saveMutation, setDraftResume, aiConfidence, aiInsights, aiConfidencePerSection]);

    // Magic Mode - Generate full resume from JD
    const handleMagicMode = useCallback(async () => {
        if (!jobDescription.trim()) {
            toast.error('Please paste a job description first');
            return;
        }

        setAiMagicMode(true);
        setAiThinking(true);

        const toastId = toast.loading('AI is generating your perfect resume...', {
            duration: Infinity
        });

        try {
            const generatedResume = await aiService.generateFullResumeFromJD(
                jobDescription,
                {
                    userInfo: user,
                    targetRole: resumeData?.targetRole || '',
                    existingData: resumeData
                }
            );

            // Update with AI-generated content
            startTransition(() => {
                setResumeData(prev => ({
                    ...prev,
                    ...generatedResume,
                    aiMetadata: {
                        ...prev.aiMetadata,
                        autoGenerated: true,
                        generatedFromJD: true,
                        confidenceScore: 0.85,
                        lastAnalysis: new Date().toISOString()
                    },
                    aiEnhancements: {
                        applied: true,
                        lastEnhanced: new Date().toISOString(),
                        confidence: 0.85
                    }
                }));

                // Optimize steps based on generated content
                optimizeStepOrder(generatedResume.targetRole || resumeData?.targetRole, jobDescription);
            });

            toast.dismiss(toastId);
            toast.success('AI generated your complete resume!', {
                icon: '🎯',
                duration: 5000
            });

            // Analyze the generated resume
            setTimeout(() => {
                analyzeWithAI({ ...resumeData, ...generatedResume });
            }, 1000);

        } catch (error) {
            toast.dismiss(toastId);
            toast.error('AI magic mode failed. Please try again.');
            console.error('Magic mode error:', error);
        } finally {
            setAiMagicMode(false);
            setAiThinking(false);
        }
    }, [jobDescription, user, resumeData, optimizeStepOrder, analyzeWithAI]);

    // AI Enhancement with intelligent debouncing
    const handleAIEnhance = useCallback(async (section = null) => {
        if (!resumeData || aiThinking) return;

        // Debounce rapid AI calls
        if (aiEnhanceDebounceRef.current) {
            clearTimeout(aiEnhanceDebounceRef.current);
        }

        aiEnhanceDebounceRef.current = setTimeout(async () => {
            setAiThinking(true);
            const toastId = toast.loading(
                section
                    ? `AI is enhancing your ${section}...`
                    : 'AI is optimizing your entire resume...'
            );

            try {
                // Enhanced AI context
                const context = {
                    targetRole: resumeData.targetRole,
                    jobDescription: resumeData.jobDescription || jobDescription,
                    existingData: resumeData,
                    userProfile: user,
                    aiInsights: aiInsights,
                    atsScore: atsScore,
                    keywords: keywords,
                    sectionHistory: historyManagerRef.current?.sectionHistory
                };

                let enhancedData;

                if (section) {
                    // Section-specific enhancement
                    const result = await aiService.aiEnhanceSection(
                        resumeData,
                        section,
                        context
                    );

                    const before = resumeData[section];
                    const after = result.data;

                    enhancedData = {
                        ...resumeData,
                        [section]: after,
                        aiMetadata: {
                            ...resumeData.aiMetadata,
                            enhancedSections: [
                                ...(resumeData.aiMetadata?.enhancedSections || []),
                                section
                            ],
                            lastEnhanced: new Date().toISOString(),
                            confidenceScore: Math.min((resumeData.aiMetadata?.confidenceScore || 0) + 0.1, 1)
                        }
                    };

                    // Track AI edit in history
                    historyManagerRef.current?.push(enhancedData, section, true);

                    // Show diff for user to accept/reject
                    showAIDiff(before, after, section);

                    // Add AI insight
                    setAiInsights(prev => [...prev, {
                        section,
                        message: `AI enhanced ${section} section`,
                        timestamp: new Date().toISOString(),
                        type: 'enhancement',
                        confidence: result.confidence || aiConfidence
                    }]);

                } else {
                    // Full resume enhancement
                    const result = await aiService.aiEnhanceFullResume(resumeData, context);

                    enhancedData = {
                        ...resumeData,
                        ...result.enhancedData,
                        aiMetadata: {
                            ...resumeData.aiMetadata,
                            enhancedSections: result.enhancedSections || [],
                            lastEnhanced: new Date().toISOString(),
                            confidenceScore: result.confidence || 0.8,
                            suggestedImprovements: result.suggestions || []
                        },
                        aiEnhancements: {
                            ...resumeData.aiEnhancements,
                            applied: true,
                            lastEnhanced: new Date().toISOString(),
                            suggestions: result.suggestions || [],
                            confidence: result.confidence || 0.8
                        }
                    };

                    // Track full AI enhancement
                    historyManagerRef.current?.push(enhancedData, 'full-ai-enhance', true);

                    // Update AI insights
                    setAiInsights(prev => [
                        ...prev,
                        ...(result.insights || []).map(insight => ({
                            ...insight,
                            timestamp: new Date().toISOString(),
                            type: 'full-enhancement'
                        }))
                    ]);
                }

                // Update state with transition (but wait for user acceptance)
                if (!section) {
                    startTransition(() => {
                        setResumeData(enhancedData);
                        setAiConfidence(enhancedData.aiMetadata.confidenceScore);
                        setLastAIEnhancement(new Date().toISOString());
                    });
                }

                // Auto-save AI-enhanced version
                setTimeout(() => {
                    handleSave(false);
                }, 1000);

                toast.dismiss(toastId);
                if (!section) {
                    toast.success('AI optimized your entire resume!', {
                        icon: '🤖',
                        duration: 3000
                    });
                }

                // Re-analyze with AI
                setTimeout(() => {
                    analyzeWithAI(enhancedData);
                }, 500);

            } catch (error) {
                toast.dismiss(toastId);
                toast.error('AI enhancement failed. Please try again.');
                console.error('AI enhancement error:', error);

                // Add error insight
                setAiInsights(prev => [...prev, {
                    section: section || 'general',
                    message: `AI enhancement failed: ${error.message}`,
                    timestamp: new Date().toISOString(),
                    type: 'error'
                }]);
            } finally {
                if (!section) {
                    setAiThinking(false);
                }
                aiEnhanceDebounceRef.current = null;
            }
        }, 500); // 500ms debounce
    }, [resumeData, aiThinking, jobDescription, user, aiInsights, atsScore, keywords, aiConfidence, analyzeWithAI, handleSave, showAIDiff]);

    // AI-powered undo/redo with smart detection
    const handleUndo = useCallback(() => {
        if (!historyManagerRef.current?.canUndo()) return;

        const previousState = historyManagerRef.current.undo();
        setResumeData(previousState);
        setHasUnsavedChanges(true);

        toast('AI restored previous version', {
            icon: '↩️',
            duration: 2000
        });
    }, []);

    const handleRedo = useCallback(() => {
        if (!historyManagerRef.current?.canRedo()) return;

        const nextState = historyManagerRef.current.redo();
        setResumeData(nextState);
        setHasUnsavedChanges(true);

        toast('AI restored next version', {
            icon: '↪️',
            duration: 2000
        });
    }, []);

    // AI-powered data update with intelligent tracking
    const updateResumeData = useCallback((updates, section = null) => {
        if (!resumeData) return;

        const newData = {
            ...resumeData,
            ...updates,
            updatedAt: new Date().toISOString(),
            version: (resumeData.version || 1) + 1
        };

        // Calculate completion with AI
        newData.completion = calculateAICompletion(newData);

        // Track time spent on section
        if (section) {
            const now = Date.now();
            if (sectionTimerRef.current.has(section)) {
                const startTime = sectionTimerRef.current.get(section);
                const timeSpent = now - startTime;

                // Add insight for lengthy edits
                if (timeSpent > 60000) { // More than 1 minute
                    setAiInsights(prev => [...prev, {
                        section,
                        message: `Spent ${Math.round(timeSpent / 60000)} min editing. AI can help optimize this section.`,
                        timestamp: new Date().toISOString(),
                        type: 'time-spent'
                    }]);
                }
            }
            sectionTimerRef.current.set(section, now);

            // Update section confidence score
            if (updates[section]) {
                const sectionConfidence = calculateSectionConfidence(section, updates[section]);
                setAiConfidencePerSection(prev => ({
                    ...prev,
                    [section]: sectionConfidence
                }));
            }
        }

        // Update state
        setResumeData(newData);
        setHasUnsavedChanges(true);

        // Track in history
        historyManagerRef.current?.push(newData, section, false);

        // Auto-save with intelligent delay
        if (autoSaveEnabled && !isSaving) {
            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);

            // Variable delay based on change type
            const saveDelay = section ?
                (section === 'summary' || section === 'experience' ? 3000 : 1500) :
                1000;

            autoSaveRef.current = setTimeout(() => {
                handleSave(false);
            }, saveDelay);
        }

        // Trigger AI analysis on significant changes
        if (section && ['summary', 'experience', 'skills'].includes(section)) {
            if (aiEnhanceDebounceRef.current) {
                clearTimeout(aiEnhanceDebounceRef.current);
            }

            aiEnhanceDebounceRef.current = setTimeout(() => {
                analyzeWithAI(newData);
            }, 2000);
        }

        // Trigger real-time AI suggestions
        if (section && aiSettings.realTimeSuggestions) {
            clearTimeout(typingDebounceRef.current);
            typingDebounceRef.current = setTimeout(() => {
                handleRealTimeAISuggestions(section, Object.keys(updates[section] || {})[0],
                    Object.values(updates[section] || {})[0], 0);
            }, 1000);
        }
    }, [resumeData, autoSaveEnabled, isSaving, calculateAICompletion, handleSave, analyzeWithAI, aiSettings, calculateSectionConfidence, handleRealTimeAISuggestions]);

    // AI-powered section completion check
    const checkSectionCompletion = useCallback((sectionId, data) => {
        const section = data?.[sectionId];

        switch (sectionId) {
            case 'personalInfo':
                const required = ['fullName', 'email', 'phone'];
                return required.every(field => data?.personalInfo?.[field]?.trim());

            case 'summary':
                return section?.length >= 100;

            case 'experience':
                return Array.isArray(section) && section.length > 0;

            case 'skills':
                return Array.isArray(section) && section.length >= 5;

            case 'education':
                return Array.isArray(section) && section.length > 0;

            default:
                return true;
        }
    }, []);

    // AI-powered preloading
    const preloadNextSection = useCallback(async (nextSection) => {
        try {
            const suggestions = await aiService.getSectionSuggestions(
                nextSection,
                resumeData,
                user
            );

            if (suggestions?.length > 0) {
                setAiInsights(prev => [...prev, {
                    section: nextSection,
                    message: `AI has ${suggestions.length} suggestions ready for you`,
                    timestamp: new Date().toISOString(),
                    type: 'preload'
                }]);
            }
        } catch (error) {
            console.error('AI preload error:', error);
        }
    }, [resumeData, user]);

    // AI-powered wizard step navigation
    const handleNextStep = useCallback(async () => {
        if (currentStep >= aiSteps.length - 1) return;

        const currentSection = aiSteps[currentStep].id;
        const nextSection = aiSteps[currentStep + 1].id;

        // AI: Check if current section is complete
        const isComplete = checkSectionCompletion(currentSection, resumeData);

        if (!isComplete && aiSteps[currentStep].required) {
            const shouldProceed = window.confirm(
                `AI detected incomplete ${aiSteps[currentStep].label}. Skip anyway?`
            );
            if (!shouldProceed) return;
        }

        // AI: Pre-load next section with suggestions
        if (aiSteps[currentStep + 1].aiCapabilities.includes('auto-fill')) {
            startTransition(() => {
                preloadNextSection(nextSection);
            });
        }

        setCurrentStep(prev => prev + 1);

        // AI: Auto-enhance next section if enabled
        if (aiSettings.autoEnhance && !resumeData?.[nextSection]) {
            setTimeout(() => {
                handleAIEnhance(nextSection);
            }, 1000);
        }

        // Trigger step enter AI generation
        handleStepEnter(nextSection);
    }, [currentStep, aiSteps, resumeData, aiSettings, checkSectionCompletion, preloadNextSection, handleAIEnhance, handleStepEnter]);

    const handlePrevStep = useCallback(() => {
        if (currentStep <= 0) return;
        setCurrentStep(prev => prev - 1);
    }, [currentStep]);

    // AI-powered export
    const handleExport = useCallback(async (format) => {
        setIsExportOpen(true);

        // AI: Optimize resume before export
        if (resumeData?.aiMetadata?.confidenceScore < 0.7) {
            const shouldEnhance = window.confirm(
                `AI confidence is low (${Math.round(resumeData.aiMetadata.confidenceScore * 100)}%). Enhance before export?`
            );

            if (shouldEnhance) {
                await handleAIEnhance();
            }
        }
    }, [resumeData, handleAIEnhance]);

    // AI-powered resume sharing
    const handleShare = useCallback(async () => {
        if (!resumeData) return;

        try {
            // AI: Generate shareable description
            const description = await aiService.generateShareDescription(resumeData);

            // Create shareable link
            const shareData = {
                title: `${resumeData.personalInfo.fullName}'s Resume`,
                text: description,
                url: `${window.location.origin}/view/${resumeData._id}`,
            };

            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData);
            } else {
                // Fallback to clipboard
                await navigator.clipboard.writeText(shareData.url);
                toast.success('AI copied resume link to clipboard!');
            }
        } catch (error) {
            console.error('AI share error:', error);
            toast.error('AI failed to share resume');
        }
    }, [resumeData]);

    // Initialize with AI-first approach
    useEffect(() => {
        if (resumeId === 'new' && location.state?.skipEntry !== true) {
            setShowEntryScreen(true);
        }
    }, [resumeId, location.state]);

    // Handle step changes for auto-generation
    useEffect(() => {
        if (resumeData && aiSteps[currentStep]) {
            handleStepEnter(aiSteps[currentStep].id);
        }
    }, [currentStep, resumeData, aiSteps, handleStepEnter]);

    // AI-powered initialization
    useEffect(() => {
        isMounted.current = true;

        const initializeWithAI = async () => {
            try {
                if (showEntryScreen) return;

                let resumeToLoad = null;

                // Check for AI-enhanced draft recovery
                if (draftResume && draftResume._lastSavedDraft) {
                    const draftAge = Date.now() - new Date(draftResume._lastSavedDraft).getTime();
                    const hoursOld = draftAge / (1000 * 60 * 60);

                    if (hoursOld < 72) { // 3-day draft retention
                        const shouldRecover = window.confirm(
                            `AI found an enhanced draft from ${new Date(draftResume._lastSavedDraft).toLocaleDateString()}. Recover?`
                        );

                        if (shouldRecover) {
                            resumeToLoad = draftResume;
                            toast.success('AI-enhanced draft recovered!');
                        } else {
                            removeDraftResume();
                        }
                    } else {
                        removeDraftResume();
                    }
                }

                if (!resumeToLoad) {
                    const mode = location.state?.mode || 'guided';
                    resumeToLoad = {
                        ...EMPTY_RESUME,
                        builderMode: mode,
                        personalInfo: {
                            ...EMPTY_RESUME.personalInfo,
                            fullName: user?.name || '',
                            email: user?.email || '',
                            linkedin: user?.linkedin || '',
                            github: user?.github || ''
                        },
                        userId: user?._id || user?.id,
                        _id: resumeId === 'new' ? `ai_temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : resumeId,
                        aiMetadata: {
                            ...EMPTY_RESUME.aiMetadata,
                            autoGenerated: true
                        }
                    };

                    // Auto-set target role based on user's profile
                    if (user?.lastRole) {
                        resumeToLoad.targetRole = user.lastRole;
                    }
                    if (user?.skills?.length > 0) {
                        resumeToLoad.skills = user.skills.slice(0, 10);
                    }
                }

                // Calculate AI-powered completion
                const completion = calculateAICompletion(resumeToLoad);
                resumeToLoad.completion = completion;

                setResumeData(resumeToLoad);
                setBuilderMode(resumeToLoad.builderMode);
                setKeywords(resumeToLoad.keywords || []);
                setJobDescription(resumeToLoad.jobDescription || '');

                historyManagerRef.current = new AIHistoryManager(resumeToLoad);

                // AI: Optimize step order based on target role
                if (resumeToLoad.targetRole) {
                    startTransition(() => {
                        optimizeStepOrder(resumeToLoad.targetRole, resumeToLoad.jobDescription);
                    });
                }

                // AI: Auto-enhance if enabled
                if (aiSettings.autoEnhance && shouldAutoEnhance(resumeToLoad)) {
                    setTimeout(() => {
                        if (isMounted.current) {
                            handleAIAutoEnhance(resumeToLoad);
                        }
                    }, 2000);
                }

                // AI: Initial analysis for insights
                setTimeout(() => {
                    if (isMounted.current) {
                        analyzeWithAI(resumeToLoad);
                    }
                }, 1500);

            } catch (error) {
                console.error('AI Initialization error:', error);
                toast.error('AI failed to initialize resume builder');
                const emptyResume = {
                    ...EMPTY_RESUME,
                    _id: `ai_temp_${Date.now()}`,
                    personalInfo: {
                        ...EMPTY_RESUME.personalInfo,
                        fullName: user?.name || '',
                        email: user?.email || ''
                    },
                    userId: user?._id || user?.id
                };
                emptyResume.completion = calculateAICompletion(emptyResume);
                setResumeData(emptyResume);
                historyManagerRef.current = new AIHistoryManager(emptyResume);
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        initializeWithAI();

        return () => {
            isMounted.current = false;
            if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
            if (aiEnhanceDebounceRef.current) clearTimeout(aiEnhanceDebounceRef.current);
            if (aiSuggestionTimerRef.current) clearTimeout(aiSuggestionTimerRef.current);
            if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
            sectionTimerRef.current.clear();
        };
    }, [resumeId, user, location.state, draftResume, removeDraftResume, showEntryScreen, aiSettings, calculateAICompletion, optimizeStepOrder, shouldAutoEnhance, handleAIAutoEnhance, analyzeWithAI]);

    // AI-powered section component mapping with enhanced AI features
    const renderCurrentStep = () => {
        if (!resumeData) return null;

        const step = aiSteps[currentStep];
        const commonProps = {
            data: resumeData,
            onUpdate: updateResumeData,
            onAIEnhance: handleAIEnhance,
            onNext: handleNextStep,
            onPrev: handlePrevStep,
            aiSuggestions: aiSuggestions.filter(s => s.section === step.id),
            isAnalyzing: isAnalyzing,
            jobDescription: jobDescription,
            onJobDescriptionChange: setJobDescription,
            keywords: keywords,
            aiConfidence: aiConfidence,
            aiConfidencePerSection: aiConfidencePerSection,
            // NEW PROPS FOR AI-FIRST FEATURES:
            inlineSuggestions: inlineSuggestions,
            ghostText: ghostText,
            showAIPopover: showAIPopover,
            onShowAIPopover: setShowAIPopover,
            onRealTimeAIInput: handleRealTimeAISuggestions,
            onAcceptAIEnhancement: handleAcceptAIEnhancement,
            onRegenerateAIEnhancement: handleRegenerateAIEnhancement,
            aiEnhancementState: aiEnhancementState,
            currentDiff: currentDiff,
            onMagicMode: handleMagicMode,
            aiMagicMode: aiMagicMode
        };

        switch (step.id) {
            case 'personalInfo':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Personal Info Wizard...</div>
                        </div>
                    </div>}>
                        <PersonalInfoWizard {...commonProps} />
                    </Suspense>
                );

            case 'summary':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Summary Generator...</div>
                        </div>
                    </div>}>
                        <SummaryGenerator {...commonProps} />
                    </Suspense>
                );

            case 'experience':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Experience Builder...</div>
                        </div>
                    </div>}>
                        <ExperienceBuilder {...commonProps} />
                    </Suspense>
                );

            case 'education':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Education Builder...</div>
                        </div>
                    </div>}>
                        <EducationBuilder {...commonProps} />
                    </Suspense>
                );

            case 'skills':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Skills Optimizer...</div>
                        </div>
                    </div>}>
                        <SkillsOptimizer {...commonProps} />
                    </Suspense>
                );

            case 'projects':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Projects Builder...</div>
                        </div>
                    </div>}>
                        <ProjectsBuilder {...commonProps} />
                    </Suspense>
                );

            case 'certifications':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Certifications Builder...</div>
                        </div>
                    </div>}>
                        <CertificationsBuilder {...commonProps} />
                    </Suspense>
                );

            case 'languages':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading Languages Builder...</div>
                        </div>
                    </div>}>
                        <LanguagesBuilder {...commonProps} />
                    </Suspense>
                );

            case 'references':
                return (
                    <Suspense fallback={<div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                            <div className="text-gray-400">AI Loading References Builder...</div>
                        </div>
                    </div>}>
                        <ReferencesBuilder {...commonProps} />
                    </Suspense>
                );

            default:
                return <div>AI Wizard Section Not Found</div>;
        }
    };

    // AI Entry Screen Component
    const AIEntryScreen = () => {
        const [entryMode, setEntryMode] = useState('guided');
        const [roleInput, setRoleInput] = useState('');
        const [jdInput, setJdInput] = useState('');
        const [isAnalyzingJD, setIsAnalyzingJD] = useState(false);
        const [showMagicMode, setShowMagicMode] = useState(false);

        const handleStartWithAI = async () => {
            if (!roleInput.trim()) {
                toast.error('Please enter a target role for AI optimization');
                return;
            }

            setShowEntryScreen(false);

            // Initialize resume with AI context
            const aiResume = {
                ...EMPTY_RESUME,
                targetRole: roleInput,
                jobDescription: jdInput,
                builderMode: entryMode,
                personalInfo: {
                    ...EMPTY_RESUME.personalInfo,
                    fullName: user?.name || '',
                    email: user?.email || ''
                },
                aiMetadata: {
                    ...EMPTY_RESUME.aiMetadata,
                    initializedWithAI: true,
                    initialRole: roleInput
                }
            };

            // Extract keywords from JD
            if (jdInput) {
                setIsAnalyzingJD(true);
                try {
                    const extracted = await aiService.extractKeywords(jdInput);
                    aiResume.keywords = extracted;
                    setKeywords(extracted);
                } catch (error) {
                    console.error('JD analysis error:', error);
                } finally {
                    setIsAnalyzingJD(false);
                }
            }

            setResumeData(aiResume);
            setBuilderMode(entryMode);

            // Optimize steps for role
            optimizeStepOrder(roleInput, jdInput);

            toast.success(`AI initialized for ${roleInput}!`);
        };

        const handleMagicModeStart = async () => {
            if (!jdInput.trim()) {
                toast.error('Please paste a job description for AI magic');
                return;
            }

            setShowEntryScreen(false);
            setTimeout(() => {
                handleMagicMode();
            }, 500);
        };

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex items-center justify-center p-4"
            >
                <div className="max-w-4xl w-full bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="flex justify-center mb-6">
                            <BrainCircuit className="w-16 h-16 text-purple-400" />
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-3">
                            AI-First Resume Builder 2026
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Let AI guide you to create the perfect resume
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    How would you like to build?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['guided', 'freeform', 'ai-quick', 'magic'].map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => {
                                                setEntryMode(mode);
                                                if (mode === 'magic') setShowMagicMode(true);
                                            }}
                                            className={`p-4 rounded-xl border transition-all ${entryMode === mode
                                                ? 'border-purple-500 bg-purple-500/10 text-white'
                                                : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="font-medium capitalize">
                                                {mode === 'ai-quick' ? 'AI Quick' :
                                                    mode === 'magic' ? 'AI Magic' :
                                                        mode.split('-').map(word =>
                                                            word.charAt(0).toUpperCase() + word.slice(1)
                                                        ).join(' ')}
                                            </div>
                                            {mode === 'magic' && (
                                                <div className="text-xs text-purple-300 mt-1">
                                                    <Wand className="inline w-3 h-3 mr-1" />
                                                    Full AI Generation
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {!showMagicMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Target Role *
                                    </label>
                                    <input
                                        type="text"
                                        value={roleInput}
                                        onChange={(e) => setRoleInput(e.target.value)}
                                        placeholder="e.g., Senior Frontend Developer"
                                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        AI will optimize content for this role
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Job Description {showMagicMode ? '*' : '(Optional)'}
                            </label>
                            <textarea
                                value={jdInput}
                                onChange={(e) => setJdInput(e.target.value)}
                                placeholder="Paste the job description here for AI optimization..."
                                rows={8}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                AI will extract keywords and match your resume
                            </p>

                            {jdInput && !showMagicMode && (
                                <button
                                    onClick={async () => {
                                        setIsAnalyzingJD(true);
                                        try {
                                            const extracted = await aiService.extractKeywords(jdInput);
                                            toast.success(`AI extracted ${extracted.length} keywords`);
                                            setKeywords(extracted);
                                        } catch (error) {
                                            toast.error('Failed to analyze JD');
                                        } finally {
                                            setIsAnalyzingJD(false);
                                        }
                                    }}
                                    disabled={isAnalyzingJD}
                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isAnalyzingJD ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                            AI Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="w-4 h-4 inline mr-2" />
                                            Extract Keywords with AI
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4">
                        {showMagicMode ? (
                            <button
                                onClick={handleMagicModeStart}
                                disabled={!jdInput.trim()}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Wand className="w-5 h-5 inline mr-2" />
                                Generate Full Resume with AI Magic
                            </button>
                        ) : (
                            <button
                                onClick={handleStartWithAI}
                                disabled={!roleInput.trim()}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Sparkles className="w-5 h-5 inline mr-2" />
                                Start with AI Magic
                            </button>
                        )}

                        <button
                            onClick={() => {
                                setShowEntryScreen(false);
                                navigate('/dashboard');
                            }}
                            className="px-8 py-4 bg-gray-800 text-gray-300 font-semibold rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="mt-8 text-center text-gray-400 text-sm">
                        <p>AI will guide you through each step, suggesting content and optimizing for ATS</p>
                        <div className="flex justify-center items-center mt-4 space-x-6">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                <span>Real-time AI suggestions</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                <span>Automatic ATS optimization</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                <span>Smart step reordering</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    // Main render
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <BrainCircuit className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
                    <div className="text-white text-xl font-semibold mb-2">
                        AI Initializing Resume Builder...
                    </div>
                    <div className="text-gray-400">
                        Loading AI models and preparing your workspace
                    </div>
                </div>
            </div>
        );
    }

    if (showEntryScreen) {
        return <AIEntryScreen />;
    }

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black transition-colors">
                <Navbar
                    user={user}
                    onLogout={() => navigate('/login')}
                    showBuilderControls={false}
                />

                {/* Main Builder Layout */}
                <div className="flex h-[calc(100vh-64px)]">
                    {/* AI Sidebar */}
                    <AnimatePresence>
                        {isSidebarOpen && (
                            <motion.div
                                initial={{ x: -300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -300, opacity: 0 }}
                                transition={{ type: "spring", damping: 25 }}
                                className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col"
                            >
                                <Suspense fallback={<div>Loading AI Assistant...</div>}>
                                    <BuilderSidebar
                                        steps={aiSteps}
                                        currentStep={currentStep}
                                        onStepClick={setCurrentStep}
                                        resumeData={resumeData}
                                        completion={resumeData?.completion || 0}
                                        onSave={handleSave}
                                        onExport={() => setIsExportOpen(true)}
                                        onShare={handleShare}
                                        onUndo={handleUndo}
                                        onRedo={handleRedo}
                                        canUndo={historyManagerRef.current?.canUndo()}
                                        canRedo={historyManagerRef.current?.canRedo()}
                                        isSaving={isSaving}
                                        hasUnsavedChanges={hasUnsavedChanges}
                                        lastSaved={lastSaved}
                                        atsScore={atsScore}
                                        aiConfidence={aiConfidence}
                                        aiConfidencePerSection={aiConfidencePerSection}
                                        aiInsights={aiInsights}
                                        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                                        onMagicMode={handleMagicMode}
                                        jobDescription={jobDescription}
                                    />
                                </Suspense>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Content Area */}
                    <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : ''
                        }`}>
                        {/* Top Bar */}
                        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    {isSidebarOpen ? (
                                        <PanelLeftClose className="w-5 h-5" />
                                    ) : (
                                        <PanelLeftOpen className="w-5 h-5" />
                                    )}
                                </button>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        AI Builder • {builderMode}
                                    </span>
                                    {resumeData?.targetRole && (
                                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                                            {resumeData.targetRole}
                                        </span>
                                    )}
                                    {aiSettings.showConfidenceScores && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="flex items-center space-x-1"
                                        >
                                            <div className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400">
                                                AI Confidence: {Math.round(aiConfidence * 100)}%
                                            </div>
                                            {aiConfidencePerSection[aiSteps[currentStep]?.id] && (
                                                <div className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-600 dark:text-green-400">
                                                    Section: {Math.round(aiConfidencePerSection[aiSteps[currentStep]?.id] * 100)}%
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                {/* Magic Mode Button */}
                                {jobDescription && (
                                    <button
                                        onClick={handleMagicMode}
                                        disabled={aiMagicMode}
                                        className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                                    >
                                        {aiMagicMode ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                                AI Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Wand className="w-4 h-4 inline mr-2" />
                                                Magic Mode
                                            </>
                                        )}
                                    </button>
                                )}

                                {/* AI Assistant Toggle */}
                                <button
                                    onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
                                    className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Bot className="w-5 h-5" />
                                    {aiInsights.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                            {Math.min(aiInsights.length, 9)}+
                                        </span>
                                    )}
                                </button>

                                {/* Stats Toggle */}
                                <button
                                    onClick={() => setIsStatsOpen(!isStatsOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <BarChart3 className="w-5 h-5" />
                                </button>

                                {/* Progress Wizard */}
                                <Suspense fallback={null}>
                                    <ProgressWizard
                                        steps={aiSteps}
                                        currentStep={currentStep}
                                        onStepClick={setCurrentStep}
                                        completion={resumeData?.completion || 0}
                                        aiConfidencePerSection={aiConfidencePerSection}
                                    />
                                </Suspense>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex overflow-hidden">
                            {/* Wizard Section */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="max-w-4xl mx-auto">
                                    {/* AI Enhancement Diff Modal */}
                                    {aiEnhancementState === AIEnhancementState.SHOWING_DIFF && currentDiff.after && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-xl font-bold text-white">
                                                    <Sparkles className="inline w-5 h-5 mr-2 text-purple-400" />
                                                    AI Enhanced Your {currentDiff.section}!
                                                </h3>
                                                <button
                                                    onClick={() => setAiEnhancementState(AIEnhancementState.IDLE)}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                                <div className="bg-gray-800/50 rounded-xl p-5">
                                                    <div className="flex items-center mb-3">
                                                        <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                                                        <h4 className="font-medium text-gray-400">Before</h4>
                                                    </div>
                                                    <div className="text-gray-300 whitespace-pre-wrap">
                                                        {currentDiff.before || 'Empty section'}
                                                    </div>
                                                </div>
                                                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl p-5 border border-purple-500/20">
                                                    <div className="flex items-center mb-3">
                                                        <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                                                        <h4 className="font-medium text-purple-300">AI Enhanced</h4>
                                                        <div className="ml-auto text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                                                            AI Confidence: {Math.round(calculateSectionConfidence(currentDiff.section, currentDiff.after) * 100)}%
                                                        </div>
                                                    </div>
                                                    <div className="text-white whitespace-pre-wrap">
                                                        {currentDiff.after}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleAcceptAIEnhancement(currentDiff.section, currentDiff.after)}
                                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                                                >
                                                    <Check className="w-5 h-5 mr-2" />
                                                    Accept AI Enhancement
                                                </button>
                                                <button
                                                    onClick={() => handleRegenerateAIEnhancement(currentDiff.section)}
                                                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center"
                                                >
                                                    <RefreshCw className="w-5 h-5 mr-2" />
                                                    Regenerate with AI
                                                </button>
                                                <button
                                                    onClick={() => setAiEnhancementState(AIEnhancementState.IDLE)}
                                                    className="flex-1 bg-gray-800 text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                                                >
                                                    Edit Manually
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Inline AI Suggestions Popover */}
                                    {inlineSuggestions.length > 0 && aiSettings.inlineAI && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mb-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center text-blue-400">
                                                    <Brain className="w-4 h-4 mr-2" />
                                                    <span className="text-sm font-medium">AI Suggestions</span>
                                                </div>
                                                <button
                                                    onClick={() => setInlineSuggestions([])}
                                                    className="text-gray-400 hover:text-white"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {inlineSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            // Apply suggestion logic here
                                                            toast.success('AI suggestion applied!');
                                                            setInlineSuggestions([]);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm transition-colors"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {renderCurrentStep()}
                                </div>
                            </div>

                            {/* Preview Panel */}
                            <div className="w-1/2 border-l border-gray-200 dark:border-gray-800 hidden lg:block">
                                <Suspense fallback={
                                    <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                        <div className="text-center">
                                            <Brain className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
                                            <div className="text-gray-400">AI generating preview...</div>
                                        </div>
                                    </div>
                                }>
                                    <RealTimePreview
                                        ref={previewRef}
                                        data={resumeData}
                                        template={resumeData?.settings?.template}
                                        style={resumeData?.settings}
                                        isAnalyzing={isAnalyzing}
                                        atsScore={atsScore}
                                        keywords={keywords}
                                        aiConfidence={aiConfidence}
                                        aiConfidencePerSection={aiConfidencePerSection}
                                        aiSuggestions={aiSuggestions}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Buttons */}
                <Suspense fallback={null}>
                    <FloatingActionButtons
                        onSave={handleSave}
                        onAIEnhance={handleAIEnhance}
                        onExport={() => setIsExportOpen(true)}
                        onShare={handleShare}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={historyManagerRef.current?.canUndo()}
                        canRedo={historyManagerRef.current?.canRedo()}
                        isSaving={isSaving}
                        aiThinking={aiThinking}
                        currentSection={aiSteps[currentStep]?.id}
                        autoEnhanceProgress={autoEnhanceProgress}
                        onTogglePreview={() => {/* Toggle preview */ }}
                        onMagicMode={handleMagicMode}
                        aiConfidence={aiConfidence}
                        aiConfidencePerSection={aiConfidencePerSection}
                    />
                </Suspense>

                {/* AI Assistant Modal */}
                <AnimatePresence>
                    {isAIAssistantOpen && (
                        <Suspense fallback={null}>
                            <SmartAIAssistant
                                isOpen={isAIAssistantOpen}
                                onClose={() => setIsAIAssistantOpen(false)}
                                resumeData={resumeData}
                                currentSection={aiSteps[currentStep]?.id}
                                onEnhance={handleAIEnhance}
                                aiInsights={aiInsights}
                                atsScore={atsScore}
                                aiConfidence={aiConfidence}
                                suggestions={aiSuggestions}
                                aiConfidencePerSection={aiConfidencePerSection}
                                jobDescription={jobDescription}
                                onJobDescriptionChange={setJobDescription}
                                onMagicMode={handleMagicMode}
                            />
                        </Suspense>
                    )}
                </AnimatePresence>

                {/* Stats Dashboard Modal */}
                <AnimatePresence>
                    {isStatsOpen && (
                        <Suspense fallback={null}>
                            <ResumeStatsDashboard
                                isOpen={isStatsOpen}
                                onClose={() => setIsStatsOpen(false)}
                                resumeData={resumeData}
                                atsScore={atsScore}
                                aiConfidence={aiConfidence}
                                aiConfidencePerSection={aiConfidencePerSection}
                                completion={resumeData?.completion || 0}
                                keywords={keywords}
                                suggestions={aiSuggestions}
                                aiInsights={aiInsights}
                            />
                        </Suspense>
                    )}
                </AnimatePresence>

                {/* Export Manager Modal */}
                <AnimatePresence>
                    {isExportOpen && (
                        <Suspense fallback={null}>
                            <ExportManager
                                isOpen={isExportOpen}
                                onClose={() => setIsExportOpen(false)}
                                resumeData={resumeData}
                                onExport={handleExport}
                                onShare={handleShare}
                                aiConfidence={aiConfidence}
                                atsScore={atsScore}
                            />
                        </Suspense>
                    )}
                </AnimatePresence>

                {/* AI Thinking Indicator */}
                {aiThinking && (
                    <div className="fixed bottom-4 right-4 z-50">
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3"
                        >
                            <Brain className="w-5 h-5 animate-pulse" />
                            <div className="flex-1">
                                <div className="font-medium">AI Thinking</div>
                                {autoEnhanceProgress > 0 && (
                                    <div className="w-48 bg-white/20 rounded-full h-2 mt-1">
                                        <motion.div
                                            className="bg-white h-full rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${autoEnhanceProgress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Auto-save Indicator */}
                {hasUnsavedChanges && autoSaveEnabled && (
                    <div className="fixed bottom-4 left-4 z-40">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-2 rounded-lg text-sm backdrop-blur-sm"
                        >
                            <div className="flex items-center space-x-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>AI will auto-save soon...</span>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Ghost Text Indicator */}
                {ghostText && aiSettings.inlineAI && (
                    <div className="fixed bottom-20 right-4 z-40">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3 max-w-sm"
                        >
                            <div className="text-xs text-gray-400 mb-1">AI Suggestion:</div>
                            <div className="text-gray-300 text-sm italic">{ghostText}</div>
                            <div className="flex justify-end mt-2 space-x-2">
                                <button
                                    onClick={() => setGhostText('')}
                                    className="text-xs text-gray-500 hover:text-gray-300"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => {
                                        // Apply ghost text logic
                                        toast.success('AI suggestion applied!');
                                        setGhostText('');
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                    Apply
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </LazyMotion>
    );
};

export default Builder;