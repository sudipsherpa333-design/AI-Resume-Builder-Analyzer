import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, Users, TrendingUp, ArrowRight, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
    const navigate = useNavigate();
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleMagicBuild = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please paste a job description');
            return;
        }

        setLoading(true);
        try {
            // Navigate to magic builder with JD
            navigate('/builder/select', {
                state: { jobDescription, mode: 'magic' }
            });
        } catch (error) {
            toast.error('Failed to start magic build');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Navigation */}
            <nav className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        ✨ AI Resume Builder
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 rounded-lg border border-blue-500/50 text-blue-300 hover:bg-blue-500/10 transition"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                        >
                            Start Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="text-center mb-16">
                    <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                        <span className="text-blue-300 text-sm font-semibold">🚀 Powered by AI</span>
                    </div>
                    <h1 className="text-6xl font-bold mb-6 leading-tight">
                        AI Builds <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">92% ATS Resume</span> in 60s
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12">
                        Paste a job description and watch our AI create a perfectly optimized, ATS-friendly resume. Your personal AI recruiter.
                    </p>
                </div>

                {/* Magic Build Input */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600/50 mb-16 shadow-2xl">
                    <label className="block text-sm font-semibold text-blue-300 mb-4">
                        🔮 Paste Job Description
                    </label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Senior React Developer at TechCorp... 5+ years experience, React, Node.js, AWS..."
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                    <div className="flex gap-4 mt-6">
                        <button
                            onClick={handleMagicBuild}
                            disabled={loading}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition transform hover:scale-105"
                        >
                            <Sparkles size={20} />
                            {loading ? 'Building...' : '✨ MAGIC BUILD (60 seconds)'}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-lg transition"
                        >
                            Manual Build
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <div className="text-4xl font-bold text-blue-400 mb-2">10K+</div>
                        <div className="text-slate-300">Developers Build Resumes</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <div className="text-4xl font-bold text-cyan-400 mb-2">92%</div>
                        <div className="text-slate-300">Average ATS Score</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                        <div className="text-4xl font-bold text-emerald-400 mb-2">60s</div>
                        <div className="text-slate-300">Resume Build Time</div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30 hover:border-blue-500/50 transition">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">AI-Powered Optimization</h3>
                        <p className="text-slate-300">
                            Our AI analyzes job descriptions and automatically optimizes every section for maximum ATS compatibility.
                        </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30 hover:border-blue-500/50 transition">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                            <TrendingUp className="text-cyan-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Real-Time ATS Score</h3>
                        <p className="text-slate-300">
                            Watch your ATS score update in real-time as you edit. See exactly what improves your resume.
                        </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30 hover:border-blue-500/50 transition">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Sparkles className="text-emerald-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">AI Assistant</h3>
                        <p className="text-slate-300">
                            Get AI suggestions for every section: better bullet points, stronger summary, perfect keywords.
                        </p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-8 border border-slate-700/30 hover:border-blue-500/50 transition">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                            <Users className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold mb-3">Multiple Templates</h3>
                        <p className="text-slate-300">
                            Choose from professional templates designed to pass ATS systems and impress recruiters.
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-2xl p-12 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Build Your AI Resume?</h2>
                    <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                        Start with our magic builder for instant results, or take control with our advanced editor.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition"
                        >
                            Get Started Now
                        </button>
                        <button
                            className="px-8 py-3 border border-blue-500/50 text-blue-300 hover:bg-blue-500/10 rounded-lg font-bold transition"
                        >
                            <Play size={16} className="inline mr-2" />
                            Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-700/50 mt-20 py-12 text-center text-slate-400">
                <p>© 2026 AI Resume Builder. Built with ❤️ for developers.</p>
            </footer>
        </div>
    );
};

export default Home;
