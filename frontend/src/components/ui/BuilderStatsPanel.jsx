import React from 'react';
import { TrendingUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const BuilderStatsPanel = ({
    atsScore = 0,
    completion = 0,
    wordCount = 0,
    lastSaved = null
}) => {
    const getATSColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-amber-600';
        return 'text-red-600';
    };

    const getCompletionColor = (completion) => {
        if (completion === 100) return 'bg-green-500';
        if (completion >= 75) return 'bg-blue-500';
        if (completion >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const formatLastSaved = (date) => {
        if (!date) return 'Never';
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-t border-gray-200 p-4 space-y-4">
            {/* ATS Score */}
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">ATS Score</span>
                    </div>
                    <span className={`text-2xl font-bold ${getATSColor(atsScore)}`}>
                        {atsScore}/100
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getATSColor(atsScore)}`}
                        style={{ width: `${Math.min(atsScore, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {atsScore >= 80 ? '✓ ATS friendly' : atsScore >= 60 ? 'Good ATS score' : 'Improve ATS compatibility'}
                </p>
            </div>

            {/* Completion */}
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-700">Completion</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getCompletionColor(completion)}`}
                        style={{ width: `${completion}%` }}
                    />
                </div>
            </div>

            {/* Word Count */}
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-700">Word Count</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">{wordCount}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {wordCount < 300 ? 'Add more details' : wordCount > 800 ? 'Consider shortening' : '✓ Optimal length'}
                </p>
            </div>

            {/* Last Saved */}
            <div className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">
                        Last saved: <span className="font-medium">{formatLastSaved(lastSaved)}</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BuilderStatsPanel;
