// frontend/src/admin/components/charts/SimpleBarChart.jsx
import React from 'react';

const SimpleBarChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                <p>No chart data available</p>
            </div>
        );
    }

    const maxUsage = Math.max(...data.map(d => d.usage));

    return (
        <div className="h-full space-y-3">
            {data.map((item, index) => (
                <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {item.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {item.usage} uses
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(item.usage / maxUsage) * 100}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SimpleBarChart;