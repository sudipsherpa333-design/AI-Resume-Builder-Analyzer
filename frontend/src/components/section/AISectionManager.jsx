// ------------------- AISectionManager.jsx -------------------
import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
    Layers,
    Sparkles,
    MoveVertical,
    Eye,
    EyeOff,
    Settings,
    Check,
    X,
    Plus,
    Trash2,
    Zap,
    Target,
    BarChart,
    Lock,
    Unlock,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';

const AISectionManager = ({
    sections = [],
    resumeData,
    currentStep,
    onReorder,
    onToggle,
    onClose
}) => {
    const [reorderMode, setReorderMode] = useState(false);
    const [reorderedSections, setReorderedSections] = useState(sections);
    const [enabledSections, setEnabledSections] = useState(
        sections.reduce((acc, section) => ({
            ...acc,
            [section.id]: section.required || (resumeData[section.id]?.length > 0)
        }), {})
    );

    // AI Section Analysis Query
    const sectionAnalysisQuery = useQuery({
        queryKey: ['section-analysis', resumeData._id],
        queryFn: async () => {
            const response = await fetch('/api/ai/sections/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeData,
                    sections,
                    targetRole: resumeData.targetRole
                })
            });

            if (!response.ok) throw new Error('Failed to analyze sections');
            return response.json();
        },
        enabled: !!resumeData._id
    });

    // AI Optimize Order Mutation
    const optimizeOrderMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('/api/ai/sections/optimize-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sections: reorderedSections,
                    resumeData,
                    targetRole: resumeData.targetRole
                })
            });

            if (!response.ok) throw new Error('Failed to optimize order');
            return response.json();
        },
        onSuccess: (data) => {
            setReorderedSections(data.optimizedSections);
            toast.success('AI optimized section order!');
        },
        onError: (error) => {
            toast.error('Failed to optimize order');
            console.error('Order optimization error:', error);
        }
    });

    // Add Custom Section Mutation
    const addCustomSectionMutation = useMutation({
        mutationFn: async (sectionName) => {
            const response = await fetch('/api/ai/sections/add-custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sectionName,
                    resumeData,
                    currentSections: reorderedSections
                })
            });

            if (!response.ok) throw new Error('Failed to add custom section');
            return response.json();
        },
        onSuccess: (data) => {
            const newSection = data.section;
            setReorderedSections(prev => [...prev, newSection]);
            setEnabledSections(prev => ({ ...prev, [newSection.id]: true }));
            toast.success('AI created custom section!');
        },
        onError: (error) => {
            toast.error('Failed to add custom section');
            console.error('Add section error:', error);
        }
    });

    useEffect(() => {
        setReorderedSections(sections);
    }, [sections]);

    const handleToggleSection = (sectionId, enabled) => {
        setEnabledSections(prev => ({
            ...prev,
            [sectionId]: enabled
        }));

        if (onToggle) {
            onToggle(sectionId, enabled);
        }

        toast.success(`${enabled ? 'Enabled' : 'Disabled'} section`);
    };

    const handleSaveOrder = () => {
        if (onReorder) {
            onReorder(reorderedSections);
            toast.success('Sections reordered successfully');
        }
        setReorderMode(false);
    };

    const handleAddNewSection = () => {
        const sectionName = prompt('Enter custom section name:');
        if (sectionName) {
            addCustomSectionMutation.mutate(sectionName);
        }
    };

    const handleAIOptimizeOrder = () => {
        optimizeOrderMutation.mutate();
    };

    const SectionCard = ({ section, index, isDragging = false }) => {
        const Icon = section.icon;
        const isEnabled = enabledSections[section.id];
        const hasContent = resumeData[section.id]?.length > 0;
        const isCurrent = currentStep === index;
        const aiScore = sectionAnalysisQuery.data?.scores?.[section.id] || 0;

        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-4 rounded-xl border ${isCurrent ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200'} ${isDragging ? 'shadow-lg scale-105' : 'hover:shadow-sm'}`}
            >
                <div className="flex items-start gap-4">
                    {reorderMode && (
                        <div className="pt-1 cursor-grab active:cursor-grabbing">
                            <MoveVertical className="w-5 h-5 text-gray-400" />
                        </div>
                    )}

                    <div className={`p-3 rounded-lg ${isEnabled ? 'bg-gradient-to-r from-blue-100 to-cyan-100' : 'bg-gray-100'} ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}>
                        <Icon className={`w-5 h-5 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h3 className="font-bold text-gray-900">{section.label}</h3>
                                <p className="text-sm text-gray-600">{section.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {section.required && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                                        Required
                                    </span>
                                )}
                                {isCurrent && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                        Current
                                    </span>
                                )}
                                {aiScore > 0 && (
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${aiScore >= 80 ? 'bg-green-100 text-green-700' : aiScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {aiScore}%
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${hasContent ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <span className="text-sm text-gray-600">
                                        {hasContent ? 'Content added' : 'Empty'}
                                    </span>
                                </div>

                                {section.aiCapabilities && (
                                    <div className="hidden md:flex items-center gap-1">
                                        <Sparkles className="w-3 h-3 text-blue-500" />
                                        <span className="text-xs text-gray-600">
                                            {section.aiCapabilities.length} AI features
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {!section.required && (
                                    <button
                                        onClick={() => handleToggleSection(section.id, !isEnabled)}
                                        className={`p-2 rounded-lg ${isEnabled ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                        title={isEnabled ? 'Disable section' : 'Enable section'}
                                    >
                                        {isEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>
                                )}

                                <button
                                    onClick={() => toast.info(`Edit ${section.label}`)}
                                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200"
                                    title="Edit section"
                                >
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {section.aiCapabilities && isEnabled && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-1">
                            {section.aiCapabilities.map((capability, idx) => (
                                <span key={idx} className="px-2 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 text-xs rounded border border-blue-200">
                                    {capability}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="bg-white rounded-2xl">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                            <Layers className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">AI Section Manager</h2>
                            <p className="text-gray-600">AI-powered section organization and optimization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700">Total Sections</p>
                        <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-blue-700">Enabled</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {Object.values(enabledSections).filter(v => v).length}
                        </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-green-700">AI Score</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {sectionAnalysisQuery.data?.overallScore || 0}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setReorderMode(!reorderMode)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${reorderMode ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                        >
                            <MoveVertical className="w-4 h-4" />
                            {reorderMode ? 'Done Reordering' : 'Reorder Sections'}
                        </button>

                        <button
                            onClick={handleAIOptimizeOrder}
                            disabled={optimizeOrderMutation.isLoading}
                            className="px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg hover:shadow-sm flex items-center gap-2 border border-purple-100 disabled:opacity-50"
                        >
                            {optimizeOrderMutation.isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            AI Optimize Order
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddNewSection}
                            disabled={addCustomSectionMutation.isLoading}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                        >
                            {addCustomSectionMutation.isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4" />
                            )}
                            Add AI Section
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
                {reorderMode ? (
                    <Reorder.Group
                        axis="y"
                        values={reorderedSections}
                        onReorder={setReorderedSections}
                        className="space-y-4"
                    >
                        {reorderedSections.map((section, index) => (
                            <Reorder.Item
                                key={section.id}
                                value={section}
                                className="cursor-grab active:cursor-grabbing"
                            >
                                <SectionCard section={section} index={index} isDragging={reorderMode} />
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                ) : (
                    <div className="space-y-4">
                        {reorderedSections.map((section, index) => (
                            <SectionCard key={section.id} section={section} index={index} />
                        ))}
                    </div>
                )}
            </div>

            {sectionAnalysisQuery.data?.recommendations && (
                <div className="p-6 border-t border-gray-200">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-blue-600" />
                            AI Recommendations
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                            {sectionAnalysisQuery.data.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        <p>Drag to reorder sections • Click icons to enable/disable</p>
                    </div>
                    <div className="flex gap-3">
                        {reorderMode && (
                            <button
                                onClick={handleSaveOrder}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Save New Order
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AISectionManager;