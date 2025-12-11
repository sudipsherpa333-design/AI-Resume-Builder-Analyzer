import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const SkillsPage = ({ resumeData, onInputChange }) => {
    const [skillInput, setSkillInput] = useState('');
    const [skills, setSkills] = useState(resumeData?.skills || []);

    const addSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            const updated = [...skills, skillInput.trim()];
            setSkills(updated);
            onInputChange('skills', updated);
            setSkillInput('');
        }
    };

    const removeSkill = (index) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
        onInputChange('skills', updated);
    };

    return (
        <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills</h3>
            <div className="mb-6">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter a skill (e.g., React, JavaScript, AWS)"
                    />
                    <button
                        onClick={addSkill}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Add
                    </button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[100px] p-4 border border-gray-200 rounded-lg">
                {skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
                        <span>{skill}</span>
                        <button
                            onClick={() => removeSkill(index)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <FaTimes />
                        </button>
                    </div>
                ))}
                {skills.length === 0 && (
                    <div className="w-full text-center text-gray-500 py-8">
                        No skills added yet. Add your first skill above!
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsPage;