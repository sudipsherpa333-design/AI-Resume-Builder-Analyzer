// src/components/ui/ProgressIndicator.jsx
import React from 'react';
import { Check } from 'lucide-react';

const ProgressIndicator = ({
    currentStep = 0,
    totalSteps = 1,
    steps = [],
    descriptions = [],
    onStepClick,
    variant = 'default',
    theme = 'default',
    interactive = false,
    showCheckmarks = true,
    completionPercentage = 0,
    className = ''
}) => {
    const progress = (currentStep + 1) / totalSteps * 100;

    if (variant === 'simple') {
        return (
            <div className={`w-full ${className}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        Progress: {Math.round(progress)}%
                    </span>
                    <span className="text-sm text-gray-500">
                        {currentStep + 1}/{totalSteps}
                    </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className={`w-full ${className}`}>
                <div className="flex items-center justify-between mb-3">
                    {steps.slice(0, 3).map((step, index) => (
                        <div key={index} className="flex flex-col items-center flex-1">
                            <div className="relative">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${index <= currentStep
                                        ? 'bg-indigo-500 border-indigo-500 text-white'
                                        : index === currentStep + 1
                                            ? 'border-indigo-500 text-indigo-500'
                                            : 'border-gray-300 text-gray-400'
                                        }`}
                                >
                                    {showCheckmarks && index < currentStep ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`absolute top-4 left-8 w-full h-0.5 ${index < currentStep ? 'bg-indigo-500' : 'bg-gray-300'
                                        }`} />
                                )}
                            </div>
                            <span className={`text-xs mt-2 truncate max-w-[80px] text-center ${index <= currentStep ? 'text-gray-800 font-medium' : 'text-gray-500'
                                }`}>
                                {step}
                            </span>
                        </div>
                    ))}
                    {steps.length > 3 && (
                        <div className="flex flex-col items-center flex-1">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 border-gray-300 text-gray-400">
                                    ...
                                </div>
                            </div>
                            <span className="text-xs mt-2 text-gray-500 text-center">
                                More
                            </span>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`w-full ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Resume Progress</h3>
                    <p className="text-sm text-gray-500">
                        {currentStep < steps.length ? steps[currentStep] : 'Complete'} - {descriptions[currentStep] || ''}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                        {Math.round(progress)}%
                    </div>
                    <div className="text-sm text-gray-500">
                        Step {currentStep + 1} of {totalSteps}
                    </div>
                </div>
            </div>

            {/* Main progress bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Steps indicators */}
            <div className="flex justify-between mt-6">
                {steps.map((step, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => interactive && onStepClick && onStepClick(index)}
                        className={`flex flex-col items-center ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
                        disabled={!interactive}
                    >
                        <div className="relative mb-2">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${index < currentStep
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : index === currentStep
                                        ? 'bg-indigo-500 border-indigo-500 text-white scale-110'
                                        : index === currentStep + 1
                                            ? 'border-indigo-500 text-indigo-500'
                                            : 'border-gray-300 text-gray-400'
                                    } ${interactive ? 'hover:scale-105' : ''}`}
                            >
                                {showCheckmarks && index < currentStep ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    index + 1
                                )}
                            </div>
                        </div>
                        <span className={`text-xs font-medium text-center max-w-[80px] truncate ${index <= currentStep ? 'text-gray-800' : 'text-gray-500'
                            }`}>
                            {step}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ProgressIndicator;