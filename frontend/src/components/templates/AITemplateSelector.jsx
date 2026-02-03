// ------------------- AITemplateSelector.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Eye, TrendingUp, Palette, Smartphone, Monitor, Shield, X, Zap, Layout, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';

const AITemplateSelector = ({ currentTemplate, templates, resumeData, onSelect, onClose }) => {
    const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate);
    const [previewMode, setPreviewMode] = useState('desktop');
    const [aiRecommendedTemplates, setAiRecommendedTemplates] = useState([]);
    const [templateAnalysis, setTemplateAnalysis] = useState(null);

    // AI Template Recommendation Mutation
    const recommendTemplatesMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/ai/templates/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    targetRole: resumeData.targetRole,
                    templates
                })
            });

            if (!response.ok) throw new Error('Failed to get AI recommendations');
            return response.json();
        },
        onSuccess: (data) => {
            setAiRecommendedTemplates(data.recommendations);
            setTemplateAnalysis(data.analysis);
        },
        onError: (error) => {
            toast.error('Failed to get AI recommendations');
            console.error('AI recommendation error:', error);
        }
    });

    // Apply Template with AI Optimization Mutation
    const applyTemplateMutation = useMutation({
        mutationFn: async (templateId) => {
            const response = await fetch('/api/ai/templates/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    templateId,
                    currentTemplate
                })
            });

            if (!response.ok) throw new Error('Failed to apply template');
            return response.json();
        },
        onSuccess: (data) => {
            toast.success('Template applied with AI optimization!');
            onSelect(selectedTemplate);
        },
        onError: (error) => {
            toast.error('Failed to apply template');
            console.error('Template application error:', error);
        }
    });

    useEffect(() => {
        recommendTemplatesMutation.mutate();
    }, [resumeData.targetRole]);

    const handleTemplateSelect = (templateId) => {
        setSelectedTemplate(templateId);
    };

    const handleApplyTemplate = () => {
        if (selectedTemplate === currentTemplate) {
            toast.success('Template already applied');
            return;
        }
        applyTemplateMutation.mutate(selectedTemplate);
    };

    const TemplatePreview = ({ template }) => {
        const isSelected = selectedTemplate === template.id;
        const isRecommended = aiRecommendedTemplates[0]?.id === template.id;
        const recommendationScore = templateAnalysis?.scores?.[template.id] || 0;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                    }`}
                onClick={() => handleTemplateSelect(template.id)}
            >
                <div className={`h-32 bg-gradient-to-r ${template.color} relative`}>
                    {isRecommended && (
                        <div className="absolute top-2 left-2 z-10">
                            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                                <Sparkles className="w-3 h-3 text-yellow-500" />
                                <span className="text-gray-800">AI Top Pick</span>
                            </div>
                        </div>
                    )}

                    {isSelected && (
                        <div className="absolute top-2 right-2 z-10">
                            <div className="bg-blue-500 text-white p-1.5 rounded-full">
                                <Check className="w-4 h-4" />
                            </div>
                        </div>
                    )}

                    {/* AI Score Badge */}
                    <div className="absolute bottom-2 right-2">
                        <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                            <span className="text-white text-xs font-bold">{recommendationScore}%</span>
                        </div>
                    </div>

                    {/* Mock Content */}
                    <div className="absolute inset-0 p-4">
                        <div className="space-y-1">
                            <div className="h-3 w-3/4 bg-white/30 rounded"></div>
                            <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                            <div className="h-4 w-full bg-white/40 rounded mt-2"></div>
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className="font-bold text-gray-900">{template.name}</h3>
                            <p className="text-sm text-gray-600">{template.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-bold text-gray-900">{template.aiScore || 85}%</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                        {template.features?.slice(0, 2).map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {feature}
                            </span>
                        ))}
                    </div>

                    <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 inline mr-1" />
                        Preview
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl max-w-6xl mx-auto">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                            <Layout className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">AI Template Selector</h2>
                            <p className="text-gray-600">AI-powered template recommendations based on your resume</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Preview:</span>
                    </div>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setPreviewMode('desktop')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${previewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Monitor className="w-4 h-4 inline mr-2" />
                            Desktop
                        </button>
                        <button
                            onClick={() => setPreviewMode('mobile')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${previewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Smartphone className="w-4 h-4 inline mr-2" />
                            Mobile
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6">
                {recommendTemplatesMutation.isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">AI is analyzing your resume for optimal template recommendations...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <h3 className="text-lg font-bold text-gray-900">AI Recommendations</h3>
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    Based on ATS Analysis
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {aiRecommendedTemplates.map((template) => (
                                    <TemplatePreview key={template.id} template={template} />
                                ))}
                            </div>
                        </div>

                        {templateAnalysis && (
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    AI Analysis Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">ATS Compatibility</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${templateAnalysis.atsScore || 90}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{templateAnalysis.atsScore || 90}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Content Fit</h4>
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-5 h-5 text-yellow-500" />
                                            <span className="text-gray-900">{templateAnalysis.contentFit}/10</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-700 mb-2">Industry Match</h4>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-green-500" />
                                            <span className="text-gray-900">{templateAnalysis.industryMatch}/10</span>
                                        </div>
                                    </div>
                                </div>
                                {templateAnalysis.reason && (
                                    <p className="mt-4 text-sm text-gray-700">{templateAnalysis.reason}</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <p>Selected: <span className="font-medium text-gray-900">
                            {templates.find(t => t.id === selectedTemplate)?.name}
                        </span></p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApplyTemplate}
                            disabled={applyTemplateMutation.isLoading}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {applyTemplateMutation.isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {applyTemplateMutation.isLoading ? 'Applying...' : 'Apply with AI'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AITemplateSelector;