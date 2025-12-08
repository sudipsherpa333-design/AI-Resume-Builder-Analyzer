// src/pages/JobAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaSearch,
    FaChartLine,
    FaStar,
    FaCheckCircle,
    FaExclamationTriangle,
    FaLightbulb,
    FaFileAlt,
    FaDownload,
    FaSync,
    FaArrowLeft,
    FaExternalLinkAlt,
    FaPercent,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaBriefcase
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useResume } from '../context/ResumeContext';

const JobAnalyzer = () => {
    const navigate = useNavigate();
    const { resumes = [] } = useResume();

    const [jobDescription, setJobDescription] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [company, setCompany] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [selectedResume, setSelectedResume] = useState(null);

    const sampleJobs = [
        {
            title: "Frontend Developer",
            company: "TechCorp Inc.",
            description: "Looking for a skilled Frontend Developer with React experience. Must have 3+ years of experience in modern JavaScript frameworks."
        },
        {
            title: "Full Stack Developer",
            company: "StartUp XYZ",
            description: "Join our dynamic team! We need a Full Stack Developer proficient in Node.js, React, and MongoDB. Experience with AWS is a plus."
        },
        {
            title: "UI/UX Designer",
            company: "DesignStudio",
            description: "Creative UI/UX Designer needed to design beautiful interfaces. Proficiency in Figma, Adobe XD, and user research required."
        }
    ];

    const loadSampleJob = (job) => {
        setJobTitle(job.title);
        setCompany(job.company);
        setJobDescription(job.description);
    };

    const analyzeJob = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        if (resumes.length === 0) {
            toast.error('No resumes found. Please create a resume first.');
            navigate('/builder-home');
            return;
        }

        setAnalyzing(true);
        toast.loading('Analyzing job match...');

        // Simulate API call
        setTimeout(() => {
            const mockAnalysis = {
                matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
                strengths: [
                    "Excellent React experience matches requirements",
                    "Strong portfolio of relevant projects",
                    "Good educational background",
                    "Relevant certifications"
                ],
                weaknesses: [
                    "Limited experience with AWS (mentioned as plus)",
                    "Only 2 years of professional experience (3+ required)",
                    "No experience with specific testing framework mentioned"
                ],
                suggestions: [
                    "Add AWS projects to your portfolio",
                    "Highlight any testing framework experience",
                    "Emphasize relevant achievements in your experience section",
                    "Consider getting a certification in the missing area"
                ],
                keywordMatches: {
                    present: ["React", "JavaScript", "Node.js", "MongoDB", "UI/UX"],
                    missing: ["AWS", "Docker", "Kubernetes", "TypeScript"]
                },
                estimatedSalary: "$85,000 - $110,000",
                interviewProbability: "High",
                timeline: "2-4 weeks"
            };

            setAnalysis(mockAnalysis);
            setAnalyzing(false);
            toast.dismiss();
            toast.success('Analysis complete!');
        }, 2000);
    };

    const generateCoverLetter = () => {
        toast.success('Cover letter generated! Check your documents.');
        // In a real app, this would generate and download a cover letter
    };

    const optimizeResume = () => {
        toast.success('Resume optimization suggestions saved!');
        // In a real app, this would apply optimizations
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 80) return 'text-yellow-600';
        if (score >= 70) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 90) return 'bg-green-100';
        if (score >= 80) return 'bg-yellow-100';
        if (score >= 70) return 'bg-orange-100';
        return 'bg-red-100';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                                <FaArrowLeft className="text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Job Match Analyzer</h1>
                                <p className="text-gray-600">Analyze how well your resume matches job requirements</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">
                                {resumes.length} resume{resumes.length !== 1 ? 's' : ''} available
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Job Input */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaSearch className="text-blue-500" />
                                    Enter Job Details
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="e.g., Frontend Developer"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                            placeholder="e.g., Google, Microsoft"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Description
                                        </label>
                                        <textarea
                                            value={jobDescription}
                                            onChange={(e) => setJobDescription(e.target.value)}
                                            placeholder="Paste the job description here..."
                                            rows="10"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-medium text-gray-900">Quick Samples</h3>
                                            <span className="text-sm text-gray-500">Try these examples</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {sampleJobs.map((job, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => loadSampleJob(job)}
                                                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition text-left"
                                                >
                                                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t">
                                        <button
                                            onClick={analyzeJob}
                                            disabled={!jobDescription.trim() || analyzing}
                                            className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-3"
                                        >
                                            {analyzing ? (
                                                <>
                                                    <FaSync className="animate-spin" />
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <FaChartLine className="text-lg" />
                                                    Analyze Job Match
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Resume Selection */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FaFileAlt className="text-green-500" />
                                    Select Resume to Analyze
                                </h2>
                                {resumes.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-gray-600 mb-4">No resumes found</p>
                                        <button
                                            onClick={() => navigate('/builder-home')}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Create Your First Resume
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {resumes.slice(0, 4).map((resume, index) => (
                                            <div
                                                key={resume.id || index}
                                                className={`p-4 border rounded-lg cursor-pointer transition ${selectedResume === resume.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                                                onClick={() => setSelectedResume(resume.id)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {resume.title || 'Untitled Resume'}
                                                    </h4>
                                                    {selectedResume === resume.id && (
                                                        <FaCheckCircle className="text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <FaCalendarAlt />
                                                        {new Date(resume.updatedAt || resume.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <FaBriefcase />
                                                        {resume.template || 'Modern'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Right Column - Analysis Results */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-1"
                        >
                            {analysis ? (
                                <div className="space-y-6">
                                    {/* Match Score */}
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <div className="text-center mb-6">
                                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(analysis.matchScore)} mb-4`}>
                                                <span className={`text-3xl font-bold ${getScoreColor(analysis.matchScore)}`}>
                                                    {analysis.matchScore}%
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Match Score</h3>
                                            <p className="text-gray-600">
                                                {analysis.matchScore >= 90 ? 'Excellent match!' :
                                                    analysis.matchScore >= 80 ? 'Good match' :
                                                        analysis.matchScore >= 70 ? 'Fair match' :
                                                            'Needs improvement'}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Salary Range</span>
                                                <span className="font-semibold text-gray-900">{analysis.estimatedSalary}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Interview Chance</span>
                                                <span className="font-semibold text-green-600">{analysis.interviewProbability}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">Expected Timeline</span>
                                                <span className="font-semibold text-gray-900">{analysis.timeline}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strengths */}
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaStar className="text-green-500" />
                                            Your Strengths
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.strengths.map((strength, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                    <span className="text-gray-700">{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Improvements */}
                                    <div className="bg-white rounded-2xl shadow-lg p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <FaLightbulb className="text-yellow-500" />
                                            Suggestions for Improvement
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.suggestions.map((suggestion, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <FaExclamationTriangle className="text-blue-500 mt-1 flex-shrink-0" />
                                                    <span className="text-gray-700">{suggestion}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                                        <h3 className="text-lg font-bold mb-4">Next Steps</h3>
                                        <div className="space-y-3">
                                            <button
                                                onClick={optimizeResume}
                                                className="w-full px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold flex items-center justify-center gap-2"
                                            >
                                                <FaSync />
                                                Optimize Resume
                                            </button>
                                            <button
                                                onClick={generateCoverLetter}
                                                className="w-full px-4 py-3 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold flex items-center justify-center gap-2"
                                            >
                                                <FaFileAlt />
                                                Generate Cover Letter
                                            </button>
                                            <button
                                                onClick={() => navigate('/builder', { state: { editResume: selectedResume } })}
                                                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold flex items-center justify-center gap-2"
                                            >
                                                <FaExternalLinkAlt />
                                                Edit Resume
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                    <div className="p-4 bg-blue-100 rounded-full inline-block mb-6">
                                        <FaChartLine className="text-3xl text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        Ready to Analyze?
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Enter a job description and see how well your resume matches the requirements.
                                    </p>
                                    <div className="text-left space-y-3">
                                        <div className="flex items-center gap-2">
                                            <FaPercent className="text-blue-500" />
                                            <span className="text-gray-700">Get match percentage</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaLightbulb className="text-yellow-500" />
                                            <span className="text-gray-700">Receive improvement suggestions</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Fa