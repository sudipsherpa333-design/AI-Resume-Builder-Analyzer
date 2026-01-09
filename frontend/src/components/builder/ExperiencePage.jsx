// src/components/builder/ExperiencePage.jsx
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Edit2, Calendar, MapPin, Building } from 'lucide-react';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';

const ExperiencePage = ({ data = [], onUpdate, onSave, aiCredits, onAIEnhance }) => {
    const [newExperience, setNewExperience] = useState({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
        achievements: ['']
    });

    // Initialize drag and drop
    const {
        items: experiences,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
        registerItemRef,
        getItemStyle,
        getContainerStyle,
        containerRef,
        isDragging
    } = useDragAndDrop(data, (reorderedItems) => {
        // Call parent update when items are reordered
        onUpdate(reorderedItems);
    }, {
        dragHandleSelector: '.drag-handle',
        animationDuration: 300,
        onDragStart: (info) => {
            console.log('Started dragging:', info.itemId);
        },
        onDragEnd: (info) => {
            console.log('Finished dragging:', info.itemId);
        }
    });

    const handleAddExperience = () => {
        if (!newExperience.jobTitle || !newExperience.company || !newExperience.startDate) {
            alert('Please fill in required fields: Job Title, Company, and Start Date');
            return;
        }

        const newExp = {
            ...newExperience,
            id: `exp_${Date.now()}`,
            createdAt: new Date().toISOString()
        };

        const updated = [...experiences, newExp];
        onUpdate(updated);

        // Reset form
        setNewExperience({
            jobTitle: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
            achievements: ['']
        });
    };

    const handleDeleteExperience = useCallback((index) => {
        const updated = experiences.filter((_, i) => i !== index);
        onUpdate(updated);
    }, [experiences, onUpdate]);

    const handleUpdateExperience = useCallback((index, updates) => {
        const updated = experiences.map((exp, i) =>
            i === index ? { ...exp, ...updates } : exp
        );
        onUpdate(updated);
    }, [experiences, onUpdate]);

    const handleAddAchievement = useCallback((expIndex) => {
        const updated = [...experiences];
        updated[expIndex].achievements = [...(updated[expIndex].achievements || []), ''];
        onUpdate(updated);
    }, [experiences, onUpdate]);

    const handleUpdateAchievement = useCallback((expIndex, achievementIndex, value) => {
        const updated = [...experiences];
        updated[expIndex].achievements[achievementIndex] = value;
        onUpdate(updated);
    }, [experiences, onUpdate]);

    const handleRemoveAchievement = useCallback((expIndex, achievementIndex) => {
        const updated = [...experiences];
        updated[expIndex].achievements = updated[expIndex].achievements.filter((_, i) => i !== achievementIndex);
        onUpdate(updated);
    }, [experiences, onUpdate]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Work Experience</h2>
                <p className="text-gray-600">
                    Add your work history in reverse chronological order. Drag and drop to reorder.
                </p>
            </div>

            {/* Experiences List */}
            <div
                ref={containerRef}
                style={getContainerStyle()}
                className="space-y-4 mb-8 min-h-[200px]"
            >
                <AnimatePresence>
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={exp.id || exp._id || index}
                            ref={(el) => registerItemRef(exp.id || exp._id || index, el)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.3 }}
                            style={getItemStyle(exp.id || exp._id || index, index)}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                            data-drag-item="true"
                            data-drag-item-id={exp.id || exp._id || index}
                            data-drag-item-index={index}
                        >
                            <div className="flex items-start gap-4">
                                {/* Drag Handle */}
                                <button
                                    className="drag-handle p-2 -ml-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, exp.id || exp._id || index, index)}
                                    onDragOver={(e) => handleDragOver(e, exp.id || exp._id || index, index)}
                                    onDrop={(e) => handleDrop(e, exp.id || exp._id || index, index)}
                                    onDragEnd={handleDragEnd}
                                    title="Drag to reorder"
                                >
                                    <GripVertical className="w-5 h-5" />
                                </button>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {exp.jobTitle}
                                            </h3>
                                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                                <Building className="w-4 h-4" />
                                                <span>{exp.company}</span>
                                                {exp.location && (
                                                    <>
                                                        <span className="text-gray-400">•</span>
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{exp.location}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                                            </span>
                                        </div>
                                    </div>

                                    {exp.description && (
                                        <p className="text-gray-700 mb-4 whitespace-pre-line">
                                            {exp.description}
                                        </p>
                                    )}

                                    {exp.achievements && exp.achievements.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-700 mb-2">Key Achievements</h4>
                                            <ul className="space-y-2">
                                                {exp.achievements.map((achievement, achIndex) => (
                                                    achievement && (
                                                        <li key={achIndex} className="flex items-start gap-2">
                                                            <span className="text-blue-500 mt-1">•</span>
                                                            <span className="text-gray-600">{achievement}</span>
                                                        </li>
                                                    )
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                                        <button
                                            onClick={() => handleDeleteExperience(index)}
                                            className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>

                                        {aiCredits >= 10 && (
                                            <button
                                                onClick={() => {
                                                    onAIEnhance(exp).then(enhanced => {
                                                        handleUpdateExperience(index, enhanced);
                                                    });
                                                }}
                                                className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm"
                                            >
                                                <Sparkles className="w-4 h-4" />
                                                Enhance with AI
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {experiences.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No experience added yet</h3>
                        <p className="text-gray-500">Add your first work experience below</p>
                    </div>
                )}
            </div>

            {/* Add New Experience Form */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Add New Experience</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                        </label>
                        <input
                            type="text"
                            value={newExperience.jobTitle}
                            onChange={(e) => setNewExperience({ ...newExperience, jobTitle: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Senior Software Engineer"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company *
                        </label>
                        <input
                            type="text"
                            value={newExperience.company}
                            onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Google"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={newExperience.location}
                            onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., San Francisco, CA"
                        />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="month"
                                value={newExperience.startDate}
                                onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <div className="space-y-2">
                                {!newExperience.isCurrent && (
                                    <input
                                        type="month"
                                        value={newExperience.endDate}
                                        onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                )}
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newExperience.isCurrent}
                                        onChange={(e) => setNewExperience({
                                            ...newExperience,
                                            isCurrent: e.target.checked,
                                            endDate: e.target.checked ? '' : newExperience.endDate
                                        })}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm text-gray-700">I currently work here</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={newExperience.description}
                            onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Describe your responsibilities and accomplishments..."
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAddExperience}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Experience
                    </button>
                </div>
            </div>

            {/* Drag and Drop Instructions */}
            {isDragging && (
                <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                    <p className="text-sm">Drag to reorder experiences</p>
                </div>
            )}
        </div>
    );
};

export default ExperiencePage;