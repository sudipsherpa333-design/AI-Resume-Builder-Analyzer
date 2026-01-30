// src/components/builder/LanguagesPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Globe, MessageSquare, BookOpen, Mic, Headphones,
    Edit, Trash2, Plus, X, ChevronUp, ChevronDown,
    Star, Eye, EyeOff, Award, Target, TrendingUp,
    CheckCircle, Volume2, PenTool, Users, Brain,
    GraduationCap, Flag, Languages as LanguagesIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const LanguagesPage = ({ data = {}, onUpdate, onNext, onPrev, onAIEnhance, aiCredits }) => {
    const [languageSkills, setLanguageSkills] = useState(data?.items || []);
    const [editingId, setEditingId] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [filterLevel, setFilterLevel] = useState('all');

    useEffect(() => {
        if (languageSkills !== data?.items) {
            const timer = setTimeout(() => {
                if (onUpdate) {
                    onUpdate({ items: languageSkills });
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [languageSkills, onUpdate, data?.items]);

    // Nepal-specific languages with native speakers data
    const nepaliLanguages = [
        { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', speakers: '17 million', official: true },
        { code: 'en', name: 'English', nativeName: 'English', speakers: 'Global', official: true },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speakers: '8 million', official: false },
        { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', speakers: '3 million', official: false },
        { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', speakers: '2.6 million', official: false },
        { code: 'thr', name: 'Tharu', nativeName: 'थारु', speakers: '1.9 million', official: false },
        { code: 'taj', name: 'Tamang', nativeName: 'तामाङ', speakers: '1.7 million', official: false },
        { code: 'new', name: 'Newari', nativeName: 'नेवारी', speakers: '1.2 million', official: false },
        { code: 'mag', name: 'Magar', nativeName: 'मगर', speakers: '1.1 million', official: false },
        { code: 'awa', name: 'Awadhi', nativeName: 'अवधी', speakers: '1.0 million', official: false },
        { code: 'gur', name: 'Gurung', nativeName: 'तमु गुरुङ', speakers: '0.6 million', official: false },
        { code: 'lim', name: 'Limbu', nativeName: 'यक्थुङ', speakers: '0.4 million', official: false },
        { code: 'zh', name: 'Chinese', nativeName: '中文', speakers: 'Global', official: false },
        { code: 'ja', name: 'Japanese', nativeName: '日本語', speakers: 'Global', official: false },
        { code: 'ko', name: 'Korean', nativeName: '한국어', speakers: 'Global', official: false },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', speakers: 'Global', official: false },
        { code: 'fr', name: 'French', nativeName: 'Français', speakers: 'Global', official: false },
        { code: 'de', name: 'German', nativeName: 'Deutsch', speakers: 'Global', official: false }
    ];

    const proficiencyLevels = [
        {
            id: 'beginner',
            name: 'Beginner',
            description: 'Basic phrases and simple conversations',
            color: 'bg-gray-100 text-gray-700',
            short: 'B'
        },
        {
            id: 'intermediate',
            name: 'Intermediate',
            description: 'Can handle daily conversations',
            color: 'bg-blue-50 text-blue-700',
            short: 'I'
        },
        {
            id: 'advanced',
            name: 'Advanced',
            description: 'Can discuss complex topics with some effort',
            color: 'bg-green-50 text-green-700',
            short: 'A'
        },
        {
            id: 'fluent',
            name: 'Fluent',
            description: 'Can communicate effectively in any situation',
            color: 'bg-purple-50 text-purple-700',
            short: 'F'
        },
        {
            id: 'native',
            name: 'Native',
            description: 'First language, complete fluency',
            color: 'bg-amber-50 text-amber-700',
            short: 'N'
        }
    ];

    const skillCategories = [
        { id: 'speaking', name: 'Speaking', icon: Mic, color: 'bg-blue-100' },
        { id: 'listening', name: 'Listening', icon: Headphones, color: 'bg-green-100' },
        { id: 'reading', name: 'Reading', icon: BookOpen, color: 'bg-purple-100' },
        { id: 'writing', name: 'Writing', icon: PenTool, color: 'bg-amber-100' }
    ];

    const emptyLanguageSkill = {
        id: Date.now().toString(),
        language: '',
        proficiency: 'intermediate',
        speaking: 'intermediate',
        listening: 'intermediate',
        reading: 'intermediate',
        writing: 'intermediate',
        yearsOfExperience: '',
        certification: '',
        description: '',
        isVisible: true,
        isFeatured: false
    };

    const addLanguageSkill = () => {
        const newLang = { ...emptyLanguageSkill, id: Date.now().toString() };
        setLanguageSkills([newLang, ...languageSkills]);
        setEditingId(newLang.id);
        setIsAdding(true);
    };

    const updateLanguageSkill = (id, updates) => {
        setLanguageSkills(languageSkills.map(lang =>
            lang.id === id ? { ...lang, ...updates } : lang
        ));
    };

    const deleteLanguageSkill = (id) => {
        setLanguageSkills(languageSkills.filter(lang => lang.id !== id));
        toast.success('Language skill deleted');
    };

    const moveLanguageSkill = (id, direction) => {
        const index = languageSkills.findIndex(lang => lang.id === id);
        if (
            (direction === 'up' && index > 0) ||
            (direction === 'down' && index < languageSkills.length - 1)
        ) {
            const newSkills = [...languageSkills];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [newSkills[index], newSkills[newIndex]] =
                [newSkills[newIndex], newSkills[index]];
            setLanguageSkills(newSkills);
        }
    };

    const toggleVisibility = (id) => {
        updateLanguageSkill(id, { isVisible: !languageSkills.find(l => l.id === id).isVisible });
    };

    const toggleFeatured = (id) => {
        updateLanguageSkill(id, { isFeatured: !languageSkills.find(l => l.id === id).isFeatured });
    };

    const getProficiencyScore = (level) => {
        const scores = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'fluent': 4,
            'native': 5
        };
        return scores[level] || 0;
    };

    const getOverallProficiency = (lang) => {
        const scores = [
            getProficiencyScore(lang.listening),
            getProficiencyScore(lang.speaking),
            getProficiencyScore(lang.reading),
            getProficiencyScore(lang.writing)
        ];
        const average = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (average >= 4.5) return 'native';
        if (average >= 3.5) return 'fluent';
        if (average >= 2.5) return 'advanced';
        if (average >= 1.5) return 'intermediate';
        return 'beginner';
    };

    const renderLanguageCard = (lang, index) => {
        const isEditing = editingId === lang.id;
        const overall = getOverallProficiency(lang);
        const overallLevel = proficiencyLevels.find(l => l.id === overall);

        return (
            <motion.div
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl border ${lang.isFeatured ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'} overflow-hidden`}
            >
                {/* Header */}
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                                <div className={`w-12 h-12 ${overallLevel?.color.split(' ')[0]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                    <Globe className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-800">
                                                    {lang.language || 'Language Name'}
                                                </h3>
                                                {lang.isFeatured && (
                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${overallLevel?.color}`}>
                                                    {overallLevel?.name} Level
                                                </span>
                                                {lang.yearsOfExperience && (
                                                    <span className="text-sm text-gray-600">
                                                        • {lang.yearsOfExperience} years experience
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skill Levels */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                        {skillCategories.map(skill => {
                                            const level = lang[skill.id];
                                            const levelInfo = proficiencyLevels.find(l => l.id === level);
                                            return (
                                                <div key={skill.id} className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 ${skill.color} rounded-lg flex items-center justify-center`}>
                                                        {React.createElement(skill.icon, { className: "w-4 h-4" })}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-medium text-gray-700">{skill.name}</div>
                                                        <div className="text-xs text-gray-500">{levelInfo?.short || '-'}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Certification */}
                                    {lang.certification && !isEditing && (
                                        <div className="mb-3">
                                            <span className="text-sm font-medium text-gray-700">Certification: </span>
                                            <span className="text-sm text-gray-600">{lang.certification}</span>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {lang.description && !isEditing && (
                                        <p className="text-gray-600 text-sm line-clamp-2">
                                            {lang.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 ml-4">
                            <button
                                onClick={() => toggleVisibility(lang.id)}
                                className={`p-2 rounded-lg ${lang.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={lang.isVisible ? 'Visible on resume' : 'Hidden from resume'}
                            >
                                {lang.isVisible ? (
                                    <Eye className="w-4 h-4" />
                                ) : (
                                    <EyeOff className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={() => toggleFeatured(lang.id)}
                                className={`p-2 rounded-lg ${lang.isFeatured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                title={lang.isFeatured ? 'Featured language' : 'Mark as featured'}
                            >
                                <Star className={`w-4 h-4 ${lang.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={() => moveLanguageSkill(lang.id, 'up')}
                                disabled={index === 0}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                title="Move up"
                            >
                                <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => moveLanguageSkill(lang.id, 'down')}
                                disabled={index === languageSkills.length - 1}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                                title="Move down"
                            >
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setEditingId(isEditing ? null : lang.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => deleteLanguageSkill(lang.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-6 border-t border-gray-200 bg-gray-50"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Language *
                                    </label>
                                    <select
                                        value={lang.language}
                                        onChange={(e) => updateLanguageSkill(lang.id, { language: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select a language</option>
                                        {nepaliLanguages.map(langOption => (
                                            <option key={langOption.code} value={langOption.name}>
                                                {langOption.name} ({langOption.nativeName})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Overall Proficiency *
                                    </label>
                                    <select
                                        value={lang.proficiency}
                                        onChange={(e) => updateLanguageSkill(lang.id, { proficiency: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select proficiency</option>
                                        {proficiencyLevels.map(level => (
                                            <option key={level.id} value={level.id}>
                                                {level.name} - {level.description}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={lang.yearsOfExperience}
                                        onChange={(e) => updateLanguageSkill(lang.id, { yearsOfExperience: e.target.value })}
                                        placeholder="e.g., 5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Certification
                                    </label>
                                    <input
                                        type="text"
                                        value={lang.certification}
                                        onChange={(e) => updateLanguageSkill(lang.id, { certification: e.target.value })}
                                        placeholder="e.g., DELF B2, HSK 4, TOEFL"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={lang.description}
                                        onChange={(e) => updateLanguageSkill(lang.id, { description: e.target.value })}
                                        placeholder="Describe your language proficiency, usage context, achievements..."
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    />
                                </div>

                                {/* Skill Levels Section */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Detailed Skill Levels
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {skillCategories.map(skill => (
                                            <div key={skill.id}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-6 h-6 ${skill.color} rounded-md flex items-center justify-center`}>
                                                        {React.createElement(skill.icon, { className: "w-3 h-3" })}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                                                </div>
                                                <select
                                                    value={lang[skill.id]}
                                                    onChange={(e) => updateLanguageSkill(lang.id, { [skill.id]: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                >
                                                    {proficiencyLevels.map(level => (
                                                        <option key={level.id} value={level.id}>
                                                            {level.short}: {level.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <span>B: Beginner</span>
                                        <span>I: Intermediate</span>
                                        <span>A: Advanced</span>
                                        <span>F: Fluent</span>
                                        <span>N: Native</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setEditingId(null)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Save Language
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    const filteredLanguageSkills = languageSkills.filter(lang => {
        if (filterLevel === 'all') return true;
        return lang.proficiency === filterLevel;
    });

    const stats = {
        total: languageSkills.length,
        visible: languageSkills.filter(l => l.isVisible).length,
        native: languageSkills.filter(l => l.proficiency === 'native').length,
        fluent: languageSkills.filter(l => l.proficiency === 'fluent').length,
        advanced: languageSkills.filter(l => l.proficiency === 'advanced').length,
        certified: languageSkills.filter(l => l.certification && l.certification.trim() !== '').length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Languages</h2>
                    <p className="text-gray-600">Showcase your multilingual abilities</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-gray-100 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                            {stats.visible} languages
                        </span>
                    </div>
                    <button
                        onClick={addLanguageSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Language
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {languageSkills.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Languages Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                            <div className="text-sm text-gray-600">Total</div>
                        </div>
                        <div className="text-center p-3 bg-amber-50 rounded-lg">
                            <div className="text-2xl font-bold text-amber-600">{stats.native}</div>
                            <div className="text-sm text-gray-600">Native</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.fluent}</div>
                            <div className="text-sm text-gray-600">Fluent</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.advanced}</div>
                            <div className="text-sm text-gray-600">Advanced</div>
                        </div>
                        <div className="text-center p-3 bg-teal-50 rounded-lg">
                            <div className="text-2xl font-bold text-teal-600">{stats.certified}</div>
                            <div className="text-sm text-gray-600">Certified</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            {languageSkills.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterLevel('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${filterLevel === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            All Languages ({languageSkills.length})
                        </button>
                        {proficiencyLevels.map(level => {
                            const count = languageSkills.filter(l => l.proficiency === level.id).length;
                            return (
                                <button
                                    key={level.id}
                                    onClick={() => setFilterLevel(level.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${filterLevel === level.id ? `${level.color} text-${level.color.split('-')[1]}-700` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${level.color.split(' ')[0]}`} />
                                    {level.name} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Languages List */}
            <div className="space-y-4">
                {languageSkills.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No languages added yet</h3>
                        <p className="text-gray-500 mb-6">Add languages to showcase your multilingual abilities</p>
                        <button
                            onClick={addLanguageSkill}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Language
                        </button>
                    </div>
                ) : filteredLanguageSkills.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">No languages found</h3>
                        <p className="text-gray-500">Try adjusting your filter criteria</p>
                    </div>
                ) : (
                    filteredLanguageSkills.map((lang, index) => renderLanguageCard(lang, index))
                )}
            </div>

            {/* Proficiency Guide */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Language Proficiency Guide
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {proficiencyLevels.map(level => (
                        <div key={level.id} className={`${level.color} rounded-lg p-4`}>
                            <div className="font-semibold text-gray-800 mb-1">{level.name}</div>
                            <div className="text-sm text-gray-600">{level.description}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                    onClick={onPrev}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    ← Previous
                </button>
                <button
                    onClick={onNext}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Next: Finish →
                </button>
            </div>
        </div>
    );
};

export default LanguagesPage;