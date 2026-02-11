// frontend/src/admin/components/charts/SimpleLineChart.jsx
import React from 'react';

const SimpleLineChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>No chart data available</p>
      </div>
    );
  }

  // Simple chart rendering - you can replace with Chart.js or Recharts later
  const maxValue = Math.max(...data.map(d => d.users + d.resumes));

  return (
    <div className="h-full flex items-end space-x-1">
      {data.slice(-15).map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div className="w-full flex justify-center space-x-px">
            <div
              className="w-1/2 bg-blue-500 rounded-t"
              style={{ height: `${(item.users / maxValue) * 100}%` }}
            />
            <div
              className="w-1/2 bg-green-500 rounded-t"
              style={{ height: `${(item.resumes / maxValue) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(item.date).getDate()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SimpleLineChart;