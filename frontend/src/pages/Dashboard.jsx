import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    FaPlus,
    FaFileAlt,
    FaChartLine,
    FaRocket,
    FaStar,
    FaEdit,
    FaTrash,
    FaCopy,
    FaDownload,
    FaSync,
    FaBriefcase,
    FaGraduationCap,
    FaCogs,
    FaSearch,
    FaFilter,
    FaSort,
    FaSpinner,
    FaPalette,
    FaExclamationTriangle,
    FaEye,
    FaShareAlt,
    FaRobot,
    FaBolt,
    FaBrain,
    FaDatabase,
    FaCheckCircle,
    FaUser,
    FaAward,
    FaChartBar,
    FaLightbulb,
    FaMagic,
    FaClipboardCheck,
    FaThumbsUp,
    FaExclamationCircle,
    FaCrown,
    FaChevronRight,
    FaFire,
    FaHistory,
    FaUserTie,
    FaMedal,
    FaShieldAlt,
    FaArrowUp,
    FaClock,
    FaTachometerAlt,
    FaBullseye,
    FaMicrochip,
    FaRegClock,
    FaProjectDiagram,
    FaBullhorn,
    FaCode,
    FaNetworkWired,
    FaChartPie,
    FaTools,
    FaBookOpen,
    FaCalendarAlt,
    FaCaretRight,
    FaRegStar,
    FaRegCheckCircle
} from 'react-icons/fa';

import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const Dashboard = () => {
    const { user, isAuthenticated, token } = useAuth();
    const navigate = useNavigate();

    // State management
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        recent: 0,
        completed: 0,
        averageATS: 0,
        bestScore: 0,
        worstScore: 0,
        aiAnalyzed: 0,
        templates: {},
        topIndustries: {},
        sectionCompletion: {}
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('score');
    const [filteredResumes, setFilteredResumes] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [analyzing, setAnalyzing] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const [trendData, setTrendData] = useState([]);
    const [showQuickActions, setShowQuickActions] = useState(false);

    // Axios instance with auth token
    const api = useMemo(() => {
        const instance = axios.create({
            baseURL: API_URL,
            timeout: 10000,
        });

        if (token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        return instance;
    }, [token]);

    // Enhanced AI-powered ATS Score calculation
    const calculateATSScore = useCallback((resume) => {
        const data = resume.data || {};
        let baseScore = 50;

        const industryWeights = {
            'tech': { experience: 30, skills: 25, education: 15, projects: 20, summary: 5, personal: 5 },
            'business': { experience: 35, skills: 15, education: 20, summary: 20, personal: 10, projects: 0 },
            'design': { experience: 25, skills: 20, education: 15, projects: 30, summary: 5, personal: 5 },
            'academic': { education: 35, experience: 20, skills: 15, publications: 20, summary: 5, personal: 5 },
            'default': { experience: 25, education: 15, skills: 20, projects: 15, summary: 10, personal: 15 }
        };

        const industry = data.personalInfo?.industry || 'default';
        const weights = industryWeights[industry] || industryWeights.default;

        const scoreSection = (section, content, maxScore) => {
            if (!content || (Array.isArray(content) && content.length === 0)) return 0;

            let sectionScore = 0;

            switch (section) {
                case 'personalInfo':
                    const personal = content;
                    if (personal.firstName && personal.lastName) sectionScore += 1;
                    if (personal.email && /\S+@\S+\.\S+/.test(personal.email)) sectionScore += 2;
                    if (personal.phone) sectionScore += 1;
                    if (personal.location) sectionScore += 1;
                    if (personal.linkedin || personal.github || personal.portfolio) sectionScore += 2;
                    if (personal.title) sectionScore += 1;
                    if (personal.summary?.length > 50) sectionScore += 2;
                    break;

                case 'experience':
                    content.forEach(exp => {
                        let expScore = 3;
                        if (exp.position && exp.company) expScore += 2;
                        if (exp.description?.length > 100) expScore += 3;
                        if (exp.achievements?.length > 0) expScore += 2;
                        if (exp.startDate && exp.endDate) expScore += 1;
                        if (exp.technologies?.length > 0) expScore += 1;
                        sectionScore += Math.min(expScore, 10);
                    });
                    break;

                case 'education':
                    content.forEach(edu => {
                        let eduScore = 3;
                        if (edu.degree && edu.institution) eduScore += 2;
                        if (edu.gpa && parseFloat(edu.gpa) >= 3.0) eduScore += 2;
                        if (edu.honors) eduScore += 1;
                        if (edu.relevantCoursework?.length > 0) eduScore += 2;
                        sectionScore += Math.min(eduScore, 10);
                    });
                    break;

                case 'skills':
                    const skillCount = content.length;
                    if (skillCount >= 15) sectionScore = 25;
                    else if (skillCount >= 10) sectionScore = 20;
                    else if (skillCount >= 7) sectionScore = 15;
                    else if (skillCount >= 5) sectionScore = 10;
                    else if (skillCount >= 3) sectionScore = 5;
                    break;

                case 'projects':
                    content.forEach(project => {
                        let projScore = 3;
                        if (project.name && project.description) projScore += 2;
                        if (project.technologies?.length > 0) projScore += 2;
                        if (project.link) projScore += 1;
                        if (project.duration) projScore += 1;
                        sectionScore += Math.min(projScore, 8);
                    });
                    break;

                case 'summary':
                    const summary = content;
                    if (!summary) return 0;
                    const wordCount = summary.split(/\s+/).length;
                    const keywordDensity = calculateKeywordDensity(summary, industry);
                    sectionScore = Math.min(wordCount / 10, 5) + keywordDensity * 3;
                    break;
            }

            return Math.min(sectionScore, maxScore);
        };

        const calculateKeywordDensity = (text, industry) => {
            const keywords = {
                'tech': ['develop', 'engineer', 'software', 'code', 'system', 'technical', 'programming', 'database'],
                'business': ['manage', 'lead', 'strategy', 'growth', 'revenue', 'team', 'business', 'analysis'],
                'design': ['design', 'creative', 'user experience', 'UI/UX', 'prototype', 'visual', 'brand'],
                'academic': ['research', 'study', 'analysis', 'publication', 'academic', 'thesis', 'methodology'],
                'default': []
            };

            const industryKeywords = keywords[industry] || keywords.default;
            const textLower = text.toLowerCase();
            let keywordCount = 0;

            industryKeywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
                const matches = textLower.match(regex);
                if (matches) keywordCount += matches.length;
            });

            const wordCount = text.split(/\s+/).length;
            return wordCount > 0 ? keywordCount / wordCount : 0;
        };

        const scores = {
            personalInfo: scoreSection('personalInfo', data.personalInfo, weights.personal || 0),
            experience: scoreSection('experience', data.experience, weights.experience || 0),
            education: scoreSection('education', data.education, weights.education || 0),
            skills: scoreSection('skills', data.skills, weights.skills || 0),
            projects: scoreSection('projects', data.projects, weights.projects || 0),
            summary: scoreSection('summary', data.summary, weights.summary || 0)
        };

        const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
        const maxPossible = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

        let finalScore = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 0;

        if (data.certifications?.length > 0) finalScore = Math.min(finalScore + 5, 100);
        if (data.languages?.length > 1) finalScore = Math.min(finalScore + 3, 100);
        if (data.references?.length > 0) finalScore = Math.min(finalScore + 2, 100);

        const analysis = {
            total: finalScore,
            breakdown: scores,
            recommendations: generateAIRecommendations(scores, weights),
            industry: industry,
            strengths: identifyStrengths(scores),
            weaknesses: identifyWeaknesses(scores),
            improvementAreas: identifyImprovementAreas(scores, weights),
            keywords: extractKeywords(data, industry),
            lastAnalyzed: new Date().toISOString()
        };

        return analysis;
    }, []);

    const generateAIRecommendations = useCallback((scores, weights) => {
        const recommendations = [];
        const threshold = 0.6;

        if (weights.experience > 0 && scores.experience / weights.experience < threshold) {
            recommendations.push({
                type: 'experience',
                priority: 'high',
                message: "Add quantifiable achievements to your work experience",
                action: "Add metrics like 'increased efficiency by 40%' or 'managed $500K budget'"
            });
        }

        if (weights.skills > 0 && scores.skills / weights.skills < threshold) {
            recommendations.push({
                type: 'skills',
                priority: 'medium',
                message: "Add more technical and soft skills",
                action: "Include 8-12 relevant skills with proficiency levels"
            });
        }

        if (weights.summary > 0 && scores.summary / weights.summary < threshold) {
            recommendations.push({
                type: 'summary',
                priority: 'high',
                message: "Enhance your professional summary",
                action: "Write a 100-150 word summary with key achievements and career goals"
            });
        }

        if (weights.education > 0 && scores.education / weights.education < threshold) {
            recommendations.push({
                type: 'education',
                priority: 'medium',
                message: "Add more education details",
                action: "Include relevant coursework, projects, and honors"
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                type: 'excellent',
                priority: 'low',
                message: "Great job! Your resume is well-optimized",
                action: "Consider adding certifications or publications for bonus points"
            });
        }

        return recommendations.slice(0, 4);
    }, []);

    const identifyStrengths = useCallback((scores) => {
        const strengths = [];
        Object.entries(scores).forEach(([section, score]) => {
            if (score > 8) {
                strengths.push(section);
            }
        });
        return strengths;
    }, []);

    const identifyWeaknesses = useCallback((scores) => {
        const weaknesses = [];
        Object.entries(scores).forEach(([section, score]) => {
            if (score < 4) {
                weaknesses.push(section);
            }
        });
        return weaknesses;
    }, []);

    const identifyImprovementAreas = useCallback((scores, weights) => {
        const improvements = [];
        Object.entries(scores).forEach(([section, score]) => {
            const weight = weights[section] || 0;
            const percentage = weight > 0 ? (score / weight) * 100 : 0;
            if (percentage < 60 && weight > 0) {
                improvements.push({
                    section,
                    currentScore: score,
                    maxPossible: weight,
                    percentage: Math.round(percentage)
                });
            }
        });
        return improvements.sort((a, b) => a.percentage - b.percentage);
    }, []);

    const extractKeywords = useCallback((data, industry) => {
        const keywords = new Set();

        if (data.personalInfo?.title) {
            data.personalInfo.title.toLowerCase().split(/\s+/).forEach(word => {
                if (word.length > 3) keywords.add(word);
            });
        }

        if (data.summary) {
            data.summary.toLowerCase().match(/\b\w{5,}\b/g)?.forEach(word => {
                keywords.add(word);
            });
        }

        if (data.skills) {
            data.skills.forEach(skill => {
                if (skill.name) {
                    skill.name.toLowerCase().split(/\s+/).forEach(word => {
                        if (word.length > 2) keywords.add(word);
                    });
                }
            });
        }

        return Array.from(keywords).slice(0, 15);
    }, []);

    const calculateProgress = useCallback((resume) => {
        const data = resume.data || {};
        let completed = 0;
        let total = 8;

        if (data.personalInfo?.firstName && data.personalInfo?.email) completed++;
        if (data.summary && data.summary.trim().length > 50) completed++;
        if (data.experience && data.experience.length > 0) completed++;
        if (data.education && data.education.length > 0) completed++;
        if (data.skills && data.skills.length >= 5) completed++;
        if (data.projects && data.projects.length > 0) completed++;
        if (data.certifications && data.certifications.length > 0) completed++;
        if (data.languages && data.languages.length > 0) completed++;

        return Math.round((completed / total) * 100);
    }, []);

    const formatDate = useCallback((dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;

            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return 'N/A';
        }
    }, []);

    const loadUserResumes = useCallback(async () => {
        if (!isAuthenticated || !token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/resumes');
            const userResumes = response.data.data?.resumes || [];

            const analyzedResumes = userResumes.map(resume => {
                const analysis = calculateATSScore(resume);
                return {
                    ...resume,
                    analysis,
                    atsScore: analysis.total,
                    progress: calculateProgress(resume),
                    updatedAt: resume.updatedAt || resume.createdAt || new Date().toISOString()
                };
            });

            setResumes(analyzedResumes);
            calculateComprehensiveStats(analyzedResumes);
            updateTrendData(analyzedResumes);

            toast.success(`Loaded ${analyzedResumes.length} resumes with AI analysis`);

        } catch (error) {
            console.error('Error loading resumes:', error);

            const savedResumes = JSON.parse(localStorage.getItem('savedResumes') || '[]');
            const userResumes = savedResumes.filter(resume =>
                resume.userId === user?.id || resume.userEmail === user?.email
            );

            const analyzedResumes = userResumes.map(resume => {
                const analysis = calculateATSScore(resume);
                return {
                    ...resume,
                    analysis,
                    atsScore: analysis.total,
                    progress: calculateProgress(resume),
                    updatedAt: resume.updatedAt || resume.createdAt || new Date().toISOString()
                };
            });

            setResumes(analyzedResumes);
            calculateComprehensiveStats(analyzedResumes);
            updateTrendData(analyzedResumes);

            toast('Using demo data. Login for full database access.', {
                icon: '💾',
                duration: 3000,
            });
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, token, user, api, calculateATSScore, calculateProgress]);

    const calculateComprehensiveStats = useCallback((resumesList) => {
        const total = resumesList.length;
        const recent = resumesList.filter(r => {
            const date = r.updatedAt || r.createdAt;
            if (!date) return false;
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(date) > weekAgo;
        }).length;

        const completed = resumesList.filter(r => calculateProgress(r) >= 80).length;
        const scores = resumesList.map(r => r.analysis?.total || 0).filter(s => s > 0);

        const averageATS = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const worstScore = scores.length > 0 ? Math.min(...scores) : 0;

        const templates = {};
        resumesList.forEach(r => {
            const template = r.template || 'modern';
            templates[template] = (templates[template] || 0) + 1;
        });

        const topIndustries = {};
        resumesList.forEach(r => {
            const industry = r.data?.personalInfo?.industry || 'general';
            topIndustries[industry] = (topIndustries[industry] || 0) + 1;
        });

        const sectionCompletion = {
            personalInfo: 0,
            summary: 0,
            experience: 0,
            education: 0,
            skills: 0,
            projects: 0,
            certifications: 0,
            languages: 0
        };

        resumesList.forEach(r => {
            const data = r.data || {};
            if (data.personalInfo?.firstName && data.personalInfo?.email) sectionCompletion.personalInfo++;
            if (data.summary?.length > 50) sectionCompletion.summary++;
            if (data.experience?.length > 0) sectionCompletion.experience++;
            if (data.education?.length > 0) sectionCompletion.education++;
            if (data.skills?.length >= 5) sectionCompletion.skills++;
            if (data.projects?.length > 0) sectionCompletion.projects++;
            if (data.certifications?.length > 0) sectionCompletion.certifications++;
            if (data.languages?.length > 0) sectionCompletion.languages++;
        });

        Object.keys(sectionCompletion).forEach(key => {
            sectionCompletion[key] = total > 0
                ? Math.round((sectionCompletion[key] / total) * 100)
                : 0;
        });

        const overallProgress = total > 0
            ? Math.round((completed / total) * 100)
            : 0;

        setStats({
            total,
            recent,
            completed,
            averageATS,
            bestScore,
            worstScore,
            aiAnalyzed: scores.length,
            templates,
            topIndustries,
            sectionCompletion,
            overallProgress
        });

        setOverallProgress(overallProgress);
    }, [calculateProgress]);

    const updateTrendData = useCallback((resumesList) => {
        const trend = resumesList
            .filter(r => r.updatedAt)
            .sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt))
            .map((resume, index) => ({
                date: new Date(resume.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: resume.analysis?.total || 0,
                progress: calculateProgress(resume)
            }))
            .slice(-7);

        setTrendData(trend);
    }, [calculateProgress]);

    const performClientSideSearch = useCallback(() => {
        let filtered = [...resumes];

        if (activeTab === 'drafts') {
            filtered = filtered.filter(r => r.status === 'draft');
        } else if (activeTab === 'completed') {
            filtered = filtered.filter(r => calculateProgress(r) >= 80);
        } else if (activeTab === 'needs-work') {
            filtered = filtered.filter(r => {
                const score = r.analysis?.total || 0;
                return score < 70;
            });
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(r => {
                const title = r.title || '';
                const data = r.data || {};
                const firstName = data.personalInfo?.firstName || '';
                const lastName = data.personalInfo?.lastName || '';
                const summary = data.summary || '';
                const industry = data.personalInfo?.industry || '';
                const keywords = r.analysis?.keywords || [];

                return (
                    title.toLowerCase().includes(query) ||
                    firstName.toLowerCase().includes(query) ||
                    lastName.toLowerCase().includes(query) ||
                    summary.toLowerCase().includes(query) ||
                    industry.toLowerCase().includes(query) ||
                    keywords.some(kw => kw.includes(query))
                );
            });
        }

        if (filter !== 'all') {
            filtered = filtered.filter(r => r.template === filter);
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return (a.title || '').localeCompare(b.title || '');
                case 'updated':
                    const dateA = new Date(a.updatedAt || a.createdAt || 0);
                    const dateB = new Date(b.updatedAt || b.createdAt || 0);
                    return dateB - dateA;
                case 'progress':
                    return calculateProgress(b) - calculateProgress(a);
                case 'score':
                default:
                    const scoreA = a.analysis?.total || 0;
                    const scoreB = b.analysis?.total || 0;
                    return scoreB - scoreA;
            }
        });

        setFilteredResumes(filtered);
    }, [resumes, searchQuery, filter, sortBy, activeTab, calculateProgress]);

    const runEnhancedAIAnalysis = async () => {
        if (resumes.length === 0) {
            toast.error('No resumes to analyze');
            return;
        }

        setAnalyzing(true);
        try {
            toast.loading('Running enhanced AI analysis...', {
                duration: 3000,
                icon: '🧠'
            });

            await new Promise(resolve => setTimeout(resolve, 2500));

            const reanalyzedResumes = resumes.map(resume => {
                const newAnalysis = calculateATSScore(resume);
                return {
                    ...resume,
                    analysis: newAnalysis,
                    atsScore: newAnalysis.total,
                    progress: calculateProgress(resume),
                    updatedAt: new Date().toISOString()
                };
            });

            setResumes(reanalyzedResumes);
            calculateComprehensiveStats(reanalyzedResumes);
            updateTrendData(reanalyzedResumes);

            try {
                const resumeUpdates = reanalyzedResumes.map(({ _id, analysis, atsScore, updatedAt }) => ({
                    id: _id,
                    analysis,
                    atsScore,
                    updatedAt
                }));

                await api.patch('/resumes/analysis', { updates: resumeUpdates });
            } catch (dbError) {
                console.warn('Could not save analysis to database:', dbError);
            }

            toast.dismiss();
            toast.success(`Enhanced analysis complete! Updated ${reanalyzedResumes.length} resumes`, {
                icon: '✅',
                duration: 3000,
            });

        } catch (error) {
            console.error('AI analysis failed:', error);
            toast.dismiss();
            toast.error('AI analysis failed. Please try again.', {
                icon: '❌',
                duration: 3000,
            });
        } finally {
            setAnalyzing(false);
        }
    };

    // UPDATED: Navigate to /build for BuilderHome
    const handleCreateResume = () => {
        navigate('/build', {  // Changed to /build for BuilderHome
            state: {
                quickStart: true,
                suggestedTemplate: 'modern',
                industry: user?.profile?.industry || 'tech'
            }
        });
    };

    // UPDATED: Navigate to /build for BuilderHome with template
    const handleQuickTemplate = (template) => {
        navigate('/build', {  // Changed to /build for BuilderHome
            state: {
                quickStart: true,
                suggestedTemplate: template,
                industry: user?.profile?.industry || 'tech',
                directStart: true
            }
        });
    };

    const handleDeleteResume = async (resumeId) => {
        try {
            await api.delete(`/resumes/${resumeId}`);

            const updatedResumes = resumes.filter(r => r._id !== resumeId);
            setResumes(updatedResumes);
            calculateComprehensiveStats(updatedResumes);

            toast.success('Resume deleted successfully!');
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error('Failed to delete resume');
        } finally {
            setShowDeleteConfirm(null);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 80) return 'text-green-500';
        if (score >= 70) return 'text-yellow-500';
        if (score >= 60) return 'text-orange-500';
        return 'text-red-500';
    };

    const getScoreBg = (score) => {
        if (score >= 90) return 'bg-emerald-500';
        if (score >= 80) return 'bg-green-500';
        if (score >= 70) return 'bg-yellow-500';
        if (score >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500 bg-red-50';
            case 'medium': return 'text-yellow-500 bg-yellow-50';
            case 'low': return 'text-green-500 bg-green-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadUserResumes();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, loadUserResumes]);

    useEffect(() => {
        if (resumes.length > 0) {
            performClientSideSearch();
        }
    }, [resumes, searchQuery, filter, sortBy, activeTab, performClientSideSearch]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Loading Dashboard
                        </span>
                    </h3>
                    <p className="text-slate-600">
                        Fetching your resumes and analyzing with AI...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">
                                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    AI Resume Dashboard
                                </span>
                            </h1>
                            <p className="text-slate-600">
                                Manage, analyze, and optimize your resumes with AI-powered insights
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={runEnhancedAIAnalysis}
                                disabled={analyzing || resumes.length === 0}
                                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                {analyzing ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <FaBrain />
                                        Run AI Analysis
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleCreateResume}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <FaPlus />
                                New Resume
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Total Resumes</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <FaFileAlt className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <FaRegClock className="w-4 h-4 mr-1" />
                            <span>{stats.recent} updated this week</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Avg. ATS Score</p>
                                <h3 className={`text-3xl font-bold ${getScoreColor(stats.averageATS)} mt-1`}>
                                    {stats.averageATS}/100
                                </h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                <FaChartLine className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <FaMedal className="w-4 h-4 mr-1 text-yellow-500" />
                            <span>Best: {stats.bestScore}/100</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">Completed</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.completed}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                                <FaCheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <FaRocket className="w-4 h-4 mr-1 text-blue-500" />
                            <span>{stats.overallProgress}% overall progress</span>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-slate-500 text-sm font-medium">AI Analyzed</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.aiAnalyzed}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                                <FaRobot className="w-6 h-6 text-pink-600" />
                            </div>
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                            <FaSync className="w-4 h-4 mr-1 text-purple-500" />
                            <span>Last analyzed recently</span>
                        </div>
                    </motion.div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search resumes by name, title, industry, or keywords..."
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Templates</option>
                                <option value="modern">Modern</option>
                                <option value="classic">Classic</option>
                                <option value="creative">Creative</option>
                                <option value="professional">Professional</option>
                            </select>
                            <select
                                className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="score">Sort by Score</option>
                                <option value="title">Sort by Title</option>
                                <option value="updated">Sort by Updated</option>
                                <option value="progress">Sort by Progress</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-6">
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Resumes ({resumes.length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'drafts' ? 'bg-yellow-100 text-yellow-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setActiveTab('drafts')}
                        >
                            Drafts ({resumes.filter(r => r.status === 'draft').length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setActiveTab('completed')}
                        >
                            Completed ({resumes.filter(r => calculateProgress(r) >= 80).length})
                        </button>
                        <button
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'needs-work' ? 'bg-red-100 text-red-700' : 'text-slate-600 hover:bg-slate-100'}`}
                            onClick={() => setActiveTab('needs-work')}
                        >
                            Needs Work ({resumes.filter(r => (r.analysis?.total || 0) < 70).length})
                        </button>
                    </div>
                </div>

                {filteredResumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredResumes.map((resume, index) => (
                            <motion.div
                                key={resume._id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="p-6 border-b border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 truncate">
                                                {resume.title || 'Untitled Resume'}
                                            </h3>
                                            <p className="text-slate-500 text-sm mt-1">
                                                {resume.data?.personalInfo?.title || 'No title specified'}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getScoreBg(resume.atsScore)} text-white`}>
                                            {resume.atsScore}/100
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-slate-600 mb-1">
                                            <span>Completion</span>
                                            <span>{resume.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${resume.progress >= 80 ? 'bg-emerald-500' : resume.progress >= 60 ? 'bg-yellow-500' : 'bg-blue-500'}`}
                                                style={{ width: `${resume.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center">
                                                <FaPalette className="w-4 h-4 mr-1" />
                                                {resume.template || 'modern'}
                                            </span>
                                            <span className="flex items-center">
                                                <FaBriefcase className="w-4 h-4 mr-1" />
                                                {resume.data?.personalInfo?.industry || 'tech'}
                                            </span>
                                        </div>
                                        <span className="flex items-center">
                                            <FaClock className="w-4 h-4 mr-1" />
                                            {formatDate(resume.updatedAt)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                                            <FaBrain className="w-4 h-4 mr-2 text-purple-500" />
                                            AI Analysis
                                        </h4>
                                        {resume.analysis?.recommendations?.[0] && (
                                            <div className={`p-3 rounded-lg ${getPriorityColor(resume.analysis.recommendations[0].priority)}`}>
                                                <p className="text-sm font-medium mb-1">{resume.analysis.recommendations[0].message}</p>
                                                <p className="text-xs opacity-75">{resume.analysis.recommendations[0].action}</p>
                                            </div>
                                        )}
                                    </div>

                                    {resume.analysis?.keywords && resume.analysis.keywords.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-slate-900 mb-2 flex items-center">
                                                <FaMicrochip className="w-4 h-4 mr-2 text-blue-500" />
                                                Keywords
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {resume.analysis.keywords.slice(0, 5).map((keyword, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                                                    >
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/builder/${resume._id}/edit`, {
                                                    state: {
                                                        resumeId: resume._id,
                                                        editMode: true
                                                    }
                                                })}
                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/preview/${resume._id || 'preview'}`)}
                                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Preview"
                                            >
                                                <FaEye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(resume._id)}
                                                className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/analyze/${resume._id || 'analyze'}`)}
                                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                                        >
                                            <FaRobot className="w-4 h-4" />
                                            Analyze
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-lg border border-slate-100 mb-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                            <FaFileAlt className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">
                            No resumes found
                        </h3>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                            {searchQuery || filter !== 'all' || activeTab !== 'all'
                                ? 'Try adjusting your search criteria or filters'
                                : 'Get started by creating your first AI-optimized resume'}
                        </p>
                        <button
                            onClick={handleCreateResume}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            Create Your First Resume
                        </button>
                    </div>
                )}

                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Quick Templates
                        </h2>
                        <button
                            onClick={() => setShowQuickActions(!showQuickActions)}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                        >
                            {showQuickActions ? 'Hide' : 'Show All'}
                            <FaChevronRight className={`w-4 h-4 transition-transform ${showQuickActions ? 'rotate-90' : ''}`} />
                        </button>
                    </div>

                    <AnimatePresence>
                        {showQuickActions && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    {['Modern Professional', 'Creative Designer', 'Academic Research', 'Tech Developer'].map((template, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickTemplate(template.toLowerCase().split(' ')[0])}
                                            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow text-left group"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                {template.includes('Tech') ? <FaCode className="w-6 h-6 text-white" /> :
                                                    template.includes('Creative') ? <FaPalette className="w-6 h-6 text-white" /> :
                                                        template.includes('Academic') ? <FaGraduationCap className="w-6 h-6 text-white" /> :
                                                            <FaUserTie className="w-6 h-6 text-white" />}
                                            </div>
                                            <h4 className="font-bold text-slate-900 mb-2">{template}</h4>
                                            <p className="text-sm text-slate-600">
                                                Start with a pre-optimized template for {template.split(' ')[0].toLowerCase()} roles
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                                <FaExclamationTriangle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                                Delete Resume
                            </h3>
                            <p className="text-slate-600 text-center mb-6">
                                Are you sure you want to delete this resume? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteResume(showDeleteConfirm)}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Footer />
        </div>
    );
};

export default Dashboard;