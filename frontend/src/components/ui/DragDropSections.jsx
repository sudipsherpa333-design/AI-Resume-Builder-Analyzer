// ------------------- DragDropSections.jsx -------------------
// src/components/ui/DragDropSections.jsx
import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { MoveVertical, Eye, EyeOff, Trash2, Plus, Settings, Check, X, LayoutGrid } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DragDropSections = ({ resumeData, sections, onUpdate, onClose }) => {
    const [sectionItems, setSectionItems] = useState(
        sections.map(section => ({
            ...section,
            enabled: true,
            order: sections.indexOf(section),
            custom: false
        }))
    );

    const [customSections, setCustomSections] = useState([
        { id: 'custom1', label: 'Publications', enabled: true, order: sections.length, custom: true },
        { id: 'custom2', label: 'Volunteer Work', enabled: false, order: sections.length + 1, custom: true },
        { id: 'custom3', label: 'Awards', enabled: true, order: sections.length + 2, custom: true }
    ]);

    const allSections = [...sectionItems, ...customSections].sort((a, b) => a.order - b.order);

    const handleDragEnd = (newOrder) => {
        const updated = newOrder.map((item, index) => ({
            ...item,
            order: index
        }));
        setSectionItems(updated.filter(s => !s.custom));
        setCustomSections(updated.filter(s => s.custom));
    };

    const toggleSection = (sectionId) => {
        const updated = allSections.map(section =>
            section.id === sectionId ? { ...section, enabled: !section.enabled } : section
        );

        if (updated.find(s => s.id === sectionId)?.custom) {
            setCustomSections(updated.filter(s => s.custom));
        } else {
            setSectionItems(updated.filter(s => !s.custom));
        }

        const section = updated.find(s => s.id === sectionId);
        toast.success(`${section.label} ${section.enabled ? 'enabled' : 'disabled'}`);
    };

    const deleteCustomSection = (sectionId) => {
        setCustomSections(prev => prev.filter(s => s.id !== sectionId));
        toast.success('Section deleted');
    };

    const addCustomSection = () => {
        const label = window.prompt('Enter section name:');
        if (label && label.trim()) {
            const newSection = {
                id: `custom_${Date.now()}`,
                label: label.trim(),
                enabled: true,
                order: allSections.length,
                custom: true
            };
            setCustomSections(prev => [...prev, newSection]);
            toast.success('Custom section added');
        }
    };

    const handleSave = () => {
        const finalOrder = [...sectionItems, ...customSections]
            .filter(s => s.enabled)
            .sort((a, b) => a.order - b.order)
            .map(s => s.id);

        onUpdate(finalOrder);
        toast.success('Layout saved successfully');
        onClose();
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                        <LayoutGrid className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Drag & Drop Layout</h2>
                        <p className="text-gray-600 dark:text-gray-400">Reorder and customize sections</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Instructions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <MoveVertical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="font-medium text-blue-800 dark:text-blue-300">How to customize:</p>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 mt-1 space-y-1">
                                <li>• Drag sections to reorder them</li>
                                <li>• Toggle eye icons to show/hide sections</li>
                                <li>• Add custom sections using the button below</li>
                                <li>• Click Save Layout when finished</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Sections List */}
                <Reorder.Group
                    axis="y"
                    values={allSections}
                    onReorder={handleDragEnd}
                    className="space-y-3"
                >
                    {allSections.map((section) => (
                        <Reorder.Item
                            key={section.id}
                            value={section}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600"
                        >
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <MoveVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                    {section.icon && (
                                        <section.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    )}
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">{section.label}</h3>
                                        {section.description && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                                        )}
                                    </div>
                                    {section.custom && (
                                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded">
                                            Custom
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className={`p-2 rounded-lg ${section.enabled ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
                                    >
                                        {section.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>

                                    {section.custom && (
                                        <button
                                            onClick={() => deleteCustomSection(section.id)}
                                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>

                {/* Add Custom Section */}
                <button
                    onClick={addCustomSection}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Add Custom Section</span>
                </button>

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Layout Preview</h3>
                    <div className="space-y-2">
                        {allSections
                            .filter(s => s.enabled)
                            .sort((a, b) => a.order - b.order)
                            .map((section, index) => (
                                <div
                                    key={section.id}
                                    className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded-lg"
                                >
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{section.label}</span>
                                    {section.custom && (
                                        <span className="ml-auto text-xs text-gray-500">Custom</span>
                                    )}
                                </div>
                            ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg font-medium flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Save Layout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DragDropSections;