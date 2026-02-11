import React, { useState } from "react";
import ATSWidget from "./ATSWidget";
import KeywordMatch from "./KeywordMatch";
import WeakBullets from "./WeakBullets";
import SuggestionsPanel from "./SuggestionsPanel";

const AIPanel = ({ resume, jobDescription, onResumeUpdate }) => {
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);

    const analyzeResume = async () => {
        setLoading(true);
        const res = await fetch("/api/ai/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resume, jobDescription }),
        });
        const data = await res.json();
        setAnalysis(data);
        setLoading(false);
    };

    return (
        <div className="p-4 border rounded-lg shadow bg-white">
            <h2 className="text-xl font-bold mb-2">AI Resume Analysis</h2>
            <button
                onClick={analyzeResume}
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600"
            >
                {loading ? "Analyzing..." : "Analyze Resume"}
            </button>

            {analysis && (
                <div className="space-y-4">
                    <ATSWidget score={analysis.atsScore} breakdown={analysis.breakdown} />
                    <KeywordMatch
                        percent={analysis.keywordMatch}
                        missing={analysis.missingKeywords}
                    />
                    <WeakBullets bullets={analysis.weakBullets} resume={resume} onResumeUpdate={onResumeUpdate} />
                    <SuggestionsPanel suggestions={analysis.suggestions} />
                </div>
            )}
        </div>
    );
};

export default AIPanel;
