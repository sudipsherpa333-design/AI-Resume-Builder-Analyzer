import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ExperiencePage = ({ resumeData, onInputChange, errors, setErrors }) => {
    const [experiences, setExperiences] = useState(resumeData?.experience || []);

    const addExperience = () => {
        const newExp = {
            jobTitle: '',
            company: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        const updated = [...experiences, newExp];
        setExperiences(updated);
        onInputChange('experience', updated);
    };

    const updateExperience = (index, field, value) => {
        const updated = [...experiences];
        updated[index] = { ...updated[index], [field]: value };
        setExperiences(updated);
        onInputChange('experience', updated);
    };

    const removeExperience = (index) => {
        const updated = experiences.filter((_, i) => i !== index);
        setExperiences(updated);
        onInputChange('experience', updated);
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Work Experience</h3>
            {experiences.map((exp, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Experience #{index + 1}</h4>
                        {index > 0 && (
                            <button
                                onClick={() => removeExperience(index)}
                                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                            >
                                <FaTimes /> Remove
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                            <input
                                type="text"
                                value={exp.jobTitle || ''}
                                onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Senior Software Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                            <input
                                type="text"
                                value={exp.company || ''}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Tech Corp"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="month"
                                value={exp.startDate || ''}
                                onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="month"
                                    value={exp.current ? '' : exp.endDate || ''}
                                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                    disabled={exp.current}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={exp.current || false}
                                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Currently working here</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={exp.description || ''}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                            placeholder="Describe your responsibilities and achievements..."
                        />
                    </div>
                </div>
            ))}
            <button
                onClick={addExperience}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
            >
                <span className="text-xl">+</span> Add Experience
            </button>
        </div>
    );
};

export default ExperiencePage;