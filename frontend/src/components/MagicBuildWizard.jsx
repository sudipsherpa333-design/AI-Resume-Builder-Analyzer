// ------------------- MagicBuildWizard.jsx -------------------
// src/pages/builder/components/MagicBuildWizard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle, FileText, Sparkles, Zap, Brain, Target, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const MagicBuildWizard = ({ extractedData, onComplete, onCancel }) => {
    const [step, setStep] = useState(0);
    const [processing, setProcessing] = useState(true);
    const [progress, setProgress] = useState(0);
    const [aiSuggestions, setAiSuggestions] = useState([]);

    const steps = [
        { id: 'extract', title: 'Extracting Content', description: 'Reading and parsing your resume' },
        { id: 'analyze', title: 'AI Analysis', description: 'Analyzing structure and content' },
        { id: 'enhance', title: 'AI Enhancement', description: 'Optimizing for ATS and impact' },
        { id: 'format', title: 'Formatting', description: 'Applying modern resume templates' },
        { id: 'review', title: 'Ready for Review', description: 'Your AI-optimized resume is ready' }
    ];

    useEffect(() => {
        const processResume = async () => {
            try {
                // Simulate processing steps
                const interval = setInterval(() => {
                    setProgress(prev => {
                        const newProgress = prev + 20;
                        if (newProgress >= 100) {
                            clearInterval(interval);
                            setProcessing(false);
                            setStep(4);
                            return 100;
                        }

                        // Move to next step every 20%
                        if (newProgress % 20 === 0) {
                            setStep(newProgress / 20);
                        }

                        return newProgress;
                    });
                }, 1000);

                // Simulate AI suggestions
                setTimeout(() => {
                    setAiSuggestions([
                        'Added quantifiable metrics to experience section',
                        'Optimized keywords for ATS systems',
                        'Enhanced professional summary with industry terms',
                        'Reformatted education section for better readability',
                        'Added missing skills from job market analysis'
                    ]);
                }, 3000);

                return () => clearInterval(interval);
            } catch (error) {
                toast.error('Failed to process resume');
                console.error(error);
            }
        };

        processResume();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Magic Build
                        </span> in Progress
                    </h1>
                    <p className="text-gray-600">AI is creating your perfect resume draft</p>
                </div>

                {/* Progress Visualization */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-medium text-purple-600">{progress}%</span>
                        </div>
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="relative">
                        {/* Connection Lines */}
                        <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 -z-10" />

                        <div className="grid grid-cols-5 gap-4">
                            {steps.map((s, index) => (
                                <div key={s.id} className="text-center">
                                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${index <= step ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`}>
                                        {index < step ? (
                                            <Check className="w-6 h-6 text-white" />
                                        ) : index === step ? (
                                            processing ? (
                                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                                            ) : (
                                                <Zap className="w-6 h-6 text-white" />
                                            )
                                        ) : (
                                            <div className="w-6 h-6" />
                                        )}
                                    </div>
                                    <h4 className={`text-sm font-medium ${index <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {s.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Enhancements Preview */}
                {aiSuggestions.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6 mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Brain className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-bold text-gray-900">AI Enhancements Applied</h3>
                        </div>

                        <div className="space-y-3">
                            {aiSuggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-3 bg-white/50 rounded-lg"
                                >
                                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{suggestion}</span>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-white/70 rounded-lg">
                                <div className="text-lg font-bold text-blue-600">95%</div>
                                <div className="text-sm text-gray-600">ATS Score</div>
                            </div>
                            <div className="text-center p-3 bg-white/70 rounded-lg">
                                <div className="text-lg font-bold text-purple-600">8</div>
                                <div className="text-sm text-gray-600">Keywords Added</div>
                            </div>
                            <div className="text-center p-3 bg-white/70 rounded-lg">
                                <div className="text-lg font-bold text-emerald-600">12</div>
                                <div className="text-sm text-gray-600">Improvements</div>
                            </div>
                            <div className="text-center p-3 bg-white/70 rounded-lg">
                                <div className="text-lg font-bold text-pink-600">30s</div>
                                <div className="text-sm text-gray-600">Time Saved</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resume Preview */}
                {!processing && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Your AI-Optimized Resume</h3>
                                <p className="text-gray-600">Review the draft created by AI</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                    Ready
                                </span>
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900">
                                        {extractedData?.personalInfo?.fullName || 'Your Name'}
                                    </h4>
                                    <p className="text-gray-600">{extractedData?.personalInfo?.email || 'email@example.com'}</p>
                                </div>

                                {extractedData?.summary && (
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-1">Professional Summary</h5>
                                        <p className="text-gray-700 text-sm">
                                            {extractedData.summary.substring(0, 150)}...
                                        </p>
                                    </div>
                                )}

                                {extractedData?.experience?.[0] && (
                                    <div>
                                        <h5 className="font-semibold text-gray-900 mb-1">Recent Experience</h5>
                                        <p className="text-gray-700 text-sm">
                                            {extractedData.experience[0].position} at {extractedData.experience[0].company}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 text-sm text-gray-500">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            This is a preview. You can further customize every section in the builder.
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {processing ? (
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                        >
                            Cancel Build
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                            >
                                Start Over
                            </button>
                            <button
                                onClick={onComplete}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg font-medium flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Enter Builder to Customize
                            </button>
                        </>
                    )}
                </div>

                {/* AI Tips */}
                {!processing && (
                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700">
                                Pro Tip: Use the AI Assistant to further tailor your resume for specific jobs
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MagicBuildWizard;