// src/components/Preview/ResumePreview.jsx
import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';

const LivePreview = forwardRef(({
    resume,
    isVisible,
    onClose,
    isMobile,
    position = 'right'
}, ref) => {
    if (!isVisible) return null;

    const positionClasses = {
        right: 'right-0 top-0 h-full',
        bottom: 'bottom-0 left-0 w-full',
        left: 'left-0 top-0 h-full'
    };

    const getSectionData = (section) => {
        return resume?.data?.[section] || {};
    };

    const renderPreview = () => {
        const personalInfo = getSectionData('personalInfo');
        const summary = getSectionData('summary');
        const experience = getSectionData('experience');
        const education = getSectionData('education');
        const skills = getSectionData('skills');

        return (
            <div className="bg-white h-full overflow-y-auto" id="resume-preview" ref={ref}>
                <div className="p-8 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {personalInfo.fullName || 'Your Name'}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-4 text-gray-600">
                            {personalInfo.email && <div>{personalInfo.email}</div>}
                            {personalInfo.phone && <div>{personalInfo.phone}</div>}
                            {personalInfo.location && <div>{personalInfo.location}</div>}
                            {personalInfo.linkedin && <div>LinkedIn: {personalInfo.linkedin}</div>}
                        </div>
                    </div>

                    {/* Summary */}
                    {summary.content && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">SUMMARY</h2>
                            <p className="text-gray-700 whitespace-pre-line">{summary.content}</p>
                        </div>
                    )}

                    {/* Experience */}
                    {experience.items && experience.items.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">EXPERIENCE</h2>
                            {experience.items.map((exp, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{exp.position}</h3>
                                            <p className="text-gray-700">{exp.company} • {exp.location}</p>
                                        </div>
                                        <span className="text-gray-600">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                    </div>
                                    {exp.description && (
                                        <p className="text-gray-700 mt-2 whitespace-pre-line">{exp.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Education */}
                    {education.items && education.items.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">EDUCATION</h2>
                            {education.items.map((edu, index) => (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                                            <p className="text-gray-700">{edu.school} • {edu.location}</p>
                                        </div>
                                        <span className="text-gray-600">{edu.graduationYear}</span>
                                    </div>
                                    {edu.gpa && (
                                        <p className="text-gray-700 mt-1">GPA: {edu.gpa}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Skills */}
                    {skills.items && skills.items.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">SKILLS</h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.items.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                                    >
                                        {skill.name} {skill.level && `(${skill.level})`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t text-center text-gray-500 text-sm">
                        <p>Generated with ResumeAI Pro • Last updated: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ x: position === 'right' ? 400 : position === 'left' ? -400 : 0, y: position === 'bottom' ? 400 : 0 }}
            animate={{ x: 0, y: 0 }}
            exit={{ x: position === 'right' ? 400 : position === 'left' ? -400 : 0, y: position === 'bottom' ? 400 : 0 }}
            className={`fixed ${positionClasses[position]} ${isMobile
                    ? 'w-full h-3/4'
                    : 'w-96 shadow-2xl border-l border-gray-200'
                } bg-white z-40 flex flex-col`}
        >
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-bold text-gray-900">Live Preview</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                        title="Print"
                    >
                        <Printer size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
                {renderPreview()}
            </div>
        </motion.div>
    );
});

LivePreview.displayName = 'LivePreview';

export default LivePreview;