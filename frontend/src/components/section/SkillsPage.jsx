// src/components/builder/SkillsPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code, Palette, Globe, Database, Wrench, Users,
    Cpu, Shield, Cloud, Smartphone, Edit, Trash2,
    Plus, X, ChevronUp, ChevronDown, Star, Eye, EyeOff,
    Zap, Target, TrendingUp, CheckCircle, Search,
    Filter, BarChart3, PieChart, Layers, Brain,
    BookOpen, Briefcase, MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SkillsPage = ({ data = {}, onUpdate, onNext, onPrev, onAIEnhance, aiCredits }) => {
    const [skills, setSkills] = useState(data?.items || []);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onUpdate) {
                onUpdate({ items: skills });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [skills, onUpdate]);

    // Categories with 'Wrench' instead of 'Tool'
    const categories = [
        { id: 'technical', name: 'Technical Skills', icon: Code, color: 'bg-blue-100 text-blue-600' },
        { id: 'design', name: 'Design & Creative', icon: Palette, color: 'bg-purple-100 text-purple-600' },
        { id: 'language', name: 'Languages', icon: Globe, color: 'bg-green-100 text-green-600' },
        { id: 'business', name: 'Business & Management', icon: Briefcase, color: 'bg-amber-100 text-amber-600' },
        { id: 'soft', name: 'Soft Skills', icon: Users, color: 'bg-pink-100 text-pink-600' },
        { id: 'digital', name: 'Digital Marketing', icon: TrendingUp, color: 'bg-red-100 text-red-600' },
        { id: 'industry', name: 'Industry Specific', icon: Wrench, color: 'bg-indigo-100 text-indigo-600' }
    ];

    const proficiencyLevels = [
        { id: 'beginner', name: 'Beginner', color: 'bg-gray-100 text-gray-700' },
        { id: 'intermediate', name: 'Intermediate', color: 'bg-blue-50 text-blue-700' },
        { id: 'advanced', name: 'Advanced', color: 'bg-green-50 text-green-700' },
        { id: 'expert', name: 'Expert', color: 'bg-purple-50 text-purple-700' }
    ];

    const emptySkill = {
        id: Date.now().toString(),
        name: '',
        category: 'technical',
        proficiency: 'intermediate',
        yearsOfExperience: '',
        description: '',
        isVisible: true,
        isFeatured: false
    };

    const addSkill = () => {
        const newSkill = { ...emptySkill, id: Date.now().toString() };
        setSkills([newSkill, ...skills]);
        setEditingId(newSkill.id);
    };

    const updateSkill = (id, updates) => {
        setSkills(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    const deleteSkill = (id) => {
        setSkills(prev => prev.filter(s => s.id !== id));
        toast.success('Skill removed');
    };

    const handleAIEnhance = (id) => {
        if (aiCredits <= 0) return toast.error('Insufficient credits');
        const skill = skills.find(s => s.id === id);
        if (skill?.name) {
            updateSkill(id, {
                description: `Expert proficiency in ${skill.name} with a focus on modern industry standards and best practices.`,
                aiEnhanced: true
            });
            onAIEnhance?.();
            toast.success('Skill description optimized!');
        }
    };

    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCat = filterCategory === 'all' || skill.category === filterCategory;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Skills & Expertise</h2>
                    <p className="text-gray-500">Highlight your top skills and proficiency levels.</p>
                </div>
                <button onClick={addSkill} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
                    <Plus className="w-5 h-5" /> Add Skill
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your skills..."
                        className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>

            {/* Skills List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {filteredSkills.map((skill) => {
                        const isEditing = editingId === skill.id;
                        const CategoryIcon = categories.find(c => c.id === skill.category)?.icon || Code;

                        return (
                            <motion.div
                                key={skill.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-4 rounded-2xl border bg-white shadow-sm transition-all ${skill.isVisible ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <CategoryIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{skill.name || 'New Skill'}</h4>
                                            <p className="text-xs text-gray-500 capitalize">{skill.category} • {skill.proficiency}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => setEditingId(isEditing ? null : skill.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteSkill(skill.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {isEditing && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mt-4 pt-4 border-t space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Skill Name (e.g. React)"
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={skill.name}
                                            onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <select
                                                className="p-2 border rounded-lg text-sm"
                                                value={skill.category}
                                                onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                                            >
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                            </select>
                                            <select
                                                className="p-2 border rounded-lg text-sm"
                                                value={skill.proficiency}
                                                onChange={(e) => updateSkill(skill.id, { proficiency: e.target.value })}
                                            >
                                                {proficiencyLevels.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.name}</option>)}
                                            </select>
                                        </div>
                                        <button
                                            onClick={() => handleAIEnhance(skill.id)}
                                            className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                                        >
                                            <Brain className="w-3 h-3" /> Optimize with AI
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 border-t">
                <button onClick={onPrev} className="px-8 py-3 text-gray-600 font-bold">← Back</button>
                <button onClick={onNext} className="px-10 py-3 bg-gray-900 text-white rounded-xl font-bold shadow-lg">Next Step →</button>
            </div>
        </div>
    );
};

export default SkillsPage;