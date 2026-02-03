// ------------------- SummaryGenerator.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    Sparkles,
    Zap,
    Target,
    BarChart,
    Clock,
    Type,
    Copy,
    RotateCcw,
    Check,
    X,
    TrendingUp,
    Award,
    Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SummaryGenerator = ({
    data = '',
    onChange,
    onAIEnhance,
    onNext,
    onBack,
    isAnalyzing = false,
    targetRole = '',
    keywords = []
}) => {
    const [summary, setSummary] = useState(data || '');
    const [tone, setTone] = useState('professional'); // professional, confident, creative, concise
    const [length, setLength] = useState(150); // Character count target
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedOptions, setGeneratedOptions] = useState([]);

    useEffect(() => {
        setSummary(data || '');
    }, [data]);

    const handleGenerate = async () => {
        setIsGenerating(true);

        // Simulate AI summary generation
        setTimeout(() => {
            const examples = [
                `Results-driven ${targetRole || 'professional'} with 8+ years of experience specializing in [KEYWORD1] and [KEYWORD2]. Proven track record of delivering innovative solutions that improve efficiency by 30%+. Passionate about leveraging cutting-edge technologies to solve complex business challenges.`,
                `Accomplished ${targetRole || 'expert'} with expertise in [KEYWORD1], [KEYWORD2], and strategic planning. Successfully led cross-functional teams to achieve 150% revenue growth. Seeking to apply analytical skills and industry knowledge to drive impactful results.`,
                `Innovative ${targetRole || 'specialist'} skilled in [KEYWORD1] with a strong background in [KEYWORD2]. Demonstrated ability to streamline processes and enhance productivity. Committed to continuous learning and adapting to emerging industry trends.`
            ];

            const options = examples.map((example, idx) => ({
                id: idx,
                text: example.replace('[KEYWORD1]', keywords[0] || 'technology').replace('[KEYWORD2]', keywords[1] || 'innovation'),
                tone: ['professional', 'confident', 'creative'][idx],
                length: example.length
            }));

            setGeneratedOptions(options);
            setIsGenerating(false);
            toast.success('AI generated 3 summary options!');
        }, 2000);
    };

    const handleApplyOption = (option) => {
        setSummary(option.text);
        onChange(option.text);
        setTone(option.tone);
        toast.success('Summary applied!');
    };

    const handleToneChange = (newTone) => {
        setTone(newTone);
        // Simulate tone adjustment
        if (summary) {
            toast.loading(`Adjusting to ${newTone} tone...`);
            setTimeout(() => {
                toast.success(`Tone adjusted to ${newTone}`);
            }, 800);
        }
    };

    const handleLengthChange = (newLength) => {
        setLength(newLength);
        // Simulate length optimization
        if (summary && summary.length > newLength) {
            toast.info('Consider trimming your summary for optimal length');
        }
    };

    const getToneColor = (toneType) => {
        return tone === toneType ? 'ring-2 ring-blue-500' : '';
    };

    const getToneConfig = (toneType) => {
        const configs = {
            professional: { color: 'from-blue-500 to-cyan-500', icon: Users, description: 'Formal, corporate language' },
            confident: { color: 'from-purple-500 to-pink-500', icon: Award, description: 'Assertive, achievement-focused' },
            creative: { color: 'from-emerald-500 to-teal-500', icon: Sparkles, description: 'Innovative, engaging style' },
            concise: { color: 'from-gray-600 to-gray-800', icon: Zap, description: 'Brief, to-the-point' }
        };
        return configs[toneType] || configs.professional;
    };

    const analyzeSummary = () => {
        const wordCount = summary.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = summary.length;
        const keywordMatches = keywords.filter(keyword =>
            summary.toLowerCase().includes(keyword.toLowerCase())
        ).length;

        return { wordCount, charCount, keywordMatches };
    };

    const stats = analyzeSummary();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
                    <p className="text-gray-600">Craft a compelling introduction that highlights your expertise</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {isGenerating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Sparkles className="w-4 h-4" />
                        )}
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Editor & Controls */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tone Selector */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Summary Tone</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['professional', 'confident', 'creative', 'concise'].map((toneType) => {
                                const config = getToneConfig(toneType);
                                const Icon = config.icon;

                                return (
                                    <button
                                        key={toneType}
                                        onClick={() => handleToneChange(toneType)}
                                        className={`p-4 rounded-xl border border-gray-200 hover:shadow-sm transition-all ${getToneColor(toneType)}`}
                                    >
                                        <div className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-gray-900 capitalize">{toneType}</p>
                                            <p className="text-xs text-gray-600 mt-1">{config.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Summary Editor */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Write Your Summary</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(summary);
                                        toast.success('Copied to clipboard!');
                                    }}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    title="Copy"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setSummary('');
                                        onChange('');
                                        toast.success('Cleared summary');
                                    }}
                                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                                    title="Clear"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="relative">
                            <textarea
                                value={summary}
                                onChange={(e) => {
                                    setSummary(e.target.value);
                                    onChange(e.target.value);
                                }}
                                rows="8"
                                placeholder={`Experienced ${targetRole || 'professional'} with expertise in [your key skills]. Proven ability to [key achievement]. Seeking to leverage [your strengths] to [desired outcome]...`}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-medium"
                            />

                            {/* Character Counter */}
                            <div className="absolute bottom-3 right-3">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${summary.length > length ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {summary.length}/{length}
                                </div>
                            </div>
                        </div>

                        {/* Length Slider */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">Target Length</label>
                                <span className="text-sm text-gray-600">{length} characters</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="300"
                                value={length}
                                onChange={(e) => handleLengthChange(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Brief (100)</span>
                                <span>Optimal (150)</span>
                                <span>Detailed (300)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Stats & AI Options */}
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Summary Stats</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Type className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Words</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.wordCount}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${stats.wordCount >= 50 && stats.wordCount <= 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {stats.wordCount >= 50 && stats.wordCount <= 100 ? 'Optimal' : 'Adjust'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <BarChart className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Keywords</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.keywordMatches}/{keywords.length}</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${stats.keywordMatches >= Math.min(3, keywords.length) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {stats.keywordMatches >= Math.min(3, keywords.length) ? 'Good' : 'Add more'}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg">
                                        <Clock className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Read Time</p>
                                        <p className="text-2xl font-bold text-gray-900">{Math.ceil(stats.wordCount / 200)}s</p>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm ${Math.ceil(stats.wordCount / 200) <= 30 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {Math.ceil(stats.wordCount / 200) <= 30 ? 'Good' : 'Long'}
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">ATS Optimization</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {Math.round((stats.keywordMatches / Math.max(keywords.length, 1)) * 100)}%
                                </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(stats.keywordMatches / Math.max(keywords.length, 1)) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* AI Generated Options */}
                    {generatedOptions.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">AI Suggestions</h3>
                                <button
                                    onClick={() => setGeneratedOptions([])}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Clear
                                </button>
                            </div>

                            <div className="space-y-4">
                                {generatedOptions.map((option) => (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
                                        onClick={() => handleApplyOption(option)}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded ${option.tone === 'professional' ? 'bg-blue-100 text-blue-600' : option.tone === 'confident' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    {option.tone === 'professional' ? <Users className="w-4 h-4" /> :
                                                        option.tone === 'confident' ? <Award className="w-4 h-4" /> :
                                                            <Sparkles className="w-4 h-4" />}
                                                </div>
                                                <span className="text-xs font-medium text-gray-700 capitalize">{option.tone}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{option.length} chars</span>
                                        </div>
                                        <p className="text-sm text-gray-800 line-clamp-3">{option.text}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex-1 h-px bg-gray-200" />
                                            <span className="text-xs text-blue-600 font-medium">Click to apply</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Summary Tips
                        </h4>
                        <ul className="text-sm text-gray-700 space-y-2">
                            <li className="flex items-start gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Start with your strongest selling point</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Include 2-3 key achievements or skills</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <BarChart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Use metrics and numbers when possible</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span>Keep it between 50-100 words (optimal)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                    Back
                </button>
                <div className="text-sm text-gray-600">
                    {stats.wordCount} words • {stats.keywordMatches}/{keywords.length} keywords matched
                </div>
                <button
                    onClick={onNext}
                    disabled={!summary.trim()}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    Continue to Experience
                </button>
            </div>
        </div>
    );
};

export default SummaryGenerator;