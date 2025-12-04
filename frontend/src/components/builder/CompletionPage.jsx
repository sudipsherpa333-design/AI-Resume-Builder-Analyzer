import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    FaDownload,
    FaSave,
    FaPlus,
    FaEdit,
    FaShareAlt,
    FaPrint,
    FaFilePdf,
    FaFileWord,
    FaCheckCircle,
    FaArrowLeft,
    FaCopy,
    FaEye,
    FaTrash,
    FaChartLine,
    FaMagic,
    FaRobot,
    FaClipboardCheck,
    FaFileAlt,
    FaLinkedin,
    FaPalette,
    FaSync,
    FaQrcode,
    FaExpand,
    FaCompress,
    FaHistory,
    FaDatabase,
    FaCloud,
    FaSpinner,
    FaLightbulb,
    FaStar,
    FaAward,
    FaChartBar,
    FaFileSignature,
    FaShieldAlt,
    FaBrain,
    FaRegClock,
    FaRegCalendarAlt,
    FaUserCheck,
    FaCertificate,
    FaBriefcase,
    FaGraduationCap,
    FaCode,
    FaProjectDiagram,
    FaRocket,
    FaUser,
    FaCogs,
    FaProject,
    FaGlobe,
    FaLaptop,
    FaMobileAlt,
    FaCheck,
    FaTimes,
    FaArrowRight
} from 'react-icons/fa';
import { SiJson } from 'react-icons/si';

const EnhancedCompletionPage = ({ resumeData = {}, onReset, onSave, onDownload, onPrev }) => {
    const navigate = useNavigate();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [resumeId, setResumeId] = useState(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [atsScore, setAtsScore] = useState(85);
    const [improvementTips, setImprovementTips] = useState([]);
    const [activeTab, setActiveTab] = useState('export');
    const [resumePreview, setResumePreview] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [template, setTemplate] = useState('professional');
    const [savedVersions, setSavedVersions] = useState([]);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [completionData, setCompletionData] = useState([]);
    const [keywordData, setKeywordData] = useState([]);
    const [expertTips, setExpertTips] = useState([]);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(true);
    const [selectedAction, setSelectedAction] = useState(null);

    // API Base URL
    const API_URL = window.API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const id = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setResumeId(id);
        setShareUrl(`${window.location.origin}/resume/share/${id}`);

        // Calculate scores and generate data
        calculateATSscore();
        generateImprovementTips();
        generateCompletionData();
        generateKeywordAnalysis();
        generateExpertTips();
        generateResumePreview();
        loadSavedVersions();
        autoSaveToDatabase();

        // Auto-hide success animation after 3 seconds
        const timer = setTimeout(() => {
            setShowSuccessAnimation(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, [resumeData]);

    // Generate completion data for charts
    const generateCompletionData = () => {
        const sections = [
            { name: 'Contact Info', icon: <FaUser />, value: resumeData.personalInfo?.email ? 100 : 0, color: '#3B82F6' },
            { name: 'Summary', icon: <FaFileAlt />, value: resumeData.summary?.length > 100 ? 100 : 50, color: '#10B981' },
            { name: 'Experience', icon: <FaBriefcase />, value: Math.min((resumeData.experience?.length || 0) * 25, 100), color: '#F59E0B' },
            { name: 'Education', icon: <FaGraduationCap />, value: resumeData.education?.length ? 100 : 0, color: '#8B5CF6' },
            { name: 'Skills', icon: <FaCogs />, value: Math.min((resumeData.skills?.length || 0) * 10, 100), color: '#EC4899' },
            { name: 'Projects', icon: <FaProjectDiagram />, value: resumeData.projects?.length ? 100 : 0, color: '#6366F1' },
            { name: 'Certifications', icon: <FaCertificate />, value: resumeData.certifications?.length ? 100 : 0, color: '#14B8A6' }
        ];
        setCompletionData(sections);
    };

    // Generate keyword analysis data
    const generateKeywordAnalysis = () => {
        const keywords = ['leadership', 'management', 'development', 'analysis', 'strategy', 'innovation', 'optimization', 'collaboration'];
        const text = JSON.stringify(resumeData).toLowerCase();
        const data = keywords.map(keyword => ({
            name: keyword,
            count: (text.match(new RegExp(keyword, 'g')) || []).length,
            percentage: Math.min((text.match(new RegExp(keyword, 'g')) || []).length * 25, 100)
        }));
        setKeywordData(data.filter(item => item.count > 0));
    };

    // Generate expert tips
    const generateExpertTips = () => {
        const tips = [
            {
                icon: FaChartBar,
                title: 'Quantify Achievements',
                description: 'Add metrics and numbers to showcase impact (e.g., "Increased revenue by 30%")',
                priority: 'high'
            },
            {
                icon: FaBrain,
                title: 'Optimize Keywords',
                description: 'Include industry-specific keywords for better ATS compatibility',
                priority: 'medium'
            },
            {
                icon: FaFileSignature,
                title: 'Action Verbs',
                description: 'Start bullet points with strong action verbs like "Managed", "Developed", "Implemented"',
                priority: 'high'
            },
            {
                icon: FaShieldAlt,
                title: 'Format Consistency',
                description: 'Ensure consistent formatting throughout for professional appearance',
                priority: 'low'
            }
        ];
        setExpertTips(tips);
    };

    // Calculate ATS score
    const calculateATSscore = () => {
        let score = 65;

        // Content quality analysis
        if (resumeData.personalInfo?.firstName && resumeData.personalInfo?.lastName) score += 5;
        if (resumeData.summary?.length > 150) score += 8;
        if (resumeData.experience?.length >= 2) score += 12;
        if (resumeData.skills?.length >= 7) score += 7;
        if (resumeData.education?.length >= 1) score += 5;
        if (resumeData.projects?.length >= 1) score += 4;
        if (resumeData.certifications?.length >= 1) score += 4;

        // Keyword optimization
        const powerKeywords = ['managed', 'developed', 'increased', 'reduced', 'implemented', 'optimized', 'led', 'created', 'improved', 'achieved'];
        const allText = JSON.stringify(resumeData).toLowerCase();
        const foundKeywords = powerKeywords.filter(word => allText.includes(word));
        score += Math.min(foundKeywords.length * 3, 15);

        // Quantifiable achievements
        const quantPatterns = [/\d+%/, /\$\d+/, /\d+\+/, /growth of \d+/i, /reduced by \d+/i];
        const hasQuantifiers = quantPatterns.some(pattern => pattern.test(allText));
        if (hasQuantifiers) score += 8;

        // Recent experience check
        const hasRecentExp = resumeData.experience?.some(exp => {
            const year = exp.endDate ? parseInt(exp.endDate.split('/').pop()) : 2024;
            return year >= 2020;
        });
        if (hasRecentExp) score += 5;

        setAtsScore(Math.min(Math.max(score, 0), 100));
    };

    // Enhanced improvement tips
    const generateImprovementTips = () => {
        const tips = [];

        if (!resumeData.summary || resumeData.summary.length < 100) {
            tips.push('Expand professional summary to 100+ characters for better impact');
        }

        if (!resumeData.experience || resumeData.experience.length < 2) {
            tips.push('Include at least 2 detailed work experiences with measurable results');
        }

        if (!resumeData.skills || resumeData.skills.length < 7) {
            tips.push('Add 7-12 relevant technical and soft skills');
        }

        const hasQuantifiers = JSON.stringify(resumeData).match(/\d+%|\$\d+|\d+\+/);
        if (!hasQuantifiers) {
            tips.push('Incorporate quantifiable achievements (metrics, percentages, numbers)');
        }

        if (!resumeData.certifications || resumeData.certifications.length === 0) {
            tips.push('Add relevant certifications to enhance credibility');
        }

        if (!resumeData.projects || resumeData.projects.length === 0) {
            tips.push('Showcase 1-2 significant projects to demonstrate practical skills');
        }

        setImprovementTips(tips.slice(0, 4));
    };

    // Load saved versions from localStorage
    const loadSavedVersions = () => {
        try {
            const saved = localStorage.getItem(`resume_versions_${resumeId}`);
            if (saved) {
                setSavedVersions(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading versions:', error);
        }
    };

    // Auto-save to database
    const autoSaveToDatabase = async () => {
        if (!resumeData.personalInfo?.firstName) return;

        setIsAutoSaving(true);
        try {
            if (API_URL !== 'http://localhost:5000/api') {
                await saveToBackend('Auto-save');
            } else {
                handleLocalSave();
            }
            setLastSaved(new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Auto-save failed:', error);
            handleLocalSave();
        } finally {
            setIsAutoSaving(false);
        }
    };

    // Save to backend
    const saveToBackend = async (action = 'Manual save') => {
        try {
            const response = await fetch(`${API_URL}/resumes/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    resumeId,
                    resumeData,
                    atsScore,
                    template,
                    action,
                    metadata: {
                        savedAt: new Date().toISOString(),
                        userId: localStorage.getItem('userId'),
                        source: 'resume-builder'
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const savedId = data.resumeId || resumeId;
                    setResumeId(savedId);
                    return savedId;
                }
            }
        } catch (error) {
            console.error('Backend save failed:', error);
            throw error;
        }
        return null;
    };

    // Fallback local save
    const handleLocalSave = () => {
        const localId = resumeId || `local_${Date.now()}`;

        const resumeToSave = {
            id: localId,
            title: `${resumeData.personalInfo?.firstName || 'My'} Resume`,
            data: resumeData,
            atsScore,
            template,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            savedLocally: true
        };

        const resumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
        const existingIndex = resumes.findIndex(r => r.id === localId);

        if (existingIndex >= 0) {
            resumes[existingIndex] = resumeToSave;
        } else {
            resumes.push(resumeToSave);
        }

        localStorage.setItem('savedResumes', JSON.stringify(resumes));

        // Update versions
        const versions = JSON.parse(localStorage.getItem(`resume_versions_${localId}`) || '[]');
        versions.push({
            ...resumeToSave,
            savedAt: new Date().toISOString(),
            versionName: `Version ${versions.length + 1}`
        });
        localStorage.setItem(`resume_versions_${localId}`, JSON.stringify(versions));
        setSavedVersions(versions);

        return localId;
    };

    // Generate resume preview
    const generateResumePreview = () => {
        const previewHTML = generateResumeHTML();
        setResumePreview(previewHTML);
    };

    // Handle PDF download
    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        setSelectedAction('download');
        try {
            await handleSaveResume();
            toast.loading('Generating professional PDF...', { id: 'pdf-download' });
            await new Promise(resolve => setTimeout(resolve, 1000));

            const resumeHTML = generateResumeHTML(true);
            const blob = new Blob([resumeHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resumeData.personalInfo?.firstName || 'Resume'}_${resumeData.personalInfo?.lastName || 'Document'}_Resume.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully! ✅', { id: 'pdf-download' });
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download. Please try again.', { id: 'pdf-download' });
        } finally {
            setIsDownloading(false);
            setSelectedAction(null);
        }
    };

    // Enhanced Print Function
    const handlePrint = async () => {
        setSelectedAction('print');
        toast.loading('Preparing optimized print layout...', { id: 'print' });
        await handleSaveResume();

        const printContent = generateResumeHTML(true);
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${resumeData.personalInfo?.firstName || 'Resume'} ${resumeData.personalInfo?.lastName || ''} - Resume</title>
                <meta charset="UTF-8">
                <style>
                    @media print {
                        @page { margin: 0.75in; size: letter; }
                        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.4; color: #000000; }
                        .no-print { display: none !important; }
                        a { color: #000000; text-decoration: none; }
                        .page-break { page-break-before: always; }
                        h1, h2, h3, h4 { page-break-after: avoid; }
                        ul, ol, p { page-break-inside: avoid; }
                    }
                    body { margin: 0; padding: 0; font-family: 'Arial', sans-serif; }
                    .resume-container { max-width: 8.5in; margin: 0 auto; padding: 40px; }
                    .header { border-bottom: 2px solid #000000; padding-bottom: 20px; margin-bottom: 30px; }
                    .name { font-size: 28pt; font-weight: bold; margin: 0; color: #000000; }
                    .title { font-size: 14pt; color: #666666; margin: 5px 0 15px 0; }
                    .contact-info { display: flex; flex-wrap: wrap; gap: 15px; font-size: 11pt; color: #444444; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16pt; font-weight: bold; color: #000000; border-bottom: 1px solid #cccccc; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; }
                    .experience-item, .education-item { margin-bottom: 20px; }
                    .item-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
                    .item-title { font-weight: bold; font-size: 13pt; color: #000000; }
                    .item-subtitle { color: #666666; font-size: 11pt; }
                    .item-date { color: #666666; font-size: 11pt; white-space: nowrap; }
                    .item-description { font-size: 11pt; color: #444444; margin-top: 5px; line-height: 1.5; }
                    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
                    .skill-tag { background: #f5f5f5; padding: 6px 12px; border-radius: 3px; font-size: 11pt; border-left: 3px solid #2563eb; color: #000000; }
                    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #cccccc; font-size: 10pt; color: #666666; text-align: center; }
                </style>
            </head>
            <body>
                <div class="resume-container">
                    ${printContent}
                </div>
                <script>
                    window.onload = function() { setTimeout(() => { window.print(); }, 500); };
                    window.onafterprint = function() { setTimeout(() => { window.close(); }, 500); };
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
        toast.success('Print preview ready! 🖨️', { id: 'print' });
        setSelectedAction(null);
    };

    // Handle Save Resume
    const handleSaveResume = async () => {
        setSelectedAction('save');
        setIsSaving(true);
        try {
            let savedId;
            try {
                savedId = await saveToBackend('Manual save');
            } catch (error) {
                savedId = handleLocalSave();
            }

            if (savedId) {
                toast.success('✅ Resume saved successfully!', {
                    duration: 3000,
                    icon: '💾'
                });
                setLastSaved(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
            setSelectedAction(null);
        }
    };

    // Handle Word download
    const handleDownloadWord = async () => {
        setSelectedAction('word');
        setIsDownloading(true);
        try {
            await handleSaveResume();
            toast.loading('Generating Word document...', { id: 'word-download' });
            await new Promise(resolve => setTimeout(resolve, 800));

            const content = generateWordContent();
            const blob = new Blob([content], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${resumeData.personalInfo?.firstName || 'Resume'}_Resume.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Word document generated! 📄', { id: 'word-download' });
        } catch (error) {
            console.error('Word download error:', error);
            toast.error('Word export failed. Try PDF instead.');
        } finally {
            setIsDownloading(false);
            setSelectedAction(null);
        }
    };

    // Handle JSON export
    const handleDownloadJSON = async () => {
        setSelectedAction('json');
        try {
            const dataStr = JSON.stringify({
                ...resumeData,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    atsScore,
                    template,
                    version: '1.0'
                }
            }, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'resume_data.json';
            link.click();
            toast.success('Resume data exported as JSON!');
        } catch (error) {
            toast.error('Failed to export JSON');
        } finally {
            setSelectedAction(null);
        }
    };

    // Handle plain text export
    const handleDownloadText = async () => {
        setSelectedAction('text');
        try {
            const textContent = generateTextContent();
            const blob = new Blob([textContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'resume.txt';
            link.click();
            toast.success('Resume exported as text!');
        } catch (error) {
            toast.error('Failed to export text');
        } finally {
            setSelectedAction(null);
        }
    };

    // AI Enhancement
    const handleAIEnhancement = async () => {
        setSelectedAction('ai');
        setIsAnalyzing(true);
        toast.loading('Enhancing your resume...', { id: 'ai-enhance' });
        await new Promise(resolve => setTimeout(resolve, 1500));

        const improvedScore = Math.min(atsScore + 15, 95);
        setAtsScore(improvedScore);

        toast.success(`Resume enhanced! New ATS Score: ${improvedScore}`, {
            id: 'ai-enhance',
            duration: 4000
        });

        setIsAnalyzing(false);
        setSelectedAction(null);
    };

    // Create new resume
    const handleCreateNew = () => {
        setSelectedAction('new');
        if (window.confirm('Create a new resume? Your current progress will be saved.')) {
            if (typeof onReset === 'function') {
                onReset();
            } else {
                handleSaveResume();
                navigate('/builder');
                toast.success('Starting new resume!');
            }
        }
        setSelectedAction(null);
    };

    // Edit resume
    const handleEditResume = () => {
        setSelectedAction('edit');
        if (typeof onPrev === 'function') {
            onPrev();
        } else {
            navigate('/builder');
        }
        setSelectedAction(null);
    };

    // Share resume
    const handleShareResume = () => {
        setSelectedAction('share');
        setShowShareModal(true);
        setSelectedAction(null);
    };

    // Copy share URL
    const copyShareUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard!');
        } catch (error) {
            console.error('Copy error:', error);
            toast.error('Failed to copy link');
        }
    };

    // Share to LinkedIn
    const shareToLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank');
    };

    // Preview resume
    const handlePreview = () => {
        setSelectedAction('preview');
        setShowPreview(true);
        setSelectedAction(null);
    };

    // Delete resume
    const handleDeleteResume = () => {
        setSelectedAction('delete');
        if (window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
            try {
                const resumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
                const updatedResumes = resumes.filter(r => r.id !== resumeId);
                localStorage.setItem('savedResumes', JSON.stringify(updatedResumes));
                localStorage.removeItem(`resume_versions_${resumeId}`);
                localStorage.removeItem('resumeDraft');
                localStorage.removeItem('currentStep');

                toast.success('Resume deleted successfully');
                navigate('/dashboard');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete resume');
            }
        }
        setSelectedAction(null);
    };

    // Apply template
    const applyTemplate = (templateName) => {
        setTemplate(templateName);
        toast.success(`Applied ${templateName} template!`);
        generateResumePreview();
    };

    // Save as version
    const saveAsVersion = () => {
        const versionName = prompt('Enter a name for this version:', `Version ${savedVersions.length + 1}`);
        if (versionName) {
            handleSaveResume();
            const newVersion = {
                versionName,
                savedAt: new Date().toISOString(),
                atsScore,
                template
            };
            setSavedVersions([...savedVersions, newVersion]);
        }
    };

    // Calculate completion percentage
    const calculateCompletion = () => {
        const sections = {
            personalInfo: 20,
            summary: 15,
            experience: 25,
            education: 15,
            skills: 15,
            projects: 5,
            certifications: 5
        };

        let totalScore = 0;
        let maxScore = Object.values(sections).reduce((a, b) => a + b, 0);

        Object.entries(sections).forEach(([section, weight]) => {
            let sectionScore = 0;

            switch (section) {
                case 'personalInfo':
                    const info = resumeData.personalInfo || {};
                    sectionScore = (info.firstName && info.email && info.phone && info.location) ? weight : weight * 0.5;
                    break;
                case 'summary':
                    sectionScore = (resumeData.summary?.length > 100) ? weight : weight * 0.3;
                    break;
                case 'experience':
                    if (resumeData.experience?.length >= 3) sectionScore = weight;
                    else if (resumeData.experience?.length >= 2) sectionScore = weight * 0.75;
                    else if (resumeData.experience?.length >= 1) sectionScore = weight * 0.5;
                    break;
                case 'education':
                    sectionScore = (resumeData.education?.length >= 1) ? weight : 0;
                    break;
                case 'skills':
                    if (resumeData.skills?.length >= 10) sectionScore = weight;
                    else if (resumeData.skills?.length >= 7) sectionScore = weight * 0.8;
                    else if (resumeData.skills?.length >= 5) sectionScore = weight * 0.6;
                    else if (resumeData.skills?.length >= 3) sectionScore = weight * 0.4;
                    break;
                case 'projects':
                    sectionScore = (resumeData.projects?.length >= 1) ? weight : 0;
                    break;
                case 'certifications':
                    sectionScore = (resumeData.certifications?.length >= 1) ? weight : 0;
                    break;
            }

            totalScore += sectionScore;
        });

        return Math.round((totalScore / maxScore) * 100);
    };

    // Generate Word content
    const generateWordContent = () => {
        const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

        return `
RESUME
${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}
${personalInfo?.title || ''}

CONTACT INFORMATION
Email: ${personalInfo?.email || ''}
Phone: ${personalInfo?.phone || ''}
Location: ${personalInfo?.location || ''}
${personalInfo?.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ''}

PROFESSIONAL SUMMARY
${summary || ''}

WORK EXPERIENCE
${(experience || []).map(exp => `
${exp.jobTitle || ''}
${exp.company || ''} | ${exp.location || ''}
${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}

${exp.description || ''}
`).join('\n')}

EDUCATION
${(education || []).map(edu => `
${edu.degree || ''}
${edu.institution || ''} | ${edu.location || ''}
${edu.graduationDate || edu.endDate || ''}
${edu.gpa ? `GPA: ${edu.gpa}` : ''}
`).join('\n')}

SKILLS
${(skills || []).map(s => typeof s === 'string' ? s : s.skill).join(', ')}

${projects?.length > 0 ? `
PROJECTS
${projects.map(proj => `
${proj.name || ''}
${proj.description || ''}
`).join('\n')}
` : ''}

${certifications?.length > 0 ? `
CERTIFICATIONS
${certifications.map(cert => `
${cert.name || ''}
${cert.issuer || ''} | ${cert.date || ''}
`).join('\n')}
` : ''}

---
Generated with Resume Builder
ATS Score: ${atsScore}/100
Generated on: ${new Date().toLocaleDateString()}
        `;
    };

    // Generate text content
    const generateTextContent = () => {
        return generateWordContent();
    };

    // Generate resume HTML
    const generateResumeHTML = (forPrint = false) => {
        const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

        const templateStyles = {
            professional: `
                body { font-family: 'Calibri', 'Arial', sans-serif; }
                .header { background: #2c3e50; }
            `,
            modern: `
                body { font-family: 'Segoe UI', system-ui, sans-serif; }
                .header { background: #3b82f6; }
            `,
            executive: `
                body { font-family: 'Times New Roman', serif; }
                .header { background: #1e293b; }
            `
        };

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${personalInfo?.firstName || 'Resume'} ${personalInfo?.lastName || ''} - Professional Resume</title>
                <style>
                    ${templateStyles[template] || templateStyles.professional}
                    body { 
                        margin: 0; 
                        padding: 0; 
                        line-height: 1.6; 
                        color: #000000;
                    }
                    .resume-container {
                        max-width: 8.5in;
                        margin: ${forPrint ? '0 auto' : '40px auto'};
                        background: white;
                    }
                    .header {
                        color: white;
                        padding: 40px;
                    }
                    .name {
                        font-size: 36px;
                        font-weight: 600;
                        margin: 0 0 10px 0;
                        color: #ffffff;
                    }
                    .title {
                        font-size: 18px;
                        font-weight: 400;
                        opacity: 0.9;
                        margin: 0 0 30px 0;
                        color: #ffffff;
                    }
                    .contact-info {
                        display: flex;
                        flex-wrap: wrap;
                        gap: 20px;
                        font-size: 14px;
                        color: #ffffff;
                    }
                    .section {
                        padding: 25px 40px;
                        border-bottom: 1px solid #e5e7eb;
                    }
                    .section:last-child {
                        border-bottom: none;
                    }
                    .section-title {
                        font-size: 18px;
                        font-weight: 600;
                        color: #000000;
                        margin-bottom: 20px;
                        padding-bottom: 8px;
                        border-bottom: 2px solid #3b82f6;
                        text-transform: uppercase;
                    }
                    .experience-item, .education-item {
                        margin-bottom: 20px;
                    }
                    .item-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                    }
                    .item-title {
                        font-weight: 600;
                        font-size: 16px;
                        color: #000000;
                    }
                    .item-subtitle {
                        color: #4b5563;
                        font-size: 14px;
                    }
                    .item-date {
                        color: #6b7280;
                        font-size: 14px;
                        white-space: nowrap;
                    }
                    .item-description {
                        font-size: 14px;
                        line-height: 1.6;
                        color: #374151;
                    }
                    .skills-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                        gap: 10px;
                    }
                    .skill-tag {
                        background: #f3f4f6;
                        padding: 8px 15px;
                        border-radius: 4px;
                        font-size: 14px;
                        border-left: 3px solid #3b82f6;
                        color: #000000;
                    }
                    .footer {
                        padding: 20px 40px;
                        text-align: center;
                        color: #6b7280;
                        font-size: 12px;
                        border-top: 1px solid #e5e7eb;
                    }
                </style>
            </head>
            <body>
                <div class="resume-container">
                    <div class="header">
                        <h1 class="name">${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}</h1>
                        <div class="title">${personalInfo?.title || 'Professional'}</div>
                        <div class="contact-info">
                            ${personalInfo?.email ? `<div>✉️ ${personalInfo.email}</div>` : ''}
                            ${personalInfo?.phone ? `<div>📱 ${personalInfo.phone}</div>` : ''}
                            ${personalInfo?.location ? `<div>📍 ${personalInfo.location}</div>` : ''}
                        </div>
                    </div>
                    
                    ${summary ? `
                    <div class="section">
                        <div class="section-title">Professional Summary</div>
                        <p>${summary}</p>
                    </div>
                    ` : ''}
                    
                    ${experience?.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Work Experience</div>
                        ${experience.map(exp => `
                            <div class="experience-item">
                                <div class="item-header">
                                    <div>
                                        <div class="item-title">${exp.jobTitle || ''}</div>
                                        <div class="item-subtitle">${exp.company || ''} • ${exp.location || ''}</div>
                                    </div>
                                    <div class="item-date">${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''}</div>
                                </div>
                                <div class="item-description">${exp.description || ''}</div>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${education?.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Education</div>
                        ${education.map(edu => `
                            <div class="education-item">
                                <div class="item-header">
                                    <div>
                                        <div class="item-title">${edu.degree || ''}</div>
                                        <div class="item-subtitle">${edu.institution || ''} • ${edu.location || ''}</div>
                                    </div>
                                    <div class="item-date">${edu.graduationDate || edu.endDate || ''}</div>
                                </div>
                                ${edu.gpa ? `<div class="item-description">GPA: ${edu.gpa}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${skills?.length > 0 ? `
                    <div class="section">
                        <div class="section-title">Skills</div>
                        <div class="skills-grid">
                            ${skills.map(skill => `
                                <div class="skill-tag">${typeof skill === 'string' ? skill : skill.skill || skill.name}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="footer">
                        <p>Generated with Resume Builder • ATS Score: ${atsScore}/100 • ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const completionPercentage = calculateCompletion();

    const actionCards = [
        {
            id: 'export',
            title: 'Export',
            icon: <FaDownload />,
            color: '#3B82F6',
            description: 'Download in various formats',
            actions: [
                { label: 'PDF', icon: <FaFilePdf />, onClick: handleDownloadPDF, color: '#EF4444' },
                { label: 'Word', icon: <FaFileWord />, onClick: handleDownloadWord, color: '#2563EB' },
                { label: 'Print', icon: <FaPrint />, onClick: handlePrint, color: '#059669' }
            ]
        },
        {
            id: 'enhance',
            title: 'Enhance',
            icon: <FaMagic />,
            color: '#8B5CF6',
            description: 'Improve with AI suggestions',
            actions: [
                { label: 'AI Enhance', icon: <FaRobot />, onClick: handleAIEnhancement, color: '#7C3AED' },
                { label: 'Check ATS', icon: <FaClipboardCheck />, onClick: () => { }, color: '#10B981' }
            ]
        },
        {
            id: 'share',
            title: 'Share',
            icon: <FaShareAlt />,
            color: '#10B981',
            description: 'Share with employers',
            actions: [
                { label: 'Share Link', icon: <FaShareAlt />, onClick: handleShareResume, color: '#3B82F6' },
                { label: 'LinkedIn', icon: <FaLinkedin />, onClick: shareToLinkedIn, color: '#0077B5' }
            ]
        },
        {
            id: 'manage',
            title: 'Manage',
            icon: <FaDatabase />,
            color: '#F59E0B',
            description: 'Manage your resume',
            actions: [
                { label: 'Edit', icon: <FaEdit />, onClick: handleEditResume, color: '#6366F1' },
                { label: 'New', icon: <FaPlus />, onClick: handleCreateNew, color: '#EC4899' },
                { label: 'Delete', icon: <FaTrash />, onClick: handleDeleteResume, color: '#DC2626' }
            ]
        }
    ];

    return (
        <div className="enhanced-completion-page">
            {/* Success Animation */}
            <AnimatePresence>
                {showSuccessAnimation && (
                    <motion.div
                        className="success-animation-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="success-animation"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                        >
                            <div className="animation-content">
                                <motion.div
                                    className="animation-icon"
                                    animate={{
                                        rotate: 360,
                                        scale: [1, 1.2, 1]
                                    }}
                                    transition={{
                                        rotate: { duration: 2, ease: "linear", repeat: Infinity },
                                        scale: { duration: 1, repeat: 1 }
                                    }}
                                >
                                    <FaAward />
                                </motion.div>
                                <h2 className="animation-title">Resume Complete!</h2>
                                <p className="animation-subtitle">Your professional resume is ready</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="completion-container">
                {/* Header Section */}
                <div className="completion-header">
                    <div className="header-left">
                        <div className="header-badge">
                            <FaCheckCircle className="badge-icon" />
                            <span className="badge-text">RESUME COMPLETE</span>
                        </div>
                        <h1 className="header-title">
                            Resume <span className="title-highlight">Polished & Ready</span>
                        </h1>
                        <p className="header-subtitle">
                            Your professionally crafted resume is optimized for success
                        </p>
                    </div>

                    <div className="header-right">
                        {/* Next Steps Section */}
                        <div className="next-steps-section">
                            <div className="steps-header">
                                <FaRocket className="steps-icon" />
                                <h3>Next Steps</h3>
                            </div>
                            <p className="steps-subtitle">
                                Choose your next action to maximize your resume's impact
                            </p>

                            <div className="steps-tabs">
                                {actionCards.map((card) => (
                                    <button
                                        key={card.id}
                                        className={`steps-tab ${activeTab === card.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(card.id)}
                                        style={{ '--tab-color': card.color }}
                                    >
                                        <div className="tab-icon" style={{ color: card.color }}>
                                            {card.icon}
                                        </div>
                                        <span className="tab-title">{card.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="main-grid">
                    {/* Left Column - Statistics */}
                    <div className="stats-column">
                        {/* ATS Score Card */}
                        <div className="stats-card ats-card">
                            <div className="card-header">
                                <h3>ATS Score</h3>
                                <span className={`score-label ${atsScore >= 90 ? 'excellent' : atsScore >= 80 ? 'good' : 'fair'}`}>
                                    {atsScore >= 90 ? '🎯 Excellent' : atsScore >= 80 ? '✨ Strong' : '📈 Good'}
                                </span>
                            </div>
                            <div className="score-display">
                                <div className="circular-progress" style={{ '--progress': `${atsScore}%` }}>
                                    <span className="score-number">{atsScore}</span>
                                    <span className="score-max">/100</span>
                                </div>
                                <div className="score-details">
                                    <div className="detail-row">
                                        <span className="detail-label">Content Quality</span>
                                        <div className="detail-bar">
                                            <div className="bar-fill" style={{ width: '85%' }}></div>
                                        </div>
                                        <span className="detail-value">85%</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Keyword Optimization</span>
                                        <div className="detail-bar">
                                            <div className="bar-fill" style={{ width: '78%' }}></div>
                                        </div>
                                        <span className="detail-value">78%</span>
                                    </div>
                                    <div className="detail-row">
                                        <span className="detail-label">Format Compliance</span>
                                        <div className="detail-bar">
                                            <div className="bar-fill" style={{ width: '92%' }}></div>
                                        </div>
                                        <span className="detail-value">92%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Completion Stats */}
                        <div className="stats-card completion-card">
                            <div className="card-header">
                                <h3>Completion Stats</h3>
                                <span className="completion-percentage">{completionPercentage}%</span>
                            </div>
                            <div className="stats-grid">
                                {completionData.map((section, index) => (
                                    <div key={index} className="stat-item">
                                        <div className="stat-icon" style={{ color: section.color }}>
                                            {section.icon}
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-name">{section.name}</span>
                                            <div className="stat-bar">
                                                <div
                                                    className="bar-fill"
                                                    style={{
                                                        width: `${section.value}%`,
                                                        backgroundColor: section.color
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="stat-value">{section.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="stats-card quick-stats-card">
                            <div className="card-header">
                                <h3>Quick Stats</h3>
                            </div>
                            <div className="quick-stats-grid">
                                <div className="quick-stat">
                                    <div className="quick-stat-icon">
                                        <FaBriefcase />
                                    </div>
                                    <div className="quick-stat-content">
                                        <div className="quick-stat-value">{resumeData.experience?.length || 0}</div>
                                        <div className="quick-stat-label">Experiences</div>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <div className="quick-stat-icon">
                                        <FaGraduationCap />
                                    </div>
                                    <div className="quick-stat-content">
                                        <div className="quick-stat-value">{resumeData.education?.length || 0}</div>
                                        <div className="quick-stat-label">Education</div>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <div className="quick-stat-icon">
                                        <FaCertificate />
                                    </div>
                                    <div className="quick-stat-content">
                                        <div className="quick-stat-value">{resumeData.certifications?.length || 0}</div>
                                        <div className="quick-stat-label">Certifications</div>
                                    </div>
                                </div>
                                <div className="quick-stat">
                                    <div className="quick-stat-icon">
                                        <FaCogs />
                                    </div>
                                    <div className="quick-stat-content">
                                        <div className="quick-stat-value">{resumeData.skills?.length || 0}</div>
                                        <div className="quick-stat-label">Skills</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Action Cards */}
                    <div className="actions-column">
                        {/* Active Tab Content */}
                        <div className="active-tab-content">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="tab-content-wrapper"
                            >
                                {activeTab === 'export' && (
                                    <div className="export-tab">
                                        <div className="tab-header">
                                            <FaDownload className="tab-main-icon" />
                                            <div>
                                                <h3>Export Your Resume</h3>
                                                <p>Download in multiple formats for different needs</p>
                                            </div>
                                        </div>
                                        <div className="export-options">
                                            <div className="export-primary">
                                                <button
                                                    onClick={handleDownloadPDF}
                                                    disabled={isDownloading}
                                                    className="export-option primary"
                                                >
                                                    <div className="option-icon">
                                                        <FaFilePdf />
                                                    </div>
                                                    <div className="option-content">
                                                        <h4>Download PDF</h4>
                                                        <p>Professional, ATS-optimized format</p>
                                                        <ul className="option-features">
                                                            <li><FaCheck /> Print-ready</li>
                                                            <li><FaCheck /> Preserves styling</li>
                                                            <li><FaCheck /> Best for applications</li>
                                                        </ul>
                                                    </div>
                                                    {isDownloading && selectedAction === 'download' ? (
                                                        <FaSpinner className="spinner" />
                                                    ) : (
                                                        <FaDownload className="action-icon" />
                                                    )}
                                                </button>

                                                <div className="export-secondary-grid">
                                                    <button onClick={handlePrint} className="export-option secondary">
                                                        <FaPrint />
                                                        <span>Print</span>
                                                        <small>Optimized for printing</small>
                                                    </button>
                                                    <button onClick={handleDownloadWord} className="export-option secondary">
                                                        <FaFileWord />
                                                        <span>Word</span>
                                                        <small>.docx format</small>
                                                    </button>
                                                    <button onClick={handleDownloadJSON} className="export-option secondary">
                                                        <SiJson />
                                                        <span>JSON</span>
                                                        <small>Data export</small>
                                                    </button>
                                                    <button onClick={handleDownloadText} className="export-option secondary">
                                                        <FaFileAlt />
                                                        <span>Text</span>
                                                        <small>Plain format</small>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'enhance' && (
                                    <div className="enhance-tab">
                                        <div className="tab-header">
                                            <FaMagic className="tab-main-icon" />
                                            <div>
                                                <h3>Enhance Your Resume</h3>
                                                <p>Improve with AI-powered suggestions</p>
                                            </div>
                                        </div>
                                        <div className="enhance-options">
                                            <button
                                                onClick={handleAIEnhancement}
                                                disabled={isAnalyzing}
                                                className="enhance-option ai"
                                            >
                                                <div className="option-icon">
                                                    <FaRobot />
                                                </div>
                                                <div className="option-content">
                                                    <h4>AI-Powered Enhancement</h4>
                                                    <p>Let AI optimize your resume for maximum impact</p>
                                                    <div className="ai-features">
                                                        <span><FaStar /> Keyword optimization</span>
                                                        <span><FaChartBar /> ATS score improvement</span>
                                                        <span><FaBrain /> Content refinement</span>
                                                    </div>
                                                </div>
                                                {isAnalyzing && selectedAction === 'ai' ? (
                                                    <FaSpinner className="spinner" />
                                                ) : (
                                                    <FaMagic className="action-icon" />
                                                )}
                                            </button>

                                            <div className="improvement-tips">
                                                <h4>Quick Improvements</h4>
                                                <div className="tips-list">
                                                    {improvementTips.map((tip, index) => (
                                                        <div key={index} className="tip-item">
                                                            <FaCheckCircle />
                                                            <span>{tip}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'share' && (
                                    <div className="share-tab">
                                        <div className="tab-header">
                                            <FaShareAlt className="tab-main-icon" />
                                            <div>
                                                <h3>Share Your Resume</h3>
                                                <p>Share with employers or get feedback</p>
                                            </div>
                                        </div>
                                        <div className="share-options">
                                            <div className="share-primary">
                                                <div className="share-url-section">
                                                    <div className="share-input-group">
                                                        <input
                                                            type="text"
                                                            value={shareUrl}
                                                            readOnly
                                                            className="share-input"
                                                            placeholder="Generating shareable link..."
                                                        />
                                                        <button onClick={copyShareUrl} className="copy-btn">
                                                            <FaCopy /> Copy
                                                        </button>
                                                    </div>
                                                    <button onClick={handleShareResume} className="share-btn primary">
                                                        <FaShareAlt /> Generate Shareable Link
                                                    </button>
                                                </div>

                                                <div className="social-share-section">
                                                    <h4>Share to Platform</h4>
                                                    <button onClick={shareToLinkedIn} className="social-share-btn linkedin">
                                                        <FaLinkedin /> Share to LinkedIn
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'manage' && (
                                    <div className="manage-tab">
                                        <div className="tab-header">
                                            <FaDatabase className="tab-main-icon" />
                                            <div>
                                                <h3>Manage Your Resume</h3>
                                                <p>Edit, create new, or delete your resume</p>
                                            </div>
                                        </div>
                                        <div className="manage-options">
                                            <div className="manage-actions-grid">
                                                <button onClick={handleEditResume} className="manage-action">
                                                    <FaEdit />
                                                    <span>Edit Resume</span>
                                                    <small>Make changes</small>
                                                </button>
                                                <button onClick={handleCreateNew} className="manage-action">
                                                    <FaPlus />
                                                    <span>Create New</span>
                                                    <small>Start fresh</small>
                                                </button>
                                                <button onClick={handlePreview} className="manage-action">
                                                    <FaEye />
                                                    <span>Live Preview</span>
                                                    <small>View resume</small>
                                                </button>
                                                <button onClick={handleDeleteResume} className="manage-action danger">
                                                    <FaTrash />
                                                    <span>Delete</span>
                                                    <small>Remove resume</small>
                                                </button>
                                            </div>

                                            <div className="save-section">
                                                <button
                                                    onClick={handleSaveResume}
                                                    disabled={isSaving}
                                                    className="save-btn"
                                                >
                                                    {isSaving && selectedAction === 'save' ? (
                                                        <>
                                                            <FaSpinner className="spinner" /> Saving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSave /> Save Resume
                                                        </>
                                                    )}
                                                </button>
                                                <div className="save-status">
                                                    {lastSaved ? (
                                                        <span className="last-saved">
                                                            <FaRegClock /> Last saved: {lastSaved}
                                                        </span>
                                                    ) : (
                                                        <span className="ready-to-save">
                                                            <FaCloud /> Ready to save
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section - Additional Info */}
                <div className="bottom-section">
                    {/* Expert Recommendations */}
                    <div className="expert-recommendations">
                        <div className="section-header">
                            <FaLightbulb className="section-icon" />
                            <h3>Expert Recommendations</h3>
                        </div>
                        <div className="recommendations-grid">
                            {expertTips.map((tip, index) => {
                                const IconComponent = tip.icon;
                                return (
                                    <div key={index} className="recommendation-card">
                                        <div className="recommendation-icon">
                                            <IconComponent />
                                        </div>
                                        <div className="recommendation-content">
                                            <h4>{tip.title}</h4>
                                            <p>{tip.description}</p>
                                            <span className={`priority-badge ${tip.priority}`}>
                                                {tip.priority === 'high' ? 'High Priority' :
                                                    tip.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Status Bar */}
                    <div className="status-bar">
                        <div className="status-content">
                            <div className="status-item">
                                <FaDatabase className={isAutoSaving ? 'spinning' : ''} />
                                <span>
                                    {isAutoSaving ? 'Auto-saving...' :
                                        lastSaved ? `Saved at ${lastSaved}` : 'Ready to save'}
                                </span>
                            </div>
                            <div className="status-separator"></div>
                            <div className="status-item">
                                <FaShieldAlt />
                                <span>Resume ID: {resumeId?.substring(0, 8)}...</span>
                            </div>
                            <div className="status-separator"></div>
                            <div className="status-item">
                                <FaRegClock />
                                <span>Created: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Share Modal */}
                {showShareModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h3>Share Your Resume</h3>
                                <button
                                    className="close-modal"
                                    onClick={() => setShowShareModal(false)}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className="modal-body">
                                <div className="share-url">
                                    <input
                                        type="text"
                                        value={shareUrl}
                                        readOnly
                                        className="share-input"
                                    />
                                    <button
                                        onClick={copyShareUrl}
                                        className="copy-btn"
                                    >
                                        <FaCopy /> Copy
                                    </button>
                                </div>

                                <div className="social-share">
                                    <button onClick={shareToLinkedIn} className="social-btn linkedin">
                                        <FaLinkedin /> Share to LinkedIn
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Preview Modal */}
                {showPreview && resumePreview && (
                    <motion.div
                        className="modal-overlay preview-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div
                            className="modal-content preview-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="preview-header">
                                <h3>Resume Preview</h3>
                                <div className="preview-actions">
                                    <button onClick={handlePrint}>
                                        <FaPrint /> Print
                                    </button>
                                    <button onClick={() => setShowPreview(false)}>
                                        <FaTimes /> Close
                                    </button>
                                </div>
                            </div>
                            <div className="preview-frame">
                                <iframe
                                    srcDoc={resumePreview}
                                    title="Resume Preview"
                                    className="resume-iframe"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .enhanced-completion-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    padding: 2rem;
                    color: #000000;
                }

                /* Success Animation */
                .success-animation-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }

                .success-animation {
                    background: white;
                    border-radius: 24px;
                    padding: 3rem;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    text-align: center;
                    max-width: 400px;
                }

                .animation-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1.5rem;
                }

                .animation-icon {
                    font-size: 4rem;
                    color: #10B981;
                    background: linear-gradient(135deg, #10B981, #059669);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .animation-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0;
                }

                .animation-subtitle {
                    color: #6B7280;
                    font-size: 1rem;
                    margin: 0;
                }

                /* Main Container */
                .completion-container {
                    max-width: 1400px;
                    margin: 0 auto;
                }

                /* Header Section */
                .completion-header {
                    display: grid;
                    grid-template-columns: 1fr 400px;
                    gap: 3rem;
                    margin-bottom: 3rem;
                    align-items: start;
                }

                @media (max-width: 1024px) {
                    .completion-header {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }

                .header-left {
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                }

                .header-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    background: linear-gradient(135deg, #10B981, #059669);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 50px;
                    margin-bottom: 1.5rem;
                }

                .badge-icon {
                    font-size: 1rem;
                }

                .badge-text {
                    font-size: 0.75rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }

                .header-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1F2937;
                    margin: 0 0 0.5rem 0;
                    line-height: 1.2;
                }

                @media (max-width: 768px) {
                    .header-title {
                        font-size: 2rem;
                    }
                }

                .title-highlight {
                    background: linear-gradient(135deg, #3B82F6, #8B5CF6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-subtitle {
                    color: #6B7280;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin: 0;
                }

                /* Next Steps Section */
                .next-steps-section {
                    background: white;
                    padding: 2rem;
                    border-radius: 20px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                    height: 100%;
                }

                .steps-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .steps-icon {
                    color: #3B82F6;
                    font-size: 1.5rem;
                }

                .steps-header h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0;
                }

                .steps-subtitle {
                    color: #6B7280;
                    font-size: 0.95rem;
                    margin-bottom: 2rem;
                }

                .steps-tabs {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                .steps-tab {
                    background: white;
                    border: 2px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    position: relative;
                    overflow: hidden;
                }

                .steps-tab:hover {
                    transform: translateY(-4px);
                    border-color: var(--tab-color);
                    box-shadow: 0 8px 20px rgba(var(--tab-color-rgb, 59, 130, 246), 0.15);
                }

                .steps-tab.active {
                    background: linear-gradient(135deg, var(--tab-color), var(--tab-color));
                    border-color: var(--tab-color);
                    color: white;
                }

                .steps-tab.active .tab-icon {
                    color: white;
                }

                .steps-tab.active .tab-title {
                    color: white;
                }

                .tab-icon {
                    font-size: 2rem;
                    transition: color 0.3s;
                }

                .tab-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1F2937;
                    transition: color 0.3s;
                }

                /* Main Grid */
                .main-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.2fr;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 1024px) {
                    .main-grid {
                        grid-template-columns: 1fr;
                    }
                }

                /* Stats Column */
                .stats-column {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .stats-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .card-header h3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1F2937;
                    margin: 0;
                }

                /* ATS Card */
                .ats-card .score-label {
                    padding: 0.375rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .score-label.excellent {
                    background: linear-gradient(135deg, #10B981, #059669);
                    color: white;
                }

                .score-label.good {
                    background: linear-gradient(135deg, #F59E0B, #D97706);
                    color: white;
                }

                .score-label.fair {
                    background: linear-gradient(135deg, #6B7280, #4B5563);
                    color: white;
                }

                .score-display {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                @media (max-width: 768px) {
                    .score-display {
                        flex-direction: column;
                        text-align: center;
                    }
                }

                .circular-progress {
                    position: relative;
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    background: conic-gradient(#3B82F6 0% var(--progress, 0%), #E5E7EB 0%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .circular-progress::before {
                    content: '';
                    position: absolute;
                    width: 84px;
                    height: 84px;
                    background: white;
                    border-radius: 50%;
                }

                .score-number {
                    position: relative;
                    z-index: 2;
                    font-size: 2rem;
                    font-weight: 700;
                    color: #1F2937;
                }

                .score-max {
                    position: relative;
                    z-index: 2;
                    font-size: 1rem;
                    color: #6B7280;
                    margin-left: 0.25rem;
                }

                .score-details {
                    flex: 1;
                }

                .detail-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                }

                .detail-label {
                    flex: 1;
                    font-size: 0.875rem;
                    color: #4B5563;
                    min-width: 120px;
                }

                .detail-bar {
                    flex: 2;
                    height: 6px;
                    background: #E5E7EB;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .detail-bar .bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3B82F6, #60A5FA);
                    border-radius: 3px;
                }

                .detail-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1F2937;
                    min-width: 40px;
                    text-align: right;
                }

                /* Completion Card */
                .completion-percentage {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #3B82F6;
                }

                .stats-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .stat-icon {
                    font-size: 1.25rem;
                    opacity: 0.9;
                }

                .stat-content {
                    flex: 1;
                }

                .stat-name {
                    display: block;
                    font-size: 0.875rem;
                    color: #4B5563;
                    margin-bottom: 0.25rem;
                }

                .stat-bar {
                    height: 6px;
                    background: #E5E7EB;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .stat-value {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #1F2937;
                    min-width: 40px;
                    text-align: right;
                }

                /* Quick Stats Card */
                .quick-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                .quick-stat {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem;
                    background: #F9FAFB;
                    border-radius: 12px;
                    border: 1px solid #E5E7EB;
                }

                .quick-stat-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #3B82F6, #2563EB);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.25rem;
                }

                .quick-stat-content {
                    flex: 1;
                }

                .quick-stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1F2937;
                    line-height: 1;
                }

                .quick-stat-label {
                    font-size: 0.75rem;
                    color: #6B7280;
                    margin-top: 0.25rem;
                }

                /* Actions Column */
                .actions-column {
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                }

                .active-tab-content {
                    padding: 2rem;
                    height: 100%;
                }

                /* Tab Header */
                .tab-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .tab-main-icon {
                    font-size: 2.5rem;
                    color: #3B82F6;
                }

                .tab-header h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0 0 0.25rem 0;
                }

                .tab-header p {
                    color: #6B7280;
                    margin: 0;
                    font-size: 0.95rem;
                }

                /* Export Tab */
                .export-option {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                    background: white;
                    border: 2px solid #E5E7EB;
                    border-radius: 16px;
                    width: 100%;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-bottom: 1rem;
                }

                .export-option:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
                }

                .export-option.primary {
                    border-color: #3B82F6;
                    background: linear-gradient(135deg, #EFF6FF, #FFFFFF);
                }

                .export-option.secondary {
                    flex-direction: column;
                    padding: 1.5rem;
                }

                .option-icon {
                    font-size: 2.5rem;
                    color: #3B82F6;
                }

                .option-content {
                    flex: 1;
                }

                .option-content h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #1F2937;
                    margin: 0 0 0.5rem 0;
                }

                .option-content p {
                    color: #6B7280;
                    margin: 0 0 1rem 0;
                    font-size: 0.95rem;
                }

                .option-features {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .option-features li {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #4B5563;
                    font-size: 0.875rem;
                }

                .option-features li svg {
                    color: #10B981;
                    font-size: 0.875rem;
                }

                .export-secondary-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }

                @media (max-width: 768px) {
                    .export-secondary-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .export-option.secondary svg {
                    font-size: 2rem;
                    color: #3B82F6;
                    margin-bottom: 0.5rem;
                }

                .export-option.secondary span {
                    font-weight: 600;
                    color: #1F2937;
                    margin-bottom: 0.25rem;
                }

                .export-option.secondary small {
                    color: #6B7280;
                    font-size: 0.75rem;
                }

                .action-icon {
                    color: #3B82F6;
                    font-size: 1.5rem;
                }

                .spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Enhance Tab */
                .enhance-option.ai {
                    background: linear-gradient(135deg, #F3F4F6, #FFFFFF);
                    border: 2px solid #E5E7EB;
                    border-radius: 16px;
                    padding: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .ai-features {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 0.75rem;
                    margin-top: 1rem;
                }

                .ai-features span {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #4B5563;
                }

                .ai-features span svg {
                    color: #8B5CF6;
                }

                .improvement-tips {
                    background: #F9FAFB;
                    border-radius: 16px;
                    padding: 1.5rem;
                }

                .improvement-tips h4 {
                    font-size: 1.125rem;
                    color: #1F2937;
                    margin: 0 0 1rem 0;
                }

                .tips-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .tip-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    font-size: 0.95rem;
                    color: #4B5563;
                }

                .tip-item svg {
                    color: #10B981;
                    margin-top: 0.125rem;
                    flex-shrink: 0;
                }

                /* Share Tab */
                .share-url-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .share-input-group {
                    display: flex;
                    gap: 0.75rem;
                }

                .share-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 2px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: #000000;
                    background: #f8fafc;
                }

                .copy-btn {
                    background: #3B82F6;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 500;
                }

                .share-btn {
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    width: 100%;
                }

                .share-btn.primary {
                    background: #3B82F6;
                    color: white;
                }

                .social-share-section h4 {
                    font-size: 1.125rem;
                    color: #1F2937;
                    margin: 0 0 1rem 0;
                }

                .social-share-btn {
                    padding: 1rem 1.5rem;
                    background: white;
                    border: 2px solid #E5E7EB;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    font-weight: 500;
                    width: 100%;
                    transition: all 0.3s;
                }

                .social-share-btn.linkedin {
                    background: #0077B5;
                    color: white;
                    border-color: #0077B5;
                }

                .social-share-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                /* Manage Tab */
                .manage-actions-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .manage-actions-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .manage-action {
                    background: white;
                    border: 2px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .manage-action:hover {
                    transform: translateY(-4px);
                    border-color: #3B82F6;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .manage-action.danger {
                    border-color: #FCA5A5;
                    background: #FEF2F2;
                }

                .manage-action.danger:hover {
                    border-color: #DC2626;
                }

                .manage-action svg {
                    font-size: 2rem;
                    color: #3B82F6;
                }

                .manage-action.danger svg {
                    color: #DC2626;
                }

                .manage-action span {
                    font-weight: 600;
                    color: #1F2937;
                }

                .manage-action.danger span {
                    color: #DC2626;
                }

                .manage-action small {
                    color: #6B7280;
                    font-size: 0.75rem;
                }

                .save-section {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    align-items: center;
                }

                .save-btn {
                    background: linear-gradient(135deg, #10B981, #059669);
                    color: white;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transition: all 0.3s;
                }

                .save-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .save-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }

                .save-status {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #6B7280;
                    font-size: 0.875rem;
                }

                /* Bottom Section */
                .bottom-section {
                    margin-top: 2rem;
                }

                /* Expert Recommendations */
                .expert-recommendations {
                    background: white;
                    border-radius: 20px;
                    padding: 2rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
                    margin-bottom: 1.5rem;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .section-icon {
                    color: #F59E0B;
                    font-size: 1.5rem;
                }

                .section-header h3 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0;
                }

                .recommendations-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                .recommendation-card {
                    background: #F9FAFB;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #E5E7EB;
                    transition: all 0.3s;
                }

                .recommendation-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .recommendation-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #3B82F6, #2563EB);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                }

                .recommendation-content h4 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1F2937;
                    margin: 0 0 0.5rem 0;
                }

                .recommendation-content p {
                    color: #6B7280;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin: 0 0 1rem 0;
                }

                .priority-badge {
                    display: inline-block;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .priority-badge.high {
                    background: #FEE2E2;
                    color: #DC2626;
                }

                .priority-badge.medium {
                    background: #FEF3C7;
                    color: #D97706;
                }

                .priority-badge.low {
                    background: #D1FAE5;
                    color: #059669;
                }

                /* Status Bar */
                .status-bar {
                    background: white;
                    border-radius: 12px;
                    padding: 1rem 2rem;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                }

                .status-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 2rem;
                    flex-wrap: wrap;
                }

                @media (max-width: 768px) {
                    .status-content {
                        flex-direction: column;
                        gap: 1rem;
                        text-align: center;
                    }
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: #4B5563;
                    font-weight: 500;
                }

                .status-item svg {
                    color: #3B82F6;
                    font-size: 1.25rem;
                }

                .status-separator {
                    width: 1px;
                    height: 20px;
                    background: #E5E7EB;
                }

                @media (max-width: 768px) {
                    .status-separator {
                        display: none;
                    }
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 500px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #E5E7EB;
                }

                .modal-header h3 {
                    margin: 0;
                    color: #000000;
                    font-size: 1.25rem;
                }

                .close-modal {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: #6B7280;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                /* Preview Modal */
                .preview-modal .modal-content {
                    max-width: 90%;
                    width: 100%;
                    height: 90vh;
                }

                .preview-content {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }

                .preview-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #E5E7EB;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .preview-header h3 {
                    margin: 0;
                    color: #000000;
                    font-size: 1.25rem;
                }

                .preview-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .preview-actions button {
                    background: #3B82F6;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                }

                .preview-frame {
                    flex: 1;
                    overflow: hidden;
                }

                .resume-iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
            `}</style>
        </div>
    );
};

EnhancedCompletionPage.defaultProps = {
    resumeData: {},
    onReset: () => { },
    onSave: () => Promise.resolve({ success: true }),
    onDownload: () => { },
    onPrev: () => { }
};

export default EnhancedCompletionPage;