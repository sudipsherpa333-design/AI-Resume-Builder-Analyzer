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
    FaTimes,
    FaSpinner,
    FaEye,
    FaCopy,
    FaExclamationCircle,
    FaInfoCircle
} from 'react-icons/fa';
import { useResume } from '../context/ResumeContext';
import toast from 'react-hot-toast';

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
    const [aiModel, setAiModel] = useState('openai');
    const [jobDescription, setJobDescription] = useState('');
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [previewContent, setPreviewContent] = useState('');
    const [showContentPreview, setShowContentPreview] = useState(false);

    const fileInputRef = useRef(null);
    const dropAreaRef = useRef(null);

    // Load resume data and history
    useEffect(() => {
        const loadData = () => {
            try {
                if (currentResume) {
                    const data = currentResume.data || currentResume.content || {};
                    setResumeData(data);
                    generatePreview(data);
                } else {
                    const savedDraft = localStorage.getItem('resumeDraft');
                    if (savedDraft) {
                        const parsed = JSON.parse(savedDraft);
                        const data = parsed.data || parsed;
                        setResumeData(data);
                        generatePreview(data);
                    }
                }

                const savedHistory = localStorage.getItem('resumeAnalysisHistory');
                if (savedHistory) {
                    setAnalysisHistory(JSON.parse(savedHistory));
                }
            } catch (error) {
                console.error('Error loading data:', error);
                toast.error('Failed to load resume data');
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

        if (data.summary) {
            preview += `SUMMARY\n${data.summary}\n\n`;
        }

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

        if (data.education && data.education.length > 0) {
            preview += `EDUCATION\n`;
            data.education.forEach((edu, index) => {
                preview += `${edu.degree} at ${edu.institution}\n`;
                preview += `${edu.startDate} - ${edu.endDate || 'Present'}\n\n`;
            });
        }

        if (data.skills && data.skills.length > 0) {
            preview += `SKILLS\n`;
            data.skills.forEach((skill, index) => {
                if (typeof skill === 'string') {
                    preview += `${skill}\n`;
                } else if (skill.name) {
                    preview += `${skill.name}: ${skill.level || ''}\n`;
                }
            });
            preview += '\n';
        }

        setPreviewContent(preview);
    };

    // Handle file selection
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;

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
                    content = `PDF Content: ${file.name}\n\nMock extracted content from PDF file.\nThis would contain the actual text from your resume.\n\nFile info:\n- Name: ${file.name}\n- Size: ${(file.size / 1024).toFixed(2)} KB\n- Type: ${file.type}`;
                } else if (file.type.includes('word')) {
                    content = `DOCX Content: ${file.name}\n\nMock extracted content from Word document.\nThis would contain the actual text from your resume.\n\nFile info:\n- Name: ${file.name}\n- Size: ${(file.size / 1024).toFixed(2)} KB\n- Type: ${file.type}`;
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

        if (file.type === 'application/pdf' || file.type.includes('word')) {
            reader.readAsArrayBuffer(file);
        } else {
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
            if (dropArea) {
                dropArea.classList.add('border-blue-500', 'bg-blue-50');
            }
        };

        const unhighlight = () => {
            if (dropArea) {
                dropArea.classList.remove('border-blue-500', 'bg-blue-50');
            }
        };

        const handleDrop = (e) => {
            preventDefaults(e);
            unhighlight();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
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

        try {
            new URL(urlInput);
        } catch {
            toast.error('Please enter a valid URL');
            return;
        }

        setIsUploading(true);
        try {
            setTimeout(() => {
                setFileContent(`Content from URL: ${urlInput}\n\nMock extracted content from the provided URL.\nThis would contain actual text from LinkedIn, portfolio, or online resume.\n\nURL: ${urlInput}\nTimestamp: ${new Date().toISOString()}`);
                toast.success('URL content extracted successfully! Ready for analysis.');
                setUrlInput('');
                setIsUploading(false);
            }, 1500);
        } catch (error) {
            console.error('Error extracting URL:', error);
            toast.error('Failed to extract content from URL');
            setIsUploading(false);
        }
    };

    // Main analysis function
    const performAnalysis = async () => {
        const hasContent = resumeData || fileContent || selectedFile || previewContent;

        if (!hasContent) {
            toast.error('Please upload a resume file, enter a URL, or select a resume to analyze');
            return;
        }

        setIsAnalyzing(true);
        setAnalysis(null);

        try {
            let contentToAnalyze = '';

            if (fileContent) {
                contentToAnalyze = fileContent;
            } else if (previewContent) {
                contentToAnalyze = previewContent;
            } else if (resumeData) {
                contentToAnalyze = JSON.stringify(resumeData, null, 2);
            }

            const loadingToast = toast.loading('AI is analyzing your resume...');

            // Mock AI analysis
            setTimeout(() => {
                const contentLength = contentToAnalyze.length;
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
                    analysisSource: selectedFile ? 'File' : resumeData ? 'Resume' : 'URL',
                    analyzedAt: new Date().toISOString(),

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
                        }
                    ],

                    strengths: [
                        'Clear and professional contact information',
                        'Well-structured education section',
                        'Good variety of technical skills',
                        'Appropriate resume length'
                    ],

                    weaknesses: [
                        'Lack of quantifiable achievements',
                        'Could use more action verbs',
                        'Missing some industry keywords',
                        'Skills not categorized by proficiency'
                    ],

                    industryComparison: {
                        experienceEntries: { current: 3, average: '3-5' },
                        skillsListed: { current: 8, average: '8-12' },
                        summaryLength: { current: 245, average: '150-400' }
                    },

                    keywordAnalysis: {
                        missingKeywords: ['leadership', 'management', 'optimization', 'automation'],
                        foundKeywords: ['development', 'javascript', 'react', 'node.js', 'database'],
                        keywordDensity: 'Good',
                        jobMatchScore: jobDescription ? Math.floor(Math.random() * 30) + 60 : null
                    },

                    aiInsights: [
                        'Your resume shows strong technical expertise but could benefit from more leadership examples',
                        'Consider adding metrics to quantify your achievements - this increases impact by 40%'
                    ],

                    improvementPlan: {
                        priority1: 'Add 3-5 quantifiable achievements to experience section',
                        priority2: 'Optimize summary with action verbs and target role keywords',
                        priority3: 'Categorize skills and add proficiency levels',
                        estimatedTime: '30-45 minutes',
                        expectedImprovement: '15-25 points'
                    }
                };

                setAnalysis(analysisResult);

                // Save to history
                const newAnalysis = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    score: analysisResult.overallScore,
                    type: selectedFile ? 'file' : resumeData ? 'resume' : urlInput ? 'url' : 'unknown',
                    fileName: selectedFile?.name || currentResume?.title || 'Current Resume',
                    aiModel: aiModel,
                    source: 'AI Analysis'
                };

                const updatedHistory = [newAnalysis, ...analysisHistory.slice(0, 9)];
                setAnalysisHistory(updatedHistory);
                localStorage.setItem('resumeAnalysisHistory', JSON.stringify(updatedHistory));

                toast.dismiss(loadingToast);
                toast.success(`Analysis complete! Score: ${analysisResult.overallScore}/100`);
                setIsAnalyzing(false);
            }, 2000);

        } catch (error) {
            console.error('Analysis error:', error);
            toast.error('Failed to analyze resume');
            setIsAnalyzing(false);
        }
    };

    // Generate PDF Report
    const generatePDFReport = () => {
        if (!analysis) {
            toast.error('No analysis available to export');
            return;
        }

        const loadingToast = toast.loading('Generating PDF report...');

        try {
            // Create HTML content for PDF
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Resume Analysis Report</title>
                    <style>
                        body {
                            font-family: 'Helvetica', 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 3px solid #3b82f6;
                        }
                        .header h1 {
                            color: #1e40af;
                            margin-bottom: 10px;
                        }
                        .score-banner {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 25px;
                            border-radius: 12px;
                            margin-bottom: 30px;
                        }
                        .score-display {
                            font-size: 60px;
                            font-weight: bold;
                            text-align: center;
                            margin: 20px 0;
                        }
                        .section {
                            margin-bottom: 30px;
                            page-break-inside: avoid;
                        }
                        .section-title {
                            color: #1e40af;
                            border-bottom: 2px solid #e5e7eb;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }
                        .score-grid {
                            display: grid;
                            grid-template-columns: repeat(2, 1fr);
                            gap: 15px;
                            margin-top: 15px;
                        }
                        .score-card {
                            background: #f9fafb;
                            padding: 15px;
                            border-radius: 8px;
                            text-align: center;
                        }
                        .score-value {
                            font-size: 24px;
                            font-weight: bold;
                            color: #1e40af;
                        }
                        .suggestion-item {
                            background: #f8fafc;
                            padding: 15px;
                            border-left: 4px solid #3b82f6;
                            margin-bottom: 15px;
                            border-radius: 0 8px 8px 0;
                        }
                        .priority-high {
                            border-left-color: #ef4444;
                        }
                        .priority-medium {
                            border-left-color: #f59e0b;
                        }
                        .keyword-badge {
                            display: inline-block;
                            background: #10b981;
                            color: white;
                            padding: 4px 12px;
                            border-radius: 20px;
                            margin: 3px;
                            font-size: 12px;
                        }
                        .keyword-missing {
                            background: #ef4444;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                            color: #6b7280;
                            font-size: 12px;
                        }
                        @media print {
                            .no-print {
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>AI Resume Analysis Report</h1>
                        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>AI Model:</strong> ${aiModel === 'openai' ? 'OpenAI GPT-4' :
                    aiModel === 'gemini' ? 'Google Gemini' :
                        aiModel === 'claude' ? 'Anthropic Claude' : 'Custom AI'}</p>
                        <p><strong>Source:</strong> ${analysis.analysisSource || 'Resume Analysis'}</p>
                    </div>

                    <div class="score-banner">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h2 style="margin: 0 0 10px 0; color: white;">Overall Analysis Score</h2>
                                <p style="margin: 0; opacity: 0.9;">${analysis.analysisId || 'Analysis Report'}</p>
                            </div>
                            <div style="text-align: right;">
                                <div class="score-display">${analysis.overallScore}/100</div>
                                <div style="font-size: 16px; opacity: 0.9;">ATS Score: ${analysis.atsScore}/100</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Score Breakdown</h3>
                        <div class="score-grid">
                            ${Object.entries(analysis.sections || {}).map(([key, section]) => `
                                <div class="score-card">
                                    <div class="score-value">${section.score}/${section.maxScore}</div>
                                    <div style="color: #6b7280; margin-top: 5px; text-transform: capitalize;">
                                        ${key.replace(/([A-Z])/g, ' $1')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="section">
                        <h3 class="section-title">Strengths & Areas for Improvement</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <div>
                                <h4 style="color: #10b981; margin-bottom: 10px;">✅ Strengths</h4>
                                <ul style="margin: 0; padding-left: 20px;">
                                    ${(analysis.strengths || []).map(strength => `
                                        <li style="margin-bottom: 8px;">${strength}</li>
                                    `).join('')}
                                </ul>
                            </div>
                            <div>
                                <h4 style="color: #ef4444; margin-bottom: 10px;">⚠️ Areas for Improvement</h4>
                                <ul style="margin: 0; padding-left: 20px;">
                                    ${(analysis.weaknesses || []).map(weakness => `
                                        <li style="margin-bottom: 8px;">${weakness}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>

                    ${analysis.suggestions && analysis.suggestions.length > 0 ? `
                        <div class="section">
                            <h3 class="section-title">AI Improvement Suggestions</h3>
                            ${analysis.suggestions.map((suggestion, index) => `
                                <div class="suggestion-item ${suggestion.priority === 'high' ? 'priority-high' :
                                suggestion.priority === 'medium' ? 'priority-medium' : ''}">
                                    <h4 style="margin: 0 0 8px 0; color: #1e293b;">
                                        ${suggestion.title} 
                                        <span style="font-size: 12px; background: ${suggestion.priority === 'high' ? '#ef4444' :
                                suggestion.priority === 'medium' ? '#f59e0b' : '#3b82f6'}; 
                                            color: white; padding: 2px 8px; border-radius: 4px; margin-left: 10px;">
                                            ${suggestion.priority} priority
                                        </span>
                                    </h4>
                                    <p style="margin: 0 0 10px 0; color: #4b5563;">${suggestion.description}</p>
                                    <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
                                        <strong>How to fix:</strong> ${suggestion.fix}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${analysis.keywordAnalysis ? `
                        <div class="section">
                            <h3 class="section-title">Keyword Analysis</h3>
                            <div style="margin-bottom: 20px;">
                                <h4 style="color: #10b981; margin-bottom: 10px;">Keywords Found (${analysis.keywordAnalysis.foundKeywords?.length || 0})</h4>
                                <div>
                                    ${(analysis.keywordAnalysis.foundKeywords || []).map(keyword => `
                                        <span class="keyword-badge">${keyword}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <div>
                                <h4 style="color: #ef4444; margin-bottom: 10px;">Suggested Keywords to Add</h4>
                                <div>
                                    ${(analysis.keywordAnalysis.missingKeywords || []).map(keyword => `
                                        <span class="keyword-badge keyword-missing">${keyword}</span>
                                    `).join('')}
                                </div>
                            </div>
                            <p style="margin-top: 15px; color: #6b7280;">
                                <strong>Keyword Density:</strong> ${analysis.keywordAnalysis.keywordDensity || 'Good'}
                                ${analysis.keywordAnalysis.jobMatchScore ? `<br><strong>Job Match Score:</strong> ${analysis.keywordAnalysis.jobMatchScore}%` : ''}
                            </p>
                        </div>
                    ` : ''}

                    <div class="section">
                        <h3 class="section-title">Improvement Plan</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px;">
                                <h4 style="margin: 0 0 10px 0; color: white;">Priority 1</h4>
                                <p style="margin: 0; opacity: 0.9;">${analysis.improvementPlan?.priority1 || 'Add quantifiable achievements'}</p>
                            </div>
                            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 10px;">
                                <h4 style="margin: 0 0 10px 0; color: white;">Priority 2</h4>
                                <p style="margin: 0; opacity: 0.9;">${analysis.improvementPlan?.priority2 || 'Optimize summary section'}</p>
                            </div>
                            <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 10px;">
                                <h4 style="margin: 0 0 10px 0; color: white;">Priority 3</h4>
                                <p style="margin: 0; opacity: 0.9;">${analysis.improvementPlan?.priority3 || 'Categorize skills'}</p>
                            </div>
                        </div>
                        <p><strong>Estimated Time:</strong> ${analysis.improvementPlan?.estimatedTime || '30-45 minutes'}</p>
                        <p><strong>Expected Improvement:</strong> ${analysis.improvementPlan?.expectedImprovement || '15-25 points'}</p>
                    </div>

                    <div class="section">
                        <h3 class="section-title">AI Insights</h3>
                        ${(analysis.aiInsights || []).map(insight => `
                            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3b82f6;">
                                <p style="margin: 0; color: #1e40af;">💡 ${insight}</p>
                            </div>
                        `).join('')}
                    </div>

                    <div class="footer">
                        <p>Generated by AI Resume Analyzer • ${new Date().getFullYear()}</p>
                        <p>Report ID: ${analysis.analysisId || 'N/A'} • Analysis Date: ${analysis.lastAnalyzed}</p>
                        <p class="no-print">This report was automatically generated based on AI analysis of your resume.</p>
                    </div>
                </body>
                </html>
            `;

            // Create a blob from HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);

            // Create a link element
            const link = document.createElement('a');
            link.href = url;
            link.download = `Resume-Analysis-Report-${new Date().getTime()}.pdf`;

            // Append to body, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up URL object
            URL.revokeObjectURL(url);

            toast.dismiss(loadingToast);
            toast.success('PDF report downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to generate PDF report');
        }
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
        toast.success('All inputs cleared');
    };

    // Share analysis
    const shareAnalysis = async () => {
        if (!analysis) {
            toast.error('No analysis to share');
            return;
        }

        try {
            const shareData = {
                title: 'Resume Analysis Report',
                text: `My resume scored ${analysis.overallScore}/100 on the AI Resume Analyzer!`,
                url: window.location.href
            };

            if (navigator.share) {
                await navigator.share(shareData);
                toast.success('Analysis shared successfully!');
            } else {
                await navigator.clipboard.writeText(shareData.text + '\n' + shareData.url);
                toast.success('Analysis link copied to clipboard!');
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
                toast.error('Failed to share analysis');
            }
        }
    };

    // Apply suggestions to resume
    const applySuggestions = () => {
        if (!analysis) {
            toast.error('No analysis available');
            return;
        }

        navigate('/builder', {
            state: {
                analysis: analysis,
                suggestions: analysis.suggestions,
                fromAnalyzer: true
            }
        });

        toast.success('Navigating to resume builder with suggestions...');
    };

    // View analysis history item
    const viewHistoryItem = (item) => {
        toast.success(`Loading analysis from ${new Date(item.timestamp).toLocaleDateString()}`);

        setAnalysis({
            overallScore: item.score,
            aiModel: item.aiModel || 'openai',
            lastAnalyzed: new Date(item.timestamp).toLocaleString(),
            analysisId: `history_${item.id}`,
            analysisSource: 'History',
            sections: {
                personalInfo: { score: 25, maxScore: 30, status: 'good' },
                summary: { score: 16, maxScore: 20, status: 'good' }
            }
        });
    };

    // Copy content to clipboard
    const copyToClipboard = async () => {
        const content = fileContent || previewContent || '';
        if (!content) {
            toast.error('No content to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(content);
            toast.success('Content copied to clipboard!');
        } catch (error) {
            console.error('Copy failed:', error);
            toast.error('Failed to copy content');
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 70) return '#3b82f6';
        if (score >= 50) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreEmoji = (score) => {
        if (score >= 90) return '🎯 Excellent';
        if (score >= 70) return '👍 Good';
        if (score >= 50) return '🤔 Average';
        return '📝 Needs Work';
    };

    const getCurrentContent = () => {
        if (fileContent) return fileContent;
        if (previewContent) return previewContent;
        if (resumeData) return JSON.stringify(resumeData, null, 2);
        return '';
    };

    const currentContent = getCurrentContent();
    const hasContentForAnalysis = currentContent.length > 0;

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
                        className="text-sm text-gray-500 space-y-2"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Extracting text content</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <span>Analyzing structure and format</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <span>Checking keyword optimization</span>
                        </div>
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
                                        title="Share analysis"
                                    >
                                        <FaShare />
                                        <span className="hidden sm:inline">Share</span>
                                    </button>
                                    <button
                                        onClick={generatePDFReport}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        title="Export PDF report"
                                    >
                                        <FaFilePdf />
                                        <span className="hidden sm:inline">PDF Report</span>
                                    </button>
                                </>
                            )}
                            <button
                                onClick={performAnalysis}
                                disabled={isAnalyzing || isUploading || !hasContentForAnalysis}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={!hasContentForAnalysis ? "Please upload or select a resume first" : "Start AI analysis"}
                            >
                                {isAnalyzing ? (
                                    <FaSpinner className="animate-spin" />
                                ) : (
                                    <FaMagic />
                                )}
                                <span className="hidden sm:inline">
                                    {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                                </span>
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
                        {/* Content Preview Panel */}
                        {hasContentForAnalysis && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <FaEye className="text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Content Ready for Analysis
                                        </h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowContentPreview(!showContentPreview)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <FaEye />
                                            {showContentPreview ? 'Hide' : 'Show'} Preview
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <FaCopy />
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 mb-2">
                                    Content length: {currentContent.length} characters
                                    {selectedFile && ` • File: ${selectedFile.name}`}
                                    {currentResume && ` • Resume: ${currentResume.title}`}
                                </div>

                                {showContentPreview && (
                                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {currentContent.substring(0, 1000)}
                                            {currentContent.length > 1000 ? '...' : ''}
                                        </pre>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600">
                                    <FaCheckCircle />
                                    <span>Content ready for AI analysis. Click "Analyze with AI" to start.</span>
                                </div>
                            </div>
                        )}

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
                                                <FaSpinner className="animate-spin text-yellow-600" />
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
                                disabled={isAnalyzing || isUploading || !hasContentForAnalysis}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-lg hover:shadow-xl"
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center gap-2">
                                        <FaSpinner className="animate-spin" />
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
                                <div className="text-2xl font-bold text-blue-600">{analysis.sections?.personalInfo?.score || 0}/{analysis.sections?.personalInfo?.maxScore || 30}</div>
                                <div className="text-sm text-gray-600">Personal Info</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-green-600">{analysis.sections?.experience?.score || 0}/{analysis.sections?.experience?.maxScore || 30}</div>
                                <div className="text-sm text-gray-600">Experience</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-purple-600">{analysis.sections?.skills?.score || 0}/{analysis.sections?.skills?.maxScore || 15}</div>
                                <div className="text-sm text-gray-600">Skills</div>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-600">{analysis.sections?.education?.score || 0}/{analysis.sections?.education?.maxScore || 10}</div>
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
                                onClick={generatePDFReport}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                            >
                                <FaFilePdf />
                                Download PDF Report
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

// Sub-components for each tab (keep these the same as before)
const OverviewTab = ({ analysis, getScoreColor }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">Overall Analysis</h3>
            <div className="text-sm text-gray-500">
                <FaClock className="inline mr-1" />
                {analysis.lastAnalyzed}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="text-5xl font-bold" style={{ color: getScoreColor(analysis.overallScore) }}>
                        {analysis.overallScore}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">Overall Score /100</div>
                        <div className="text-sm text-gray-600">ATS Score: {analysis.atsScore}/100</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">{analysis.overallScore}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${analysis.overallScore}%`,
                                backgroundColor: getScoreColor(analysis.overallScore)
                            }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{analysis.wordCount}</div>
                        <div className="text-sm text-gray-600">Word Count</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{analysis.readTime}</div>
                        <div className="text-sm text-gray-600">Reading Time</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Section Scores</h4>
                {Object.entries(analysis.sections || {}).map(([key, section]) => (
                    <div key={key} className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className="font-medium">{section.score}/{section.maxScore}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${(section.score / section.maxScore) * 100}%`,
                                    backgroundColor: section.status === 'excellent' ? '#10b981' :
                                        section.status === 'good' ? '#3b82f6' :
                                            section.status === 'average' ? '#f59e0b' : '#ef4444'
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Strengths</h4>
                <ul className="space-y-2">
                    {(analysis.strengths || []).map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{strength}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h4 className="font-semibold text-gray-900 mb-3">Areas for Improvement</h4>
                <ul className="space-y-2">
                    {(analysis.weaknesses || []).map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <FaExclamationTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700">{weakness}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

const SuggestionsTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">AI Improvement Suggestions</h3>

        <div className="space-y-4">
            {(analysis.suggestions || []).map((suggestion, index) => (
                <div
                    key={index}
                    className={`p-4 rounded-lg border ${suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                        suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                            'border-blue-200 bg-blue-50'}`}
                >
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded ${suggestion.priority === 'high' ? 'bg-red-100 text-red-600' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-blue-100 text-blue-600'}`}>
                            {suggestion.priority === 'high' ? <FaExclamationTriangle /> :
                                suggestion.priority === 'medium' ? <FaExclamationCircle /> :
                                    <FaInfoCircle />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                    {suggestion.priority} priority
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1 mb-3">{suggestion.description}</p>
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <div className="text-sm font-medium text-gray-700 mb-1">How to fix:</div>
                                <p className="text-gray-600 text-sm">{suggestion.fix}</p>
                            </div>
                            {suggestion.section && suggestion.section !== 'all' && (
                                <div className="mt-3 text-sm text-gray-500">
                                    <FaFileAlt className="inline mr-1" />
                                    Section: {suggestion.section}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const KeywordAnalysisTab = ({ analysis, jobDescription }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Keyword Analysis</h3>

        {analysis.keywordAnalysis ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Keywords Found</h4>
                        <div className="flex flex-wrap gap-2">
                            {(analysis.keywordAnalysis.foundKeywords || []).map((keyword, index) => (
                                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Suggested Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                            {(analysis.keywordAnalysis.missingKeywords || []).map((keyword, index) => (
                                <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">{analysis.keywordAnalysis.keywordDensity || 'Good'}</div>
                        <div className="text-sm text-gray-600">Keyword Density</div>
                    </div>
                    {analysis.keywordAnalysis.jobMatchScore && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="text-lg font-bold text-gray-900">{analysis.keywordAnalysis.jobMatchScore}%</div>
                            <div className="text-sm text-gray-600">Job Match Score</div>
                        </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-lg font-bold text-gray-900">
                            {analysis.keywordAnalysis.foundKeywords?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Keywords Found</div>
                    </div>
                </div>

                {jobDescription && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Job Description Analysis</h4>
                        <p className="text-sm text-gray-700">
                            Your resume matches {analysis.keywordAnalysis.jobMatchScore || '75'}% of keywords from the provided job description.
                        </p>
                    </div>
                )}
            </>
        ) : (
            <div className="text-center py-8 text-gray-500">
                <FaExclamationCircle className="text-4xl mx-auto mb-3 text-yellow-500" />
                <p>Keyword analysis requires AI configuration. Please set up your API keys.</p>
            </div>
        )}
    </div>
);

const ComparisonTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Industry Comparison</h3>

        <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">Experience Entries</div>
                    <div className="text-sm text-gray-600">Industry average: 3-5</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                        </div>
                    </div>
                    <div className="font-bold text-blue-600">3</div>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-gray-900">Skills Listed</div>
                    <div className="text-sm text-gray-600">Industry average: 8-12</div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }} />
                        </div>
                    </div>
                    <div className="font-bold text-blue-600">9</div>
                </div>
            </div>
        </div>
    </div>
);

const AIInsightsTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">AI Insights & Recommendations</h3>

        <div className="space-y-4">
            {(analysis.aiInsights || []).map((insight, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            <FaLightbulb />
                        </div>
                        <p className="text-gray-700">{insight}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ImprovementPlanTab = ({ analysis }) => (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">AI-Powered Improvement Plan</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                <div className="text-2xl font-bold mb-2">Priority 1</div>
                <p className="opacity-90">{analysis.improvementPlan?.priority1 || 'Add quantifiable achievements'}</p>
                <div className="mt-4 text-sm opacity-80">
                    <FaClock className="inline mr-1" />
                    {analysis.improvementPlan?.estimatedTime || '30-45 minutes'}
                </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white">
                <div className="text-2xl font-bold mb-2">Priority 2</div>
                <p className="opacity-90">{analysis.improvementPlan?.priority2 || 'Optimize summary section'}</p>
                <div className="mt-4 text-sm opacity-80">
                    <FaClock className="inline mr-1" />
                    15-20 minutes
                </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                <div className="text-2xl font-bold mb-2">Priority 3</div>
                <p className="opacity-90">{analysis.improvementPlan?.priority3 || 'Categorize skills'}</p>
                <div className="mt-4 text-sm opacity-80">
                    <FaClock className="inline mr-1" />
                    10-15 minutes
                </div>
            </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Expected Results</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-blue-600">
                        +{analysis.improvementPlan?.expectedImprovement?.split('-')[0] || 15}%
                    </div>
                    <div className="text-sm text-gray-600">Score Improvement</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">
                        +{analysis.improvementPlan?.expectedImprovement?.split('-')[1] || 25}
                    </div>
                    <div className="text-sm text-gray-600">ATS Score Increase</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                    <div className="text-2xl font-bold text-purple-600">
                        {analysis.improvementPlan?.difficulty || 'Medium'}
                    </div>
                    <div className="text-sm text-gray-600">Implementation Difficulty</div>
                </div>
            </div>
        </div>
    </div>
);

export default Analyzer;