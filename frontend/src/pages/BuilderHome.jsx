// src/pages/BuilderHome.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaPlus,
    FaUpload,
    FaFilePdf,
    FaFileWord,
    FaFileAlt,
    FaLink,
    FaCloudUploadAlt,
    FaArrowRight,
    FaRocket,
    FaSync,
    FaMagic,
    FaChevronRight,
    FaTimes,
    FaCheck,
    FaSpinner,
    FaRobot,
    FaDatabase
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:5001/api';

const BuilderHome = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const fileInputRef = useRef(null);
    const urlInputRef = useRef(null);

    const [uploadMethod, setUploadMethod] = useState('browse'); // 'browse' or 'url'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [url, setUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [processingText, setProcessingText] = useState('');

    const handleNewResume = () => {
        navigate('/builder');
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'text/html'
            ];
            const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
        });

        if (validFiles.length === 0) {
            toast.error('Please select valid files (PDF, DOC, DOCX, TXT, RTF)');
            return;
        }

        // Limit to 5 files
        if (selectedFiles.length + validFiles.length > 5) {
            toast.error('Maximum 5 files allowed');
            return;
        }

        setSelectedFiles(prev => [...prev, ...validFiles]);
        toast.success(`${validFiles.length} file(s) selected`);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const validFiles = files.filter(file => {
            const validTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'text/html'
            ];
            const validExtensions = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

            return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
        });

        if (validFiles.length > 0) {
            // Limit to 5 files
            if (selectedFiles.length + validFiles.length > 5) {
                toast.error('Maximum 5 files allowed');
                return;
            }

            setSelectedFiles(prev => [...prev, ...validFiles]);
            toast.success(`${validFiles.length} file(s) dropped successfully`);
        } else {
            toast.error('Please drop valid files (PDF, DOC, DOCX, TXT, RTF)');
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        toast.success('File removed');
    };

    const handleUrlUpload = async () => {
        if (!url.trim()) {
            toast.error('Please enter a valid URL');
            return;
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            toast.error('Please enter a valid URL (include http:// or https://)');
            return;
        }

        setUploading(true);
        setProcessingText('Processing URL...');

        try {
            const response = await fetch(`${API_BASE_URL}/upload/url`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                toast.success('URL processed successfully!');
                navigate('/builder', {
                    state: {
                        source: 'url',
                        url: url,
                        data: result.data,
                        processed: true
                    }
                });
            } else {
                throw new Error(result.message || 'Failed to process URL');
            }
        } catch (err) {
            console.error('Error processing URL:', err);
            toast.error(err.message || 'Failed to process URL');

            // Fallback: Navigate to builder with URL info
            setTimeout(() => {
                navigate('/builder', {
                    state: {
                        source: 'url',
                        url: url,
                        processed: true
                    }
                });
            }, 1000);
        } finally {
            setUploading(false);
            setProcessingText('');
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        setUploading(true);
        setProcessingText('Uploading and processing files...');

        // For single file upload
        if (selectedFiles.length === 1) {
            const file = selectedFiles[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch(`${API_BASE_URL}/upload/file`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    toast.success('File processed successfully!');
                    navigate('/builder', {
                        state: {
                            source: 'file',
                            fileName: file.name,
                            data: result.data,
                            processed: true
                        }
                    });
                } else {
                    throw new Error(result.message || 'Failed to process file');
                }
            } catch (err) {
                console.error('Error uploading file:', err);
                toast.error(err.message || 'Failed to upload file');

                // Fallback: Navigate to builder with file info
                setTimeout(() => {
                    navigate('/builder', {
                        state: {
                            source: 'files',
                            files: selectedFiles,
                            processed: true
                        }
                    });
                }, 1000);
            } finally {
                setUploading(false);
                setProcessingText('');
            }
        } else {
            // For multiple files, show processing message and navigate
            toast.success('Processing multiple files...');
            setTimeout(() => {
                setUploading(false);
                setProcessingText('');
                navigate('/builder', {
                    state: {
                        source: 'files',
                        files: selectedFiles,
                        processed: true
                    }
                });
            }, 2000);
        }
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return <FaFilePdf className="text-red-500 text-xl" />;
            case 'doc':
            case 'docx': return <FaFileWord className="text-blue-500 text-xl" />;
            case 'txt':
            case 'rtf': return <FaFileAlt className="text-gray-500 text-xl" />;
            default: return <FaFileAlt className="text-gray-500 text-xl" />;
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Uploading overlay
    if (uploading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="relative mb-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto"
                        />
                        <FaRobot className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        AI Processing
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {processingText || 'Analyzing your content...'}
                    </p>
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <FaDatabase className="text-indigo-400" />
                            <span>Extracting content...</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <FaMagic className="text-purple-400" />
                            <span>Analyzing structure...</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                            <FaRocket className="text-green-400" />
                            <span>Preparing builder...</span>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2 }}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                            This may take a few moments...
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
            </div>

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                Resume Builder
                            </h1>
                            <p className="text-gray-600">Create your professional resume with AI assistance</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-medium flex items-center gap-2"
                        >
                            <FaArrowRight className="rotate-180" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-block p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-6">
                            <FaRobot className="text-white text-3xl" />
                        </div>
                        <h2 className="text-5xl font-bold text-gray-900 mb-4">
                            Start Your Resume Journey
                        </h2>
                        <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                            Choose how you'd like to begin. Our AI will help you create the perfect resume.
                        </p>
                    </motion.div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                        {/* New Resume Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-3xl shadow-2xl border-2 border-blue-100 overflow-hidden hover:shadow-3xl transition-all duration-300 group cursor-pointer"
                            onClick={handleNewResume}
                        >
                            <div className="p-10">
                                <div className="relative mb-8">
                                    <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl inline-block group-hover:scale-110 transition-transform duration-300">
                                        <FaPlus className="text-white text-4xl" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        RECOMMENDED
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    Start from Scratch
                                </h3>
                                <p className="text-gray-600 text-lg mb-8">
                                    Build a new resume with our intelligent templates and AI guidance
                                </p>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center text-base text-gray-700">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                            <FaCheck className="text-green-600" />
                                        </div>
                                        <span>AI-powered content suggestions</span>
                                    </div>
                                    <div className="flex items-center text-base text-gray-700">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                            <FaCheck className="text-green-600" />
                                        </div>
                                        <span>Professional ATS-optimized templates</span>
                                    </div>
                                    <div className="flex items-center text-base text-gray-700">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                            <FaCheck className="text-green-600" />
                                        </div>
                                        <span>Real-time preview and editing</span>
                                    </div>
                                    <div className="flex items-center text-base text-gray-700">
                                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                                            <FaCheck className="text-green-600" />
                                        </div>
                                        <span>Auto-save to cloud database</span>
                                    </div>
                                </div>
                                <div className="pt-8 border-t">
                                    <button className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-3 text-lg font-semibold group-hover:gap-4 duration-300">
                                        <span>Create New Resume</span>
                                        <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Upload Resume Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-100 overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="p-5 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl inline-block mb-8">
                                    <FaUpload className="text-white text-4xl" />
                                </div>
                                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                                    Upload & Enhance
                                </h3>
                                <p className="text-gray-600 text-lg mb-8">
                                    Upload your existing resume and let AI transform it into perfection
                                </p>

                                {/* Upload Method Tabs */}
                                <div className="flex border-b mb-8">
                                    <button
                                        className={`flex-1 py-4 text-center font-semibold text-lg ${uploadMethod === 'browse' ? 'text-emerald-600 border-b-4 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
                                        onClick={() => setUploadMethod('browse')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <FaCloudUploadAlt />
                                            Browse Files
                                        </div>
                                    </button>
                                    <button
                                        className={`flex-1 py-4 text-center font-semibold text-lg ${uploadMethod === 'url' ? 'text-emerald-600 border-b-4 border-emerald-600' : 'text-gray-500 hover:text-emerald-500'}`}
                                        onClick={() => setUploadMethod('url')}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <FaLink />
                                            Enter URL
                                        </div>
                                    </button>
                                </div>

                                {/* Browse Files Section */}
                                {uploadMethod === 'browse' && (
                                    <div>
                                        <div
                                            className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'}`}
                                            onClick={handleFileSelect}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}
                                        >
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                multiple
                                                accept=".pdf,.doc,.docx,.txt,.rtf"
                                            />
                                            <FaCloudUploadAlt className={`text-5xl mx-auto mb-6 ${isDragging ? 'text-emerald-500' : 'text-gray-400'}`} />
                                            <h4 className="text-xl font-bold text-gray-900 mb-3">
                                                {isDragging ? 'Drop files here!' : 'Drag & drop files here'}
                                            </h4>
                                            <p className="text-gray-600 mb-6 text-lg">
                                                or click to browse files from your computer
                                            </p>
                                            <div className="flex flex-wrap justify-center gap-3 mb-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    PDF
                                                </span>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    DOC
                                                </span>
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    DOCX
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                    TXT
                                                </span>
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                                    RTF
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Maximum 5 files, 10MB each
                                            </p>
                                        </div>

                                        {/* Selected Files */}
                                        {selectedFiles.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-8"
                                            >
                                                <h4 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
                                                    <span>Selected Files ({selectedFiles.length})</span>
                                                    <button
                                                        onClick={() => setSelectedFiles([])}
                                                        className="text-sm text-red-500 hover:text-red-700"
                                                    >
                                                        Clear All
                                                    </button>
                                                </h4>
                                                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                                    {selectedFiles.map((file, index) => (
                                                        <motion.div
                                                            key={index}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: index * 0.1 }}
                                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-white rounded-lg">
                                                                    {getFileIcon(file.name)}
                                                                </div>
                                                                <div className="text-left">
                                                                    <p className="font-semibold text-gray-900 truncate max-w-xs">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeFile(index);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                            >
                                                                <FaTimes className="text-lg" />
                                                            </button>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}

                                {/* URL Section */}
                                {uploadMethod === 'url' && (
                                    <div>
                                        <div className="mb-6">
                                            <label className="block text-lg font-semibold text-gray-700 mb-3">
                                                Enter your resume URL
                                            </label>
                                            <div className="flex gap-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="url"
                                                        ref={urlInputRef}
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        placeholder="https://example.com/your-resume.pdf"
                                                        className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-3 focus:ring-emerald-500 focus:border-transparent text-lg"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleUrlUpload}
                                                    disabled={!url.trim()}
                                                    className="px-8 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                                                >
                                                    Fetch
                                                </button>
                                            </div>
                                            <p className="text-gray-500 mt-3">
                                                Enter URL of your resume (PDF, DOC, DOCX formats supported)
                                            </p>
                                            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                                                <p className="text-sm text-gray-600">
                                                    <strong>Tip:</strong> Make sure the URL is publicly accessible.
                                                    Our AI will download and analyze the resume content.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-8 border-t">
                                    <button
                                        onClick={uploadMethod === 'browse' ? handleUpload : handleUrlUpload}
                                        disabled={(uploadMethod === 'browse' && selectedFiles.length === 0) ||
                                            (uploadMethod === 'url' && !url.trim())}
                                        className="w-full px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 text-lg font-semibold"
                                    >
                                        {uploadMethod === 'browse' ? (
                                            <>
                                                <FaMagic />
                                                Enhance {selectedFiles.length > 0 ? `(${selectedFiles.length} files)` : ''} with AI
                                                <FaChevronRight />
                                            </>
                                        ) : (
                                            <>
                                                <FaRobot />
                                                Process URL with AI
                                                <FaChevronRight />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-center text-gray-500 mt-3 text-sm">
                                        Your data is processed securely and saved to your cloud account
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Features Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-10 text-white shadow-2xl"
                    >
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-bold mb-4">Why Choose Our AI Resume Builder?</h3>
                            <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                                Experience the future of resume creation with our advanced AI technology
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
                            >
                                <div className="p-4 bg-white/20 rounded-full inline-block mb-6">
                                    <FaRocket className="text-3xl" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">Smart AI Analysis</h4>
                                <p className="text-indigo-100">
                                    Our AI analyzes your content and suggests improvements for better ATS compatibility
                                </p>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
                            >
                                <div className="p-4 bg-white/20 rounded-full inline-block mb-6">
                                    <FaSync className="text-3xl" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">Any Format Support</h4>
                                <p className="text-indigo-100">
                                    Convert PDF, Word, or any text format into a professional resume effortlessly
                                </p>
                            </motion.div>
                            <motion.div
                                whileHover={{ y: -5 }}
                                className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm"
                            >
                                <div className="p-4 bg-white/20 rounded-full inline-block mb-6">
                                    <FaDatabase className="text-3xl" />
                                </div>
                                <h4 className="text-xl font-bold mb-3">Cloud Storage</h4>
                                <p className="text-indigo-100">
                                    All your resumes are securely stored in the cloud and accessible from anywhere
                                </p>
                            </motion.div>
                        </div>
                        <div className="text-center mt-10 pt-8 border-t border-white/20">
                            <p className="text-indigo-100">
                                <strong>100,000+</strong> resumes created • <strong>95%</strong> ATS compatibility rate
                            </p>
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-16 text-center"
                    >
                        <div className="inline-flex items-center gap-8 text-gray-600">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-600">10+</div>
                                <div className="text-sm">Professional Templates</div>
                            </div>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600">24/7</div>
                                <div className="text-sm">AI Assistance</div>
                            </div>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-600">∞</div>
                                <div className="text-sm">Revisions</div>
                            </div>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-pink-600">100%</div>
                                <div className="text-sm">Privacy Guaranteed</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <p className="text-gray-600">
                                © {new Date().getFullYear()} AI Resume Builder. All rights reserved.
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <button className="text-gray-600 hover:text-indigo-600 transition">
                                Privacy Policy
                            </button>
                            <button className="text-gray-600 hover:text-indigo-600 transition">
                                Terms of Service
                            </button>
                            <button className="text-gray-600 hover:text-indigo-600 transition">
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BuilderHome;