import React from "react";

const SuggestionsPanel = ({ suggestions }) => {
    if (!suggestions) return null;
    return (
        <div className="p-3 border rounded bg-gray-50">
            <h3 className="font-semibold">AI Suggestions</h3>
            <p className="text-sm mt-1">{suggestions}</p>
        </div>
    );
};

export default SuggestionsPanel;
