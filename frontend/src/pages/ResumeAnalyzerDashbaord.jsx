// src/pages/ResumeAnalyzerDashboard.jsx - FULL AI + DB POWERED (January 01, 2026)
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaTrash, FaDownload, FaSearch, FaShareAlt, FaBolt,
    FaCheckCircle, FaExclamationTriangle, FaLightbulb, FaStar,
    FaFilePdf, FaCopy, FaExternalLinkAlt, FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ResumeAnalyzerDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch reports from backend
    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:5001/api/analysis/reports');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setReports(data.reports || []);
                // Auto-select first or from navigation state
                const initialId = location.state?.selectedReportId || data.reports?.[0]?.id;
                if (initialId) {
                    const initialReport = data.reports.find(r => r.id === initialId);
                    setSelectedReport(initialReport || data.reports[0]);
                }
            } catch (err) {
                toast.error('Failed to load reports');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [location.state]);

    const filteredReports = reports.filter(report =>
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (report) => {
        setSelectedReport(report);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this analysis report?')) return;

        try {
            setDeletingId(id);
            const res = await fetch(`http://localhost:5001/api/analysis/report/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Delete failed');
            setReports(prev => prev.filter(r => r.id !== id));
            if (selectedReport?.id === id) setSelectedReport(null);
            toast.success('Report deleted');
        } catch (err) {
            toast.error('Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    const handleExportPDF = (report) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(24);
        doc.setTextColor(79, 70, 229); // indigo-600
        doc.text('Resume Analysis Report', pageWidth / 2, 20, { align: 'center' });

        // Subtitle
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(report.title || 'Untitled Analysis', pageWidth / 2, 32, { align: 'center' });

        // Metadata
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Job: ${report.jobTitle}`, 20, 50);
        doc.text(`Date: ${new Date(report.timestamp).toLocaleDateString()}`, 20, 58);
        doc.text(`Overall Score: ${report.result?.overallScore || 0}%`, 20, 66);

        let y = 80;

        // Scores
        if (report.result) {
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Scores', 20, y);
            y += 10;

            const scores = [
                ['Overall', `${report.result.overallScore}%`],
                ['ATS Compatibility', `${report.result.atsScore}%`],
                ['Keyword Match', `${report.result.keywordScore}%`]
            ];

            doc.autoTable({
                startY: y,
                head: [['Metric', 'Score']],
                body: scores,
                theme: 'grid',
                styles: { fontSize: 12 },
                headStyles: { fillColor: [79, 70, 229] }
            });
            y = doc.lastAutoTable.finalY + 20;
        }

        // Missing Keywords
        if (report.result?.missingKeywords?.length > 0) {
            doc.setFontSize(14);
            doc.text('Missing Keywords', 20, y);
            y += 10;
            const keywords = report.result.missingKeywords.join(', ');
            doc.setFontSize(11);
            doc.text(keywords, 20, y, { maxWidth: pageWidth - 40 });
            y += 30;
        }

        // Recommendations
        if (report.result?.recommendations?.length > 0) {
            doc.setFontSize(14);
            doc.text('Top Recommendations', 20, y);
            y += 10;
            report.result.recommendations.forEach((rec, i) => {
                doc.setFontSize(11);
                doc.text(`${i + 1}. ${rec}`, 25, y);
                y += 10;
            });
        }

        doc.save(`ResumeCraft_Analysis_${report.id}.pdf`);
        toast.success('PDF exported!');
    };

    const ScoreBadge = ({ label, score, color = 'indigo' }) => {
        const colors = {
            indigo: 'from-indigo-500 to-purple-600',
            green: 'from-green-500 to-emerald-600',
            yellow: 'from-yellow-500 to-amber-600',
            red: 'from-red-500 to-pink-600'
        };

        const getGrade = () => {
            if (score >= 90) return { text: 'Excellent', icon: FaStar, color: 'green' };
            if (score >= 80) return { text: 'Strong', icon: FaCheckCircle, color: 'emerald' };
            if (score >= 70) return { text: 'Good', icon: FaBolt, color: 'yellow' };
            return { text: 'Needs Work', icon: FaExclamationTriangle, color: 'red' };
        };

        const grade = getGrade();

        return (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 text-center">
                <div className={`text-5xl font-black bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
                    {score}%
                </div>
                <div className="text-xl font-bold text-gray-800 mt-3">{label}</div>
                <div className={`mt-4 px-5 py-2 rounded-full inline-flex items-center gap-2 text-white font-bold bg-gradient-to-r from-${grade.color}-500 to-${grade.color}-600`}>
                    <grade.icon className="w-5 h-5" />
                    {grade.text}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => navigate('/analyzer')}
                        className="inline-flex items-center gap-3 text-indigo-600 hover:text-indigo-800 text-lg font-semibold"
                    >
                        <FaArrowLeft className="w-5 h-5" />
                        Back to Analyzer
                    </button>
                    <h1 className="text-5xl font-extrabold text-gray-900">
                        Analysis Dashboard
                    </h1>
                    <div className="text-lg text-gray-600">
                        {reports.length} Total Report{reports.length !== 1 ? 's' : ''}
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Left: Report List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sticky top-8">
                            <div className="relative mb-6">
                                <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-gray-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 text-lg"
                                />
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {loading ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaSpinner className="animate-spin text-4xl mx-auto mb-4" />
                                        Loading reports...
                                    </div>
                                ) : filteredReports.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                        <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-6" />
                                        <p className="text-xl text-gray-600 font-medium">No reports yet</p>
                                        <p className="text-gray-500 mt-2">Run an analysis to see results here</p>
                                    </div>
                                ) : (
                                    filteredReports.map((report) => (
                                        <motion.div
                                            key={report.id}
                                            whileHover={{ scale: 1.03 }}
                                            onClick={() => handleSelect(report)}
                                            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedReport?.id === report.id
                                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                                    : 'border-gray-200 bg-white hover:border-indigo-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-lg text-gray-900 truncate">
                                                        {report.title || 'Untitled Analysis'}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {report.jobTitle}
                                                    </p>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <div className="text-3xl font-black text-indigo-600">
                                                        {report.result?.overallScore || 0}%
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-gray-500">
                                                <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(report.id);
                                                    }}
                                                    disabled={deletingId === report.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    {deletingId === report.id ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Selected Report Details */}
                    <div className="lg:col-span-3">
                        {!selectedReport ? (
                            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-16 text-center">
                                <FaFileAlt className="text-8xl text-gray-300 mx-auto mb-8" />
                                <h2 className="text-3xl font-bold text-gray-600 mb-4">Select a report</h2>
                                <p className="text-xl text-gray-500">Click any report on the left to view full AI analysis</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-white">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-4xl font-extrabold mb-3">
                                                {selectedReport.title || 'Analysis Report'}
                                            </h2>
                                            <p className="text-xl opacity-90">
                                                Target Job: <strong>{selectedReport.jobTitle}</strong>
                                            </p>
                                            <p className="text-lg opacity-80 mt-2">
                                                Analyzed on {new Date(selectedReport.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleExportPDF(selectedReport)}
                                                className="px-6 py-4 bg-white text-indigo-700 rounded-2xl font-bold flex items-center gap-3 hover:shadow-xl transition-all"
                                            >
                                                <FaDownload className="w-6 h-6" />
                                                Export PDF
                                            </button>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(window.location.href);
                                                    toast.success('Link copied!');
                                                }}
                                                className="px-6 py-4 bg-white/20 backdrop-blur rounded-2xl font-bold flex items-center gap-3 hover:bg-white/30 transition-all"
                                            >
                                                <FaShareAlt className="w-6 h-6" />
                                                Share
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Score Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <ScoreBadge
                                        label="Overall Score"
                                        score={selectedReport.result?.overallScore || 0}
                                        color="indigo"
                                    />
                                    <ScoreBadge
                                        label="ATS Compatibility"
                                        score={selectedReport.result?.atsScore || 0}
                                        color="green"
                                    />
                                    <ScoreBadge
                                        label="Keyword Match"
                                        score={selectedReport.result?.keywordScore || 0}
                                        color="yellow"
                                    />
                                </div>

                                {/* Missing Keywords */}
                                {selectedReport.result?.missingKeywords?.length > 0 && (
                                    <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8">
                                        <h3 className="text-2xl font-bold text-red-800 mb-6 flex items-center gap-4">
                                            <FaExclamationTriangle className="w-8 h-8" />
                                            Critical Missing Keywords
                                        </h3>
                                        <div className="flex flex-wrap gap-4">
                                            {selectedReport.result.missingKeywords.map((kw, i) => (
                                                <span key={i} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-lg shadow-md">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="mt-6 text-red-700 font-medium text-lg">
                                            Add these to boost your ATS score by up to 30%
                                        </p>
                                    </div>
                                )}

                                {/* AI Bullet Improvements */}
                                {selectedReport.result?.improvements?.length > 0 && (
                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-10 border-2 border-purple-200">
                                        <h3 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4">
                                            <FaLightbulb className="w-10 h-10 text-yellow-500" />
                                            AI-Powered Bullet Improvements
                                        </h3>
                                        <div className="space-y-8">
                                            {selectedReport.result.improvements.map((imp, i) => (
                                                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg border border-purple-200">
                                                    <div className="grid md:grid-cols-2 gap-8">
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-600 mb-3">Original:</p>
                                                            <p className="text-lg italic text-gray-700 bg-gray-50 p-4 rounded-xl">
                                                                "{imp.original}"
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-indigo-700 mb-3 flex items-center gap-2">
                                                                <FaBolt /> GPT-4o Suggestion:
                                                            </p>
                                                            <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl shadow-inner">
                                                                "{imp.improved}"
                                                            </p>
                                                            <p className="mt-4 text-green-600 font-bold text-lg">
                                                                ↑ {imp.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Final Recommendations */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-12 text-white">
                                    <h3 className="text-4xl font-extrabold mb-10 flex items-center gap-5">
                                        <FaStar className="w-12 h-12" />
                                        Your Personalized Action Plan
                                    </h3>
                                    <ol className="space-y-6 text-xl">
                                        {selectedReport.result?.recommendations?.map((rec, i) => (
                                            <li key={i} className="flex items-start gap-6">
                                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-black text-2xl flex-shrink-0">
                                                    {i + 1}
                                                </div>
                                                <span>{rec}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <div className="mt-12 text-center">
                                        <button
                                            onClick={() => navigate('/builder')}
                                            className="px-12 py-6 bg-white text-indigo-700 rounded-3xl font-extrabold text-2xl hover:shadow-2xl transition-all inline-flex items-center gap-4"
                                        >
                                            <FaBolt className="w-8 h-8" />
                                            Fix Resume Now in Builder
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzerDashboard;