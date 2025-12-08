import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaArrowLeft,
    FaPalette,
    FaFileAlt,
    FaRocket,
    FaBriefcase,
    FaPaintBrush,
    FaUser,
    FaCheck,
    FaEye,
    FaDownload,
    FaSave,
    FaMagic,
    FaLightbulb,
    FaStar,
    FaClock,
    FaCrown,
    FaShieldAlt,
    FaMobileAlt,
    FaDesktop
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

const BuilderHome = () => {
    const { user } = useAuth();
    const { createResume, loading: resumeLoading } = useResume();
    const navigate = useNavigate();
    const { id } = useParams(); // For editing existing resumes

    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [resumeTitle, setResumeTitle] = useState('');
    const [useAI, setUseAI] = useState(false);

    const templates = [
        {
            id: 'modern',
            name: 'Modern',
            icon: <FaRocket />,
            color: 'from-blue-500 to-cyan-500',
            description: 'Clean, contemporary design perfect for tech and creative industries',
            category: 'Popular',
            features: ['ATS Friendly', 'Modern Layout', 'Color Customizable'],
            preview: 'bg-gradient-to-br from-blue-400 to-cyan-300',
            stats: { rating: 4.8, users: '12k+' }
        },
        {
            id: 'professional',
            name: 'Professional',
            icon: <FaBriefcase />,
            color: 'from-indigo-500 to-purple-500',
            description: 'Traditional format preferred by corporate recruiters',
            category: 'Corporate',
            features: ['Traditional', 'Corporate Ready', 'Formal Layout'],
            preview: 'bg-gradient-to-br from-indigo-400 to-purple-300',
            stats: { rating: 4.6, users: '8k+' }
        },
        {
            id: 'creative',
            name: 'Creative',
            icon: <FaPaintBrush />,
            color: 'from-pink-500 to-rose-500',
            description: 'For designers, artists, and creative professionals',
            category: 'Creative',
            features: ['Visual Focus', 'Portfolio Style', 'Unique Layout'],
            preview: 'bg-gradient-to-br from-pink-400 to-rose-300',
            stats: { rating: 4.7, users: '6k+' }
        },
        {
            id: 'classic',
            name: 'Classic',
            icon: <FaFileAlt />,
            color: 'from-emerald-500 to-teal-500',
            description: 'Timeless design that works for all industries',
            category: 'All-Purpose',
            features: ['Clean Layout', 'Easy to Read', 'Universal Appeal'],
            preview: 'bg-gradient-to-br from-emerald-400 to-teal-300',
            stats: { rating: 4.5, users: '10k+' }
        },
        {
            id: 'minimal',
            name: 'Minimal',
            icon: <FaUser />,
            color: 'from-gray-600 to-gray-800',
            description: 'Simple and clean for maximum readability',
            category: 'Minimalist',
            features: ['Ultra Clean', 'Focus on Content', 'Fast Loading'],
            preview: 'bg-gradient-to-br from-gray-400 to-gray-600',
            stats: { rating: 4.4, users: '5k+' }
        },
        {
            id: 'executive',
            name: 'Executive',
            icon: <FaCrown />,
            color: 'from-amber-500 to-orange-500',
            description: 'Premium template for senior-level professionals',
            category: 'Premium',
            features: ['Premium Design', 'Leadership Focus', 'Detailed Sections'],
            preview: 'bg-gradient-to-br from-amber-400 to-orange-300',
            stats: { rating: 4.9, users: '3k+' }
        }
    ];

    const aiFeatures = [
        'Auto-generate professional summaries',
        'Optimize keywords for ATS systems',
        'Suggest action verbs and achievements',
        'Format validation and suggestions',
        'Industry-specific recommendations'
    ];

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        if (!resumeTitle) {
            setResumeTitle(`${user?.name || user?.firstName || 'My'} ${template.name} Resume`);
        }
    };

    const handleStartBuilding = async () => {
        if (!selectedTemplate) {
            toast.error('Please select a template to continue');
            return;
        }

        if (!resumeTitle.trim()) {
            toast.error('Please enter a resume title');
            return;
        }

        try {
            // Create a new resume with the selected template
            const newResume = await createResume({
                title: resumeTitle,
                template: selectedTemplate.id,
                useAI: useAI
            });

            toast.success('Resume created successfully!');

            // Navigate to the resume editor
            navigate(`/builder/${newResume.id}`);
        } catch (error) {
            console.error('Error creating resume:', error);
            toast.error(error.message || 'Failed to create resume');
        }
    };

    const handleBack = () => {
        navigate('/dashboard');
    };

    // If editing an existing resume, load it
    useEffect(() => {
        if (id) {
            // You would fetch the existing resume here
            // For now, we'll just show the builder
            setStep(2);
        }
    }, [id]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FaArrowLeft className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {id ? 'Edit Resume' : 'Build New Resume'}
                                </h1>
                                <p className="text-gray-600">
                                    {step === 1 ? 'Choose a template' : step === 2 ? 'Customize your resume' : 'Preview & Download'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                                <FaUser className="text-blue-500" />
                                <span>{user?.name || user?.email || 'User'}</span>
                            </div>
                            <Link
                                to="/dashboard"
                                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Progress Steps */}
                <div className="max-w-4xl mx-auto mb-12">
                    <div className="flex justify-between items-center relative">
                        {/* Progress line */}
                        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
                        <div
                            className="absolute top-4 left-0 h-1 bg-blue-600 -z-10 transition-all duration-500"
                            style={{ width: step === 1 ? '25%' : step === 2 ? '75%' : '100%' }}
                        ></div>

                        {/* Steps */}
                        {[
                            { number: 1, label: 'Template', icon: <FaPalette /> },
                            { number: 2, label: 'Content', icon: <FaFileAlt /> },
                            { number: 3, label: 'Design', icon: <FaPaintBrush /> },
                            { number: 4, label: 'Download', icon: <FaDownload /> }
                        ].map((stepItem) => (
                            <div key={stepItem.number} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= stepItem.number
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border-2 border-gray-300 text-gray-400'
                                    }`}>
                                    {step >= stepItem.number ? stepItem.number : stepItem.icon}
                                </div>
                                <span className={`mt-2 text-sm font-medium ${step >= stepItem.number ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                    {stepItem.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto">
                    {/* Step 1: Template Selection */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg border p-8"
                        >
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                                    Choose Your Template
                                </h2>
                                <p className="text-gray-600 max-w-2xl mx-auto">
                                    Select a professionally designed template. You can always change the design later.
                                </p>
                            </div>

                            {/* AI Assistant Toggle */}
                            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-100 rounded-full">
                                            <FaMagic className="text-blue-600 text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                                            <p className="text-sm text-gray-600">
                                                Get AI-powered suggestions for your resume content
                                            </p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={useAI}
                                            onChange={(e) => setUseAI(e.target.value)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                            {useAI ? 'AI Enabled' : 'Enable AI'}
                                        </span>
                                    </label>
                                </div>

                                {useAI && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-6 pt-6 border-t border-blue-200"
                                    >
                                        <h4 className="font-medium text-gray-900 mb-3">AI Features Included:</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {aiFeatures.map((feature, index) => (
                                                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                    <FaCheck className="text-green-500 text-xs" />
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Template Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {templates.map((template) => (
                                    <motion.div
                                        key={template.id}
                                        whileHover={{ y: -5 }}
                                        className={`bg-white rounded-xl border-2 ${selectedTemplate?.id === template.id
                                            ? 'border-blue-500 ring-2 ring-blue-100'
                                            : 'border-gray-200 hover:border-blue-300'
                                            } overflow-hidden cursor-pointer transition-all`}
                                        onClick={() => handleTemplateSelect(template)}
                                    >
                                        {/* Template Preview */}
                                        <div className="relative h-40">
                                            <div className={`${template.preview} h-full`}>
                                                {/* Mock resume content */}
                                                <div className="absolute inset-0 p-4">
                                                    <div className="bg-white/90 rounded-lg p-3 h-full">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                                                            <div className="flex-1">
                                                                <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                                                                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="h-2 bg-gray-300 rounded"></div>
                                                            <div className="h-2 bg-gray-300 rounded"></div>
                                                            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedTemplate?.id === template.id && (
                                                <div className="absolute top-3 right-3">
                                                    <div className="bg-blue-600 text-white p-1 rounded-full">
                                                        <FaCheck className="text-xs" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Template Info */}
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`p-2 rounded-lg ${template.color.split(' ')[0].replace('from-', 'bg-')}`}>
                                                        {template.icon}
                                                    </span>
                                                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${template.category === 'Premium'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {template.category}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <FaStar className="text-yellow-500" />
                                                    <span className="font-medium">{template.stats.rating}</span>
                                                    <span className="text-gray-500">({template.stats.users})</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-500">
                                                    <FaDesktop />
                                                    <FaMobileAlt />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Resume Title Input */}
                            <div className="max-w-md mx-auto mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Resume Title
                                </label>
                                <input
                                    type="text"
                                    value={resumeTitle}
                                    onChange={(e) => setResumeTitle(e.target.value)}
                                    placeholder="e.g., Software Engineer Resume 2024"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={handleStartBuilding}
                                    disabled={!selectedTemplate || resumeLoading}
                                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition font-semibold flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resumeLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Start Building
                                            <FaArrowRight />
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={handleBack}
                                    className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Quick Tips */}
                            <div className="mt-8 pt-8 border-t">
                                <div className="flex items-center gap-3 mb-4">
                                    <FaLightbulb className="text-yellow-500 text-xl" />
                                    <h4 className="font-semibold text-gray-900">Quick Tips</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-2">Modern Template</h5>
                                        <p className="text-sm text-gray-600">
                                            Best for tech roles and creative positions. Features clean layout with modern design elements.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-2">Professional Template</h5>
                                        <p className="text-sm text-gray-600">
                                            Preferred by corporate recruiters. Traditional format with formal structure.
                                        </p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <h5 className="font-medium text-gray-900 mb-2">AI Assistant</h5>
                                        <p className="text-sm text-gray-600">
                                            Enable AI to get content suggestions, ATS optimization, and formatting help.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 py-8 border-t bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Need Help?</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li>
                                    <Link to="/help/templates" className="hover:text-blue-600 transition">
                                        Template Guide
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/help/ai" className="hover:text-blue-600 transition">
                                        Using AI Assistant
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/help/examples" className="hover:text-blue-600 transition">
                                        Resume Examples
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <FaShieldAlt className="text-green-500" />
                                    <span>ATS Friendly</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaMobileAlt className="text-blue-500" />
                                    <span>Mobile Responsive</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <FaDownload className="text-purple-500" />
                                    <span>Multiple Formats</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                            <p className="text-sm text-gray-600 mb-3">
                                Having trouble? Contact our support team for assistance.
                            </p>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                                Contact Support
                                <FaArrowRight className="text-xs" />
                            </Link>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} AI Resume Builder. All templates are professionally designed and ATS optimized.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default BuilderHome;