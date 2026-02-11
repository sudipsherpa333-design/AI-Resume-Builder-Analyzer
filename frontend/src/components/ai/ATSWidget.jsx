import React from "react";

const ATSWidget = ({ score, breakdown }) => {
    return (
        <div className="p-3 border rounded bg-gray-50">
            <h3 className="font-semibold">ATS Score: {score}/100</h3>
            <ul className="text-sm mt-1">
                {Object.entries(breakdown).map(([k, v]) => (
                    <li key={k}>{k}: {v}</li>
                ))}
            </ul>
        </div>
    );
};

export default ATSWidget;
