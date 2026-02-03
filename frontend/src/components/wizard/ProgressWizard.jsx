// ------------------- ProgressWizard.jsx -------------------
import React from 'react';
import { motion } from 'framer-motion';
import {
    ChevronRight,
    CheckCircle,
    Circle,
    AlertCircle,
    Sparkles,
    Target,
    Zap,
    Lock,
    BarChart
} from 'lucide-react';

const ProgressWizard = ({
    steps = [],
    currentStep = 0,
    onStepClick,
    atsScore = 0,
    aiSuggestions = 0
}) => {
    const getStepStatus = (stepIndex) => {
        if (stepIndex < currentStep) return 'completed';
        if (stepIndex === currentStep) return 'active';
        return 'upcoming';
    };

    const getStepIcon = (step, status) => {
        const Icon = step.icon;

        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'active':
                return (
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                        <div className="relative p-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                            <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>
                );
            case 'upcoming':
                return (
                    <div className="p-1.5 bg-gray-100 rounded-full">
                        <Icon className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                );
        }
    };

    const calculateProgress = () => {
        return Math.round((currentStep + 1) / steps.length * 100);
    };

    const getAIScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100';
        if (score >= 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">AI Resume Wizard</h2>
                        <p className="text-gray-600">Step-by-step AI guidance to create your perfect resume</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700">AI Progress</p>
                                <p className="text-lg font-bold text-blue-600">{calculateProgress()}%</p>
                            </div>
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateProgress()}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                                />
                            </div>
                        </div>

                        {atsScore > 0 && (
                            <div className="hidden md:block">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-gray-700">ATS:</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getAIScoreColor(atsScore)}`}>
                                        {atsScore}%
                                    </span>
                                </div>
                            </div>
                        )}

                        {aiSuggestions > 0 && (
                            <div className="hidden md:block">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-200">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium text-gray-900">{aiSuggestions}</span>
                                    <span className="text-sm text-gray-600">AI tips</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 md:block hidden">
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-blue-500 to-cyan-500"
                        />
                    </div>

                    <div className="space-y-8 relative z-10">
                        {steps.map((step, index) => {
                            const status = getStepStatus(index);
                            const isClickable = index <= currentStep || step.required;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="flex-shrink-0">
                                        <div className="relative">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${status === 'completed' ? 'bg-green-100' : status === 'active' ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300' : 'bg-gray-100'}`}>
                                                {getStepIcon(step, status)}

                                                <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${status === 'completed' ? 'bg-green-500 text-white' : status === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'}`}>
                                                    {index + 1}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 pt-2">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <button
                                                    onClick={() => isClickable && onStepClick(index)}
                                                    disabled={!isClickable}
                                                    className={`text-left group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                                >
                                                    <h3 className={`text-lg font-bold ${status === 'active' ? 'text-blue-700' : status === 'completed' ? 'text-green-700' : 'text-gray-500'} group-hover:text-blue-600 transition-colors`}>
                                                        {step.label}
                                                        {step.required && (
                                                            <span className="ml-2 text-xs text-red-600">*</span>
                                                        )}
                                                    </h3>
                                                    <p className="text-gray-600 mt-1">{step.description}</p>
                                                </button>

                                                {step.aiCapabilities && status === 'active' && (
                                                    <div className="mt-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Sparkles className="w-4 h-4 text-blue-500" />
                                                            <span className="text-sm font-medium text-gray-700">AI Assistant Available:</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {step.aiCapabilities.slice(0, 3).map((capability, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs rounded border border-blue-200"
                                                                >
                                                                    {capability}
                                                                </span>
                                                            ))}
                                                            {step.aiCapabilities.length > 3 && (
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                                                    +{step.aiCapabilities.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {status === 'completed' && (
                                                    <div className="flex items-center gap-1 text-green-600 text-sm">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="hidden md:inline">AI Complete</span>
                                                    </div>
                                                )}
                                                {status === 'active' && (
                                                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full">
                                                        <Zap className="w-4 h-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-blue-700">AI Active</span>
                                                    </div>
                                                )}
                                                {status === 'upcoming' && step.required && (
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <Lock className="w-4 h-4" />
                                                        <span className="hidden md:inline">Required</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {index < steps.length - 1 && (
                                            <div className="mt-4 md:hidden">
                                                <ChevronRight className="w-5 h-5 text-gray-300 mx-auto" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Step {currentStep + 1} of {steps.length}
                        <span className="mx-2">•</span>
                        {steps[currentStep]?.required && (
                            <span className="text-red-600 font-medium">AI Required section</span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onStepClick(Math.max(currentStep - 1, 0))}
                            disabled={currentStep === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onStepClick(Math.min(currentStep + 1, steps.length - 1))}
                            disabled={currentStep === steps.length - 1}
                            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            AI Next Step
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressWizard;