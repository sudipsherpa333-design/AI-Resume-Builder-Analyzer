// src/components/preview/RealTimePreview.jsx
import React, { forwardRef, useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Printer,
    Download,
    Share2,
    Eye,
    EyeOff,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    Smartphone,
    Monitor,
    Tablet,
    BarChart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const RealTimePreview = forwardRef(({
    resumeData = {},
    template = 'modern-pro',
    keywords = [],
    atsScore = 0,
    compact = false,
    onPrint = () => { },
    onExport = () => { }
}, ref) => {
    const [zoom, setZoom] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [deviceMode, setDeviceMode] = useState('desktop');
    const [showKeywords, setShowKeywords] = useState(true);
    const [showAtsScore, setShowAtsScore] = useState(true);

    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch (error) {
            return dateString || 'Present';
        }
    };

    // Calculate total experience
    const totalExperience = useMemo(() => {
        if (!resumeData?.experience || !Array.isArray(resumeData.experience)) return 0;

        let totalMonths = 0;
        resumeData.experience.forEach(exp => {
            if (exp.startDate && exp.endDate) {
                try {
                    const start = new Date(exp.startDate);
                    const end = exp.endDate.toLowerCase() === 'present' ? new Date() : new Date(exp.endDate);
                    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                    totalMonths += Math.max(0, months);
                } catch (error) {
                    console.error('Error calculating experience:', error);
                }
            }
        });

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        if (years === 0 && months === 0) return '0 months';
        if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
        if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
        return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
    }, [resumeData?.experience]);

    // Calculate skill categories
    const skillCategories = useMemo(() => {
        if (!resumeData?.skills || !Array.isArray(resumeData.skills)) return {};

        const categories = {};
        resumeData.skills.forEach(skill => {
            if (!skill) return;

            const skillName = typeof skill === 'string' ? skill : skill.name || '';
            const category = (typeof skill === 'object' && skill.category) || 'Other';

            if (!skillName) return;

            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(skillName);
        });

        return categories;
    }, [resumeData?.skills]);

    // Safely access nested properties
    const personalInfo = resumeData?.personalInfo || {};
    const targetRole = resumeData?.targetRole || 'Your Target Role';
    const summary = resumeData?.summary || '';
    const experience = resumeData?.experience || [];
    const education = resumeData?.education || [];
    const projects = resumeData?.projects || [];
    const certifications = resumeData?.certifications || [];
    const languages = resumeData?.languages || [];

    // Modern Pro Template
    const renderModernPro = () => (
        <div className="bg-white text-gray-800 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">{personalInfo?.fullName || 'Your Name'}</h1>
                        <p className="text-lg opacity-90 mt-1">{targetRole}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            {personalInfo?.email && (
                                <div className="flex items-center gap-1">
                                    <span>📧</span>
                                    <span>{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo?.phone && (
                                <div className="flex items-center gap-1">
                                    <span>📱</span>
                                    <span>{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo?.location && (
                                <div className="flex items-center gap-1">
                                    <span>📍</span>
                                    <span>{personalInfo.location}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {totalExperience && totalExperience !== '0 months' && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 text-sm">
                            <div className="font-semibold">{totalExperience}</div>
                            <div className="text-xs opacity-80">Experience</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
                {/* Summary */}
                {summary && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 pb-2 border-b border-gray-300">Professional Summary</h2>
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Experience */}
                    <div className="lg:col-span-2">
                        {/* Work Experience */}
                        {experience.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-300">Work Experience</h2>
                                <div className="space-y-4">
                                    {experience.map((exp, index) => (
                                        <div key={index} className="border-l-2 border-blue-500 pl-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{exp.position || 'Position'}</h3>
                                                    <p className="text-blue-600 font-medium">{exp.company || 'Company'}</p>
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {exp.startDate && formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                                </div>
                                            </div>
                                            {exp.description && (
                                                <ul className="mt-2 space-y-1">
                                                    {exp.description.split('\n').map((bullet, i) => (
                                                        bullet.trim() && (
                                                            <li key={i} className="flex items-start gap-2">
                                                                <span className="text-blue-500 mt-1">•</span>
                                                                <span className="text-gray-700">{bullet}</span>
                                                            </li>
                                                        )
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Skills */}
                        {Object.keys(skillCategories).length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">Skills</h2>
                                <div className="space-y-4">
                                    {Object.entries(skillCategories).map(([category, skills]) => (
                                        <div key={category}>
                                            <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {education.length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">Education</h2>
                                <div className="space-y-3">
                                    {education.map((edu, index) => (
                                        <div key={index}>
                                            <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                                            <p className="text-blue-600">{edu.school || 'School'}</p>
                                            <p className="text-gray-600 text-sm">
                                                {edu.startYear && `${edu.startYear} - ${edu.endYear || 'Present'}`}
                                                {edu.gpa && ` • GPA: ${edu.gpa}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    // Executive 2026 Template
    const renderExecutive2026 = () => (
        <div className="bg-gray-50 text-gray-800 font-serif">
            {/* Header */}
            <div className="border-l-8 border-purple-600 pl-6 py-8 bg-white">
                <h1 className="text-4xl font-bold text-gray-900">{personalInfo?.fullName || 'Your Name'}</h1>
                <p className="text-xl text-purple-600 mt-2">{targetRole}</p>
                <div className="flex flex-wrap gap-6 mt-4">
                    {personalInfo?.email && (
                        <div className="text-gray-600">{personalInfo.email}</div>
                    )}
                    {personalInfo?.phone && (
                        <div className="text-gray-600">{personalInfo.phone}</div>
                    )}
                    {personalInfo?.location && (
                        <div className="text-gray-600">{personalInfo.location}</div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 space-y-8">
                {/* Summary */}
                {summary && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Executive Summary</h2>
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Experience</h2>
                        <div className="space-y-6">
                            {experience.map((exp, index) => (
                                <div key={index} className="border-l-4 border-purple-500 pl-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{exp.position || 'Position'}</h3>
                                            <p className="text-purple-600 text-lg">{exp.company || 'Company'}</p>
                                        </div>
                                        <div className="text-gray-600">
                                            {exp.startDate && formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                        </div>
                                    </div>
                                    {exp.description && (
                                        <ul className="mt-3 space-y-2">
                                            {exp.description.split('\n').map((bullet, i) => (
                                                bullet.trim() && <li key={i} className="text-gray-700">• {bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills */}
                    {Object.keys(skillCategories).length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Core Competencies</h2>
                            <div className="space-y-4">
                                {Object.entries(skillCategories).map(([category, skills]) => (
                                    <div key={category}>
                                        <h3 className="font-semibold text-gray-800 mb-2">{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, index) => (
                                                <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
                            <div className="space-y-4">
                                {education.map((edu, index) => (
                                    <div key={index}>
                                        <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                                        <p className="text-purple-600">{edu.school || 'School'}</p>
                                        <p className="text-gray-600 text-sm">{edu.startYear || ''} - {edu.endYear || 'Present'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Creative Tech Template - Fixed Version
    const renderCreativeTech = () => (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="relative">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-4"></div>
                    <div className="bg-white p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                    {personalInfo?.fullName || 'YOUR NAME'}
                                </h1>
                                <p className="text-xl text-emerald-600 font-semibold mt-2">
                                    {targetRole}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="space-y-1 text-sm">
                                    {personalInfo?.email && (
                                        <div className="text-gray-600">{personalInfo.email}</div>
                                    )}
                                    {personalInfo?.phone && (
                                        <div className="text-gray-600">{personalInfo.phone}</div>
                                    )}
                                    {personalInfo?.location && (
                                        <div className="text-gray-600">{personalInfo.location}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-8">
                    {/* Summary */}
                    {summary && (
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-gray-900">SUMMARY</h2>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
                                <p className="text-gray-700 leading-relaxed">{summary}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Experience */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-2xl font-bold text-gray-900">EXPERIENCE</h2>
                            </div>
                            <div className="space-y-6">
                                {experience.map((exp, index) => (
                                    <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{exp.position || 'Position'}</h3>
                                                <p className="text-emerald-600 font-medium">{exp.company || 'Company'}</p>
                                            </div>
                                            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                                {exp.startDate && formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Now'}
                                            </div>
                                        </div>
                                        {exp.description && (
                                            <div className="space-y-2">
                                                {exp.description.split('\n').map((bullet, i) => (
                                                    bullet.trim() && (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <span className="text-emerald-500 mt-1">{'>'}</span>
                                                            <span className="text-gray-700">{bullet}</span>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-8">
                            {/* Skills */}
                            {Object.keys(skillCategories).length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                        <h2 className="text-2xl font-bold text-gray-900">SKILLS</h2>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
                                        <div className="space-y-4">
                                            {Object.entries(skillCategories).map(([category, skills]) => (
                                                <div key={category}>
                                                    <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wider">{category}</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {skills.map((skill, index) => (
                                                            <span key={index} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Education */}
                            {education.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                        <h2 className="text-2xl font-bold text-gray-900">EDUCATION</h2>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
                                        <div className="space-y-4">
                                            {education.map((edu, index) => (
                                                <div key={index}>
                                                    <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                                                    <p className="text-emerald-600">{edu.school || 'School'}</p>
                                                    <p className="text-gray-600 text-sm">{edu.startYear || ''} - {edu.endYear || 'Present'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Minimalist+ Template
    const renderMinimalistPlus = () => (
        <div className="bg-white text-gray-800 font-sans">
            {/* Simple Header */}
            <div className="border-b border-gray-300 pb-6 mb-6">
                <h1 className="text-3xl font-light text-gray-900">{personalInfo?.fullName || 'Your Name'}</h1>
                <p className="text-lg text-gray-600 mt-1">{targetRole}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                    {personalInfo?.email && <span>{personalInfo.email}</span>}
                    {personalInfo?.phone && <span>• {personalInfo.phone}</span>}
                    {personalInfo?.location && <span>• {personalInfo.location}</span>}
                </div>
            </div>

            <div className="space-y-8">
                {/* Summary */}
                {summary && (
                    <div>
                        <p className="text-gray-700 leading-relaxed">{summary}</p>
                    </div>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <div>
                        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Experience</h2>
                        <div className="space-y-6">
                            {experience.map((exp, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{exp.position || 'Position'}</h3>
                                            <p className="text-gray-600">{exp.company || 'Company'}</p>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {exp.startDate && formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                        </div>
                                    </div>
                                    {exp.description && (
                                        <ul className="space-y-1">
                                            {exp.description.split('\n').map((bullet, i) => (
                                                bullet.trim() && <li key={i} className="text-gray-700 text-sm">• {bullet}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills */}
                    {Object.keys(skillCategories).length > 0 && (
                        <div>
                            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Skills</h2>
                            <div className="space-y-4">
                                {Object.entries(skillCategories).map(([category, skills]) => (
                                    <div key={category}>
                                        <h3 className="font-medium text-gray-700 mb-2">{category}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((skill, index) => (
                                                <span key={index} className="text-gray-600 text-sm">
                                                    {skill}{index < skills.length - 1 ? ',' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Education */}
                    {education.length > 0 && (
                        <div>
                            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Education</h2>
                            <div className="space-y-4">
                                {education.map((edu, index) => (
                                    <div key={index}>
                                        <h3 className="font-medium text-gray-900">{edu.degree || 'Degree'}</h3>
                                        <p className="text-gray-600">{edu.school || 'School'}</p>
                                        <p className="text-gray-500 text-sm">{edu.startYear || ''} - {edu.endYear || 'Present'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // ATS Optimized Template
    const renderAtsOptimized = () => (
        <div className="bg-white text-gray-800 font-sans text-sm">
            {/* Simple Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 uppercase">{personalInfo?.fullName || 'YOUR NAME'}</h1>
                <div className="flex flex-wrap gap-4 mt-2">
                    {personalInfo?.email && <span>{personalInfo.email}</span>}
                    {personalInfo?.phone && <span>| {personalInfo.phone}</span>}
                    {personalInfo?.location && <span>| {personalInfo.location}</span>}
                </div>
                {targetRole && (
                    <div className="mt-3 font-medium">{targetRole}</div>
                )}
            </div>

            {/* Summary */}
            {summary && (
                <div className="mb-6">
                    <h2 className="font-bold text-gray-900 uppercase mb-2">Summary</h2>
                    <p className="text-gray-700">{summary}</p>
                </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
                <div className="mb-6">
                    <h2 className="font-bold text-gray-900 uppercase mb-3">Professional Experience</h2>
                    <div className="space-y-4">
                        {experience.map((exp, index) => (
                            <div key={index}>
                                <div className="flex justify-between mb-1">
                                    <div>
                                        <span className="font-bold">{exp.position || 'Position'}</span>
                                        {exp.company && <span>, {exp.company}</span>}
                                    </div>
                                    <div>
                                        {exp.startDate && formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}
                                    </div>
                                </div>
                                {exp.description && (
                                    <div className="ml-4">
                                        {exp.description.split('\n').map((bullet, i) => (
                                            bullet.trim() && <div key={i} className="mb-1">• {bullet}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {Object.keys(skillCategories).length > 0 && (
                <div className="mb-6">
                    <h2 className="font-bold text-gray-900 uppercase mb-3">Skills</h2>
                    <div className="space-y-2">
                        {Object.entries(skillCategories).map(([category, skills]) => (
                            <div key={category}>
                                <span className="font-medium">{category}: </span>
                                <span className="text-gray-700">
                                    {skills.map((skill, index) => (
                                        <span key={index}>
                                            {skill}{index < skills.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {education.length > 0 && (
                <div className="mb-6">
                    <h2 className="font-bold text-gray-900 uppercase mb-3">Education</h2>
                    <div className="space-y-2">
                        {education.map((edu, index) => (
                            <div key={index}>
                                <div className="font-bold">{edu.degree || 'Degree'}</div>
                                <div>{edu.school || 'School'} | {edu.startYear || ''} - {edu.endYear || 'Present'}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Render template based on selected template
    const renderTemplate = () => {
        const templates = {
            'modern-pro': renderModernPro,
            'executive-2026': renderExecutive2026,
            'creative-tech': renderCreativeTech,
            'minimalist-plus': renderMinimalistPlus,
            'ats-optimized': renderAtsOptimized
        };

        const renderFunction = templates[template] || renderModernPro;
        return renderFunction();
    };

    // Device mode styling
    const getDeviceClass = () => {
        switch (deviceMode) {
            case 'mobile':
                return 'max-w-sm mx-auto border-8 border-gray-300 rounded-3xl overflow-hidden';
            case 'tablet':
                return 'max-w-md mx-auto border-8 border-gray-300 rounded-2xl overflow-hidden';
            default:
                return 'border border-gray-300 rounded-xl overflow-hidden shadow-lg';
        }
    };

    // Handle zoom
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    // Handle fullscreen
    const toggleFullscreen = () => {
        if (!isFullscreen) {
            const elem = ref?.current;
            if (elem && elem.requestFullscreen) {
                elem.requestFullscreen();
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Handle print
    const handlePrint = () => {
        onPrint();
        toast.loading('Preparing for print...');
        setTimeout(() => {
            window.print();
            toast.dismiss();
            toast.success('Print dialog opened');
        }, 1000);
    };

    // Handle export
    const handleExport = (format = 'pdf') => {
        onExport(format);
        toast.success(`Exporting as ${format.toUpperCase()}...`);
    };

    // Listen for fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // If compact mode, just show the preview
    if (compact) {
        return (
            <div
                ref={ref}
                className="h-full overflow-auto bg-gray-50"
                style={{ zoom }}
            >
                <div className={getDeviceClass()}>
                    {renderTemplate()}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Preview Controls */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-gray-900">Live Preview</div>

                    {/* Device Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setDeviceMode('mobile')}
                            className={`p-2 rounded ${deviceMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                            title="Mobile View"
                        >
                            <Smartphone className={`w-4 h-4 ${deviceMode === 'mobile' ? 'text-blue-600' : 'text-gray-500'}`} />
                        </button>
                        <button
                            onClick={() => setDeviceMode('tablet')}
                            className={`p-2 rounded ${deviceMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
                            title="Tablet View"
                        >
                            <Tablet className={`w-4 h-4 ${deviceMode === 'tablet' ? 'text-blue-600' : 'text-gray-500'}`} />
                        </button>
                        <button
                            onClick={() => setDeviceMode('desktop')}
                            className={`p-2 rounded ${deviceMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                            title="Desktop View"
                        >
                            <Monitor className={`w-4 h-4 ${deviceMode === 'desktop' ? 'text-blue-600' : 'text-gray-500'}`} />
                        </button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-sm text-gray-600 min-w-[40px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 hover:bg-gray-100 rounded"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>

                    {/* Toggle Keywords & ATS Score */}
                    {keywords && keywords.length > 0 && (
                        <button
                            onClick={() => setShowKeywords(!showKeywords)}
                            className={`p-2 rounded ${showKeywords ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
                            title="Toggle Keywords"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )}

                    {atsScore > 0 && (
                        <button
                            onClick={() => setShowAtsScore(!showAtsScore)}
                            className={`p-2 rounded ${showAtsScore ? 'bg-green-50 text-green-600' : 'text-gray-600'}`}
                            title="Toggle ATS Score"
                        >
                            <BarChart className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-100 rounded"
                        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-gray-600" />
                        ) : (
                            <Maximize2 className="w-4 h-4 text-gray-600" />
                        )}
                    </button>

                    <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Print"
                    >
                        <Printer className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                        onClick={() => handleExport('pdf')}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Export as PDF"
                    >
                        <Download className="w-4 h-4 text-gray-600" />
                    </button>

                    <button
                        onClick={() => {
                            const resumeId = resumeData?._id;
                            if (resumeId && !resumeId.toString().startsWith('temp_')) {
                                navigator.clipboard.writeText(`${window.location.origin}/share/${resumeId}`);
                                toast.success('Share link copied!');
                            } else {
                                toast.error('Please save the resume first to share');
                            }
                        }}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Share"
                    >
                        <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Preview Stats Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <span className="text-gray-600">Template: </span>
                        <span className="font-medium">{template.replace(/-/g, ' ').toUpperCase()}</span>
                    </div>

                    {totalExperience && totalExperience !== '0 months' && (
                        <div>
                            <span className="text-gray-600">Experience: </span>
                            <span className="font-medium">{totalExperience}</span>
                        </div>
                    )}

                    {resumeData?.completion !== undefined && (
                        <div>
                            <span className="text-gray-600">Completion: </span>
                            <span className="font-medium">{resumeData.completion}%</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {showAtsScore && atsScore > 0 && (
                        <div className={`px-3 py-1 rounded-full ${atsScore >= 80 ? 'bg-green-100 text-green-700' : atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            ATS Score: {atsScore}%
                        </div>
                    )}

                    {showKeywords && keywords && keywords.length > 0 && (
                        <div className="text-gray-600">
                            Keywords: <span className="font-medium">{keywords.length} detected</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Keywords Display */}
            {showKeywords && keywords && keywords.length > 0 && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm font-medium text-blue-700">Keywords:</span>
                        {keywords.slice(0, 15).map((keyword, index) => (
                            <span key={index} className="px-2 py-1 bg-white border border-blue-200 rounded-full text-xs text-blue-700">
                                {keyword}
                            </span>
                        ))}
                        {keywords.length > 15 && (
                            <span className="px-2 py-1 text-xs text-blue-600">
                                +{keywords.length - 15} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Content */}
            <div
                ref={ref}
                className="flex-1 overflow-auto bg-gray-100 p-4"
                style={{ zoom }}
            >
                <div className="h-full flex items-center justify-center">
                    <div className={getDeviceClass()}>
                        {renderTemplate()}
                    </div>
                </div>
            </div>
        </div>
    );
});

RealTimePreview.displayName = 'RealTimePreview';

export default RealTimePreview;