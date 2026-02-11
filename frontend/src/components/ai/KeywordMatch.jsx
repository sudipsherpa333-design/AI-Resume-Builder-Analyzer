import React from "react";

const KeywordMatch = ({ percent, missing }) => {
    return (
        <div className="p-3 border rounded bg-gray-50">
            <h3 className="font-semibold">Keyword Match: {percent}%</h3>
            {missing.length > 0 && (
                <div className="mt-1 text-red-600 text-sm">
                    Missing Keywords: {missing.join(", ")}
                </div>
            )}
        </div>
    );
};

export default KeywordMatch;
