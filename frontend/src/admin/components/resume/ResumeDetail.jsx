// frontend/src/admin/pages/ResumeDetail.jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { formatDate, formatDateTime, truncateText, getStatusColor, formatBytes } from '../../utils/formatters';

const ResumeDetail = () => {
    const { id } = useParams();
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data for demonstration
        setTimeout(() => {
            setResume({
                id: id,
                title: 'Senior Software Engineer Resume',
                user: {
                    name: 'John Doe',
                    email: 'john@example.com'
                },
                status: 'published',
                createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
                views: 124,
                downloads: 8,
                aiAnalyses: 3,
                lastAnalysis: new Date(Date.now() - 86400000).toISOString(),
                atsScore: 87,
                fileSize: 256789,
                sections: {
                    personalInfo: true,
                    summary: true,
                    experience: true,
                    education: true,
                    skills: true,
                    projects: false,
                    certifications: true
                },
                analysisHistory: [
                    {
                        id: 1,
                        type: 'ATS Analysis',
                        score: 87,
                        date: new Date(Date.now() - 86400000).toISOString(),
                        recommendations: ['Add more keywords', 'Improve formatting']
                    },
                    {
                        id: 2,
                        type: 'Content Analysis',
                        score: 92,
                        date: new Date(Date.now() - 172800000).toISOString(),
                        recommendations: ['Great content structure', 'Consider adding metrics']
                    }
                ]
            });
            setLoading(false);
        }, 1000);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading resume details...</p>
                </div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Resume not found</h2>
                    <Link to="/admin/resumes" className="text-blue-600 hover:text-blue-800">
                        ← Back to Resumes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white border-b border-slate-200">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link to="/admin/resumes" className="text-slate-600 hover:text-blue-600 flex items-center">
                                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Resumes
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{resume.title}</h1>
                                <p className="text-slate-600">Resume ID: {resume.id}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(resume.status)}`}>
                                {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                            </span>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-4 md:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Resume Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Resume Stats */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Resume Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{resume.views}</div>
                                    <div className="text-sm text-blue-800">Views</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{resume.downloads}</div>
                                    <div className="text-sm text-green-800">Downloads</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">{resume.aiAnalyses}</div>
                                    <div className="text-sm text-purple-800">AI Analyses</div>
                                </div>
                                <div className="text-center p-4 bg-orange-50 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{resume.atsScore}%</div>
                                    <div className="text-sm text-orange-800">ATS Score</div>
                                </div>
                            </div>
                        </div>

                        {/* User Information */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">User Information</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Name:</span>
                                    <span className="font-medium">{resume.user.name}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Email:</span>
                                    <span className="font-medium">{resume.user.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Created:</span>
                                    <span className="font-medium">{formatDateTime(resume.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">Last Updated:</span>
                                    <span className="font-medium">{formatDateTime(resume.updatedAt)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-600">File Size:</span>
                                    <span className="font-medium">{formatBytes(resume.fileSize)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Analysis History */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Analysis History</h2>
                            <div className="space-y-4">
                                {resume.analysisHistory.map((analysis) => (
                                    <div key={analysis.id} className="p-4 border border-slate-200 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-medium text-slate-900">{analysis.type}</h3>
                                            <div className="flex items-center">
                                                <span className="text-lg font-bold text-blue-600 mr-2">{analysis.score}%</span>
                                                <span className="text-sm text-slate-500">{formatDate(analysis.date)}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            <p className="font-medium mb-1">Recommendations:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {analysis.recommendations.map((rec, idx) => (
                                                    <li key={idx}>{rec}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Actions and Sections */}
                    <div className="space-y-6">
                        {/* Resume Actions */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Resume Actions</h2>
                            <div className="space-y-3">
                                <button className="w-full px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left font-medium">
                                    Run AI Analysis
                                </button>
                                <button className="w-full px-4 py-3 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left font-medium">
                                    Export as PDF
                                </button>
                                <button className="w-full px-4 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left font-medium">
                                    View Analytics
                                </button>
                                <button className="w-full px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left font-medium">
                                    Delete Resume
                                </button>
                            </div>
                        </div>

                        {/* Resume Sections */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Resume Sections</h2>
                            <div className="space-y-3">
                                {Object.entries(resume.sections).map(([section, completed]) => (
                                    <div key={section} className="flex items-center justify-between">
                                        <span className="text-slate-700 capitalize">
                                            {section.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className={completed ? 'text-green-600' : 'text-red-600'}>
                                            {completed ? '✓' : '✗'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ATS Score Breakdown */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">ATS Score Breakdown</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-slate-600">Keyword Match</span>
                                        <span className="text-sm font-medium">85%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-slate-600">Formatting</span>
                                        <span className="text-sm font-medium">92%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-slate-600">Content Quality</span>
                                        <span className="text-sm font-medium">78%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Metadata</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Last Analysis:</span>
                                    <span>{formatDate(resume.lastAnalysis)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Completion:</span>
                                    <span>6/7 sections</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Version:</span>
                                    <span>3</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Template:</span>
                                    <span>Modern</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResumeDetail;