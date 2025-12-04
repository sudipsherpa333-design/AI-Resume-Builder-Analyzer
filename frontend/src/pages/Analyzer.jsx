// src/pages/Analyzer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaArrowLeft,
    FaSync,
    FaEdit,
    FaChartBar,
    FaStar,
    FaExclamationTriangle,
    FaCheckCircle,
    FaLightbulb,
    FaDownload,
    FaShare,
    FaClock,
    FaFileAlt,
    FaGraduationCap,
    FaBriefcase,
    FaUser,
    FaCogs,
    FaUpload,
    FaLink,
    FaFilePdf,
    FaFileWord,
    FaTrash,
    FaRobot,
    FaMagic,
    FaAward,
    FaBullseye,
    FaGlobe,
    FaHistory,
    FaTimes
} from 'react-icons/fa';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Analyzer = () => {
    const navigate = useNavigate();
    const { currentResume, analyzeResume: contextAnalyzeResume } = useResume();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [resumeData, setResumeData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [urlInput, setUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [aiModel, setAiModel] = useState('openai'); // openai, gemini, claude, custom
    const [jobDescription, setJobDescription] = useState('');
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [previewContent, setPreviewContent] = useState('');

    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);

    // Load resume data and history
    useEffect(() => {
        const loadData = () => {
            try {
                // Load from current resume context
                if (currentResume) {
                    const data = currentResume.data || currentResume.content || {};
                    setResumeData(data);
                    // Generate preview
                    generatePreview(data);
                } else {
                    // Fallback to localStorage
                    const savedDraft = localStorage.getItem('resumeDraft');
                    if (savedDraft) {
                        const parsed = JSON.parse(savedDraft);
                        const data = parsed.data || parsed;
                        setResumeData(data);
                        generatePreview(data);
                    }
                }

                // Load analysis history
                const savedHistory = localStorage.getItem('resumeAnalysisHistory');
                if (savedHistory) {
                    setAnalysisHistory(JSON.parse(savedHistory));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, [currentResume]);

    // Generate text preview from resume data
    const generatePreview = (data) => {
        if (!data) {
            setPreviewContent('');
            return;
        }

        let preview = '';

        // Personal Info
        if (data.personalInfo) {
            const { firstName, lastName, email, phone, location, title } = data.personalInfo;
            if (firstName || lastName) {
                preview += `${firstName} ${lastName}\n`;
            }
            if (title) preview += `${title}\n`;
            if (email) preview += `${email}\n`;
            if (phone) preview += `${phone}\n`;
            if (location) preview += `${location}\n\n`;
        }

        // Summary
        if (data.summary) {
            preview += `SUMMARY\n${data.summary}\n\n`;
        }

        // Experience
        if (data.experience && data.experience.length > 0) {
            preview += `EXPERIENCE\n`;
            data.experience.forEach((exp, index) => {
                preview += `${exp.jobTitle || exp.position} at ${exp.company}\n`;
                preview += `${exp.startDate} - ${exp.endDate || 'Present'}\n`;
                if (exp.description) preview += `${exp.description}\n`;
                if (index < data.experience.length - 1) preview += '\n';
            });
            preview += '\n';
        }

        // Education
        if (data.education && data.education.length > 0) {
            preview += `EDUCATION\n`;
            data.education.forEach((edu, index) => {
                preview += `${edu.degree} at ${edu.institution}\n`;
                preview += `${edu.startDate} - ${edu.endDate || 'Present'}\n\n`;
            });
        }

        setPreviewContent(preview);
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/html',
            'application/json'
        ];

        if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|json|html)$/i)) {
            toast.error('Please upload PDF, DOC, DOCX, TXT, HTML, or JSON files only');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setSelectedFile(file);
        readFileContent(file);
    };

    // Read file content
    const readFileContent = (file) => {
        setIsUploading(true);

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                let content = '';

                if (file.type === 'application/pdf') {
                    // Mock PDF content extraction
                    content = `PDF File: ${file.name}\n\n`;
                    content += "This is a simulated PDF content extraction. In production, this would extract actual text from the PDF file.\n\n";
                    content += "To implement real PDF extraction, you would need to:\n";
                    content += "1. Use pdf-parse library on the backend\n";
                    content += "2. Send file to server for processing\n";
                    content += "3. Return extracted text to frontend\n\n";
                    content += "Current file info:\n";
                    content += `- Name: ${file.name}\n`;
                    content += `- Size: ${(file.size / 1024).toFixed(2)} KB\n`;
                    content += `- Type: ${file.type}`;
                } else if (file.type.includes('msword') || file.type.includes('wordprocessingml')) {
                    // Mock DOCX content extraction
                    content = `DOCX File: ${file.name}\n\n`;
                    content += "This is a simulated DOCX content extraction. In production, this would extract actual text from the DOCX file.\n\n";
                    content += "To implement real DOCX extraction, you would need to:\n";
                    content += "1. Use mammoth.js library on the backend\n";
                    content += "2. Send file to server for processing\n";
                    content += "3. Return extracted text to frontend\n\n";
                    content += "Current file info:\n";
                    content += `- Name: ${file.name}\n`;
                    content += `- Size: ${(file.size / 1024).toFixed(2)} KB\n`;
                    content += `- Type: ${file.type}`;
                } else if (file.type === 'application/json') {
                    try {
                        const jsonContent = JSON.parse(e.target.result);
                        content = JSON.stringify(jsonContent, null, 2);
                    } catch {
                        content = e.target.result;
                    }
                } else {
                    content = e.target.result;
                }

                setFileContent(content);
                toast.success('File uploaded successfully! Ready for analysis.');
            } catch (error) {
                console.error('Error reading file:', error);
                toast.error('Failed to read file content');
            } finally {
                setIsUploading(false);
            }
        };

        reader.onerror = () => {
            setIsUploading(false);
            toast.error('Failed to read file');
        };

        if (file.type === 'application/pdf' || file.type.includes('msword') || file.type.includes('wordprocessingml')) {
            // For binary files, read as array buffer
            reader.readAsArrayBuffer(file);
        } else {
            // For text files, read as text
            reader.readAsText(file);
        }
    };

    // Handle drag and drop
    useEffect(() => {
        const dropArea = dropAreaRef.current;

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        const highlight = () => {
            dropArea.classList.add('border-blue-500', 'bg-blue-50');
        };

        const unhighlight = () => {
            dropArea.classList.remove('border-blue-500', 'bg-blue-50');
        };

        const handleDrop = (e) => {
            preventDefaults(e);
            unhighlight();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                // Create a mock event object
                const event = { target: { files } };
                handleFileSelect(event);
            }
        };

        if (dropArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropArea.addEventListener(eventName, highlight, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropArea.addEventListener(eventName, unhighlight, false);
            });

            dropArea.addEventListener('drop', handleDrop, false);
        }

        return () => {
            if (dropArea) {
                ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                    dropArea.removeEventListener(eventName, preventDefaults, false);
                });
            }
        };
    }, []);

    // Analyze from URL
    const analyzeFromUrl = async () => {
        if (!urlInput.trim()) {
            toast.error('Please enter a URL');
            return;
        }

        // Validate URL
        try {
            const url = new URL(urlInput);
            if (!url.protocol.startsWith('http')) {
                toast.error('Please enter a valid HTTP/HTTPS URL');
                return;
            }
        } catch {
            toast.error('Please enter a valid URL');
            return;
        }

        setIsUploading(true);
        try {
            // Mock URL content extraction
            // In production, you would call your backend API
            setTimeout(() => {
                setFileContent(`Content extracted from URL: ${urlInput}\n\n`);
                setFileContent(prev => prev + `This is a simulated content extraction from the provided URL.\n\n`);
                setFileContent(prev => prev + `In production, this would:\n`);
                setFileContent(prev => prev + `1. Fetch the webpage content\n`);
                setFileContent(prev => prev + `2. Parse HTML and extract text\n`);
                setFileContent(prev => prev + `3. Clean and format the content\n\n`);
                setFileContent(prev => prev + `URL analyzed: ${urlInput}`);

                toast.success('URL content extracted successfully! Ready for analysis.');
                setUrlInput('');
                setIsUploading(false);
            }, 1500);
        } catch (error) {
            console.error('Error fetching URL:', error);
            toast.error('Failed to extract content from URL');
            setIsUploading(false);
        }
    };

    // Main analysis function
    const performAnalysis = async () => {
        // Check if we have content to analyze
        const hasContent = resumeData || fileContent || selectedFile || previewContent;

        if (!hasContent) {
            toast.error('Please upload a resume file, enter a URL, or select a resume to analyze');
            return;
        }

        setIsAnalyzing(true);

        try {
            let contentToAnalyze = '';

            if (fileContent) {
                contentToAnalyze = fileContent;
            } else if (previewContent) {
                contentToAnalyze = previewContent;
            } else if (resumeData) {
                contentToAnalyze = JSON.stringify(resumeData, null, 2);
            }

            // Use context analyzeResume function if available
            if (contextAnalyzeResume && resumeData) {
                const result = await contextAnalyzeResume(resumeData, jobDescription);
                if (result.success) {
                    setAnalysis(result.data);
                } else {
                    throw new Error(result.message || 'Analysis failed');
                }
            } else {
                // Use mock AI analysis
                const analysisResult = await analyzeWithAI(contentToAnalyze, jobDescription);
                setAnalysis(analysisResult);
            }

            // Save to history
            const newAnalysis = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                score: analysis?.overallScore || 0,
                type: selectedFile ? 'file' : resumeData ? 'resume' : urlInput ? 'url' : 'unknown',
                fileName: selectedFile?.name || currentResume?.title || 'Current Resume',
                aiModel: aiModel
            };

            const updatedHistory = [newAnalysis, ...analysisHistory.slice(0, 9)];
            setAnalysisHistory(updatedHistory);
            localStorage.setItem('resumeAnalysisHistory', JSON.stringify(updatedHistory));

            toast.success('AI analysis complete!');
        } catch (error) {
            console.error('Analysis error:', error);
            toast.error(error.message || 'Failed to analyze resume');
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Mock AI Analysis function
    const analyzeWithAI = async (content, jobDesc = '') => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generate realistic scores based on content length
                const contentLength = content.length;
                const baseScore = Math.min(85 + Math.floor(contentLength / 1000), 95);
                const randomVariation = Math.floor(Math.random() * 10) - 5;
                const score = Math.max(60, Math.min(95, baseScore + randomVariation));

                const analysisResult = {
                    overallScore: score,
                    atsScore: Math.min(100, score + 3),
                    wordCount: Math.floor(contentLength / 5),
                    readTime: `${Math.ceil(contentLength / 1500)} minutes`,
                    lastAnalyzed: new Date().toLocaleString(),
                    aiModel: aiModel,
                    analysisId: `ai_${Date.now()}`,
                    contentLength: contentLength,

                    sections: {
                        personalInfo: {
                            score: 28,
                            maxScore: 30,
                            status: 'excellent',
                            suggestions: ['Add LinkedIn profile for better networking'],
                            completeness: 95
                        },
                        summary: {
                            score: 16,
                            maxScore: 20,
                            status: 'good',
                            suggestions: ['Add more quantifiable achievements', 'Include industry keywords'],
                            completeness: 80
                        },
                        experience: {
                            score: 22,
                            maxScore: 30,
                            status: 'good',
                            suggestions: ['Add more achievement metrics', 'Include specific technologies used'],
                            completeness: 73
                        },
                        education: {
                            score: 9,
                            maxScore: 10,
                            status: 'excellent',
                            suggestions: [],
                            completeness: 90
                        },
                        skills: {
                            score: 13,
                            maxScore: 15,
                            status: 'good',
                            suggestions: ['Categorize skills by proficiency level'],
                            completeness: 87
                        }
                    },

                    suggestions: [
                        {
                            type: 'critical',
                            title: 'Add Achievement Metrics',
                            description: 'Include quantifiable results in your experience section to demonstrate impact',
                            priority: 'high',
                            section: 'experience',
                            fix: 'Add numbers, percentages, and specific results to your achievements. For example: "Increased sales by 30%" or "Reduced processing time by 40%"'
                        },
                        {
                            type: 'improvement',
                            title: 'Enhance Professional Summary',
                            description: 'Make your summary more compelling with action verbs and industry keywords',
                            priority: 'medium',
                            section: 'summary',
                            fix: 'Start with a strong action verb and include 3-5 key industry terms relevant to your target role'
                        },
                        {
                            type: 'suggestion',
                            title: 'Add LinkedIn Profile',
                            description: 'Include your LinkedIn profile in personal information for better networking',
                            priority: 'low',
                            section: 'personalInfo',
                            fix: 'Add your LinkedIn URL to the personal information section'
                        },
                        {
                            type: 'improvement',
                            title: 'Categorize Skills',
                            description: 'Organize skills by category and proficiency level',
                            priority: 'medium',
                            section: 'skills',
                            fix: 'Group skills into categories like Technical, Soft Skills, Tools, etc. and indicate proficiency (Beginner, Intermediate, Expert)'
                        }
                    ],

                    strengths: [
                        'Clear and professional contact information',
                        'Well-structured education section',
                        'Good variety of technical skills',
                        'Appropriate resume length',
                        'Clean formatting and organization',
                        'Relevant work experience listed',
                        'Good use of industry terminology'
                    ],

                    weaknesses: [
                        'Lack of quantifiable achievements',
                        'Could use more action verbs',
                        'Missing some industry keywords',
                        'Skills not categorized by proficiency'
                    ],

                    industryComparison: {
                        experienceEntries: { current: resumeData?.experience?.length || 3, average: '3-5' },
                        skillsListed: { current: resumeData?.skills?.length || 8, average: '8-12' },
                        summaryLength: { current: resumeData?.summary?.length || 245, average: '150-400' },
                        achievementMetrics: { current: 2, average: '3-5' }
                    },

                    keywordAnalysis: {
                        missingKeywords: ['leadership', 'management', 'optimization', 'automation', 'strategy', 'innovation'],
                        foundKeywords: ['development', 'javascript', 'react', 'node.js', 'database', 'web', 'application', 'software'],
                        keywordDensity: 'Good',
                        jobMatchScore: jobDesc ? Math.floor(Math.random() * 30) + 60 : null,
                        keywordSuggestions: ['Consider adding more leadership-related keywords for management roles']
                    },

                    aiInsights: [
                        'Your resume shows strong technical expertise but could benefit from more leadership examples',
                        'Consider adding metrics to quantify your achievements - this increases impact by 40%',
                        'The structure is clean and easy to read for both humans and ATS systems',
                        'Skills section is comprehensive but could be better organized',
                        'Education section is well-formatted and complete'
                    ],

                    improvementPlan: {
                        priority1: 'Add 3-5 quantifiable achievements to experience section',
                        priority2: 'Optimize summary with action verbs and target role keywords',
                        priority3: 'Categorize skills and add proficiency levels',
                        estimatedTime: '30-45 minutes',
                        expectedImprovement: '15-25 points',
                        difficulty: 'Medium'
                    },

                    nextSteps: [
                        'Review the suggestions below and implement them in your resume',
                        'Use the "Apply Suggestions" button to automatically update your resume',
                        'Re-analyze after making changes to track improvement',
                        'Consider getting feedback from industry professionals'
                    ]
                };

                resolve(analysisResult);
            }, 2500);
        });
    };

    // Clear file
    const clearFile = () => {
        setSelectedFile(null);
        setFileContent('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Clear URL input
    const clearUrlInput = () => {
        setUrlInput('');
    };

    // Clear all inputs
    const clearAllInputs = () => {
        clearFile();
        clearUrlInput();
        setJobDescription('');
        setAnalysis(null);
    };

    // Generate report
    const generateReport = () => {
        if (!analysis) {
            toast.error('No analysis available to export');
            return;
        }

        const report = {
            analysis: analysis,
            resumeData: resumeData,
            fileContent: fileContent,
            previewContent: previewContent,
            generatedAt: new Date().toISOString(),
            aiModel: aiModel,
            jobDescription: jobDescription || 'Not provided',
            source: selectedFile ? `File: ${selectedFile.name}` :
                urlInput ? `URL: ${urlInput}` :
                    'Current Resume'
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resume-analysis-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('Report downloaded successfully!');
    };

    // Share analysis
    const shareAnalysis = async () => {
        if (!analysis) {
            toast.error('No analysis to share');
            return;
        }

        const shareData = {
            title: 'Resume Analysis Report',
            text: `My resume scored ${analysis.overallScore}/100 on the AI Resume Analyzer!`,
            url: window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Analysis shared successfully!');
            } catch (err) {
                console.log('Share cancelled:', err);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareData.text + '\n' + shareData.url);
            toast.success('Analysis link copied to clipboard!');
        }
    };

    // Apply suggestions to resume
    const applySuggestions = () => {
        if (!analysis) {
            toast.error('No analysis available');
            return;
        }

        // Navigate to builder with analysis data
        navigate('/builder', {
            state: {
                analysis: analysis,
                suggestions: analysis.suggestions
            }
        });

        toast.success('Navigating to resume builder with suggestions...');
    };

    // View analysis history item
    const viewHistoryItem = (item) => {
        // In production, you would load the saved analysis
        toast.success(`Loading analysis from ${new Date(item.timestamp).toLocaleDateString()}`);

        // For now, just show a message
        setAnalysis({
            overallScore: item.score,
            aiModel: item.aiModel || 'openai',
            lastAnalyzed: new Date(item.timestamp).toLocaleString(),
            // Add mock data for display
            sections: {
                personalInfo: { score: 25, maxScore: 30, status: 'good' },
                summary: { score: 16, maxScore: 20, status: 'good' }
            }
        });
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981'; // Green
        if (score >= 70) return '#3b82f6'; // Blue
        if (score >= 50) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const getScoreEmoji = (score) => {
        if (score >= 90) return '🎯';
        if (score >= 70) return '👍';
        if (score >= 50) return '🤔';
        return '📝';
    };

    if (isAnalyzing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="mb-8"
                    >
                        <div className="relative inline-block">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <FaRobot className="text-blue-600 text-2xl" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-gray-900 mb-2"
                    >
                        AI Analysis in Progress
                    </motion.h2>

                    <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 mb-2"
                    >
                        Analyzing with {aiModel === 'openai' ? 'OpenAI GPT-4' :
                            aiModel === 'gemini' ? 'Google Gemini' :
                                aiModel === 'claude' ? 'Anthropic Claude' : 'Custom AI'}
                    </motion.p>

                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                        className="h-2 bg-blue-200 rounded-full overflow-hidden mb-8"
                    >
                        <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="text-sm text-gray-500 space-y-1"
                    >
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Extracting text content
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            Analyzing structure and format
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            Checking keyword optimization
                        </p>
                        <p className="flex items-center justify-center gap-2">
                            <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                            Generating improvement suggestions
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <FaArrowLeft />
                                <span className="hidden sm:inline">Dashboard</span>
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    AI Resume Analyzer
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-base">
                                    Upload, analyze, and optimize your resume with AI
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {analysis && (
                                <>
                                    <button
                                        onClick={shareAnalysis}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FaShare />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                    <button
                                        onClick={generateReport}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <FaDownload />
                                        <span className="hidden sm:inline">Export</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={performAnalysis}
                                disabled={isAnalyzing || isUploading || (!resumeData && !fileContent && !previewContent)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaMagic />
                                <span className="hidden sm:inline">Analyze with AI</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Upload & Input Section */}
                {!analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Clear All Button */}
                        {(selectedFile || urlInput || jobDescription) && (
                            <div className="flex justify-end">
                                <button
                                    onClick={clearAllInputs}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaTimes />
                                    Clear All Inputs
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left Column - File Upload & URL */}
                            <div className="space-y-6">
                                {/* File Upload Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FaUpload className="text-blue-600 text-xl" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Upload Resume File
                                        </h3>
                                    </div>

                                    <div
                                        ref={dropAreaRef}
                                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors bg-gray-50 hover:bg-blue-50"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <div className="relative w-16 h-16 mx-auto mb-4">
                                            <FaFilePdf className="absolute text-4xl text-red-500" />
                                            <FaFileWord className="absolute text-4xl text-blue-500 ml-4 mt-4" />
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                            accept=".pdf,.doc,.docx,.txt,.json,.html"
                                        />

                                        <p className="text-gray-700 font-medium mb-2">
                                            Drag & drop your resume here
                                        </p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            or click to browse files
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Supports PDF, DOC, DOCX, TXT, JSON, HTML (Max 10MB)
                                        </p>
                                    </div>

                                    {selectedFile && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {selectedFile.type === 'application/pdf' ? (
                                                        <FaFilePdf className="text-red-500 text-xl" />
                                                    ) : selectedFile.type.includes('word') ? (
                                                        <FaFileWord className="text-blue-500 text-xl" />
                                                    ) : (
                                                        <FaFileAlt className="text-gray-500 text-xl" />
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-900">{selectedFile.name}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={clearFile}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove file"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}

                                    {isUploading && (
                                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600"></div>
                                                <p className="text-yellow-800">Processing file...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* URL Input Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FaGlobe className="text-green-600 text-xl" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Or Analyze from URL
                                        </h3>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type="url"
                                            value={urlInput}
                                            onChange={(e) => setUrlInput(e.target.value)}
                                            placeholder="https://linkedin.com/in/yourprofile or https://yourportfolio.com"
                                            className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                        />
                                        {urlInput && (
                                            <button
                                                onClick={clearUrlInput}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={analyzeFromUrl}
                                            disabled={!urlInput || isUploading}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Extract Content
                                        </button>
                                        <button
                                            onClick={() => setUrlInput('https://linkedin.com/in/')}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <FaLink />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Paste a URL to your LinkedIn profile, portfolio, or online resume
                                    </p>
                                </div>
                            </div>

                            {/* Right Column - Options & History */}
                            <div className="space-y-6">
                                {/* Current Resume Selection */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FaFileAlt className="text-purple-600 text-xl" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Analyze Current Resume
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {currentResume
                                                            ? currentResume.title
                                                            : 'No resume selected'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {currentResume
                                                            ? `${currentResume.data?.experience?.length || 0} experiences • ${currentResume.data?.skills?.length || 0} skills`
                                                            : 'Select a resume from your dashboard'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <button
                                                        onClick={() => navigate('/dashboard')}
                                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {previewContent && (
                                            <div className="border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                                    {previewContent.substring(0, 300)}
                                                    {previewContent.length > 300 ? '...' : ''}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* AI Model Selection */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FaRobot className="text-indigo-600 text-xl" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            AI Model Selection
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: 'openai', name: 'GPT-4', icon: '🤖', desc: 'Most accurate', color: 'bg-blue-50 border-blue-200' },
                                            { id: 'gemini', name: 'Gemini', icon: '🔍', desc: 'Fast analysis', color: 'bg-red-50 border-red-200' },
                                            { id: 'claude', name: 'Claude 3', icon: '🧠', desc: 'Detailed insights', color: 'bg-purple-50 border-purple-200' },
                                            { id: 'custom', name: 'Custom AI', icon: '⚡', desc: 'Resume trained', color: 'bg-green-50 border-green-200' }
                                        ].map((model) => (
                                            <button
                                                key={model.id}
                                                onClick={() => setAiModel(model.id)}
                                                className={`p-3 border rounded-lg text-center transition-all ${aiModel === model.id
                                                    ? `${model.color} ring-2 ring-offset-2 ${model.id === 'openai' ? 'ring-blue-500' :
                                                        model.id === 'gemini' ? 'ring-red-500' :
                                                            model.id === 'claude' ? 'ring-purple-500' : 'ring-green-500'}`
                                                    : 'border-gray-200 hover:bg-gray-50'}`}
                                            >
                                                <div className="text-2xl mb-1">{model.icon}</div>
                                                <div className="font-semibold text-gray-900">{model.name}</div>
                                                <div className="text-xs text-gray-500 mt-1">{model.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <FaBullseye className="text-red-600 text-xl" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Target Job Description (Optional)
                                        </h3>
                                    </div>

                                    <textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste a job description to get tailored analysis and keyword matching..."
                                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Get personalized suggestions for a specific job role
                                    </p>
                                </div>

                                {/* Analysis History */}
                                {analysisHistory.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <FaHistory className="text-gray-600 text-xl" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Recent Analysis
                                            </h3>
                                        </div>

                                        <div className="space-y-2">
                                            {analysisHistory.slice(0, 3).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                                    onClick={() => viewHistoryItem(item)}
                                                >
                                                    <div>
                                                        <p className="font-medium text-gray-900">{item.fileName}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(item.timestamp).toLocaleDateString()} • {item.type}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-blue-600">{item.score}/100</p>
                                                        <p className="text-xs text-gray-500 capitalize">{item.aiModel}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <div className="text-center">
                            <button
                                onClick={performAnalysis}
                                disabled={isAnalyzing || isUploading || (!resumeData && !fileContent && !previewContent)}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-lg hover:shadow-xl"
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Analyzing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <FaMagic />
                                        Start AI Analysis
                                    </span>
                                )}
                            </button>
                            <p className="text-sm text-gray-500 mt-3">
                                {getScoreEmoji(85)} Get detailed feedback and improvement suggestions
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Analysis Results */}
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* AI Insights Banner */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex flex-col md:flex-row items-center justify-between">
                                <div className="mb-4 md:mb-0">
                                    <h2 className="text-2xl font-bold mb-2">AI Analysis Complete!</h2>
                                    <p className="opacity-90">
                                        Your resume was analyzed using {aiModel === 'openai' ? 'OpenAI GPT-4' :
                                            aiModel === 'gemini' ? 'Google Gemini' :
                                                aiModel === 'claude' ? 'Anthropic Claude' : 'Custom AI'} AI
                                    </p>
                                    <p className="text-sm opacity-80 mt-1">
                                        Analysis ID: {analysis.analysisId} • {analysis.lastAnalyzed}
                                    </p>
                                </div>
                                <div className="text-center md:text-right">
                                    <div className="text-4xl font-bold mb-1">{analysis.overallScore}</div>
                                    <div className="text-lg opacity-90">Overall Score</div>
                                    <div className="text-sm opacity-80 mt-1">
                                        ATS Score: {analysis.atsScore} • Words: {analysis.wordCount}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-blue-600">{analysis.sections.personalInfo.score}/{analysis.sections.personalInfo.maxScore}</div>
                                <div className="text-sm text-gray-600">Personal Info</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{analysis.sections.experience.score}/{analysis.sections.experience.maxScore}</div>
                                <div className="text-sm text-gray-600">Experience</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">{analysis.sections.skills.score}/{analysis.sections.skills.maxScore}</div>
                                <div className="text-sm text-gray-600">Skills</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{analysis.sections.education.score}/{analysis.sections.education.maxScore}</div>
                                <div className="text-sm text-gray-600">Education</div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex overflow-x-auto mb-8 border-b border-gray-200">
                            {[
                                { id: 'overview', label: 'Overview', icon: FaChartBar },
                                { id: 'suggestions', label: 'AI Suggestions', icon: FaLightbulb },
                                { id: 'keywords', label: 'Keyword Analysis', icon: FaCogs },
                                { id: 'comparison', label: 'Comparison', icon: FaBriefcase },
                                { id: 'insights', label: 'AI Insights', icon: FaRobot },
                                { id: 'plan', label: 'Improvement Plan', icon: FaAward }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <tab.icon />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <OverviewTab analysis={analysis} getScoreColor={getScoreColor} />
                                    </motion.div>
                                )}

                                {activeTab === 'suggestions' && (
                                    <motion.div
                                        key="suggestions"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <SuggestionsTab analysis={analysis} />
                                    </motion.div>
                                )}

                                {activeTab === 'keywords' && (
                                    <motion.div
                                        key="keywords"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <KeywordAnalysisTab analysis={analysis} jobDescription={jobDescription} />
                                    </motion.div>
                                )}

                                {activeTab === 'comparison' && (
                                    <motion.div
                                        key="comparison"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <ComparisonTab analysis={analysis} />
                                    </motion.div>
                                )}

                                {activeTab === 'insights' && (
                                    <motion.div
                                        key="insights"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <AIInsightsTab analysis={analysis} />
                                    </motion.div>
                                )}

                                {activeTab === 'plan' && (
                                    <motion.div
                                        key="plan"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-6"
                                    >
                                        <ImprovementPlanTab analysis={analysis} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex flex-wrap justify-center gap-4 mt-8"
                        >
                            <button
                                onClick={applySuggestions}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-colors font-semibold"
                            >
                                <FaEdit />
                                Apply Suggestions to Resume
                            </button>
                            <button
                                onClick={generateReport}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                <FaDownload />
                                Download Full Report
                            </button>
                            <button
                                onClick={() => setAnalysis(null)}
                                className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            >
                                <FaSync />
                                New Analysis
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Sub-components for each tab (Updated versions)
// [Keep the same sub-components from the previous implementation]
// Make sure to import them properly

export default Analyzer;