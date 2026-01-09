// src/pages/BuilderHome.jsx - FIXED & WORKING VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FilePlus,
    Upload,
    FileText,
    Sparkles,
    ArrowRight,
    Shield,
    Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useResume } from '../context/ResumeContext';

const BuilderHome = () => {
    const navigate = useNavigate();
    const { createNewResume } = useResume(); // ← Use context!

    const handleCreateNew = async () => {
        try {
            const newResume = await createNewResume();
            if (newResume && newResume._id) {
                navigate(`/builder/${newResume._id}`);
            } else {
                toast.error('Failed to create resume');
            }
        } catch (error) {
            console.error('Create error:', error);
            toast.error('Failed to create new resume');
        }
    };

    const handleImport = () => {
        navigate('/builder/import');
    };

    const handleUseTemplate = () => {
        navigate('/templates'); // or wherever your templates page is
    };

    const options = [
        {
            id: 'create',
            title: 'Create New Resume',
            description: 'Start from scratch with a clean, professional template',
            icon: FilePlus,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50',
            action: handleCreateNew,
            features: ['Full control', 'Professional templates', 'Step-by-step guidance']
        },
        {
            id: 'import',
            title: 'Import Resume',
            description: 'Upload your existing resume (PDF, DOCX) or import from LinkedIn',
            icon: Upload,
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-50',
            action: handleImport,
            features: ['PDF/DOCX upload', 'LinkedIn import', 'Smart parsing']
        },
        {
            id: 'template',
            title: 'Use Template',
            description: 'Choose from professionally designed resume templates',
            icon: FileText,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-50',
            action: handleUseTemplate,
            features: ['20+ templates', 'Industry-specific', 'ATS-optimized']
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-6">
                                <Sparkles className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">
                                    AI-Powered Resume Builder
                                </span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                                Build Your Perfect
                                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Resume in Minutes
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
                                Choose your starting point. Create from scratch, import your existing resume,
                                or start with a professionally designed template.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Options Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid md:grid-cols-3 gap-8">
                    {options.map((option, index) => (
                        <motion.div
                            key={option.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="relative group"
                        >
                            <div className={`${option.bgColor} rounded-2xl p-8 h-full border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl`}>
                                <div className="mb-6">
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                                        <option.icon className="w-7 h-7 text-white" />
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        {option.title}
                                    </h3>

                                    <p className="text-gray-600 mb-6">
                                        {option.description}
                                    </p>

                                    <ul className="space-y-2 mb-8">
                                        {option.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-gray-700">
                                                <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={option.action}
                                    className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${option.color} text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity group-hover:shadow-lg`}
                                >
                                    <span>Get Started</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-16 pt-12 border-t border-gray-200">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Secure & Private</h4>
                            <p className="text-gray-600 text-sm">
                                Your data is encrypted and never shared with third parties
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 mb-4">
                                <Zap className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
                            <p className="text-gray-600 text-sm">
                                Smart suggestions and real-time ATS optimization
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-4">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Professional Results</h4>
                            <p className="text-gray-600 text-sm">
                                Industry-approved formats that get you noticed
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuilderHome;