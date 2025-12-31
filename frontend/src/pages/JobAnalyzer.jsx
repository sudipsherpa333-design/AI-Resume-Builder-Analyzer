// src/pages/JobAnalyzer.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    FaUpload,
    FaSearch,
    FaChartLine,
    FaLightbulb,
    FaFileAlt,
    FaArrowRight,
    FaCopy,
    FaCheck,
    FaTimes
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const JobAnalyzer = () => {
    const { user, isDemoMode } = useAuth();
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
            // In a real app, you would upload to server here
            console.log('File uploaded:', file.name);
        } else {
            alert('Please upload a PDF file');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
            console.log('File dropped:', file.name);
        } else {
            alert('Please drop a PDF file');
        }
    };

    const analyzeResume = async () => {
        if (!uploadedFile && !jobDescription.trim()) {
            alert('Please upload a resume or enter a job description');
            return;
        }

        setIsAnalyzing(true);

        // Simulate API call
        setTimeout(() => {
            const mockAnalysis = {
                matchScore: 78,
                strengths: [
                    'Relevant experience in React and Node.js',
                    'Strong educational background',
                    'Good project portfolio'
                ],
                weaknesses: [
                    'Missing specific certifications',
                    'Could highlight leadership experience more',
                    'Keywords from job description missing'
                ],
                recommendations: [
                    'Add more keywords from the job description',
                    'Highlight leadership experience in projects',
                    'Consider adding relevant certifications',
                    'Quantify achievements with metrics'
                ],
                keywords: ['React', 'Node.js', 'JavaScript', 'AWS', 'MongoDB', 'Agile'],
                missingKeywords: ['TypeScript', 'Docker', 'CI/CD', 'GraphQL']
            };

            setAnalysis(mockAnalysis);
            setIsAnalyzing(false);
        }, 2000);
    };

    const clearAnalysis = () => {
        setAnalysis(null);
        setUploadedFile(null);
        setJobDescription('');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Show feedback (you can use toast here)
        alert('Copied to clipboard!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        AI Job Analyzer
                    </h1>
                    <p className="text-gray-600">
                        Upload your resume and paste a job description to get AI-powered analysis
                    </p>
                    {isDemoMode() && (
                        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm">
                            <FaLightbulb className="mr-2" />
                            Demo Mode - Using mock data
                        </div>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Input */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* File Upload Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <FaUpload className="text-blue-600 text-xl mr-3" />
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Upload Resume (PDF)
                                </h2>
                            </div>

                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : uploadedFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                    }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <FaFileAlt className="text-4xl mx-auto mb-4 text-gray-400" />

                                {uploadedFile ? (
                                    <div>
                                        <p className="text-green-600 font-medium">
                                            ✓ {uploadedFile.name}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Click to change file
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-700 mb-2">
                                            <span className="font-medium">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            PDF files only (Max 5MB)
                                        </p>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    className="hidden"
                                />
                            </div>

                            {uploadedFile && (
                                <button
                                    onClick={() => setUploadedFile(null)}
                                    className="mt-4 text-red-600 hover:text-red-700 text-sm flex items-center"
                                >
                                    <FaTimes className="mr-2" />
                                    Remove file
                                </button>
                            )}
                        </div>

                        {/* Job Description Section */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center mb-4">
                                <FaSearch className="text-purple-600 text-xl mr-3" />
                                <h2 className="text-xl font-semibold text-gray-800">
                                    Job Description
                                </h2>
                            </div>

                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows="6"
                            />

                            <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-gray-500">
                                    {jobDescription.length} characters
                                </span>
                                <button
                                    onClick={() => setJobDescription('')}
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <button
                            onClick={analyzeResume}
                            disabled={isAnalyzing}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center ${isAnalyzing
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                                }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <FaChartLine className="mr-3" />
                                    Analyze Resume
                                    <FaArrowRight className="ml-3" />
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Right Column - Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {analysis ? (
                            <>
                                {/* Match Score */}
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Analysis Results
                                        </h2>
                                        <button
                                            onClick={clearAnalysis}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <FaTimes className="text-xl" />
                                        </button>
                                    </div>

                                    <div className="text-center mb-8">
                                        <div className="relative inline-block">
                                            <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                                                <div className="text-center">
                                                    <span className="text-5xl font-bold text-gray-900">
                                                        {analysis.matchScore}%
                                                    </span>
                                                    <p className="text-gray-600 mt-2">Match Score</p>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-blue-500 border-r-purple-500"></div>
                                        </div>
                                        <p className="text-gray-600 mt-4">
                                            {analysis.matchScore >= 80
                                                ? 'Excellent match! Your resume aligns well with the job requirements.'
                                                : analysis.matchScore >= 60
                                                    ? 'Good match. Consider improving some areas.'
                                                    : 'Needs improvement. Review recommendations below.'}
                                        </p>
                                    </div>

                                    {/* Strengths & Weaknesses */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="bg-green-50 p-5 rounded-xl">
                                            <h3 className="font-bold text-green-800 mb-3 flex items-center">
                                                <FaCheck className="mr-2" />
                                                Strengths
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysis.strengths.map((strength, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-green-500 mr-2">✓</span>
                                                        <span className="text-gray-700">{strength}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-red-50 p-5 rounded-xl">
                                            <h3 className="font-bold text-red-800 mb-3 flex items-center">
                                                <FaTimes className="mr-2" />
                                                Areas to Improve
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysis.weaknesses.map((weakness, index) => (
                                                    <li key={index} className="flex items-start">
                                                        <span className="text-red-500 mr-2">•</span>
                                                        <span className="text-gray-700">{weakness}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Recommendations */}
                                    <div className="bg-blue-50 p-5 rounded-xl mb-6">
                                        <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                                            <FaLightbulb className="mr-2" />
                                            AI Recommendations
                                        </h3>
                                        <ul className="space-y-3">
                                            {analysis.recommendations.map((rec, index) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-500 mr-3">💡</span>
                                                    <span className="text-gray-700">{rec}</span>
                                                    <button
                                                        onClick={() => copyToClipboard(rec)}
                                                        className="ml-auto text-blue-600 hover:text-blue-800"
                                                        title="Copy to clipboard"
                                                    >
                                                        <FaCopy />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Keywords Analysis */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">
                                                Keywords Found
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.keywords.map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">
                                                Missing Keywords
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.missingKeywords.map((keyword, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Placeholder when no analysis */
                            <div className="bg-white rounded-2xl shadow-lg p-8 text-center h-full flex flex-col items-center justify-center">
                                <FaChartLine className="text-6xl text-gray-300 mb-6" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                                    No Analysis Yet
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Upload your resume and enter a job description to see AI-powered analysis
                                </p>
                                <div className="text-gray-400">
                                    <p className="mb-2">✓ Get match score</p>
                                    <p className="mb-2">✓ Identify strengths & weaknesses</p>
                                    <p>✓ Receive improvement recommendations</p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default JobAnalyzer;