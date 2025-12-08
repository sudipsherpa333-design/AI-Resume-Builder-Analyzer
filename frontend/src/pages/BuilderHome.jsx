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
    FaCheck
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const BuilderHome = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const urlInputRef = useRef(null);

    const [uploadMethod, setUploadMethod] = useState('browse'); // 'browse' or 'url'
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [url, setUrl] = useState('');
    const [uploading, setUploading] = useState(false);

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
            setSelectedFiles(prev => [...prev, ...validFiles]);
            toast.success(`${validFiles.length} file(s) dropped successfully`);
        } else {
            toast.error('Please drop valid files (PDF, DOC, DOCX, TXT, RTF)');
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUrlUpload = () => {
        if (!url.trim()) {
            toast.error('Please enter a valid URL');
            return;
        }

        // Validate URL
        const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        if (!urlPattern.test(url)) {
            toast.error('Please enter a valid URL');
            return;
        }

        setUploading(true);
        toast.success('Processing URL...');

        // Simulate upload/processing
        setTimeout(() => {
            setUploading(false);
            navigate('/builder', {
                state: {
                    source: 'url',
                    url: url,
                    processed: true
                }
            });
        }, 1500);
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select files to upload');
            return;
        }

        setUploading(true);
        toast.success('Processing files...');

        // Simulate upload/processing
        setTimeout(() => {
            setUploading(false);
            navigate('/builder', {
                state: {
                    source: 'files',
                    files: selectedFiles,
                    processed: true
                }
            });
        }, 2000);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
                            <p className="text-gray-600">Create your professional resume</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            How would you like to create your resume?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Choose your starting point below
                        </p>
                    </motion.div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        {/* New Resume Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] group cursor-pointer"
                            onClick={handleNewResume}
                        >
                            <div className="p-8">
                                <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <FaPlus className="text-white text-3xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Start Fresh
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Build a new resume from scratch with our smart templates
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaCheck className="text-green-500 mr-2" />
                                        <span>AI-powered suggestions</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaCheck className="text-green-500 mr-2" />
                                        <span>Professional templates</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <FaCheck className="text-green-500 mr-2" />
                                        <span>Real-time preview</span>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t">
                                    <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 group-hover:gap-3 duration-300">
                                        <span>Create New Resume</span>
                                        <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Upload Resume Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl border-2 border-green-100 overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl inline-block mb-6">
                                    <FaUpload className="text-white text-3xl" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                    Upload & Enhance
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Upload your existing resume and let AI enhance it
                                </p>

                                {/* Upload Method Tabs */}
                                <div className="flex border-b mb-6">
                                    <button
                                        className={`flex-1 py-3 text-center font-medium ${uploadMethod === 'browse' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                                        onClick={() => setUploadMethod('browse')}
                                    >
                                        Browse Files
                                    </button>
                                    <button
                                        className={`flex-1 py-3 text-center font-medium ${uploadMethod === 'url' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                                        onClick={() => setUploadMethod('url')}
                                    >
                                        Enter URL
                                    </button>
                                </div>

                                {/* Browse Files Section */}
                                {uploadMethod === 'browse' && (
                                    <div>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-green-50'}`}
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
                                            <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-4" />
                                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                {isDragging ? 'Drop files here' : 'Drag & drop files here'}
                                            </h4>
                                            <p className="text-gray-600 mb-4">
                                                or click to browse files
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Supports: PDF, DOC, DOCX, TXT, RTF
                                            </p>
                                        </div>

                                        {/* Selected Files */}
                                        {selectedFiles.length > 0 && (
                                            <div className="mt-6">
                                                <h4 className="font-semibold text-gray-900 mb-3">
                                                    Selected Files ({selectedFiles.length})
                                                </h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {selectedFiles.map((file, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                {getFileIcon(file.name)}
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-sm text-gray-500">
                                                                        {(file.size / 1024).toFixed(2)} KB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeFile(index);
                                                                }}
                                                                className="p-1 text-gray-400 hover:text-red-500"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* URL Section */}
                                {uploadMethod === 'url' && (
                                    <div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Enter resume URL
                                            </label>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <input
                                                        type="url"
                                                        ref={urlInputRef}
                                                        value={url}
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        placeholder="https://example.com/your-resume.pdf"
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleUrlUpload}
                                                    disabled={!url.trim() || uploading}
                                                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {uploading ? 'Processing...' : 'Fetch'}
                                                </button>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Enter URL of your resume (PDF, DOC, DOCX formats supported)
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t">
                                    <button
                                        onClick={uploadMethod === 'browse' ? handleUpload : handleUrlUpload}
                                        disabled={(uploadMethod === 'browse' && selectedFiles.length === 0) ||
                                            (uploadMethod === 'url' && !url.trim()) ||
                                            uploading}
                                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                                    >
                                        <FaMagic />
                                        {uploading ? 'Processing...' : 'Enhance with AI'}
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Features Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="p-3 bg-white/20 rounded-full inline-block mb-4">
                                    <FaRocket className="text-2xl" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">AI-Powered</h4>
                                <p className="text-indigo-100">
                                    Smart suggestions and optimization using AI
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="p-3 bg-white/20 rounded-full inline-block mb-4">
                                    <FaSync className="text-2xl" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">Easy Conversion</h4>
                                <p className="text-indigo-100">
                                    Convert any format to professional resume
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="p-3 bg-white/20 rounded-full inline-block mb-4">
                                    <FaMagic className="text-2xl" />
                                </div>
                                <h4 className="text-xl font-bold mb-2">Instant Enhancement</h4>
                                <p className="text-indigo-100">
                                    Improve your existing resume instantly
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default BuilderHome;