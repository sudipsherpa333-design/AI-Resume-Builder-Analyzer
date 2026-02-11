import React, { useState } from "react";

const OptimizeSummaryButton = ({ summary, jobDescription, onUpdate }) => {
    const [loading, setLoading] = useState(false);

    const optimize = async () => {
        setLoading(true);
        const res = await fetch("/api/ai/optimize-summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ summary, jd: jobDescription }),
        });
        const data = await res.json();
        onUpdate(data.text);
        setLoading(false);
    };

    return (
        <button
            onClick={optimize}
            disabled={loading}
            className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
            {loading ? "Optimizing..." : "Optimize Summary"}
        </button>
    );
};

export default OptimizeSummaryButton;
