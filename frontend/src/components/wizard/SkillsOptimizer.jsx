// src/components/wizard/SkillsOptimizer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    Plus, Trash2, Cpu, Sparkles, Loader2, Search, Filter,
    Star, TrendingUp, Check, X, Zap, Brain, Target, BarChart
} from 'lucide-react';

import { enhanceResume } from '../../utils/aiClient';

const SkillsOptimizer = ({
    data = [],
    onChange,
    isAnalyzing = false,
    keywords = [],
    targetRole = '',
    jobDescription = ''
}) => {
    const [skills, setSkills] = useState(Array.isArray(data) ? data : []);
    const [suggestedSkills, setSuggestedSkills] = useState([]);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        setSkills(Array.isArray(data) ? data : []);
    }, [data]);

    /* -------------------- HELPERS -------------------- */

    const calculateRelevanceScore = (skillName, role, keywords) => {
        let score = 0;
        const s = skillName.toLowerCase();
        const r = role.toLowerCase();

        if (r.includes('frontend') && (s.includes('react') || s.includes('javascript'))) score += 40;
        if (r.includes('backend') && (s.includes('node') || s.includes('python'))) score += 40;

        keywords.forEach(k => {
            if (s.includes(k.toLowerCase())) score += 15;
        });

        return Math.min(score, 100);
    };

    /* -------------------- AI CALLS -------------------- */

    const getAISuggestedSkills = useCallback(async () => {
        if (!targetRole) {
            toast.error('Please set a target role');
            return;
        }

        setIsLoadingAI(true);
        try {
            const suggestions = await aiClient.suggestSkills(targetRole, skills, keywords);

            const filtered = suggestions.filter(
                s => !skills.some(ex => ex.name.toLowerCase() === s.name.toLowerCase())
            );

            setSuggestedSkills(filtered);
            toast.success(`AI suggested ${filtered.length} skills`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to get AI skill suggestions');
        } finally {
            setIsLoadingAI(false);
        }
    }, [targetRole, skills, keywords]);

    const handleAIOptimize = async () => {
        if (!jobDescription) {
            toast.error('Add job description for ATS optimization');
            return;
        }

        setIsLoadingAI(true);
        toast.loading('Optimizing skills with AI...');

        try {
            const analysis = await aiClient.analyzeATS({ skills }, jobDescription);
            const aiSkills = await aiClient.suggestSkills(targetRole, skills, analysis.keywords || []);

            const merged = [...skills];

            aiSkills.forEach(skill => {
                if (!merged.some(s => s.name.toLowerCase() === skill.name.toLowerCase())) {
                    merged.push({
                        id: `ai_${crypto.randomUUID()}`,
                        name: skill.name,
                        category: skill.category || 'technical',
                        level: skill.level || 'Intermediate',
                        yearsOfExperience: 0,
                        isAIRecommended: true,
                        isKeywordMatch: true,
                        relevanceScore: 95
                    });
                }
            });

            const finalSkills = merged.map(s => ({
                ...s,
                relevanceScore: calculateRelevanceScore(
                    s.name,
                    targetRole,
                    analysis.keywords || keywords
                )
            })).sort((a, b) => b.relevanceScore - a.relevanceScore);

            setSkills(finalSkills);
            onChange(finalSkills);

            toast.dismiss();
            toast.success('Skills optimized successfully!');
        } catch (err) {
            console.error(err);
            toast.dismiss();
            toast.error('AI optimization failed');
        } finally {
            setIsLoadingAI(false);
        }
    };

    /* -------------------- CRUD -------------------- */

    const handleAddSkill = (skill = null) => {
        const newSkill = skill || {
            id: crypto.randomUUID(),
            name: '',
            category: 'technical',
            level: 'Intermediate',
            yearsOfExperience: 0,
            relevanceScore: 0,
            isKeywordMatch: false
        };

        const updated = [...skills, newSkill];
        setSkills(updated);
        onChange(updated);
    };

    const handleRemoveSkill = (id) => {
        const updated = skills.filter(s => s.id !== id);
        setSkills(updated);
        onChange(updated);
    };

    const handleUpdateSkill = (id, field, value) => {
        const updated = skills.map(skill =>
            skill.id === id
                ? {
                    ...skill,
                    [field]: value,
                    relevanceScore:
                        field === 'name'
                            ? calculateRelevanceScore(value, targetRole, keywords)
                            : skill.relevanceScore
                }
                : skill
        );
        setSkills(updated);
        onChange(updated);
    };

    /* -------------------- FILTER -------------------- */

    const filteredSkills = skills.filter(skill => {
        const matchesSearch =
            !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || skill.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    /* -------------------- UI -------------------- */

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold">Skills Optimizer</h3>
                    <p className="text-gray-600">AI-powered skill enhancement</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={getAISuggestedSkills}
                        disabled={isLoadingAI}
                        className="btn-primary"
                    >
                        {isLoadingAI ? <Loader2 className="animate-spin" /> : <Zap />}
                        AI Suggestions
                    </button>

                    <button
                        onClick={handleAIOptimize}
                        disabled={isLoadingAI || isAnalyzing}
                        className="btn-secondary"
                    >
                        {isLoadingAI ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        AI Optimize
                    </button>
                </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="flex gap-3">
                <input
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search skills..."
                    className="input"
                />

                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="input"
                >
                    <option value="all">All</option>
                    <option value="technical">Technical</option>
                    <option value="soft">Soft</option>
                    <option value="tools">Tools</option>
                    <option value="languages">Languages</option>
                    <option value="certifications">Certifications</option>
                </select>
            </div>

            {/* AI SUGGESTIONS */}
            {suggestedSkills.length > 0 && (
                <div className="p-4 bg-emerald-50 rounded-lg">
                    <h4 className="font-semibold mb-2">AI Suggested Skills</h4>
                    <div className="flex flex-wrap gap-2">
                        {suggestedSkills.map(skill => (
                            <button
                                key={skill.name}
                                onClick={() => handleAddSkill(skill)}
                                className="tag"
                            >
                                <Plus size={14} /> {skill.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* SKILLS LIST */}
            {filteredSkills.map(skill => (
                <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card"
                >
                    <div className="flex justify-between">
                        <input
                            value={skill.name}
                            onChange={e => handleUpdateSkill(skill.id, 'name', e.target.value)}
                            className="input flex-1"
                            placeholder="Skill name"
                        />
                        <button onClick={() => handleRemoveSkill(skill.id)}>
                            <Trash2 className="text-red-500" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-3">
                        <select
                            value={skill.level}
                            onChange={e => handleUpdateSkill(skill.id, 'level', e.target.value)}
                            className="input"
                        >
                            <option>Beginner</option>
                            <option>Intermediate</option>
                            <option>Advanced</option>
                            <option>Expert</option>
                        </select>

                        <select
                            value={skill.category}
                            onChange={e => handleUpdateSkill(skill.id, 'category', e.target.value)}
                            className="input"
                        >
                            <option value="technical">Technical</option>
                            <option value="soft">Soft</option>
                            <option value="tools">Tools</option>
                            <option value="languages">Languages</option>
                            <option value="certifications">Certifications</option>
                        </select>

                        <input
                            type="number"
                            min="0"
                            value={skill.yearsOfExperience}
                            onChange={e =>
                                handleUpdateSkill(skill.id, 'yearsOfExperience', Number(e.target.value))
                            }
                            className="input"
                        />
                    </div>
                </motion.div>
            ))}

            {/* ADD */}
            <button onClick={() => handleAddSkill()} className="btn-outline w-full">
                <Plus /> Add Skill
            </button>
        </div>
    );
};

export default SkillsOptimizer;
