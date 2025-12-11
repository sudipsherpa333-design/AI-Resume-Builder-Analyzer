import React, { useState, useRef } from 'react';
import {
    FaEye, FaFilePdf, FaFileImage, FaPrint, FaSearchMinus,
    FaSearchPlus, FaArrowsAltH, FaArrowsAltV, FaSpinner,
    FaFileAlt, FaFont, FaEnvelope, FaPhone, FaLinkedin,
    FaMapMarkerAlt, FaDatabase
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const EnhancedLivePreview = ({ resumeData, previewSize, onSizeChange }) => {
    const previewRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportAsPDF = async () => {
        if (!previewRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 190;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const firstName = resumeData?.personalInfo?.firstName || 'resume';
            const lastName = resumeData?.personalInfo?.lastName || '';
            pdf.save(`${firstName}_${lastName}.pdf`);
            toast.success('Resume exported as PDF!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    const exportAsImage = async () => {
        if (!previewRef.current) return;

        setIsExporting(true);
        try {
            const canvas = await html2canvas(previewRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const link = document.createElement('a');
            const firstName = resumeData?.personalInfo?.firstName || 'resume';
            const lastName = resumeData?.personalInfo?.lastName || '';
            link.download = `${firstName}_${lastName}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            toast.success('Resume exported as PNG!');
        } catch (error) {
            console.error('Image export error:', error);
            toast.error('Failed to export image');
        } finally {
            setIsExporting(false);
        }
    };

    const getPreviewStyle = () => {
        switch (previewSize) {
            case 'small': return { transform: 'scale(0.7)', transformOrigin: 'top left' };
            case 'medium': return { transform: 'scale(0.85)', transformOrigin: 'top left' };
            case 'large': return { transform: 'scale(1)', transformOrigin: 'top left' };
            case 'full': return { transform: 'scale(1.1)', transformOrigin: 'top left' };
            default: return { transform: 'scale(0.85)', transformOrigin: 'top left' };
        }
    };

    const printPreview = () => {
        window.print();
        toast.success('Opening print dialog...');
    };

    return (
        <div className="h-full flex flex-col">
            {/* Preview Toolbar */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-3 rounded-t-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <FaEye />
                        <span className="font-semibold">Live Preview</span>
                        <span className="flex items-center gap-1 text-xs bg-green-500 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => onSizeChange('small')}
                            className={`p-1.5 rounded ${previewSize === 'small' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                            title="Small"
                        >
                            <FaSearchMinus />
                        </button>
                        <button
                            onClick={() => onSizeChange('medium')}
                            className={`p-1.5 rounded ${previewSize === 'medium' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                            title="Medium"
                        >
                            <FaArrowsAltH />
                        </button>
                        <button
                            onClick={() => onSizeChange('large')}
                            className={`p-1.5 rounded ${previewSize === 'large' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                            title="Large"
                        >
                            <FaArrowsAltV />
                        </button>
                        <button
                            onClick={() => onSizeChange('full')}
                            className={`p-1.5 rounded ${previewSize === 'full' ? 'bg-gray-600' : 'hover:bg-gray-600'}`}
                            title="Full Size"
                        >
                            <FaSearchPlus />
                        </button>
                    </div>
                    <div className="w-px h-6 bg-gray-600"></div>
                    <button
                        onClick={exportAsImage}
                        disabled={isExporting}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                        title="Export as Image"
                    >
                        <FaFileImage />
                    </button>
                    <button
                        onClick={exportAsPDF}
                        disabled={isExporting}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                        title="Export as PDF"
                    >
                        <FaFilePdf />
                    </button>
                    <button
                        onClick={printPreview}
                        className="p-2 hover:bg-gray-700 rounded-lg transition"
                        title="Print"
                    >
                        <FaPrint />
                    </button>
                    {isExporting && <FaSpinner className="animate-spin" />}
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
                <div
                    ref={previewRef}
                    className="bg-white shadow-xl mx-auto"
                    style={{
                        ...getPreviewStyle(),
                        width: '210mm',
                        minHeight: '297mm',
                        padding: '20mm'
                    }}
                >
                    {/* Modern Resume Template */}
                    <div className="font-sans">
                        {/* Header */}
                        <div className="border-b-2 border-blue-600 pb-6 mb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                        {resumeData?.personalInfo?.firstName || 'First'} {resumeData?.personalInfo?.lastName || 'Last'}
                                    </h1>
                                    <p className="text-xl text-blue-600 font-medium">
                                        {resumeData?.personalInfo?.title || 'Professional Title'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="space-y-1 text-sm">
                                        {resumeData?.personalInfo?.email && (
                                            <div className="flex items-center justify-end gap-2">
                                                <FaEnvelope className="text-gray-400 text-xs" />
                                                <span>{resumeData.personalInfo.email}</span>
                                            </div>
                                        )}
                                        {resumeData?.personalInfo?.phone && (
                                            <div className="flex items-center justify-end gap-2">
                                                <FaPhone className="text-gray-400 text-xs" />
                                                <span>{resumeData.personalInfo.phone}</span>
                                            </div>
                                        )}
                                        {resumeData?.personalInfo?.linkedin && (
                                            <div className="flex items-center justify-end gap-2">
                                                <FaLinkedin className="text-gray-400 text-xs" />
                                                <span>{resumeData.personalInfo.linkedin}</span>
                                            </div>
                                        )}
                                        {resumeData?.personalInfo?.location && (
                                            <div className="flex items-center justify-end gap-2">
                                                <FaMapMarkerAlt className="text-gray-400 text-xs" />
                                                <span>{resumeData.personalInfo.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        {resumeData?.summary && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">PROFESSIONAL SUMMARY</h2>
                                <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
                            </div>
                        )}

                        {/* Experience */}
                        {resumeData?.experience?.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">WORK EXPERIENCE</h2>
                                <div className="space-y-6">
                                    {resumeData.experience.map((exp, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <div className="absolute left-0 top-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                            <div className="flex justify-between items-start mb-1">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{exp.jobTitle || 'Job Title'}</h3>
                                                    <p className="text-blue-600 font-medium">{exp.company || 'Company'}</p>
                                                </div>
                                                <div className="text-gray-600 text-sm">
                                                    {exp.startDate || 'Start'} - {exp.current ? 'Present' : exp.endDate || 'End'}
                                                </div>
                                            </div>
                                            {exp.description && (
                                                <p className="text-gray-700 mt-2">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Education */}
                        {resumeData?.education?.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">EDUCATION</h2>
                                <div className="space-y-4">
                                    {resumeData.education.map((edu, idx) => (
                                        <div key={idx} className="relative pl-6">
                                            <div className="absolute left-0 top-0 w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{edu.degree || 'Degree'}</h3>
                                                    <p className="text-gray-700">{edu.institution || 'Institution'}</p>
                                                </div>
                                                <div className="text-gray-600 text-sm">{edu.graduationDate || 'Date'}</div>
                                            </div>
                                            {edu.gpa && (
                                                <p className="text-gray-600 text-sm mt-1">GPA: {edu.gpa}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {resumeData?.skills?.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-300">SKILLS</h2>
                                <div className="flex flex-wrap gap-2">
                                    {resumeData.skills.map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-12 pt-6 border-t border-gray-300 text-center text-gray-500 text-sm">
                            <p>Generated with AI Resume Builder • Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Footer */}
            <div className="bg-gray-800 text-white p-3 rounded-b-lg flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <FaFileAlt className="text-blue-400" />
                        <span>A4 Format</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaFont className="text-green-400" />
                        <span>Modern Template</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-400">Scale: {previewSize === 'small' ? '70%' : previewSize === 'medium' ? '85%' : previewSize === 'large' ? '100%' : '110%'}</span>
                </div>
            </div>
        </div>
    );
};

export default EnhancedLivePreview;