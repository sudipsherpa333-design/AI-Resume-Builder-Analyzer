// src/components/dashboard/ProgressIndicator.jsx
import React, { useMemo } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const ProgressIndicator = ({ resumeData = {} }) => {
  // Calculate progress based on actual data
  const progressData = useMemo(() => {
    const sections = [
      { id: 'personalInfo', weight: 20, completed: !!resumeData?.personalInfo?.fullName && !!resumeData?.personalInfo?.email },
      { id: 'summary', weight: 15, completed: !!resumeData?.summary?.trim() },
      { id: 'experience', weight: 25, completed: (resumeData?.experience?.length || 0) > 0 },
      { id: 'education', weight: 20, completed: (resumeData?.education?.length || 0) > 0 },
      { id: 'skills', weight: 10, completed: (resumeData?.skills?.length || 0) > 0 },
      { id: 'projects', weight: 10, completed: (resumeData?.projects?.length || 0) > 0 }
    ];

    const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
    const completedWeight = sections.reduce((sum, section) =>
      sum + (section.completed ? section.weight : 0), 0
    );

    const percentage = Math.round((completedWeight / totalWeight) * 100);
    const completedSections = sections.filter(s => s.completed).length;
    const totalSections = sections.length;

    // Determine suggestions
    const suggestions = [];
    if (!resumeData?.personalInfo?.fullName) {
      suggestions.push('Add your name');
    }
    if (!resumeData?.personalInfo?.email) {
      suggestions.push('Add your email');
    }
    if (!resumeData?.summary?.trim()) {
      suggestions.push('Write a summary');
    }
    if ((resumeData?.experience?.length || 0) === 0) {
      suggestions.push('Add work experience');
    }
    if ((resumeData?.education?.length || 0) === 0) {
      suggestions.push('Add education');
    }
    if ((resumeData?.skills?.length || 0) === 0) {
      suggestions.push('Add skills');
    }

    return {
      percentage,
      completedSections,
      totalSections,
      suggestions: suggestions.slice(0, 2), // Show only 2 suggestions
      sections
    };
  }, [resumeData]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        RESUME PROGRESS
          </span>
        </div>
        <span className="text-lg font-bold text-indigo-700 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
          {progressData.percentage}% Complete
        </span>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 mb-3">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-700"
          style={{ width: `${progressData.percentage}%` }}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          <span className="font-semibold">{progressData.completedSections}</span> of{' '}
          <span className="font-semibold">{progressData.totalSections}</span> sections completed
        </span>
        {progressData.suggestions.length > 0 && (
          <span className="text-amber-600 dark:text-amber-500 font-medium flex items-center gap-2 mt-1 sm:mt-0">
            <AlertCircle size={14} />
            {progressData.suggestions[0]}
          </span>
        )}
      </div>

      {/* Section breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Section Details
        </h4>
        <div className="space-y-2">
          {progressData.sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {section.completed ? (
                  <CheckCircle size={16} className="text-green-500" />
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {section.id.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {section.weight}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;