// src/pages/Preview.jsx - UPDATED VERSION
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    ArrowLeft,
    Download,
    Printer,
    Eye,
    EyeOff,
    Settings,
    Palette,
    Type,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    Share2,
    Copy,
    Check,
    Loader2,
    FileText,
    User,
    Briefcase,
    GraduationCap,
    Code,
    Award,
    Globe,
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ExternalLink,
    Star,
    ChevronRight,
    Shield,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';

// FIXED: Import useResume instead of useResumes
import { useResume } from '../../context/ResumeContext';
import Navbar from '../../components/Navbar';

const Preview = () => {
    const { id: resumeId } = useParams();
    const navigate = useNavigate();
    const {
        currentResume,
        loadResume,
        isLoading,
        cloudStatus
    } = useResume(); // Now using useResume hook

    const [template, setTemplate] = useState('modern');
    const [showSettings, setShowSettings] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [printMode, setPrintMode] = useState(false);

    // Load resume on mount
    useEffect(() => {
        const loadResumeData = async () => {
            if (resumeId) {
                console.log('📂 [Preview] Loading resume for preview:', resumeId);
                try {
                    const resume = await loadResume(resumeId);
                    if (!resume) {
                        console.error('❌ [Preview] Resume not found');
                        toast.error('Resume not found');
                        navigate('/dashboard');
                    } else {
                        console.log('✅ [Preview] Resume loaded successfully:', resume.title);
                    }
                } catch (error) {
                    console.error('❌ [Preview] Failed to load resume:', error);
                    toast.error('Failed to load resume');
                    navigate('/dashboard');
                }
            }
        };

        loadResumeData();
    }, [resumeId, loadResume, navigate]);

    // Handle fullscreen
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleFullscreen = () => {
        const element = document.documentElement;
        if (!isFullscreen) {
            if (element.requestFullscreen) element.requestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/preview/${resumeId}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => {
        setPrintMode(true);
        toast.success('Opening print dialog...');
        setTimeout(() => {
            window.print();
            setPrintMode(false);
        }, 500);
    };

    const handleDownload = () => {
        toast.loading('Generating PDF...');
        // In a real app, this would generate and download PDF
        setTimeout(() => {
            toast.dismiss();
            toast.success('PDF download started!');
        }, 2000);
    };

    // Calculate resume completeness
    const calculateCompleteness = useMemo(() => {
        if (!currentResume) return 0;

        const sections = [
            { key: 'personalInfo', weight: 20 },
            { key: 'summary', weight: 15 },
            { key: 'experience', weight: 25 },
            { key: 'education', weight: 15 },
            { key: 'skills', weight: 15 },
            { key: 'projects', weight: 5 },
            { key: 'certifications', weight: 3 },
            { key: 'languages', weight: 2 }
        ];

        let totalScore = 0;
        let maxScore = 0;

        sections.forEach(section => {
            const data = currentResume[section.key];
            let score = 0;

            if (section.key === 'personalInfo') {
                if (data?.firstName && data?.lastName) score += 0.4;
                if (data?.email) score += 0.3;
                if (data?.jobTitle) score += 0.3;
            } else if (section.key === 'summary') {
                if (data?.length > 100) score = 1;
                else if (data?.length > 50) score = 0.7;
                else if (data?.length > 0) score = 0.3;
            } else if (Array.isArray(data)) {
                score = Math.min(1, data.length / 3);
            }

            totalScore += score * section.weight;
            maxScore += section.weight;
        });

        return Math.round((totalScore / maxScore) * 100);
    }, [currentResume]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Preview</h2>
                        <p className="text-gray-600">Preparing your resume for preview...</p>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Error state
    if (!currentResume) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md"
                    >
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Resume Not Available</h2>
                        <p className="text-gray-600 mb-6">The resume you're trying to preview doesn't exist or you don't have permission to access it.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                Back to Dashboard
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // Get resume data
    const { personalInfo, summary, experience, education, skills, projects, certifications, languages } = currentResume;

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    // Resume templates
    const templates = {
        modern: {
            primary: '#2563eb',
            secondary: '#4f46e5',
            background: '#ffffff',
            text: '#1f2937'
        },
        professional: {
            primary: '#059669',
            secondary: '#0d9488',
            background: '#f9fafb',
            text: '#111827'
        },
        creative: {
            primary: '#7c3aed',
            secondary: '#8b5cf6',
            background: '#ffffff',
            text: '#1e293b'
        }
    };

    const currentTemplate = templates[template];

    return (
        <div className={`min-h-screen ${printMode ? 'bg-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
            {!printMode && <Navbar />}

            {/* Control Bar */}
            {!printMode && (
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="sticky top-16 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    <span className="hidden sm:inline">Back to Dashboard</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${cloudStatus?.isConnected ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                                    <span className="text-sm text-gray-600">
                                        {cloudStatus?.isConnected ? 'Synced to cloud' : 'Local only'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Completion badge */}
                                <div className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">
                                            {calculateCompleteness}% Complete
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                                        className="p-2 hover:bg-gray-100"
                                        disabled={zoom <= 50}
                                    >
                                        <ZoomOut className="w-5 h-5" />
                                    </button>
                                    <span className="px-3 py-2 text-sm font-medium">{zoom}%</span>
                                    <button
                                        onClick={() => setZoom(Math.min(150, zoom + 10))}
                                        className="p-2 hover:bg-gray-100"
                                        disabled={zoom >= 150}
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <Settings className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handleCopyLink}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={handleFullscreen}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                                </button>

                                <button
                                    onClick={handlePrint}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Printer className="w-5 h-5" />
                                    <span className="hidden sm:inline">Print</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Template Settings Panel */}
            <AnimatePresence>
                {showSettings && !printMode && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="fixed left-0 top-0 bottom-0 w-80 bg-white border-r border-gray-200 shadow-xl z-50"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Template Settings</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Palette className="w-4 h-4" />
                                        Template Style
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(templates).map(([key, templateData]) => (
                                            <button
                                                key={key}
                                                onClick={() => setTemplate(key)}
                                                className={`p-4 rounded-xl border-2 transition-all ${template === key ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded-full"
                                                        style={{ backgroundColor: templateData.primary }}
                                                    />
                                                    <span className="text-sm font-medium capitalize">{key}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <Type className="w-4 h-4" />
                                        Font Size
                                    </h4>
                                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                                        <option>Small</option>
                                        <option>Medium</option>
                                        <option>Large</option>
                                    </select>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Export Options</h4>
                                    <div className="space-y-2">
                                        <button
                                            onClick={handleDownload}
                                            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center gap-3"
                                        >
                                            <Download className="w-5 h-5" />
                                            <div>
                                                <div className="font-medium">Download PDF</div>
                                                <div className="text-sm text-gray-600">High-quality print-ready PDF</div>
                                            </div>
                                        </button>
                                        <button className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-left flex items-center gap-3">
                                            <Share2 className="w-5 h-5" />
                                            <div>
                                                <div className="font-medium">Share Online</div>
                                                <div className="text-sm text-gray-600">Generate shareable link</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Resume Preview */}
            <div className={`py-8 ${printMode ? 'px-0' : 'px-4 sm:px-6 lg:px-8'}`}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`max-w-4xl mx-auto bg-white shadow-2xl ${printMode ? 'shadow-none' : ''}`}
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    {/* Resume Header */}
                    <div className="p-8 sm:p-12 border-b" style={{ borderColor: `${currentTemplate.primary}20` }}>
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                            <div className="flex-1">
                                <h1 className="text-4xl font-bold mb-2" style={{ color: currentTemplate.text }}>
                                    {personalInfo?.fullName || `${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}`.trim() || 'Your Name'}
                                </h1>
                                <div className="text-2xl font-semibold mb-4" style={{ color: currentTemplate.primary }}>
                                    {personalInfo?.jobTitle || currentResume?.title || 'Professional'}
                                </div>
                                <p className="text-gray-600 text-lg max-w-2xl">
                                    {summary || currentResume?.personalInfo?.summary || 'Results-driven professional with extensive experience.'}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {personalInfo?.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-700">{personalInfo.email}</span>
                                    </div>
                                )}
                                {personalInfo?.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-700">{personalInfo.phone}</span>
                                    </div>
                                )}
                                {personalInfo?.location && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-700">{personalInfo.location}</span>
                                    </div>
                                )}
                                {personalInfo?.linkedin && (
                                    <div className="flex items-center gap-3">
                                        <ExternalLink className="w-5 h-5 text-gray-500" />
                                        <a href={personalInfo.linkedin} className="text-blue-600 hover:underline">
                                            LinkedIn Profile
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-8 sm:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Experience */}
                                {experience?.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: currentTemplate.primary }}>
                                            <Briefcase className="w-6 h-6" />
                                            Work Experience
                                        </h2>
                                        <div className="space-y-6">
                                            {experience.map((exp, index) => (
                                                <div key={index} className="border-l-4 pl-4" style={{ borderColor: currentTemplate.primary }}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="text-xl font-semibold">{exp.jobTitle || exp.title}</h3>
                                                            <div className="text-gray-700 font-medium">{exp.company}</div>
                                                        </div>
                                                        <div className="text-gray-600">
                                                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                                                        </div>
                                                    </div>
                                                    {exp.description && (
                                                        <p className="text-gray-600">{exp.description}</p>
                                                    )}
                                                    {exp.achievements?.length > 0 && (
                                                        <ul className="mt-3 space-y-2">
                                                            {exp.achievements.map((achievement, i) => (
                                                                <li key={i} className="flex items-start gap-2">
                                                                    <ChevronRight className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                                                                    <span className="text-gray-700">{achievement}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {education?.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: currentTemplate.primary }}>
                                            <GraduationCap className="w-6 h-6" />
                                            Education
                                        </h2>
                                        <div className="space-y-6">
                                            {education.map((edu, index) => (
                                                <div key={index} className="border-l-4 pl-4" style={{ borderColor: currentTemplate.primary }}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h3 className="text-xl font-semibold">{edu.degree}</h3>
                                                            <div className="text-gray-700 font-medium">{edu.institution}</div>
                                                        </div>
                                                        <div className="text-gray-600">
                                                            {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                                                        </div>
                                                    </div>
                                                    {edu.description && (
                                                        <p className="text-gray-600">{edu.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Projects */}
                                {projects?.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: currentTemplate.primary }}>
                                            <Code className="w-6 h-6" />
                                            Projects
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {projects.map((project, index) => (
                                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                                    <h3 className="font-bold text-lg mb-2">{project.title}</h3>
                                                    <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                                                    {project.technologies?.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {project.technologies.map((tech, i) => (
                                                                <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column */}
                            <div className="space-y-8">
                                {/* Skills */}
                                {skills?.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: currentTemplate.primary }}>
                                            <Code className="w-6 h-6" />
                                            Skills
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium"
                                                >
                                                    {typeof skill === 'object' ? skill.name : skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Certifications */}
                                {certifications?.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: currentTemplate.primary }}>
                                            <Award className="w-6 h-6" />
                                            Certifications
                                        </h2>
                                        <div className="space-y-4">
                                            {certifications.map((cert, index) => (
                                                <div key={index} className="flex items-start gap-3">
                                                    <Award className="w-5 h-5 text-gray-500 mt-1" />
                                                    <div>
                                                        <div className="font-medium">{cert.name || cert}</div>
                                                        {cert.issuer && (
                                                            <div className="text-sm text-gray-600">{cert.issuer}</div>
                                                        )}
                                                        {cert.date && (
                                                            <div className="text-sm text-gray-500">{formatDate(cert.date)}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Languages */}
                                {languages?.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{ color: currentTemplate.primary }}>
                                            <Globe className="w-6 h-6" />
                                            Languages
                                        </h2>
                                        <div className="space-y-3">
                                            {languages.map((lang, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="font-medium">{typeof lang === 'object' ? lang.language : lang}</span>
                                                    <span className="text-gray-600 text-sm">
                                                        {typeof lang === 'object' ? lang.proficiency : 'Fluent'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t" style={{ borderColor: `${currentTemplate.primary}20` }}>
                        <div className="text-center text-gray-500 text-sm">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Shield className="w-4 h-4" />
                                <span>ATS Score: {currentResume.analysis?.atsScore || 85}%</span>
                            </div>
                            <p>Resume generated with ResumeCraft AI • Last updated: {formatDate(currentResume.updatedAt)}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Print Styles */}
            <style media="print">
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .print-area, .print-area * {
                            visibility: visible;
                        }
                        .print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        button, nav, .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default Preview;