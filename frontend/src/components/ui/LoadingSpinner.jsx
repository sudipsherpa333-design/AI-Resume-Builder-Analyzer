// src/components/ui/LoadingSpinner.jsx - SIMPLER VERSION
import React from 'react';

const LoadingSpinner = ({
  size = 'md',
  message = 'Loading...',
  showLogo = false,
  className = ''
}) => {
  // Determine sizes directly
  const getSpinnerSize = () => {
    switch (size) {
    case 'xs': return 'w-4 h-4';
    case 'sm': return 'w-6 h-6';
    case 'md': return 'w-8 h-8';
    case 'lg': return 'w-12 h-12';
    case 'xl': return 'w-16 h-16';
    default: return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
    case 'xs': return 'text-xs';
    case 'sm': return 'text-sm';
    case 'md': return 'text-base';
    case 'lg': return 'text-lg';
    case 'xl': return 'text-xl';
    default: return 'text-base';
    }
  };

  const getContainerGap = () => {
    switch (size) {
    case 'xs':
    case 'sm': return 'gap-2';
    case 'md':
    case 'lg':
    case 'xl': return 'gap-3';
    default: return 'gap-3';
    }
  };

  const spinnerClass = getSpinnerSize();
  const textClass = getTextSize();
  const containerClass = getContainerGap();

  return (
    <div className={`flex flex-col items-center justify-center ${containerClass} ${className}`}>
      <div className="relative">
        <div className={`${spinnerClass} border-4 border-blue-200 rounded-full`}></div>
        <div className={`${spinnerClass} border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>

        {showLogo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-1.5">
              <svg className="w-1/2 h-1/2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className={`${textClass} text-gray-600 font-medium`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;