// components/builder/LivePreview.jsx
import React from 'react';

const LivePreview = ({ resumeData }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        try {
            const date = new Date(dateString + '-01');
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        } catch {
            return dateString;
        }
    };

    const calculateDuration = (startDate, endDate, current) => {
        if (!startDate) return '';

        try {
            const start = new Date(startDate + '-01');
            const end = current ? new Date() : new Date(endDate + '-01');

            const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;

            if (years === 0) return `${remainingMonths} mos`;
            if (remainingMonths === 0) return `${years} yr${years > 1 ? 's' : ''}`;
            return `${years} yr${years > 1 ? 's' : ''} ${remainingMonths} mos`;
        } catch {
            return '';
        }
    };

    if (!resumeData) {
        return (
            <div className="bg-white p-8 min-h-[800px] font-sans flex items-center justify-center">
                <div className="text-gray-500 text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p>Start building your resume to see the preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 min-h-[800px] font-sans text-gray-800">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {resumeData.personalInfo?.firstName || 'Your'} {resumeData.personalInfo?.lastName || 'Name'}
                </h1>
                <div className="flex flex-wrap justify-center gap-4 text-gray-600 text-sm">
                    {resumeData.personalInfo?.email && (
                        <span>{resumeData.personalInfo.email}</span>
                    )}
                    {resumeData.personalInfo?.phone && (
                        <span>• {resumeData.personalInfo.phone}</span>
                    )}
                    {resumeData.personalInfo?.linkedin && (
                        <span>• LinkedIn</span>
                    )}
                    {resumeData.personalInfo?.portfolio && (
                        <span>• Portfolio</span>
                    )}
                </div>
                {(resumeData.personalInfo?.address || resumeData.personalInfo?.city) && (
                    <div className="text-gray-600 text-sm mt-2">
                        {resumeData.personalInfo?.address}
                        {resumeData.personalInfo?.city && `, ${resumeData.personalInfo.city}`}
                        {resumeData.personalInfo?.state && `, ${resumeData.personalInfo.state}`}
                        {resumeData.personalInfo?.zipCode && ` ${resumeData.personalInfo.zipCode}`}
                    </div>
                )}
            </div>

            {/* Professional Summary */}
            {resumeData.professionalSummary && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-2 border-b border-gray-300 pb-1">
                        Professional Summary
                    </h2>
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {resumeData.professionalSummary}
                    </p>
                </div>
            )}

            {/* Experience */}
            {resumeData.experience?.some(exp => exp.jobTitle || exp.company) && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        Experience
                    </h2>
                    <div className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                            (exp.jobTitle || exp.company) && (
                                <div key={exp.id || index} className="mb-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800 text-sm">
                                            {exp.jobTitle}
                                        </h3>
                                        <span className="text-gray-600 text-xs">
                                            {exp.startDate && formatDate(exp.startDate)} - {exp.current ? 'Present' : (exp.endDate && formatDate(exp.endDate))}
                                            {exp.startDate && ` • ${calculateDuration(exp.startDate, exp.endDate, exp.current)}`}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 text-sm mb-1">
                                        {exp.company}{exp.location && ` • ${exp.location}`}
                                    </div>
                                    {exp.description && (
                                        <div className="text-gray-600 text-xs leading-relaxed">
                                            {exp.description.split('\n').map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {resumeData.education?.some(edu => edu.degree || edu.institution) && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        Education
                    </h2>
                    <div className="space-y-4">
                        {resumeData.education.map((edu, index) => (
                            (edu.degree || edu.institution) && (
                                <div key={edu.id || index} className="mb-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800 text-sm">
                                            {edu.degree}
                                        </h3>
                                        <span className="text-gray-600 text-xs">
                                            {edu.startDate && formatDate(edu.startDate)} - {edu.current ? 'Present' : (edu.endDate && formatDate(edu.endDate))}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 text-sm">
                                        {edu.institution}{edu.location && ` • ${edu.location}`}
                                        {edu.gpa && ` • GPA: ${edu.gpa}`}
                                    </div>
                                    {edu.description && (
                                        <div className="text-gray-600 text-xs mt-1">
                                            {edu.description.split('\n').map((line, i) => (
                                                <div key={i}>{line}</div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {resumeData.skills?.some(skill => skill.skills) && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        Skills
                    </h2>
                    <div className="space-y-2">
                        {resumeData.skills.map((skill, index) => (
                            skill.skills && (
                                <div key={skill.id || index} className="text-sm">
                                    <span className="font-medium text-gray-700">{skill.category}:</span>
                                    <span className="text-gray-600 ml-1">{skill.skills}</span>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {resumeData.projects?.some(project => project.name) && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        Projects
                    </h2>
                    <div className="space-y-4">
                        {resumeData.projects.map((project, index) => (
                            project.name && (
                                <div key={project.id || index} className="mb-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-semibold text-gray-800 text-sm">
                                            {project.name}
                                        </h3>
                                        {project.startDate && (
                                            <span className="text-gray-600 text-xs">
                                                {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}
                                            </span>
                                        )}
                                    </div>
                                    {project.technologies && (
                                        <div className="text-gray-700 text-xs mb-1">
                                            Technologies: {project.technologies}
                                        </div>
                                    )}
                                    {project.description && (
                                        <p className="text-gray-600 text-xs leading-relaxed">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {resumeData.certifications?.some(cert => cert.name) && (
                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">
                        Certifications
                    </h2>
                    <div className="space-y-2">
                        {resumeData.certifications.map((cert, index) => (
                            cert.name && (
                                <div key={cert.id || index} className="text-sm">
                                    <div className="font-medium text-gray-700">{cert.name}</div>
                                    <div className="text-gray-600 text-xs">
                                        {cert.issuer}
                                        {cert.date && ` • ${formatDate(cert.date)}`}
                                        {cert.credentialId && ` • Credential ID: ${cert.credentialId}`}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LivePreview;