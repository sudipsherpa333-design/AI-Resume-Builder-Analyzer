import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FileText, Zap, ArrowRight, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

const BuilderSelect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const jobDescription = location.state?.jobDescription || '';
    const [selectedMode, setSelectedMode] = useState(null);
    const [localJd, setLocalJd] = useState(jobDescription);

    const modes = [
        {
            id: 'magic',
            title: '✨ MAGIC BUILD',
            subtitle: 'AI Creates Resume in 60 Seconds',
            description: 'Paste a job description and let AI generate a complete, optimized resume instantly.',
            time: '60 seconds',
            best_for: 'Quick & Powerful',
            icon: Sparkles,
            color: 'from-blue-600 to-cyan-600',
            features: [
                'Instant full resume generation',
                'AI-optimized for job description',
                '92% average ATS score',
                'One-click PDF download'
            ]
        },
        {
            id: 'quick',
            title: '📝 QUICK BUILD',
            subtitle: 'AI Assists While You Type',
            description: 'Fill in basic info, let AI help enhance each section with smart suggestions.',
            time: '2-3 minutes',
            best_for: 'Customized & Fast',
            icon: FileText,
            color: 'from-emerald-600 to-teal-600',
            features: [
                'Step-by-step guided builder',
                'AI suggestions for every field',
                'Real-time ATS scoring',
                'Full customization control'
            ]
        },
        {
            id: 'pro',
            title: '⚡ PRO BUILD',
            subtitle: 'Upload & AI Upgrades',
            description: 'Upload your current resume and let AI upgrade and optimize it automatically.',
            time: '1-2 minutes',
            best_for: 'Already Have One',
            icon: Zap,
            color: 'from-purple-600 to-pink-600',
            features: [
                'Upload existing resume',
                'AI extraction of all info',
                'Automatic AI enhancement',
                'Section-by-section improvement'
            ]
        }
    ];

    const handleStartBuild = (modeId) => {
        if (modeId === 'magic' && !localJd.trim()) {
            toast.error('Please paste a job description for magic build');
            return;
        }

        navigate('/builder', {
            state: {
                mode: modeId,
                jobDescription: localJd
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <div className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Title */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold mb-6">Choose Your Build Mode</h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                        Select how you want to create your AI-powered resume
                    </p>
                </div>

                {/* Magic Build JD Input (if applicable) */}
                {(!selectedMode || selectedMode === 'magic') && (
                    <div className="max-w-2xl mx-auto mb-16 bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600/50">
                        <label className="block text-sm font-semibold text-blue-300 mb-4">
                            🔮 Paste Job Description (for any mode)
                        </label>
                        <textarea
                            value={localJd}
                            onChange={(e) => setLocalJd(e.target.value)}
                            placeholder="Senior React Developer at TechCorp... 5+ years experience, React, Node.js, AWS..."
                            className="w-full h-24 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                        />
                        <p className="text-sm text-slate-400 mt-2">
                            Paste the job description to get JD-optimized suggestions in any mode
                        </p>
                    </div>
                )}

                {/* Mode Selection Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {modes.map((mode) => {
                        const IconComponent = mode.icon;
                        const isSelected = selectedMode === mode.id;

                        return (
                            <div
                                key={mode.id}
                                onClick={() => setSelectedMode(isSelected ? null : mode.id)}
                                className={`relative rounded-2xl p-8 border-2 transition cursor-pointer transform hover:scale-105 ${isSelected
                                        ? `border-blue-500 bg-gradient-to-br ${mode.color} bg-opacity-10 shadow-xl shadow-blue-500/20`
                                        : 'border-slate-600/50 bg-slate-800/30 hover:border-slate-500'
                                    }`}
                            >
                                {isSelected && (
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-lg">✓</span>
                                    </div>
                                )}

                                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br ${mode.color} bg-opacity-20`}>
                                    <IconComponent size={32} className="text-white" />
                                </div>

                                <h3 className="text-2xl font-bold mb-2">{mode.title}</h3>
                                <p className="text-blue-300 text-sm mb-4">{mode.subtitle}</p>
                                <p className="text-slate-300 mb-6">{mode.description}</p>

                                <div className="flex items-center gap-2 text-cyan-400 text-sm mb-6">
                                    <Lightbulb size={16} />
                                    {mode.best_for}
                                </div>

                                <div className="space-y-2 mb-6">
                                    {mode.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                            <span className="text-emerald-400 mt-0.5">✓</span>
                                            {feature}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-600/30">
                                    <span className="text-sm text-slate-400">{mode.time}</span>
                                    {isSelected && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStartBuild(mode.id);
                                            }}
                                            className={`px-6 py-2 bg-gradient-to-r ${mode.color} text-white font-bold rounded-lg hover:shadow-lg transition flex items-center gap-2`}
                                        >
                                            Start Build
                                            <ArrowRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Selected Mode Details */}
                {selectedMode && (
                    <div className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-xl p-8 mb-8">
                        <h3 className="text-xl font-bold mb-4">How it works:</h3>
                        {selectedMode === 'magic' && (
                            <ol className="space-y-2 text-slate-300">
                                <li>1. 📝 Paste job description (already filled above)</li>
                                <li>2. ⚡ Click "Start Build" to generate</li>
                                <li>3. ✓ Get full 92% ATS resume in 60 seconds</li>
                                <li>4. 📥 Download PDF or edit further</li>
                            </ol>
                        )}
                        {selectedMode === 'quick' && (
                            <ol className="space-y-2 text-slate-300">
                                <li>1. 📋 Fill in basic information</li>
                                <li>2. ✨ Get AI suggestions for each field</li>
                                <li>3. 📊 Watch ATS score update in real-time</li>
                                <li>4. 📥 Export when ready</li>
                            </ol>
                        )}
                        {selectedMode === 'pro' && (
                            <ol className="space-y-2 text-slate-300">
                                <li>1. 📄 Upload your existing resume</li>
                                <li>2. 🤖 AI extracts and analyzes</li>
                                <li>3. ✨ Auto-enhancement and optimization</li>
                                <li>4. ✓ Review and download</li>
                            </ol>
                        )}
                    </div>
                )}

                {/* CTA Button (Alternative) */}
                {!selectedMode && (
                    <div className="text-center">
                        <button
                            onClick={() => setSelectedMode('magic')}
                            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                        >
                            <Sparkles className="inline mr-2" size={20} />
                            Try Magic Build Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuilderSelect;
