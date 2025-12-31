import React from 'react';
import { FaStar, FaChevronRight, FaChartLine, FaExclamationTriangle, FaUserTie, FaTags, FaClipboardList, FaAward, FaCalendarAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

const getScoreColor = (score) => {
    if (score >= 9.0) return 'text-purple-600 border-purple-300';
    if (score >= 8.0) return 'text-emerald-500 border-emerald-300';
    if (score >= 6.5) return 'text-yellow-500 border-yellow-300';
    return 'text-red-500 border-red-300';
};

const getAtsColor = (percent) => {
    if (percent >= 90) return 'text-emerald-600 bg-emerald-100';
    if (percent >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
};

const sortAnalyses = (analyses) => {
    return [...analyses].sort((a, b) => (b.job_fit_score || 0) - (a.job_fit_score || 0));
};

const AnalysisResultsSection = ({ analyses, totalSelected }) => {
    if (!analyses || analyses.length === 0) {
        return <p className="text-sm text-slate-500 p-4 border rounded-xl">No valid results to display.</p>;
    }

    const sortedAnalyses = sortAnalyses(analyses);
    const topCandidate = sortedAnalyses[0];
    const topScore = topCandidate.job_fit_score || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-4 border border-purple-300 space-y-4"
        >
            <div className={`p-3 rounded-xl border-2 shadow-lg ${getScoreColor(topScore)}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-sm text-slate-600 flex items-center gap-1"><FaAward className='text-xs text-yellow-500' /> Top Fit:</span>
                        <div className={`text-2xl font-extrabold mt-1 ${getScoreColor(topScore)}`}>
                            {topScore.toFixed(1)}/10
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-sm text-slate-600 flex items-center gap-1"><FaTags className='text-xs' /> ATS Score:</span>
                        <span className={`inline-block px-3 py-1 rounded-full font-bold text-md mt-1 ${getAtsColor(topCandidate.ats_score_percent || 0)}`}>
                            {topCandidate.ats_score_percent || 'N/A'}%
                        </span>
                    </div>
                </div>
            </div>

            <h4 className="font-semibold text-slate-700 pt-2 border-t flex items-center gap-2">
                <FaChartLine className='text-sm' /> Rank:
            </h4>
            <ul className="space-y-1">
                {sortedAnalyses.slice(0, 3).map((a, index) => (
                    <li key={a.id || index} className="flex justify-between items-center text-sm">
                        <span className="text-slate-700 flex items-center gap-2">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-white text-xs ${index === 0 ? 'bg-purple-600' : 'bg-indigo-500'}`}>{index + 1}</span>
                            <span className="truncate flex-1">{a.name || `Candidate ${index + 1}`}</span>
                        </span>
                        <span className={`font-bold ${getScoreColor(a.job_fit_score || 0)}`}>
                            {(a.job_fit_score || 0).toFixed(1)}
                        </span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default AnalysisResultsSection;