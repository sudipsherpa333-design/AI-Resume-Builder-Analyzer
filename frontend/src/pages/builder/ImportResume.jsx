// src/pages/ImportResume.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, Link, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImportResume = () => {
    const navigate = useNavigate();
    const [importType, setImportType] = useState('file');
    const [file, setFile] = useState(null);
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState(null);

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(selectedFile.type)) {
                toast.error('Please upload a PDF or Word document');
                return;
            }

            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            setFile(selectedFile);
            setParsedData(null);
        }
    };

    const handleParse = async () => {
        if (importType === 'file' && !file) {
            toast.error('Please select a file first');
            return;
        }

        if (importType === 'linkedin' && !linkedinUrl.trim()) {
            toast.error('Please enter a LinkedIn URL');
            return;
        }

        setIsParsing(true);

        try {
            // Simulate parsing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock parsed data
            const mockParsedData = {
                personalInfo: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1 (123) 456-7890',
                    location: 'San Francisco, CA',
                    linkedin: 'https://linkedin.com/in/johndoe',
                    jobTitle: 'Senior Software Engineer'
                },
                summary: 'Experienced software engineer with 8+ years in full-stack development...',
                experience: [
                    {
                        position: 'Senior Software Engineer',
                        company: 'Tech Corp Inc',
                        location: 'San Francisco, CA',
                        startDate: '2020-01-01',
                        endDate: null,
                        current: true,
                        description: 'Led development of cloud-native applications...'
                    }
                ],
                education: [
                    {
                        degree: 'Master of Science in Computer Science',
                        institution: 'Stanford University',
                        location: 'Stanford, CA',
                        startDate: '2014-09-01',
                        endDate: '2016-06-01',
                        current: false,
                        field: 'Computer Science',
                        gpa: '3.8'
                    }
                ],
                skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']
            };

            setParsedData(mockParsedData);
            toast.success('Resume parsed successfully!');
        } catch (error) {
            console.error('Parse error:', error);
            toast.error('Failed to parse resume. Please try again.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleUseParsedData = async () => {
        if (!parsedData) return;

        try {
            // Create resume with parsed data
            const token = localStorage.getItem('token');
            const response = await fetch('/api/resumes', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'Imported Resume',
                    template: 'modern',
                    data: parsedData,
                    source: importType === 'file' ? 'file_upload' : 'linkedin'
                })
            });

            const result = await response.json();

            if (result.success && result.data?._id) {
                navigate(`/builder/${result.data._id}`);
                toast.success('Resume imported successfully!');
            } else {
                throw new Error(result.message || 'Failed to create resume');
            }
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Failed to save imported resume');
        }
    };

    const handleManualEntry = () => {
        navigate('/builder');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Import Your Resume
                    </h1>
                    <p className="text-xl text-gray-600">
                        Upload your existing resume or import from LinkedIn
                    </p>
                </motion.div>

                {/* Import Options */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {/* File Upload */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-6 rounded-2xl border-2 ${importType === 'file' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} transition-all duration-300`}
                        onClick={() => setImportType('file')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Upload File</h3>
                                    <p className="text-gray-600">PDF or Word Document</p>
                                </div>
                            </div>
                            {importType === 'file' && (
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        {importType === 'file' && (
                            <div className="mt-6">
                                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center bg-blue-25">
                                    {file ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-center gap-3">
                                                <FileText className="w-12 h-12 text-blue-600" />
                                                <div className="text-left">
                                                    <p className="font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setFile(null);
                                                    }}
                                                    className="p-1 hover:bg-gray-100 rounded"
                                                >
                                                    <X className="w-5 h-5 text-gray-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileUpload}
                                            />
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center mx-auto">
                                                    <Upload className="w-8 h-8 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-medium">Click to browse</p>
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        or drag and drop your file here
                                                    </p>
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    Supports: PDF, DOC, DOCX (Max 5MB)
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* LinkedIn Import */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-6 rounded-2xl border-2 ${importType === 'linkedin' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'} transition-all duration-300`}
                        onClick={() => setImportType('linkedin')}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                                    <Link className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">LinkedIn Import</h3>
                                    <p className="text-gray-600">Import from LinkedIn Profile</p>
                                </div>
                            </div>
                            {importType === 'linkedin' && (
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>

                        {importType === 'linkedin' && (
                            <div className="mt-6">
                                <div className="space-y-4">
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/your-profile"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                    />
                                    <p className="text-sm text-gray-500">
                                        Enter your public LinkedIn profile URL
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Parse Button */}
                {(file || (importType === 'linkedin' && linkedinUrl)) && !parsedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <button
                            onClick={handleParse}
                            disabled={isParsing}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-3 mx-auto"
                        >
                            {isParsing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Parsing Resume...</span>
                                </>
                            ) : (
                                <>
                                    <FileText className="w-5 h-5" />
                                    <span>Parse Resume</span>
                                </>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* Parsed Data Preview */}
                {parsedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Parsed Resume Preview</h3>
                                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                    Ready to Import
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Personal Info */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Personal Information</h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium">
                                                {parsedData.personalInfo.firstName} {parsedData.personalInfo.lastName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium">{parsedData.personalInfo.email}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Experience */}
                                {parsedData.experience && parsedData.experience.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Work Experience</h4>
                                        <p className="text-gray-700">
                                            {parsedData.experience.length} position(s) found
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                {parsedData.skills && parsedData.skills.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {parsedData.skills.slice(0, 5).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {parsedData.skills.length > 5 && (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                                                    +{parsedData.skills.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={handleManualEntry}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                    >
                        Create Manually Instead
                    </button>

                    {parsedData && (
                        <button
                            onClick={handleUseParsedData}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:opacity-90"
                        >
                            Use This Data & Continue
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ImportResume;