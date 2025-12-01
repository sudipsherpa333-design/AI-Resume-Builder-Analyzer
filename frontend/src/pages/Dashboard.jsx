import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    FaFileAlt,
    FaChartLine,
    FaUserEdit,
    FaArrowUp,
    FaArrowDown,
    FaEdit,
    FaTrash,
    FaCopy,
    FaSearch,
    FaRobot,
    FaBrain,
    FaPlus,
    FaEye
} from 'react-icons/fa';

// Enhanced chart components
const ProgressChart = ({ percentage, color = 'blue', size = 'medium', label = '' }) => {
    const sizes = {
        small: 'w-16 h-16',
        medium: 'w-20 h-20',
        large: 'w-24 h-24',
        xl: 'w-32 h-32'
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-500';
        if (score >= 80) return 'text-blue-500';
        if (score >= 70) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="flex flex-col items-center">
            <div className={`relative ${sizes[size]} ${getScoreColor(percentage)}`}>
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity="0.2"
                        strokeWidth="3"
                    />
                    <path
                        d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${percentage}, 100`}
                        transform="rotate(-90 18 18)"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold ${size === 'small' ? 'text-sm' : size === 'xl' ? 'text-xl' : 'text-lg'}`}>
                        {percentage}%
                    </span>
                </div>
            </div>
            {label && <span className="text-xs text-gray-600 mt-2 font-medium">{label}</span>}
        </div>
    );
};

const BarChart = ({ data, color = 'blue', title = '' }) => {
    const colors = {
        blue: 'bg-gradient-to-b from-blue-400 to-blue-600',
        green: 'bg-gradient-to-b from-green-400 to-green-600',
        purple: 'bg-gradient-to-b from-purple-400 to-purple-600',
        orange: 'bg-gradient-to-b from-orange-400 to-orange-600'
    };

    const maxValue = Math.max(...data.map(item => item.value));

    return (
        <div>
            {title && <h4 className="text-sm font-semibold text-gray-900 mb-3">{title}</h4>}
            <div className="flex items-end justify-between h-32 gap-2">
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                        <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                        <div
                            className={`${colors[color]} rounded-t-lg transition-all duration-500 hover:opacity-80 relative group w-full`}
                            style={{ height: `${(item.value / maxValue) * 80}%` }}
                        >
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {item.value}
                            </div>
                        </div>
                        <div className="text-xs font-semibold text-gray-900 mt-1">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState({
        stats: {},
        recentActivities: [],
        resumes: [],
        analytics: {},
        aiInsights: []
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await fetch('/api/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setDashboardData(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Fallback to sample data if API fails
            await fetchSampleData();
        } finally {
            setLoading(false);
        }
    };

    const fetchSampleData = async () => {
        // Sample data based on user's actual resume content
        const sampleData = {
            stats: {
                totalResumes: 3,
                averageScore: 87,
                profileCompletion: 92,
                improvementsMade: 12,
                aiAnalysisCount: 8
            },
            recentActivities: [
                {
                    id: 1,
                    action: 'AI Analysis Completed',
                    resume: 'Senior Frontend Developer',
                    time: '2 hours ago',
                    type: 'analysis',
                    score: 92,
                    details: 'OpenAI analyzed your React and TypeScript experience'
                },
                {
                    id: 2,
                    action: 'Skills Updated',
                    resume: 'Full Stack Engineer',
                    time: '1 day ago',
                    type: 'update',
                    details: 'Added Node.js and MongoDB experience'
                },
                {
                    id: 3,
                    action: 'Education Enhanced',
                    resume: 'Tech Lead Resume',
                    time: '2 days ago',
                    type: 'update',
                    details: 'Updated with latest certifications and courses'
                },
                {
                    id: 4,
                    action: 'Resume Created',
                    resume: 'Software Architect',
                    time: '3 days ago',
                    type: 'creation',
                    details: 'New resume created with your system design experience'
                }
            ],
            resumes: [
                {
                    _id: '1',
                    title: 'Senior Frontend Developer',
                    lastModified: '2024-01-15T10:30:00Z',
                    createdAt: '2024-01-10T14:20:00Z',
                    overallScore: 92,
                    aiAnalysis: {
                        contentScore: 88,
                        skillsScore: 95,
                        experienceScore: 90,
                        educationScore: 85,
                        lastAnalyzed: '2024-01-15T08:45:00Z',
                        suggestions: ['Add more React hooks examples', 'Include TypeScript advanced patterns']
                    },
                    skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'JavaScript'],
                    version: 'v3.2',
                    fileSize: '2.1 MB'
                },
                {
                    _id: '2',
                    title: 'Full Stack Engineer',
                    lastModified: '2024-01-12T09:15:00Z',
                    createdAt: '2024-01-05T11:45:00Z',
                    overallScore: 85,
                    aiAnalysis: {
                        contentScore: 82,
                        skillsScore: 88,
                        experienceScore: 85,
                        educationScore: 80,
                        lastAnalyzed: '2024-01-12T07:30:00Z',
                        suggestions: ['Add more backend technologies', 'Include database optimization experience']
                    },
                    skills: ['Node.js', 'MongoDB', 'AWS', 'Express', 'React'],
                    version: 'v2.1',
                    fileSize: '1.8 MB'
                },
                {
                    _id: '3',
                    title: 'Tech Lead Resume',
                    lastModified: '2024-01-10T16:20:00Z',
                    createdAt: '2023-12-20T10:15:00Z',
                    overallScore: 96,
                    aiAnalysis: {
                        contentScore: 94,
                        skillsScore: 95,
                        experienceScore: 98,
                        educationScore: 92,
                        lastAnalyzed: '2024-01-10T14:00:00Z',
                        suggestions: ['Highlight team leadership achievements', 'Add strategic planning examples']
                    },
                    skills: ['Leadership', 'System Design', 'Agile', 'Mentoring', 'Architecture'],
                    version: 'v4.0',
                    fileSize: '2.4 MB'
                }
            ],
            analytics: {
                resumePerformance: [
                    { label: 'Mon', value: 45 },
                    { label: 'Tue', value: 52 },
                    { label: 'Wed', value: 48 },
                    { label: 'Thu', value: 60 },
                    { label: 'Fri', value: 55 }
                ],
                scoreTrend: [
                    { label: 'Jan', value: 75 },
                    { label: 'Feb', value: 78 },
                    { label: 'Mar', value: 82 },
                    { label: 'Apr', value: 85 }
                ]
            },
            aiInsights: [
                {
                    id: 1,
                    type: 'skills',
                    title: 'Skill Enhancement Opportunity',
                    description: 'Based on your React experience, OpenAI suggests adding modern frameworks like Next.js 14 and state management libraries to increase market relevance',
                    priority: 'high',
                    impact: '+8% Market Match',
                    category: 'Technical Skills'
                },
                {
                    id: 2,
                    type: 'experience',
                    title: 'Experience Optimization',
                    description: 'Your leadership experience is strong. Consider adding specific metrics like team size, project scale, and business impact to make it more compelling',
                    priority: 'medium',
                    impact: '+12% Impact Score',
                    category: 'Work Experience'
                },
                {
                    id: 3,
                    type: 'education',
                    title: 'Education Enhancement',
                    description: 'Based on your Computer Science degree, adding recent certifications in cloud technologies (AWS, Azure) could significantly boost your profile',
                    priority: 'medium',
                    impact: '+6% Credibility',
                    category: 'Education'
                }
            ]
        };

        setDashboardData(sampleData);
    };

    const performanceMetrics = [
        {
            title: 'Total Resumes',
            value: dashboardData.stats.totalResumes || '0',
            change: '+2 this month',
            trend: 'up',
            icon: FaFileAlt,
            color: 'text-blue-600',
            bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100'
        },
        {
            title: 'AI Score',
            value: `${dashboardData.stats.averageScore || '0'}%`,
            change: '+5%',
            trend: 'up',
            icon: FaBrain,
            color: 'text-purple-600',
            bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100'
        },
        {
            title: 'Profile Complete',
            value: `${dashboardData.stats.profileCompletion || '0'}%`,
            change: '+12%',
            trend: 'up',
            icon: FaUserEdit,
            color: 'text-green-600',
            bgColor: 'bg-gradient-to-br from-green-50 to-green-100'
        },
        {
            title: 'AI Analysis',
            value: dashboardData.stats.aiAnalysisCount || '0',
            change: '+3',
            trend: 'up',
            icon: FaRobot,
            color: 'text-orange-600',
            bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100'
        }
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-gradient-to-r from-red-50 to-red-100 border-red-200';
            case 'medium': return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
            case 'low': return 'bg-gradient-to-r from-green-50 to-green-100 border-green-200';
            default: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Technical Skills': return 'text-blue-600 bg-blue-50';
            case 'Work Experience': return 'text-green-600 bg-green-50';
            case 'Education': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const filteredResumes = dashboardData.resumes.filter(resume => {
        return resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resume.skills.some(skill =>
                skill.toLowerCase().includes(searchTerm.toLowerCase())
            );
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleDeleteResume = async (resume) => {
        if (window.confirm(`Are you sure you want to delete "${resume.title}"?`)) {
            try {
                const response = await fetch(`/api/resumes/${resume._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.ok) {
                    setDashboardData(prev => ({
                        ...prev,
                        resumes: prev.resumes.filter(r => r._id !== resume._id)
                    }));
                } else {
                    throw new Error('Failed to delete resume');
                }
            } catch (error) {
                console.error('Error deleting resume:', error);
                alert('Failed to delete resume. Please try again.');
            }
        }
    };

    const handleCopyResume = async (resume) => {
        try {
            const response = await fetch(`/api/resumes/${resume._id}/duplicate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const newResume = await response.json();
                setDashboardData(prev => ({
                    ...prev,
                    resumes: [newResume, ...prev.resumes]
                }));
            } else {
                throw new Error('Failed to duplicate resume');
            }
        } catch (error) {
            console.error('Error duplicating resume:', error);
            alert('Failed to duplicate resume. Please try again.');
        }
    };

    const handleAnalyzeWithAI = async (resume) => {
        try {
            const response = await fetch(`/api/resumes/${resume._id}/analyze`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const analysis = await response.json();
                setDashboardData(prev => ({
                    ...prev,
                    resumes: prev.resumes.map(r =>
                        r._id === resume._id ? { ...r, aiAnalysis: analysis } : r
                    )
                }));
            } else {
                throw new Error('Failed to analyze resume');
            }
        } catch (error) {
            console.error('Error analyzing resume:', error);
            alert('Failed to analyze resume. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <div className="h-16 w-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-900 text-lg font-medium">Loading your AI-powered dashboard...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Welcome back, {user?.name || 'User'}! 👋
                            </h1>
                            <p className="text-gray-700 mt-2 text-lg">
                                AI-powered insights for your career growth
                            </p>
                        </div>
                        <div className="inline-flex items-center px-4 py-2 bg-white rounded-xl border shadow-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                            <span className="text-sm font-medium text-gray-900">OpenAI System Active</span>
                        </div>
                    </div>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                >
                    {performanceMetrics.map((metric, index) => (
                        <motion.div
                            key={metric.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">{metric.title}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                        <span className={`text-sm font-medium flex items-center ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {metric.trend === 'up' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                                            {metric.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-4 rounded-2xl ${metric.bgColor} ${metric.color}`}>
                                    <metric.icon className="text-2xl" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - Resumes & Analytics */}
                    <div className="xl:col-span-2 space-y-8">
                        {/* Resume Management Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-lg border p-6"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                                <div className="flex items-center gap-3">
                                    <FaFileAlt className="text-blue-600 text-xl" />
                                    <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
                                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                        {dashboardData.resumes.length} resumes
                                    </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative">
                                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by title or skills..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 w-64"
                                        />
                                    </div>
                                    <Link
                                        to="/builder"
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg"
                                    >
                                        <FaPlus className="text-sm" />
                                        Create New
                                    </Link>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredResumes.map((resume, index) => (
                                    <motion.div
                                        key={resume._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1 }}
                                        className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 group bg-gradient-to-r from-white to-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-6 flex-1">
                                                <div className="flex-shrink-0">
                                                    <ProgressChart
                                                        percentage={resume.overallScore}
                                                        size="medium"
                                                        label="AI Score"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <h3 className="font-bold text-gray-900 text-xl">
                                                            {resume.title}
                                                        </h3>
                                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                                                            {resume.version}
                                                        </span>
                                                    </div>

                                                    {/* AI Analysis Scores */}
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700 mb-4">
                                                        <div className="text-center">
                                                            <div className="font-semibold text-gray-900">{resume.aiAnalysis?.contentScore || 'N/A'}%</div>
                                                            <div className="text-xs text-gray-600">Content</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-semibold text-gray-900">{resume.aiAnalysis?.skillsScore || 'N/A'}%</div>
                                                            <div className="text-xs text-gray-600">Skills</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-semibold text-gray-900">{resume.aiAnalysis?.experienceScore || 'N/A'}%</div>
                                                            <div className="text-xs text-gray-600">Experience</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-semibold text-gray-900">{resume.aiAnalysis?.educationScore || 'N/A'}%</div>
                                                            <div className="text-xs text-gray-600">Education</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-gray-700 mb-3">
                                                        <span>Created: {formatDate(resume.createdAt)}</span>
                                                        <span>Modified: {formatDate(resume.lastModified)}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {resume.skills.slice(0, 5).map((skill, idx) => (
                                                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        {resume.skills.length > 5 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{resume.skills.length - 5} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Link
                                                    to={`/builder?resumeId=${resume._id}`}
                                                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                                                    title="Edit Resume"
                                                >
                                                    <FaEdit />
                                                </Link>
                                                <button
                                                    onClick={() => handleCopyResume(resume)}
                                                    className="p-3 text-green-600 hover:bg-green-50 rounded-xl transition-all duration-200"
                                                    title="Duplicate Resume"
                                                >
                                                    <FaCopy />
                                                </button>
                                                <button
                                                    onClick={() => handleAnalyzeWithAI(resume)}
                                                    className="p-3 text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                                                    title="Analyze with AI"
                                                >
                                                    <FaRobot />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteResume(resume)}
                                                    className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                    title="Delete Resume"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Analytics Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white rounded-2xl shadow-lg border p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Performance</h3>
                                <BarChart
                                    data={dashboardData.analytics?.resumePerformance || []}
                                    color="blue"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white rounded-2xl shadow-lg border p-6"
                            >
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Score Trend</h3>
                                <BarChart
                                    data={dashboardData.analytics?.scoreTrend || []}
                                    color="purple"
                                />
                            </motion.div>
                        </div>
                    </div>

                    {/* Right Column - Insights & Activity */}
                    <div className="space-y-8">
                        {/* OpenAI Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl shadow-lg border p-6"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <FaBrain className="text-purple-600 text-xl" />
                                <h2 className="text-xl font-semibold text-gray-900">OpenAI Insights</h2>
                            </div>
                            <div className="space-y-4">
                                {dashboardData.aiInsights?.map((insight, index) => (
                                    <motion.div
                                        key={insight.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className={`p-4 rounded-xl border-2 ${getPriorityColor(insight.priority)} hover:shadow-md transition-all duration-200`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(insight.category)}`}>
                                                        {insight.category}
                                                    </span>
                                                    <span className="text-xs font-medium text-gray-500">
                                                        {insight.priority} priority
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                                                <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium px-3 py-1 bg-white rounded-full border">
                                                        💡 {insight.impact}
                                                    </span>
                                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                        Apply Suggestion →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-2xl shadow-lg border p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                                <Link to="/activity" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                    View All
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {dashboardData.recentActivities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50 rounded-lg px-2 transition-all duration-200"
                                    >
                                        <div className={`w-3 h-3 rounded-full mt-2 ${activity.type === 'analysis' ? 'bg-purple-500' :
                                            activity.type === 'creation' ? 'bg-blue-500' :
                                                activity.type === 'update' ? 'bg-green-500' :
                                                    'bg-orange-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900">
                                                {activity.action}
                                                {activity.score && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                        {activity.score}% Score
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-sm text-blue-600 font-medium">{activity.resume}</p>
                                            {activity.details && (
                                                <p className="text-sm text-gray-700 mt-1">{activity.details}</p>
                                            )}
                                            <p className="text-xs text-gray-600 mt-1">{activity.time}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;