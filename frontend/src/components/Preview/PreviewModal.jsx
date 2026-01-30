// src/components/Preview/PreviewModal.jsx - FIXED IMPORTS
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Printer, Download, Smartphone, Monitor,
    Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Copy,
    Check, Palette, FileText, Briefcase, GraduationCap, Code,
    Globe, Award, Users, Eye, EyeOff, Sun, Moon, Grid, List,
    File, Share2, ExternalLink,
    ChevronLeft, ChevronRight, Layout, Settings, Loader2,
    FileText as FileTextIcon // This is FileText, not FilePdf
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PreviewModal = ({
    resumeData = {},
    template = 'modern',
    onClose,
    onPrint,
    onExport,
    onShare,
    onDuplicate,
    isFullscreen = false,
    isDarkMode = false,
    onToggleDarkMode,
    onTemplateChange,
    isDocked = false,
}) => {
    const [zoom, setZoom] = useState(100);
    const [activeMode, setActiveMode] = useState('desktop');
    const [activeTemplate, setActiveTemplate] = useState(template);
    const [isFullscreenMode, setIsFullscreenMode] = useState(isFullscreen);
    const [isDark, setIsDark] = useState(isDarkMode);
    const [showControls, setShowControls] = useState(true);
    const [watermark, setWatermark] = useState(true);
    const [pageSize, setPageSize] = useState('A4');
    const [previewType, setPreviewType] = useState('full');
    const [isPrinting, setIsPrinting] = useState(false);
    const previewRef = useRef(null);
    const contentRef = useRef(null);

    // Handle print (fallback implementation)
    const handlePrint = () => {
        if (onPrint) {
            onPrint();
            return;
        }

        try {
            setIsPrinting(true);

            // Create a print-friendly version
            const printContent = document.createElement('div');
            printContent.style.cssText = `
                font-family: Arial, sans-serif;
                padding: 20px;
                max-width: 800px;
                margin: 0 auto;
            `;

            // Add print styles
            const styles = document.createElement('style');
            styles.textContent = `
                @media print {
                    @page { margin: 0.5in; }
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
            `;

            // Get the preview content
            if (contentRef.current) {
                const clone = contentRef.current.cloneNode(true);

                // Remove interactive elements for print
                const buttons = clone.querySelectorAll('button');
                buttons.forEach(btn => btn.remove());

                // Remove watermark if not wanted
                if (!watermark) {
                    const watermarks = clone.querySelectorAll('footer');
                    watermarks.forEach(wm => wm.remove());
                }

                printContent.appendChild(styles);
                printContent.appendChild(clone);
            } else {
                // Fallback content
                printContent.innerHTML = `
                    <h1>${resumeData?.title || 'Resume'}</h1>
                    <p>Print preview will be available in the next update.</p>
                    <p>For now, please use the Export PDF feature.</p>
                `;
            }

            // Open print window
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${resumeData?.title || 'Resume'} - Print</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            @media print {
                                @page { margin: 0.5in; }
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div id="print-content"></div>
                        <script>
                            document.body.innerHTML = ${JSON.stringify(printContent.innerHTML)};
                            window.onload = () => {
                                setTimeout(() => {
                                    window.print();
                                    setTimeout(() => window.close(), 1000);
                                }, 500);
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();

            toast.success('Print dialog opened');
        } catch (error) {
            console.error('Print error:', error);
            toast.error('Print failed. Please try Export PDF instead.');
        } finally {
            setIsPrinting(false);
        }
    };

    // Handle template change
    const handleTemplateChange = (templateId) => {
        setActiveTemplate(templateId);
        if (onTemplateChange) {
            onTemplateChange(templateId);
        }
        toast.success(`Template changed to ${templateId}`);
    };

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const resetZoom = () => setZoom(100);
    const fitToScreen = () => {
        if (contentRef.current && previewRef.current) {
            const containerWidth = previewRef.current.offsetWidth;
            const contentWidth = contentRef.current.offsetWidth;
            const newZoom = Math.floor((containerWidth / contentWidth) * 100 * 0.9);
            setZoom(Math.max(50, Math.min(100, newZoom)));
        }
    };

    // Copy text function
    const handleCopyText = () => {
        const text = generateTextVersion();
        navigator.clipboard.writeText(text);
        toast.success('Resume text copied to clipboard!');
    };

    // Share resume
    const handleShare = async () => {
        if (onShare) {
            onShare();
            return;
        }

        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${resumeData?.title || 'Resume'} - Preview`,
                    text: 'Check out my resume preview!',
                    url: window.location.href,
                });
                toast.success('Resume shared!');
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
            }
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    // Generate plain text version
    const generateTextVersion = () => {
        if (!resumeData) return 'Resume data not available';

        let text = `${resumeData.personalInfo?.fullName || 'Your Name'}\n`;
        text += '='.repeat(text.length - 1) + '\n\n';

        // Contact info
        const contact = [
            resumeData.personalInfo?.email,
            resumeData.personalInfo?.phone,
            resumeData.personalInfo?.location,
            resumeData.personalInfo?.linkedin,
            resumeData.personalInfo?.github,
            resumeData.personalInfo?.website
        ].filter(Boolean).join(' • ');

        if (contact) {
            text += `${contact}\n\n`;
        }

        // Summary
        if (resumeData.summary) {
            text += 'PROFESSIONAL SUMMARY\n';
            text += '-'.repeat(20) + '\n';
            text += `${resumeData.summary}\n\n`;
        }

        // Experience
        if (resumeData.experience?.length > 0) {
            text += 'WORK EXPERIENCE\n';
            text += '-'.repeat(15) + '\n';
            resumeData.experience.forEach((item, i) => {
                text += `${item.position || 'Position'} at ${item.company || 'Company'}\n`;
                text += `${item.startDate || ''} - ${item.endDate || 'Present'}\n`;
                if (item.description) text += `${item.description}\n`;
                if (item.responsibilities?.length > 0) {
                    item.responsibilities.forEach(resp => text += `• ${resp}\n`);
                }
                text += '\n';
            });
        }

        // Education
        if (resumeData.education?.length > 0) {
            text += 'EDUCATION\n';
            text += '-'.repeat(10) + '\n';
            resumeData.education.forEach((item, i) => {
                text += `${item.degree || 'Degree'}\n`;
                text += `${item.institution || 'Institution'}\n`;
                if (item.fieldOfStudy) text += `Field: ${item.fieldOfStudy}\n`;
                text += `${item.startDate || ''} - ${item.endDate || ''}\n`;
                if (item.gpa) text += `GPA: ${item.gpa}\n`;
                text += '\n';
            });
        }

        // Skills
        if (resumeData.skills?.length > 0) {
            text += 'SKILLS\n';
            text += '-'.repeat(6) + '\n';
            const skills = resumeData.skills.map(s => typeof s === 'string' ? s : s.name).filter(Boolean);
            text += skills.join(' • ') + '\n\n';
        }

        text += `\nGenerated with ResumeCraft • ${new Date().toLocaleDateString()}`;
        return text;
    };

    // Template renderers
    const renderTemplate = () => {
        const templates = {
            modern: ModernTemplate,
            corporate: CorporateTemplate,
            creative: CreativeTemplate,
            minimal: MinimalTemplate,
            executive: ExecutiveTemplate
        };

        const TemplateComponent = templates[activeTemplate] || ModernTemplate;
        return <TemplateComponent resumeData={resumeData} isDark={isDark} />;
    };

    // Modern Template
    const ModernTemplate = ({ resumeData, isDark }) => (
        <div className={`p-8 rounded-xl ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} shadow-lg`}>
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {resumeData.personalInfo?.fullName || 'Your Name'}
                </h1>
                <div className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-4">
                    {resumeData.personalInfo?.jobTitle || 'Professional Title'}
                </div>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {resumeData.personalInfo?.email && <span>✉ {resumeData.personalInfo.email}</span>}
                    {resumeData.personalInfo?.phone && <span>📞 {resumeData.personalInfo.phone}</span>}
                    {resumeData.personalInfo?.location && <span>📍 {resumeData.personalInfo.location}</span>}
                    {resumeData.personalInfo?.linkedin && (
                        <span className="text-blue-600 dark:text-blue-400">🔗 LinkedIn</span>
                    )}
                    {resumeData.personalInfo?.github && (
                        <span className="text-gray-700 dark:text-gray-300">👨‍💻 GitHub</span>
                    )}
                </div>
            </div>

            {/* Summary */}
            {resumeData.summary && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-blue-500 dark:border-blue-400">
                        PROFESSIONAL SUMMARY
                    </h2>
                    <p className="leading-relaxed">{resumeData.summary}</p>
                </section>
            )}

            {/* Experience */}
            {resumeData.experience?.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-green-500 dark:border-green-400">
                        WORK EXPERIENCE
                    </h2>
                    <div className="space-y-6">
                        {resumeData.experience.map((exp, i) => (
                            <div key={i} className="relative pl-6 border-l-2 border-gray-300 dark:border-gray-600">
                                <div className="absolute -left-2.5 top-0 w-4 h-4 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                                <div className="flex flex-col md:flex-row md:justify-between mb-2">
                                    <h3 className="text-lg font-semibold">{exp.position}</h3>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {exp.startDate} – {exp.endDate || 'Present'}
                                    </span>
                                </div>
                                <div className="text-gray-700 dark:text-gray-300 mb-2">{exp.company}</div>
                                {exp.description && (
                                    <p className="text-gray-600 dark:text-gray-400">{exp.description}</p>
                                )}
                                {exp.responsibilities?.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                        {exp.responsibilities.map((resp, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="mr-2">•</span>
                                                <span>{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Education */}
            {resumeData.education?.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-purple-500 dark:border-purple-400">
                        EDUCATION
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumeData.education.map((edu, i) => (
                            <div key={i} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-semibold">{edu.degree}</h3>
                                <div className="text-gray-700 dark:text-gray-300">{edu.institution}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {edu.startDate} – {edu.endDate}
                                </div>
                                {edu.gpa && (
                                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        GPA: {edu.gpa}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Skills */}
            {resumeData.skills?.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold mb-4 pb-2 border-b-2 border-amber-500 dark:border-amber-400">
                        SKILLS
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, i) => {
                            const skillName = typeof skill === 'string' ? skill : skill.name;
                            return (
                                <span
                                    key={i}
                                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium"
                                >
                                    {skillName}
                                </span>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Footer */}
            {watermark && (
                <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                    Generated with ResumeCraft • {new Date().toLocaleDateString()}
                </footer>
            )}
        </div>
    );

    // Corporate Template
    const CorporateTemplate = ({ resumeData, isDark }) => (
        <div className={`p-8 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="border-l-4 border-blue-600 dark:border-blue-500 pl-4 mb-8">
                <h1 className="text-3xl font-bold">{resumeData.personalInfo?.fullName || 'Your Name'}</h1>
                <p className="text-gray-600 dark:text-gray-400">{resumeData.personalInfo?.jobTitle || 'Position'}</p>
            </div>
            <p>Corporate template preview - Professional layout</p>
        </div>
    );

    // Creative Template
    const CreativeTemplate = ({ resumeData, isDark }) => (
        <div className={`p-8 rounded-3xl ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' : 'bg-gradient-to-br from-white to-gray-50 text-gray-900'} shadow-2xl`}>
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                    <FileText className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold mb-2">{resumeData.personalInfo?.fullName || 'Your Name'}</h1>
                <p className="text-gray-600 dark:text-gray-400">Creative professional</p>
            </div>
        </div>
    );

    // Minimal Template
    const MinimalTemplate = ({ resumeData, isDark }) => (
        <div className={`p-6 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <h1 className="text-2xl font-light mb-1">{resumeData.personalInfo?.fullName || 'Your Name'}</h1>
            <div className="h-px bg-gray-300 dark:bg-gray-700 mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minimalist resume layout</p>
        </div>
    );

    // Executive Template
    const ExecutiveTemplate = ({ resumeData, isDark }) => (
        <div className={`p-8 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} border border-gray-200 dark:border-gray-700`}>
            <div className="flex items-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-6">
                    <FileText className="w-12 h-12 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{resumeData.personalInfo?.fullName || 'Your Name'}</h1>
                    <p className="text-gray-600 dark:text-gray-400">{resumeData.personalInfo?.jobTitle || 'Executive'}</p>
                </div>
            </div>
            <p>Executive template - Professional and authoritative</p>
        </div>
    );

    // Template selector
    const TemplateSelector = () => (
        <div className="absolute top-4 left-4 z-10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 w-64">
                <h4 className="font-semibold text-sm mb-2 px-2">Templates</h4>
                <div className="space-y-1">
                    {[
                        { id: 'modern', name: 'Modern', color: 'from-blue-500 to-cyan-500' },
                        { id: 'corporate', name: 'Corporate', color: 'from-gray-600 to-gray-800' },
                        { id: 'creative', name: 'Creative', color: 'from-purple-500 to-pink-500' },
                        { id: 'minimal', name: 'Minimal', color: 'from-gray-400 to-gray-600' },
                        { id: 'executive', name: 'Executive', color: 'from-amber-500 to-orange-500' }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => handleTemplateChange(t.id)}
                            className={`w-full text-left px-3 py-2 rounded flex items-center justify-between ${activeTemplate === t.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${t.color}`}></div>
                                <span className="text-sm">{t.name}</span>
                            </div>
                            {activeTemplate === t.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Control buttons
    const ControlButtons = () => (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
                onClick={() => setShowControls(!showControls)}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
                {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
                onClick={() => setIsFullscreenMode(!isFullscreenMode)}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
                {isFullscreenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
                onClick={() => setIsDark(!isDark)}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
                onClick={onClose}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );

    // Main control panel
    const ControlPanel = () => (
        <AnimatePresence>
            {showControls && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-16 left-4 right-4 z-10"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            {/* Mode Selection */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setActiveMode('desktop')}
                                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${activeMode === 'desktop' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <Monitor className="w-4 h-4" />
                                    <span className="text-sm">Desktop</span>
                                </button>
                                <button
                                    onClick={() => setActiveMode('mobile')}
                                    className={`px-3 py-1.5 rounded flex items-center gap-2 ${activeMode === 'mobile' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <Smartphone className="w-4 h-4" />
                                    <span className="text-sm">Mobile</span>
                                </button>
                            </div>

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleZoomOut}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                                <button
                                    onClick={handleZoomIn}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={resetZoom}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={fitToScreen}
                                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                >
                                    Fit
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleCopyText}
                                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                                >
                                    <Copy className="w-4 h-4" />
                                    <span>Copy Text</span>
                                </button>
                                <button
                                    onClick={() => onExport?.('pdf')}
                                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded flex items-center gap-2"
                                >
                                    <File className="w-4 h-4" /> {/* Using File icon instead of FilePdf */}
                                    <span>Export PDF</span>
                                </button>
                                <button
                                    onClick={handlePrint}
                                    disabled={isPrinting}
                                    className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPrinting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Printer className="w-4 h-4" />
                                    )}
                                    <span>{isPrinting ? 'Printing...' : 'Print'}</span>
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded flex items-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // For docked mode (simple preview)
    if (isDocked) {
        return (
            <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
                <div className="p-3 border-b bg-white dark:bg-gray-800 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">Live Preview</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setWatermark(!watermark)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            {watermark ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setIsDark(!isDark)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div ref={previewRef} className="flex-1 overflow-auto p-4">
                    <div
                        className="mx-auto max-w-3xl transition-transform duration-200"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    >
                        <div ref={contentRef}>
                            {renderTemplate()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Full modal mode
    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`absolute inset-4 md:inset-8 bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isFullscreenMode ? '!inset-0 !rounded-none' : ''}`}
            >
                {/* Template Selector */}
                <TemplateSelector />

                {/* Controls */}
                <ControlButtons />
                <ControlPanel />

                {/* Preview Content */}
                <div
                    ref={previewRef}
                    className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center"
                >
                    <div
                        className="transition-all duration-200"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                            maxWidth: activeMode === 'mobile' ? '420px' : '1000px',
                            width: '100%'
                        }}
                    >
                        <div ref={contentRef}>
                            {renderTemplate()}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Template: <span className="font-medium">{activeTemplate}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Mode: <span className="font-medium">{activeMode}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Zoom: <span className="font-medium">{zoom}%</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => onExport?.('pdf')}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PreviewModal;