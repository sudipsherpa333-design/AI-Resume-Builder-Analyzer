// src/pages/builder/BuilderHome.jsx - FIXED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useResumes } from '../../context/ResumeContext'; // ✅ FIXED: Changed from useResume to useResumes
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

const BuilderHome = () => {
    const navigate = useNavigate();
    const { createResume, loading: resumeLoading } = useResumes(); // ✅ FIXED: Changed to useResumes and 'loading' instead of 'isLoading'
    const { isAuthenticated, user } = useAuth();

    const [creating, setCreating] = useState(false);

    // Redirect if not authenticated
    if (!isAuthenticated && !resumeLoading) {
        navigate('/login', {
            state: { from: '/builder' },
            replace: true
        });
        return null;
    }

    const handleCreateNew = async () => {
        if (creating) return;

        setCreating(true);
        try {
            // ✅ Updated to match your ResumeContext structure
            const newResume = await createResume({
                title: `${user?.name?.split(' ')[0] || 'My'}'s Resume`,
                template: 'modern',
                status: 'draft',
                isPublic: false,
                personalInfo: {
                    fullName: user?.name || '',
                    email: user?.email || '',
                    phone: '',
                    location: '',
                    website: '',
                    linkedin: '',
                    github: '',
                    summary: ''
                },
                experience: [],
                education: [],
                skills: [],
                projects: [],
                certifications: [],
                languages: [],
                references: [],
                analysis: {
                    atsScore: 0,
                    completeness: 0,
                    suggestions: []
                },
                settings: {
                    template: 'modern',
                    color: '#3b82f6',
                    font: 'inter',
                    fontSize: 'medium'
                },
                tags: [],
                views: 0,
                downloads: 0
            });

            if (newResume && newResume._id) {
                toast.success('Resume created!', { icon: '🎉' });
                navigate(`/builder/edit/${newResume._id}`);
            } else {
                toast.error('Failed to create resume. Please try again.');
            }
        } catch (error) {
            console.error('Create error:', error);
            toast.error(`Failed to create new resume: ${error.message || 'Unknown error'}`);
        } finally {
            setCreating(false);
        }
    };

    const handleUpload = () => {
        navigate('/builder/upload');
    };

    // Loading state
    if (resumeLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
                <Navbar />
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-6"
                        />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h3>
                        <p className="text-gray-600">Please wait</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <Navbar />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Start Building Your Resume
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Choose how you want to begin. Create a new resume from scratch or upload your existing one.
                    </p>
                </div>

                {/* Buttons Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                    {/* Create New Resume */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ y: -5 }}
                        className="relative group"
                    >
                        <div className="bg-white rounded-2xl p-8 h-full border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                            <div className="mb-6">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-6 mx-auto">
                                    <FilePlus className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                    Create New Resume
                                </h3>

                                <p className="text-gray-600 text-center mb-8">
                                    Start fresh with a clean, professional template. Perfect for new resumes or complete redesigns.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {[
                                        'Professional templates',
                                        'Real-time editing',
                                        'Auto-save functionality',
                                        'ATS-optimized format'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleCreateNew}
                                disabled={creating}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium flex items-center justify-center gap-3 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FilePlus className="w-5 h-5" />
                                        <span>Start Creating</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>

                    {/* Upload Resume */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        whileHover={{ y: -5 }}
                        className="relative group"
                    >
                        <div className="bg-white rounded-2xl p-8 h-full border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                            <div className="mb-6">
                                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-6 mx-auto">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>

                                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                    Upload Resume
                                </h3>

                                <p className="text-gray-600 text-center mb-8">
                                    Upload your existing resume and let us convert it to an editable format. Keep your content, improve the format.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {[
                                        'PDF, DOCX, TXT support',
                                        'Smart content extraction',
                                        'Format conversion',
                                        'Quick editing'
                                    ].map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleUpload}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium flex items-center justify-center gap-3 hover:shadow-lg transition-all duration-300 group-hover:scale-[1.02] text-lg"
                            >
                                <Upload className="w-5 h-5" />
                                <span>Upload Resume</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Tips */}
                <div className="mt-12 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-sm font-medium text-blue-700">
                            Tip: Create new for complete control, upload to edit existing resumes
                        </span>
                    </div>

                    {/* Offline mode indicator */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-sm font-medium text-amber-700">
                            Your work is auto-saved locally. Syncs to cloud when online.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuilderHome;