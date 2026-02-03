// ------------------- BuilderSidebar.jsx -------------------
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    FileText,
    Briefcase,
    GraduationCap,
    Cpu,
    Layers,
    Award,
    Globe,
    Users,
    Sparkles,
    BarChart,
    Download,
    Eye,
    Save,
    Share2,
    Printer,
    Settings,
    ChevronRight,
    CheckCircle,
    Circle,
    PanelLeftClose,
    PanelLeftOpen,
    WifiOff,
    Cloud,
    Zap,
    Target,
    User,
    Calendar,
    MapPin,
    Mail,
    Phone,
    Linkedin,
    Github,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuilderSidebar = ({
    isOpen = true,
    isMobileOpen = false,
    onClose = () => { },
    onToggle = () => { },
    sections = [],
    activeSection = '',
    completedSections = {},
    onSectionChange = () => { },
    resumeTitle = 'Untitled Resume',
    resumeProgress = 0,
    isOnline = true,
    onSave = () => { },
    onPreview = () => { },
    onExport = () => { },
    atsScore = 0,
    aiSuggestions = 0
}) => {
    const [collapsedGroups, setCollapsedGroups] = useState({});
    const [saving, setSaving] = useState(false);

    const toggleGroup = (groupId) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const getSectionIcon = (sectionId) => {
        switch (sectionId) {
            case 'personalInfo': return User;
            case 'targetRole': return Target;
            case 'summary': return FileText;
            case 'experience': return Briefcase;
            case 'education': return GraduationCap;
            case 'skills': return Cpu;
            case 'projects': return Layers;
            case 'certifications': return Award;
            case 'languages': return Globe;
            case 'references': return Users;
            default: return FileText;
        }
    };

    // Safely define section groups with default empty array
    const sectionGroups = [
        {
            id: 'basic',
            name: 'Basics',
            sections: sections.filter(s => s && ['personalInfo', 'targetRole', 'summary'].includes(s.id))
        },
        {
            id: 'experience',
            name: 'Experience & Skills',
            sections: sections.filter(s => s && ['experience', 'education', 'skills'].includes(s.id))
        },
        {
            id: 'additional',
            name: 'Additional Sections',
            sections: sections.filter(s => s && ['projects', 'certifications', 'languages', 'references'].includes(s.id))
        }
    ];

    const handleSectionClick = (sectionId) => {
        onSectionChange(sectionId);
        if (isMobileOpen) {
            onClose();
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave();
            toast.success('Resume saved with AI analysis');
        } catch (error) {
            toast.error('Failed to save resume');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        onExport();
        toast.success('Preparing your resume for export...');
    };

    const handlePreview = () => {
        onPreview();
        toast.success('Opening preview...');
    };

    // If no sections are available yet, show loading state
    if (sections.length === 0) {
        return (
            <div className={`h-full flex flex-col bg-white border-r border-gray-200 ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-2xl' : 'w-80'}`}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg animate-pulse">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                        <p className="text-gray-600 text-sm">Loading sections...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`h-full flex flex-col bg-white border-r border-gray-200 ${isMobileOpen ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-2xl' : 'w-80'}`}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900">AI Resume Builder</h2>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                    <span className="text-xs text-gray-600">
                                        {isOnline ? 'AI Auto-save on' : 'Working offline'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                        >
                            {isOpen ? (
                                <PanelLeftClose className="w-5 h-5 text-gray-600" />
                            ) : (
                                <PanelLeftOpen className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>

                    <div className="mb-4">
                        <h3 className="font-bold text-gray-900 truncate" title={resumeTitle}>
                            {resumeTitle}
                        </h3>
                        <p className="text-sm text-gray-600">AI-powered editing in progress</p>
                    </div>

                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">AI Progress</span>
                            <span className="text-sm font-bold text-blue-600">{resumeProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${resumeProgress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                            />
                        </div>
                    </div>

                    {atsScore > 0 && (
                        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-gray-900">ATS Score</span>
                                </div>
                                <div className={`px-2 py-1 rounded-full text-xs font-bold ${atsScore >= 80 ? 'bg-green-100 text-green-700' : atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                    {atsScore}%
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                                {atsScore >= 80 ? 'Excellent! Resume is ATS-friendly' :
                                    atsScore >= 60 ? 'Good, but can be improved' :
                                        'Needs optimization for ATS'}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {sectionGroups.map((group) => {
                        // Skip empty groups
                        if (!group.sections || group.sections.length === 0) {
                            return null;
                        }

                        return (
                            <div key={group.id} className="mb-6">
                                <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="flex items-center justify-between w-full mb-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    aria-expanded={!collapsedGroups[group.id]}
                                >
                                    <span className="text-sm font-semibold text-gray-700">{group.name}</span>
                                    <ChevronRight
                                        className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${collapsedGroups[group.id] ? '' : 'rotate-90'}`}
                                    />
                                </button>

                                {!collapsedGroups[group.id] && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-1 ml-2"
                                    >
                                        {group.sections.map((section) => {
                                            if (!section) return null;

                                            const Icon = getSectionIcon(section.id);
                                            const isActive = activeSection === section.id;
                                            const isCompleted = completedSections[section.id];

                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => handleSectionClick(section.id)}
                                                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all ${isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'}`}
                                                    aria-current={isActive ? 'true' : 'false'}
                                                >
                                                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex-1 text-left">
                                                        <div className="flex items-center justify-between">
                                                            <span className={`font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                                                                {section.label || section.id}
                                                            </span>
                                                            {isCompleted ? (
                                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                                            ) : (
                                                                <Circle className="w-4 h-4 text-gray-300" />
                                                            )}
                                                        </div>
                                                        {section.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{section.description}</p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {aiSuggestions > 0 && (
                    <div className="mx-4 mb-4">
                        <button
                            className="w-full p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg hover:shadow-sm transition-shadow"
                            onClick={() => toast.success(`Showing ${aiSuggestions} AI suggestions`)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">{aiSuggestions} AI Suggestions</div>
                                    <div className="text-sm text-gray-600">Click to review</div>
                                </div>
                                <div className="ml-auto">
                                    <div className="px-2 py-1 bg-white border border-purple-300 rounded-full text-xs font-medium text-purple-700">
                                        New
                                    </div>
                                </div>
                            </div>
                        </button>
                    </div>
                )}

                <div className="p-4 border-t border-gray-200 space-y-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save with AI
                            </>
                        )}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={handlePreview}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Eye className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Preview</span>
                        </button>

                        <button
                            onClick={handleExport}
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                        >
                            <Download className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Export</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                            onClick={() => toast.success('Share link copied to clipboard')}
                        >
                            <Share2 className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Share</span>
                        </button>

                        <button
                            className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                            onClick={() => toast.success('Opening print dialog...')}
                        >
                            <Printer className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Print</span>
                        </button>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isOnline ? (
                                <Cloud className="w-4 h-4 text-green-500" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-amber-500" />
                            )}
                            <span className="text-xs text-gray-600">
                                {isOnline ? 'AI analysis ready' : 'AI offline'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            v2.5.1 • Beta
                        </div>
                    </div>
                </div>
            </div>

            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

export default BuilderSidebar;