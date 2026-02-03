// ------------------- JobTailoringModal.jsx -------------------
// src/components/ai/JobTailoringModal.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, Copy, Check, BarChart3, Zap, TrendingUp, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const JobTailoringModal = ({ currentJobDescription, onTailor, onClose }) => {
    const [jobDescription, setJobDescription] = useState(currentJobDescription || '');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [extractedKeywords, setExtractedKeywords] = useState([]);
    const [changesPreview, setChangesPreview] = useState([]);

    const sampleDescriptions = [
        {
            title: 'Senior Frontend Developer',
            content: 'Looking for a Senior Frontend Developer with 5+ years experience in React, TypeScript, and modern web technologies. Experience with Next.js, GraphQL, and design systems preferred.'
        },
        {
            title: 'Product Manager',
            content: 'Seeking Product Manager with experience in SaaS products. Responsibilities include roadmap planning, user research, and working with engineering teams. Agile/Scrum experience required.'
        },
        {
            title: 'Data Scientist',
            content: 'Data Scientist needed with expertise in Python, machine learning, and statistical analysis. Experience with SQL, PyTorch/TensorFlow, and cloud platforms (AWS/GCP) preferred.'
        }
    ];

    const analyzeJobDescription = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setIsAnalyzing(true);

        // Simulate AI analysis
        setTimeout(() => {
            const keywords = [
                'React', 'TypeScript', 'Next.js', 'GraphQL', 'Design Systems',
                'SaaS', 'Roadmap', 'User Research', 'Agile', 'Scrum',
                'Python', 'Machine Learning', 'SQL', 'AWS', 'GCP'
            ].filter(kw => jobDescription.toLowerCase().includes(kw.toLowerCase()));

            setExtractedKeywords(keywords.slice(0, 10));

            setChangesPreview([
                'Optimize professional summary for target role',
                'Align experience bullets with job requirements',
                'Add missing technical skills from job description',
                'Prioritize relevant projects and achievements',
                'Adjust keywords for ATS optimization'
            ]);

            setIsAnalyzing(false);
            toast.success('Job description analyzed successfully!');
        }, 1500);
    };

    const handleTailor = () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        onTailor(jobDescription);
    };

    const copySample = (content) => {
        setJobDescription(content);
        toast.success('Sample job description added');
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Job Tailoring</h2>
                        <p className="text-gray-600">Optimize your resume for a specific job</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Job Description Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Description
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows="6"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Paste the job description you're applying for..."
                    />

                    {/* Sample Descriptions */}
                    <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Quick samples:</p>
                        <div className="flex flex-wrap gap-2">
                            {sampleDescriptions.map((sample, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => copySample(sample.content)}
                                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                                >
                                    <Copy className="w-3 h-3" />
                                    {sample.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={analyzeJobDescription}
                        disabled={isAnalyzing || !jobDescription.trim()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <BarChart3 className="w-4 h-4" />
                                Analyze & Extract Keywords
                            </>
                        )}
                    </button>
                </div>

                {/* Extracted Keywords */}
                {extractedKeywords.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Extracted Keywords</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {extractedKeywords.map((keyword, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 bg-white border border-blue-200 rounded-lg text-blue-700 text-sm"
                                >
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Changes Preview */}
                {changesPreview.length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-5 h-5 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">AI Will Apply These Changes</h3>
                        </div>
                        <ul className="space-y-2">
                            {changesPreview.map((change, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-700">{change}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Benefits */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-semibold text-gray-900">Benefits of Tailoring</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/70 rounded-lg">
                            <div className="text-lg font-bold text-emerald-600">3.2x</div>
                            <div className="text-sm text-gray-600">More Interviews</div>
                        </div>
                        <div className="p-3 bg-white/70 rounded-lg">
                            <div className="text-lg font-bold text-emerald-600">95%</div>
                            <div className="text-sm text-gray-600">ATS Match Rate</div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleTailor}
                        disabled={!jobDescription.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium flex items-center justify-center gap-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        Create Tailored Version
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                    This will create a new version of your resume optimized for this specific job
                </p>
            </div>
        </div>
    );
};

export default JobTailoringModal;