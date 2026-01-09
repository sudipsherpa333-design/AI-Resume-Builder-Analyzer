// src/components/builder/FinalReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle, AlertCircle, FileCheck, FileSearch, FileBarChart,
    FileText, FileCode, Printer, Download, QrCode, RefreshCw,
    ShieldCheck, Sparkles, Eye, Star, TrendingUp, Target,
    Clock, Users, Zap, Award, BookOpen, Check, X,
    ArrowRight, ExternalLink, Copy, Share2, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FinalReviewsPage = ({
    resumeData = {},
    stats = {},
    reviewStatus = {},
    onReviewComplete = () => { },
    onExport = () => { },
    onPrint = () => { },
    onGenerateQR = () => { },
    qrCodeUrl = '',
    isExporting = false,
    onClose = () => { },
    onComplete = () => { }
}) => {
    const [activeReview, setActiveReview] = useState('grammar');
    const [isChecking, setIsChecking] = useState(false);
    const [showAllIssues, setShowAllIssues] = useState(false);
    const [selectedExportFormat, setSelectedExportFormat] = useState('pdf');

    const reviewTypes = [
        {
            id: 'grammar',
            title: 'Grammar & Spelling',
            description: 'Check for typos, grammar errors, and punctuation',
            icon: FileText,
            color: 'bg-blue-100 text-blue-600',
            importance: 'high'
        },
        {
            id: 'ats',
            title: 'ATS Compatibility',
            description: 'Optimize for Applicant Tracking Systems',
            icon: FileSearch,
            color: 'bg-green-100 text-green-600',
            importance: 'high'
        },
        {
            id: 'design',
            title: 'Design & Formatting',
            description: 'Ensure consistent formatting and visual appeal',
            icon: FileCode,
            color: 'bg-purple-100 text-purple-600',
            importance: 'medium'
        },
        {
            id: 'content',
            title: 'Content Quality',
            description: 'Review content effectiveness and impact',
            icon: FileBarChart,
            color: 'bg-amber-100 text-amber-600',
            importance: 'high'
        }
    ];

    const sampleIssues = {
        grammar: [
            { id: 1, type: 'spelling', text: 'Incorrect spelling of "accomplishment"', severity: 'low' },
            { id: 2, type: 'grammar', text: 'Missing comma after introductory phrase', severity: 'medium' },
            { id: 3, type: 'punctuation', text: 'Inconsistent use of semicolons', severity: 'low' }
        ],
        ats: [
            { id: 1, type: 'keyword', text: 'Add more industry-specific keywords', severity: 'medium' },
            { id: 2, type: 'format', text: 'Avoid using tables for layout', severity: 'high' },
            { id: 3, type: 'header', text: 'Use standard section headers', severity: 'medium' }
        ],
        design: [
            { id: 1, type: 'consistency', text: 'Font sizes inconsistent across sections', severity: 'low' },
            { id: 2, type: 'spacing', text: 'Adjust line spacing for better readability', severity: 'medium' },
            { id: 3, type: 'alignment', text: 'Improve text alignment in experience section', severity: 'low' }
        ],
        content: [
            { id: 1, type: 'impact', text: 'Quantify achievements with numbers', severity: 'high' },
            { id: 2, type: 'clarity', text: 'Simplify complex sentences', severity: 'medium' },
            { id: 3, type: 'relevance', text: 'Remove outdated or irrelevant experience', severity: 'medium' }
        ]
    };

    const handleRunReview = (reviewId) => {
        setIsChecking(true);

        // Simulate review process
        setTimeout(() => {
            const score = Math.floor(Math.random() * 30) + 70; // 70-100 score
            const issues = sampleIssues[reviewId] || [];

            onReviewComplete(reviewId, {
                score,
                issues,
                checked: true,
                lastChecked: new Date().toISOString(),
                suggestions: getSuggestions(reviewId, score)
            });

            setIsChecking(false);
            toast.success(`${reviewTypes.find(r => r.id === reviewId)?.title} check completed!`);
        }, 2000);
    };

    const getSuggestions = (reviewId, score) => {
        const suggestions = {
            grammar: score > 90 ? [
                'Excellent grammar and spelling',
                'Consider using more varied vocabulary'
            ] : [
                'Run spell check thoroughly',
                'Read aloud to catch awkward phrasing'
            ],
            ats: score > 85 ? [
                'Great ATS compatibility',
                'Add 2-3 more industry keywords'
            ] : [
                'Use standard section headers',
                'Avoid tables and complex formatting'
            ],
            design: score > 80 ? [
                'Clean and professional design',
                'Consider adding subtle color accents'
            ] : [
                'Ensure consistent font usage',
                'Improve spacing between sections'
            ],
            content: score > 85 ? [
                'Strong, impactful content',
                'Consider adding metrics to 1-2 more achievements'
            ] : [
                'Add more quantifiable achievements',
                'Use action verbs consistently'
            ]
        };

        return suggestions[reviewId] || [];
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getReviewScore = (reviewId) => {
        const status = reviewStatus[reviewId];
        return status?.checked ? status.score : 'Not checked';
    };

    const isReviewCompleted = (reviewId) => {
        return reviewStatus[reviewId]?.checked || false;
    };

    const allReviewsCompleted = reviewTypes.every(review => isReviewCompleted(review.id));

    const exportFormats = [
        { id: 'pdf', name: 'PDF Document', icon: FileText, color: 'bg-red-100 text-red-600' },
        { id: 'docx', name: 'Word Document', icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { id: 'txt', name: 'Plain Text', icon: FileText, color: 'bg-gray-100 text-gray-600' },
        { id: 'json', name: 'JSON Data', icon: FileCode, color: 'bg-green-100 text-green-600' }
    ];

    return (
        <div className="space-y-8 p-4 md:p-6">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <FileCheck className="w-10 h-10 md:w-12 md:h-12 text-green-600" />
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Final Reviews</h1>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
                    Complete these final checks to ensure your resume is polished, professional, and ready for submission.
                </p>
            </div>

            {/* Progress Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">Review Progress</h2>
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${allReviewsCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {reviewTypes.filter(r => isReviewCompleted(r.id)).length} of {reviewTypes.length} completed
                        </div>
                        {allReviewsCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {reviewTypes.map(review => {
                        const Icon = review.icon;
                        return (
                            <div key={review.id} className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`w-10 h-10 ${review.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs font-medium ${isReviewCompleted(review.id)
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {isReviewCompleted(review.id) ? 'Done' : 'Pending'}
                                    </div>
                                </div>
                                <h3 className="font-semibold text-gray-800 mb-1 text-sm md:text-base">{review.title}</h3>
                                <div className="text-xs md:text-sm text-gray-600">{review.description}</div>
                                {isReviewCompleted(review.id) && (
                                    <div className="mt-2">
                                        <div className="text-lg font-bold text-gray-800">
                                            {getReviewScore(review.id)}/100
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                            <div
                                                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                                                style={{ width: `${getReviewScore(review.id)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column - Review Selection */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Review Tabs */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                        <div className="flex flex-wrap gap-2 mb-6">
                            {reviewTypes.map(review => {
                                const Icon = review.icon;
                                return (
                                    <button
                                        key={review.id}
                                        onClick={() => setActiveReview(review.id)}
                                        className={`px-3 py-2 md:px-4 md:py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeReview === review.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" />
                                            {review.title}
                                            {isReviewCompleted(review.id) && (
                                                <CheckCircle className="w-4 h-4" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Review Content */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                                        {reviewTypes.find(r => r.id === activeReview)?.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm md:text-base">
                                        {reviewTypes.find(r => r.id === activeReview)?.description}
                                    </p>
                                </div>

                                {!isReviewCompleted(activeReview) ? (
                                    <button
                                        onClick={() => handleRunReview(activeReview)}
                                        disabled={isChecking}
                                        className={`flex items-center justify-center px-4 py-2 rounded-lg ${isChecking
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {isChecking ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                                Checking...
                                            </>
                                        ) : (
                                            <>
                                                <FileCheck className="w-4 h-4 mr-2" />
                                                Run Check
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-green-600">
                                            {getReviewScore(activeReview)}/100
                                        </div>
                                        <div className="text-sm text-gray-500">Score</div>
                                    </div>
                                )}
                            </div>

                            {/* Issues List */}
                            {isReviewCompleted(activeReview) && reviewStatus[activeReview]?.issues?.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-800">Issues Found</h4>
                                    <div className="space-y-3">
                                        {reviewStatus[activeReview].issues
                                            .slice(0, showAllIssues ? undefined : 3)
                                            .map(issue => (
                                                <div
                                                    key={issue.id}
                                                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${issue.severity === 'high' ? 'text-red-500' :
                                                        issue.severity === 'medium' ? 'text-yellow-500' :
                                                            'text-blue-500'
                                                        }`}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                                                            <span className="font-medium text-gray-800 truncate">{issue.text}</span>
                                                            <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(issue.severity)} whitespace-nowrap`}>
                                                                {issue.severity}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            {issue.type === 'spelling' && 'Spelling correction needed'}
                                                            {issue.type === 'grammar' && 'Grammar improvement suggested'}
                                                            {issue.type === 'keyword' && 'Add relevant keywords'}
                                                            {issue.type === 'format' && 'Formatting issue detected'}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>

                                    {reviewStatus[activeReview].issues.length > 3 && (
                                        <button
                                            onClick={() => setShowAllIssues(!showAllIssues)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            {showAllIssues ? 'Show less' : `Show all ${reviewStatus[activeReview].issues.length} issues`}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Suggestions */}
                            {isReviewCompleted(activeReview) && reviewStatus[activeReview]?.suggestions?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-800">Suggestions</h4>
                                    {reviewStatus[activeReview].suggestions.map((suggestion, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                            <Sparkles className="w-5 h-5 mt-0.5 text-blue-500 flex-shrink-0" />
                                            <span className="text-gray-700">{suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Score Interpretation */}
                            {isReviewCompleted(activeReview) && (
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold text-gray-800 mb-2">Score Interpretation</h4>
                                    <div className="text-sm text-gray-600 space-y-2">
                                        {getReviewScore(activeReview) >= 90 && (
                                            <p>Excellent! Your resume performs very well in this area.</p>
                                        )}
                                        {getReviewScore(activeReview) >= 70 && getReviewScore(activeReview) < 90 && (
                                            <p>Good! Consider addressing the suggestions for further improvement.</p>
                                        )}
                                        {getReviewScore(activeReview) < 70 && (
                                            <p>Needs improvement. Address the issues highlighted above.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200">
                            <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">
                                {stats?.completeness || 0}%
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Completion</div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200">
                            <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">
                                {stats?.atsScore || 0}/100
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">ATS Score</div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200">
                            <div className="text-xl md:text-2xl font-bold text-purple-600 mb-1">
                                {stats?.wordCount || 0}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Words</div>
                        </div>
                        <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200">
                            <div className="text-xl md:text-2xl font-bold text-amber-600 mb-1">
                                {stats?.completedSections || 0}/{stats?.totalSections || 0}
                            </div>
                            <div className="text-xs md:text-sm text-gray-600">Sections</div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions & Export */}
                <div className="space-y-6">
                    {/* Export Options */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Export Resume</h3>

                        <div className="space-y-3 mb-6">
                            {exportFormats.map(format => {
                                const Icon = format.icon;
                                return (
                                    <button
                                        key={format.id}
                                        onClick={() => setSelectedExportFormat(format.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedExportFormat === format.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${format.color.split(' ')[0]} rounded-lg flex items-center justify-center`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-gray-800">{format.name}</span>
                                        </div>
                                        {selectedExportFormat === format.id && (
                                            <CheckCircle className="w-5 h-5 text-blue-600" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => onExport(selectedExportFormat)}
                            disabled={isExporting || !allReviewsCompleted}
                            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition-all ${isExporting || !allReviewsCompleted
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90'
                                }`}
                        >
                            {isExporting ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="w-5 h-5 mr-2" />
                                    Export {selectedExportFormat.toUpperCase()}
                                </>
                            )}
                        </button>
                        {!allReviewsCompleted && (
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                Complete all reviews before exporting
                            </p>
                        )}
                    </div>

                    {/* QR Code */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <QrCode className="w-6 h-6 text-purple-600" />
                            <h3 className="text-lg font-bold text-gray-800">Digital Resume</h3>
                        </div>

                        <div className="space-y-4">
                            <p className="text-gray-600 text-sm">
                                Generate a QR code for easy sharing of your digital resume.
                            </p>

                            {qrCodeUrl ? (
                                <div className="text-center">
                                    <img
                                        src={qrCodeUrl}
                                        alt="Resume QR Code"
                                        className="w-40 h-40 md:w-48 md:h-48 mx-auto mb-4 rounded-lg border border-gray-200"
                                    />
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = qrCodeUrl;
                                                link.download = 'resume-qr-code.png';
                                                link.click();
                                            }}
                                            className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Download QR Code
                                        </button>
                                        <button
                                            onClick={onPrint}
                                            className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Print with QR
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={onGenerateQR}
                                    disabled={!allReviewsCompleted}
                                    className={`w-full py-3 rounded-lg font-medium transition-opacity ${!allReviewsCompleted
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90'
                                        }`}
                                >
                                    Generate QR Code
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Completion Status */}
                    <div className={`rounded-xl p-4 md:p-6 ${allReviewsCompleted
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
                        }`}
                    >
                        <div className="text-center">
                            {allReviewsCompleted ? (
                                <>
                                    <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">All Reviews Complete! 🎉</h3>
                                    <p className="text-gray-600 mb-4 text-sm md:text-base">
                                        Your resume is ready for submission. Consider exporting or printing your final version.
                                    </p>
                                    <button
                                        onClick={onComplete}
                                        className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
                                    >
                                        Mark as Complete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <FileCheck className="w-12 h-12 md:w-16 md:h-16 text-blue-600 mx-auto mb-4" />
                                    <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Complete All Reviews</h3>
                                    <p className="text-gray-600 mb-4 text-sm md:text-base">
                                        Run all checks to ensure your resume is polished and professional.
                                    </p>
                                    <button
                                        onClick={() => {
                                            reviewTypes.forEach(review => {
                                                if (!isReviewCompleted(review.id)) {
                                                    handleRunReview(review.id);
                                                }
                                            });
                                        }}
                                        className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm md:text-base"
                                    >
                                        Run All Checks
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 md:pt-8 border-t border-gray-200">
                <button
                    onClick={onClose}
                    className="px-4 py-2 md:px-6 md:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                    ← Back to Editing
                </button>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onPrint}
                        disabled={!allReviewsCompleted}
                        className={`px-4 py-2 md:px-6 md:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${!allReviewsCompleted
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-800 text-white hover:bg-gray-900'
                            } text-sm md:text-base`}
                    >
                        <Printer className="w-4 h-4 md:w-5 md:h-5" />
                        Print Preview
                    </button>
                    {allReviewsCompleted && (
                        <button
                            onClick={onComplete}
                            className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                            Finalize Resume
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinalReviewsPage;