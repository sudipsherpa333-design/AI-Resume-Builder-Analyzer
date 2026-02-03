// ------------------- EntryScreen.jsx -------------------
// src/pages/builder/components/EntryScreen.jsx
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileUp, Linkedin, FileInput, Wand2, ListOrdered, LayoutGrid, Sparkles, Zap, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EntryScreen = ({ onSelectMode, onMagicBuild, isMagicBuilding, magicBuildProgress }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [linkedinUrl, setLinkedinUrl] = useState('');

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFile(files[0]);
        }
    }, []);

    const handleFileInput = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    }, []);

    const handleFile = useCallback((file) => {
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setUploadedFile(file);
        toast.success('PDF uploaded successfully!');
    }, []);

    const handleLinkedInImport = useCallback(() => {
        if (!linkedinUrl.trim()) {
            toast.error('Please enter a LinkedIn URL');
            return;
        }

        if (!linkedinUrl.includes('linkedin.com/in/')) {
            toast.error('Please enter a valid LinkedIn profile URL');
            return;
        }

        onMagicBuild(linkedinUrl, 'linkedin');
    }, [linkedinUrl, onMagicBuild]);

    const handleMagicBuildStart = useCallback(() => {
        if (uploadedFile) {
            onMagicBuild(uploadedFile, 'pdf');
        } else {
            toast.error('Please upload a file first');
        }
    }, [uploadedFile, onMagicBuild]);

    const modeCards = [
        {
            id: 'magic',
            title: 'Magic Build',
            description: 'Upload your existing resume and let AI create a perfect draft in seconds',
            icon: Wand2,
            color: 'from-purple-500 to-pink-500',
            features: ['PDF/LinkedIn import', 'AI extraction', 'Smart formatting'],
            action: uploadedFile ? 'Start Magic Build' : 'Upload Resume',
            disabled: isMagicBuilding,
            progress: magicBuildProgress
        },
        {
            id: 'guided',
            title: 'Guided Wizard',
            description: 'Step-by-step builder with AI suggestions at every stage',
            icon: ListOrdered,
            color: 'from-blue-500 to-cyan-500',
            features: ['AI suggestions', 'ATS optimization', 'Live preview'],
            action: 'Start Building',
            recommended: true
        },
        {
            id: 'freeform',
            title: 'Freeform Builder',
            description: 'Drag & drop interface with complete creative control',
            icon: LayoutGrid,
            color: 'from-emerald-500 to-teal-500',
            features: ['Drag & drop', 'Custom layouts', 'Advanced editing'],
            action: 'Start Creating'
        }
    ];

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <div className="text-center py-12 px-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                >
                    Build Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">2026 Resume</span>
                </motion.h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Choose how you want to create your AI-optimized resume
                </p>
            </div>

            {/* Magic Build Upload Section */}
            <div className="max-w-4xl mx-auto px-4 mb-12">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">Magic Build</h3>
                            <p className="text-gray-600">Upload your existing resume and let AI work its magic</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* PDF Upload */}
                        <div>
                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="mb-4">
                                    <FileUp className="w-12 h-12 text-purple-500 mx-auto" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Upload PDF Resume</h4>
                                <p className="text-gray-600 text-sm mb-4">Drag & drop your PDF file here</p>
                                <input
                                    type="file"
                                    id="pdf-upload"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFileInput}
                                />
                                <label
                                    htmlFor="pdf-upload"
                                    className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer"
                                >
                                    Choose File
                                </label>
                                {uploadedFile && (
                                    <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        <span className="text-sm text-green-700">{uploadedFile.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* LinkedIn Import */}
                        <div>
                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 transition-all">
                                <div className="mb-4">
                                    <Linkedin className="w-12 h-12 text-blue-500 mx-auto" />
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-2">Import from LinkedIn</h4>
                                <p className="text-gray-600 text-sm mb-4">Enter your LinkedIn profile URL</p>
                                <div className="space-y-3">
                                    <input
                                        type="url"
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        placeholder="https://linkedin.com/in/your-profile"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        onClick={handleLinkedInImport}
                                        disabled={isMagicBuilding}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isMagicBuilding ? 'Importing...' : 'Import Profile'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isMagicBuilding && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">AI Processing...</span>
                                <span className="text-sm font-medium text-purple-600">{magicBuildProgress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${magicBuildProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                Extracting content, analyzing structure, optimizing for ATS...
                            </p>
                        </div>
                    )}

                    <div className="text-center">
                        <button
                            onClick={handleMagicBuildStart}
                            disabled={!uploadedFile || isMagicBuilding}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                            {isMagicBuilding ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    AI Building Your Resume...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5" />
                                    Start Magic Build (15-25s)
                                </>
                            )}
                        </button>
                        <p className="text-sm text-gray-500 mt-2">
                            AI will analyze and create a complete draft from your upload
                        </p>
                    </div>
                </div>
            </div>

            {/* Mode Selection */}
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Or Choose Another Method</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {modeCards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-2xl shadow-lg border ${card.id === 'magic' && uploadedFile ? 'ring-2 ring-purple-500' : ''} hover:shadow-xl transition-shadow`}
                        >
                            {card.recommended && (
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                        RECOMMENDED
                                    </span>
                                </div>
                            )}

                            <div className="p-6">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center mb-4`}>
                                    <card.icon className="w-6 h-6 text-white" />
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                                <p className="text-gray-600 mb-4">{card.description}</p>

                                <ul className="space-y-2 mb-6">
                                    {card.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-green-500 mr-2" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {card.id === 'magic' && card.progress > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">Progress</span>
                                            <span className="text-sm font-medium text-purple-600">{card.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                                style={{ width: `${card.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => card.id === 'magic' && uploadedFile ? handleMagicBuildStart() : onSelectMode(card.id)}
                                    disabled={card.disabled}
                                    className={`w-full py-3 rounded-xl font-medium transition-all ${card.id === 'guided' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'} disabled:opacity-50`}
                                >
                                    {card.action}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">95%</div>
                        <div className="text-sm text-gray-600">ATS Success Rate</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">2.3x</div>
                        <div className="text-sm text-gray-600">More Interviews</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-600">30s</div>
                        <div className="text-sm text-gray-600">Average Build Time</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">50k+</div>
                        <div className="text-sm text-gray-600">Resumes Created</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntryScreen;