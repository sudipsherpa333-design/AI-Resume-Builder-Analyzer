// src/components/Preview/PreviewModal.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    X, Printer, Download, Smartphone, Monitor,
    Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Copy
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PreviewModal = ({
    resumeData,
    onClose,
    onPrint,
    onExport,
    previewMode = 'desktop',
    previewTemplate = 'modern',
    onPreviewModeChange,
    onTemplateChange,
    isDocked = false, // Used to adjust layout for docked vs modal
}) => {
    const [zoom, setZoom] = useState(100);
    const [activeTemplate] = useState(previewTemplate);
    const [activeMode, setActiveMode] = useState(previewMode);
    const previewRef = useRef(null);

    // Defensive guard: if resumeData is missing or not loaded
    if (!resumeData || !resumeData.data) {
        return (
            <div className={`flex flex-col h-full ${isDocked ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading resume preview...</p>
                    </div>
                </div>
            </div>
        );
    }

    const { data } = resumeData;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const resetZoom = () => setZoom(100);

    const handleCopyText = () => {
        const text = generateTextVersion();
        navigator.clipboard.writeText(text);
        toast.success('Resume text copied to clipboard!');
    };

    const generateTextVersion = () => {
        let text = `${data.personalInfo?.fullName || 'Your Name'}\n`;
        text += '='.repeat(text.length - 1) + '\n\n';

        if (data.summary?.content) {
            text += 'PROFESSIONAL SUMMARY\n';
            text += '-'.repeat(20) + '\n';
            text += `${data.summary.content}\n\n`;
        }

        if (data.experience?.items?.length > 0) {
            text += 'WORK EXPERIENCE\n';
            text += '-'.repeat(15) + '\n';
            data.experience.items.forEach(item => {
                text += `${item.title || 'Position'} at ${item.company || 'Company'}\n`;
                text += `${item.startDate || ''} - ${item.endDate || 'Present'}\n`;
                if (item.description) text += `${item.description}\n`;
                text += '\n';
            });
        }

        text += `\nGenerated on: ${new Date().toLocaleDateString()}`;
        return text;
    };

    const renderPreview = () => (
        <div className={`bg-white rounded-lg shadow-lg p-8 ${activeMode === 'mobile' ? 'max-w-md mx-auto' : ''}`}>
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {data.personalInfo?.fullName || 'Your Name'}
                </h1>
                <div className="flex flex-wrap justify-center gap-4 text-gray-600 text-sm">
                    {data.personalInfo?.email && <span>✉ {data.personalInfo.email}</span>}
                    {data.personalInfo?.phone && <span>📞 {data.personalInfo.phone}</span>}
                    {data.personalInfo?.location && <span>📍 {data.personalInfo.location}</span>}
                    {data.personalInfo?.linkedin && (
                        <span className="text-blue-600">🔗 {data.personalInfo.linkedin}</span>
                    )}
                </div>
            </div>

            {/* Summary */}
            {data.summary?.content && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                        PROFESSIONAL SUMMARY
                    </h2>
                    <p className="text-gray-700 leading-relaxed">{data.summary.content}</p>
                </section>
            )}

            {/* Experience */}
            {data.experience?.items?.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                        WORK EXPERIENCE
                    </h2>
                    {data.experience.items.map((item, i) => (
                        <div key={i} className="mb-6 last:mb-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold">{item.title || 'Position'}</h3>
                                    <p className="text-gray-700">{item.company || 'Company'}</p>
                                </div>
                                <span className="text-sm text-gray-600">
                                    {item.startDate || ''} – {item.endDate || 'Present'}
                                </span>
                            </div>
                            {item.description && <p className="text-gray-700 mt-2">{item.description}</p>}
                        </div>
                    ))}
                </section>
            )}

            {/* Education */}
            {data.education?.items?.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                        EDUCATION
                    </h2>
                    {data.education.items.map((item, i) => (
                        <div key={i} className="mb-4">
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-semibold">{item.degree || 'Degree'}</h3>
                                    <p className="text-gray-700">{item.school || 'Institution'}</p>
                                </div>
                                <span className="text-gray-600">{item.graduationYear || ''}</span>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {/* Skills */}
            {data.skills?.items?.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b-2 border-gray-300 pb-2">
                        SKILLS
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {data.skills.items.map((skill, i) => (
                            <span
                                key={i}
                                className="px-4 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                            >
                                {skill.name || 'Skill'}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            <footer className="mt-12 pt-6 border-t text-center text-sm text-gray-500">
                Generated with Resume Builder • {new Date().toLocaleDateString()}
            </footer>
        </div>
    );

    // For docked mode: simple clean view
    if (isDocked) {
        return (
            <div className="h-full flex flex-col bg-gray-50">
                <div className="p-3 border-b bg-white flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Live Preview</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopyText} className="p-1.5 hover:bg-gray-100 rounded">
                            <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-100 rounded">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
                        <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-100 rounded">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                    <div
                        className="mx-auto max-w-3xl transition-transform duration-200"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                    >
                        {renderPreview()}
                    </div>
                </div>
            </div>
        );
    }

    // Full modal mode (existing rich UI)
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-4 md:inset-8 z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-3">
                        <Monitor className="w-6 h-6 text-blue-600" />
                        <div>
                            <h2 className="text-xl font-bold">Resume Preview</h2>
                            <p className="text-sm text-gray-600">Full view • Export ready</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleCopyText} className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                            <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={onPrint} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Printer className="w-4 h-4 inline mr-2" /> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setActiveMode('desktop')} className={`px-3 py-1 rounded ${activeMode === 'desktop' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}>
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button onClick={() => setActiveMode('mobile')} className={`px-3 py-1 rounded ${activeMode === 'mobile' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}>
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleZoomOut}><ZoomOut className="w-5 h-5" /></button>
                        <span className="px-3 font-medium">{zoom}%</span>
                        <button onClick={handleZoomIn}><ZoomIn className="w-5 h-5" /></button>
                        <button onClick={resetZoom}><RotateCcw className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-gray-100 p-6">
                    <div
                        ref={previewRef}
                        className="mx-auto transition-all duration-300"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            transformOrigin: 'top center',
                            maxWidth: activeMode === 'mobile' ? '420px' : '1000px'
                        }}
                    >
                        {renderPreview()}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={() => onExport?.('pdf')}
                        className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <button onClick={onClose} className="px-5 py-2 border rounded-lg hover:bg-gray-100">
                        Close
                    </button>
                </div>
            </motion.div>
        </>
    );
};

export default PreviewModal;