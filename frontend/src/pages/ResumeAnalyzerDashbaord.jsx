import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    FaArrowLeft, FaFileAlt, FaTrash, FaDownload, FaSearch, FaShareAlt,
    FaChartBar, FaClipboardList, FaBolt
} from 'react-icons/fa';
import toast from 'react-hot-toast';

/**
 * ResumeAnalyzerDashboard
 *
 * This page receives a list of analysis reports via location.state.reports (or fetches them).
 * It shows a searchable, filterable list of all reports (global or user-specific) and
 * details for a selected report on the right.
 *
 * If no state.reports is provided, it falls back to a small in-memory fetch (demo).
 */

const demoFetchReports = async () => {
    // in a real app you'd call an API -> return the user's analysis reports
    // Here we mock a short delay
    await new Promise(r => setTimeout(r, 400));
    const now = Date.now();
    return [
        { id: now - 1000000, title: 'Senior SW Engineer — Analysis', jobTitle: 'Senior Software Engineer', fileName: 'JD_SW.pdf', timestamp: new Date().toISOString(), overallScore: 92, analysisDetails: [{ section: 'Keywords', score: 95, summary: 'Good match' }] },
        { id: now - 2000000, title: 'Product Manager — Quick', jobTitle: 'Product Manager', fileName: 'JD_PM.docx', timestamp: new Date(Date.now() - 86400000).toISOString(), overallScore: 80, analysisDetails: [{ section: 'Structure', score: 78, summary: 'Ok' }] },
    ];
};

const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return past.toLocaleDateString();
};

export default function ResumeAnalyzerDashboard() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [reports, setReports] = useState(state?.reports || []);
    const [selectedReportId, setSelectedReportId] = useState(state?.selectedReportId || (state?.reports?.[0]?.id ?? null));
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If no reports were passed via navigation state, try to fetch
        let mounted = true;
        if (!state?.reports) {
            setLoading(true);
            demoFetchReports().then(rs => {
                if (!mounted) return;
                setReports(rs);
                setSelectedReportId(rs?.[0]?.id ?? null);
            }).catch(() => {
                toast.error('Failed to load reports');
            }).finally(() => {
                if (mounted) setLoading(false);
            });
        }
        return () => { mounted = false; };
    }, [state]);

    const filtered = reports.filter(r =>
        r.title?.toLowerCase().includes(search.toLowerCase()) ||
        r.jobTitle?.toLowerCase().includes(search.toLowerCase())
    );

    const selected = reports.find(r => r.id === selectedReportId) || filtered[0];

    const handleDelete = (id) => {
        setReports(prev => prev.filter(p => p.id !== id));
        if (selectedReportId === id) setSelectedReportId(null);
        toast.success('Deleted report (demo)');
    };

    const handleExport = (report) => {
        // in a real app you would trigger a download / open modal
        toast.promise(new Promise(r => setTimeout(r, 600)), { loading: 'Preparing...', success: 'Export ready', error: 'Export failed' });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800">
                        <FaArrowLeft /> Back
                    </button>
                    <h1 className="text-2xl font-extrabold">Resume Analyzer Dashboard</h1>
                    <div className="ml-auto text-sm text-slate-600">Total reports: {reports.length}</div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* LEFT: Reports list */}
                    <div className="lg:col-span-1 bg-white rounded-2xl border p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FaSearch className="text-slate-400" />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports..." className="w-full p-2 border rounded-lg" />
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-auto pr-2">
                            {loading ? (
                                <div className="text-center py-8 text-slate-500"><FaSpinner className="animate-spin inline mr-2" /> Loading reports...</div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No reports found.</div>
                            ) : (
                                filtered.map(rep => (
                                    <div key={rep.id} className={`p-3 rounded-lg border cursor-pointer ${rep.id === selectedReportId ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`} onClick={() => setSelectedReportId(rep.id)}>
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-slate-800 truncate">{rep.title}</div>
                                            <div className="text-sm text-slate-600">{rep.overallScore}%</div>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 truncate">{rep.jobTitle} • {formatTimeAgo(rep.timestamp)}</div>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleExport(rep); }} className="text-xs px-2 py-1 border rounded text-slate-700">Export</button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDelete(rep.id); }} className="text-xs px-2 py-1 border rounded text-rose-600">Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Report details */}
                    <div className="lg:col-span-3 bg-white rounded-2xl border p-6">
                        {!selected ? (
                            <div className="text-center py-12 text-slate-500">Select a report to inspect details.</div>
                        ) : (
                            <div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="text-sm text-slate-500">Analysis</div>
                                        <h2 className="text-2xl font-bold text-slate-900">{selected.title}</h2>
                                        <div className="text-sm text-slate-500 mt-1">{selected.jobTitle} • {formatTimeAgo(selected.timestamp)}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleExport(selected)} className="px-3 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
                                            <FaDownload /> Export
                                        </button>
                                        <button onClick={() => toast('Share link copied (demo)')} className="px-3 py-2 border rounded-lg flex items-center gap-2">
                                            <FaShareAlt /> Share
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-slate-500">Overall Score</div>
                                        <div className="text-3xl font-extrabold text-indigo-600 mt-2">{selected.overallScore}%</div>
                                        <div className="text-xs text-slate-500 mt-2">Higher is better — optimize keywords and metrics.</div>
                                    </div>

                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-slate-500">Top Recommendations</div>
                                        <ul className="mt-2 text-sm space-y-2">
                                            {(selected.analysisDetails || []).slice(0, 3).map((d, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <FaBolt className="text-yellow-500 mt-1" />
                                                    <div>
                                                        <div className="font-semibold">{d.section}</div>
                                                        <div className="text-xs text-slate-600">{d.suggestions || d.summary}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-4 border rounded-lg">
                                        <div className="text-sm text-slate-500">Scan Details</div>
                                        <div className="mt-2 text-sm text-slate-600">
                                            {selected.sourcePayload ? JSON.stringify(selected.sourcePayload.options) : 'Standard scan'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                                    <div className="space-y-4">
                                        {(selected.analysisDetails || []).map((d, idx) => (
                                            <div key={idx} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-bold">{d.section}</div>
                                                    <div className="text-sm text-slate-600 font-semibold">{d.score}%</div>
                                                </div>
                                                <div className="text-sm text-slate-600 mt-2">{d.summary}</div>
                                                {d.suggestions && <div className="text-sm text-indigo-700 mt-2">Suggestion: {d.suggestions}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button onClick={() => toast('Apply suggestions (demo)')} className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2">
                                        <FaClipboardList /> Apply Suggestions
                                    </button>
                                    <button onClick={() => toast('Run re-analysis (demo)')} className="px-4 py-2 border rounded-lg flex items-center gap-2">
                                        <FaChartBar /> Re-run Analysis
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}