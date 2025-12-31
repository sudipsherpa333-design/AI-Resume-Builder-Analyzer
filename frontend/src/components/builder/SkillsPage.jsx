// src/components/builder/SkillsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SmartInput } from '../ui/SmartInput';
import { Plus, Trash2 } from 'lucide-react';

const SkillsPage = ({ data, onUpdate, user }) => {
    const [skills, setSkills] = useState(Array.isArray(data) ? data : []);
    const [newSkill, setNewSkill] = useState('');

    useEffect(() => {
        setSkills(Array.isArray(data) ? data : []);
    }, [data]);

    const addSkill = () => {
        if (newSkill.trim()) {
            const updated = [...skills, newSkill.trim()];
            setSkills(updated);
            onUpdate(updated);
            setNewSkill('');
        }
    };

    const removeSkill = (index) => {
        const updated = skills.filter((_, i) => i !== index);
        setSkills(updated);
        onUpdate(updated);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills</h2>
                <p className="text-gray-600">List your technical and professional skills</p>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., React, Python, Project Management)"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                        onClick={addSkill}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium"
                    >
                        <Plus size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                            <span className="text-gray-700">{skill}</span>
                            <button
                                onClick={() => removeSkill(index)}
                                className="p-1 hover:bg-gray-200 rounded"
                            >
                                <Trash2 size={16} className="text-gray-500" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default SkillsPage;