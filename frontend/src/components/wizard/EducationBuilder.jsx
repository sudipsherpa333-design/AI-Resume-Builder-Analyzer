// ------------------- EducationBuilder.jsx -------------------
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap,
    Plus,
    Trash2,
    Sparkles,
    Calendar,
    MapPin,
    ChevronDown,
    ChevronUp,
    BookOpen,
    Award,
    Target,
    Check,
    X,
    Star,
    ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EducationBuilder = ({
    data = [],
    onChange,
    onAIEnhance,
    onNext,
    onBack,
    isAnalyzing = false
}) => {
    const [educations, setEducations] = useState(data || []);
    const [expandedIndex, setExpandedIndex] = useState(0);
    const [showGPA, setShowGPA] = useState(false);

    const newEducationTemplate = {
        id: Date.now(),
        institution: '',
        degree: '',
        field: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: '',
        maxGpa: '4.0',
        honors: [],
        description: '',
        coursework: []
    };

    const handleAddEducation = () => {
        const newEdu = { ...newEducationTemplate, id: Date.now() };
        const updated = [...educations, newEdu];
        setEducations(updated);
        onChange(updated);
        setExpandedIndex(updated.length - 1);
        toast.success('New education entry added');
    };

    const handleRemoveEducation = (index) => {
        const updated = educations.filter((_, i) => i !== index);
        setEducations(updated);
        onChange(updated);
        setExpandedIndex(Math.max(0, index - 1));
        toast.success('Education removed');
    };

    const handleUpdateEducation = (index, field, value) => {
        const updated = [...educations];
        updated[index] = { ...updated[index], [field]: value };
        setEducations(updated);
        onChange(updated);
    };

    const handleAddCourse = (index) => {
        const updated = [...educations];
        if (!updated[index].coursework) {
            updated[index].coursework = [];
        }
        updated[index].coursework.push('');
        setEducations(updated);
        onChange(updated);
    };

    const handleUpdateCourse = (eduIndex, courseIndex, value) => {
        const updated = [...educations];
        updated[eduIndex].coursework[courseIndex] = value;
        setEducations(updated);
        onChange(updated);
    };

    const handleRemoveCourse = (eduIndex, courseIndex) => {
        const updated = [...educations];
        updated[eduIndex].coursework = updated[eduIndex].coursework.filter((_, i) => i !== courseIndex);
        setEducations(updated);
        onChange(updated);
    };

    const handleAISuggestCourses = async (index) => {
        toast.loading('AI suggesting relevant coursework...');

        // Simulate AI suggestions
        setTimeout(() => {
            const suggestions = [
                'Data Structures & Algorithms',
                'Machine Learning Fundamentals',
                'Database Systems',
                'Software Engineering',
                'Computer Networks',
                'Web Development'
            ];

            const updated = [...educations];
            updated[index].coursework = suggestions.slice(0, 4);
            setEducations(updated);
            onChange(updated);

            toast.dismiss();
            toast.success('AI suggested relevant coursework!');
        }, 1500);
    };

    const honorsOptions = [
        'Summa Cum Laude',
        'Magna Cum Laude',
        'Cum Laude',
        'Dean\'s List',
        'Honors Program',
        'Valedictorian',
        'Salutatorian'
    ];

    const EducationCard = ({ education, index }) => {
        const isExpanded = expandedIndex === index;
        const gpaScore = parseFloat(education.gpa);
        const maxGpa = parseFloat(education.maxGpa) || 4.0;
        const gpaPercentage = gpaScore ? (gpaScore / maxGpa) * 100 : 0;

        const getGPAColor = () => {
            if (!gpaScore) return 'bg-gray-100 text-gray-700';
            if (gpaPercentage >= 90) return 'bg-green-100 text-green-700';
            if (gpaPercentage >= 80) return 'bg-blue-100 text-blue-700';
            if (gpaPercentage >= 70) return 'bg-yellow-100 text-yellow-700';
            return 'bg-red-100 text-red-700';
        };

        return (
            <motion.div
                layout
                className={`bg-white border ${isExpanded ? 'border-blue-300 shadow-lg' : 'border-gray-200 hover:border-gray-300'} rounded-xl overflow-hidden transition-all`}
            >
                {/* Card Header */}
                <div
                    className="p-6 cursor-pointer"
                    onClick={() => setExpandedIndex(isExpanded ? -1 : index)}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                                    <GraduationCap className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {education.degree || 'Degree'} in {education.field || 'Field of Study'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {education.institution || 'Institution'} • {education.location || 'Location'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {education.startDate || 'Start'} - {education.current ? 'Present' : education.endDate || 'End'}
                                </div>
                                {education.gpa && (
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getGPAColor()}`}>
                                        GPA: {education.gpa}/{education.maxGpa}
                                    </div>
                                )}
                                {education.honors?.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs">{education.honors[0]}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedIndex(isExpanded ? -1 : index);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveEducation(index);
                                }}
                                className="p-2 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-gray-200"
                        >
                            <div className="p-6">
                                {/* Basic Info Form */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Institution
                                        </label>
                                        <input
                                            type="text"
                                            value={education.institution}
                                            onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                                            placeholder="University Name"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Degree Type
                                        </label>
                                        <select
                                            value={education.degree}
                                            onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select degree</option>
                                            <option value="Bachelor of Science">Bachelor of Science (BS)</option>
                                            <option value="Bachelor of Arts">Bachelor of Arts (BA)</option>
                                            <option value="Master of Science">Master of Science (MS)</option>
                                            <option value="Master of Business Administration">Master of Business Administration (MBA)</option>
                                            <option value="Doctor of Philosophy">Doctor of Philosophy (PhD)</option>
                                            <option value="Associate Degree">Associate Degree</option>
                                            <option value="Diploma">Diploma</option>
                                            <option value="Certificate">Certificate</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Field of Study
                                        </label>
                                        <input
                                            type="text"
                                            value={education.field}
                                            onChange={(e) => handleUpdateEducation(index, 'field', e.target.value)}
                                            placeholder="Computer Science, Business Administration, etc."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            value={education.location}
                                            onChange={(e) => handleUpdateEducation(index, 'location', e.target.value)}
                                            placeholder="City, State/Country"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Duration
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input
                                                type="text"
                                                value={education.startDate}
                                                onChange={(e) => handleUpdateEducation(index, 'startDate', e.target.value)}
                                                placeholder="MM/YYYY"
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            />
                                            <input
                                                type="text"
                                                value={education.endDate}
                                                onChange={(e) => handleUpdateEducation(index, 'endDate', e.target.value)}
                                                placeholder={education.current ? 'Present' : 'MM/YYYY'}
                                                disabled={education.current}
                                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                id={`current-edu-${index}`}
                                                checked={education.current}
                                                onChange={(e) => handleUpdateEducation(index, 'current', e.target.checked)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`current-edu-${index}`} className="text-sm text-gray-700">
                                                Currently attending
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700">
                                                GPA
                                            </label>
                                            <button
                                                onClick={() => setShowGPA(!showGPA)}
                                                className="text-sm text-blue-600 hover:text-blue-700"
                                            >
                                                {showGPA ? 'Hide GPA' : 'Show GPA'}
                                            </button>
                                        </div>

                                        {showGPA && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={education.gpa}
                                                    onChange={(e) => handleUpdateEducation(index, 'gpa', e.target.value)}
                                                    placeholder="3.8"
                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                                <select
                                                    value={education.maxGpa}
                                                    onChange={(e) => handleUpdateEducation(index, 'maxGpa', e.target.value)}
                                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="4.0">4.0 scale</option>
                                                    <option value="5.0">5.0 scale</option>
                                                    <option value="10.0">10.0 scale</option>
                                                    <option value="100">100 scale</option>
                                                </select>
                                            </div>
                                        )}

                                        {gpaScore && (
                                            <div className="mt-2">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-gray-700">GPA Score</span>
                                                    <span className={`font-medium ${gpaPercentage >= 90 ? 'text-green-600' : gpaPercentage >= 80 ? 'text-blue-600' : gpaPercentage >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                        {gpaScore}/{education.maxGpa}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${gpaPercentage >= 90 ? 'bg-green-500' : gpaPercentage >= 80 ? 'bg-blue-500' : gpaPercentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${Math.min(gpaPercentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Honors & Awards */}
                                <div className="mb-6">
                                    <h4 className="font-bold text-gray-900 mb-3">Honors & Awards</h4>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {honorsOptions.map((honor) => {
                                            const isSelected = education.honors?.includes(honor);
                                            return (
                                                <button
                                                    key={honor}
                                                    onClick={() => {
                                                        const updated = [...educations];
                                                        if (!updated[index].honors) {
                                                            updated[index].honors = [];
                                                        }

                                                        if (isSelected) {
                                                            updated[index].honors = updated[index].honors.filter(h => h !== honor);
                                                        } else {
                                                            updated[index].honors.push(honor);
                                                        }

                                                        setEducations(updated);
                                                        onChange(updated);
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${isSelected ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                >
                                                    {isSelected ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Award className="w-4 h-4" />
                                                    )}
                                                    {honor}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Coursework */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900">Relevant Coursework</h4>
                                        <button
                                            onClick={() => handleAISuggestCourses(index)}
                                            disabled={isAnalyzing}
                                            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            AI Suggest Courses
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {education.coursework?.map((course, courseIndex) => (
                                            <div key={courseIndex} className="flex items-center gap-2">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={course}
                                                        onChange={(e) => handleUpdateCourse(index, courseIndex, e.target.value)}
                                                        placeholder="Course name"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveCourse(index, courseIndex)}
                                                    className="p-2 text-gray-400 hover:text-red-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => handleAddCourse(index)}
                                            className="col-span-1 md:col-span-2 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add another course
                                        </button>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Details
                                    </label>
                                    <textarea
                                        value={education.description}
                                        onChange={(e) => handleUpdateEducation(index, 'description', e.target.value)}
                                        rows="3"
                                        placeholder="Thesis topic, research projects, extracurricular activities, or other relevant information..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => onAIEnhance && onAIEnhance(`education-${index}`)}
                                        disabled={isAnalyzing}
                                        className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 text-sm disabled:opacity-50"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                        AI Enhance This Entry
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Education</h2>
                    <p className="text-gray-600">Add your academic background and credentials</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddEducation}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Add Education
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Entries</p>
                            <p className="text-xl font-bold text-gray-900">{educations.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Courses</p>
                            <p className="text-xl font-bold text-gray-900">
                                {educations.reduce((acc, edu) => acc + (edu.coursework?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Honors</p>
                            <p className="text-xl font-bold text-gray-900">
                                {educations.reduce((acc, edu) => acc + (edu.honors?.length || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Target className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Relevance</p>
                            <p className="text-xl font-bold text-gray-900">
                                {Math.round(educations.length > 0 ? 92 : 0)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Education List */}
            <div className="space-y-4">
                {educations.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                        <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Education Added Yet</h3>
                        <p className="text-gray-600 mb-6">Add your academic background to showcase your qualifications</p>
                        <button
                            onClick={handleAddEducation}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg flex items-center gap-2 mx-auto"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Education
                        </button>
                    </div>
                ) : (
                    educations.map((education, index) => (
                        <EducationCard
                            key={education.id || index}
                            education={education}
                            index={index}
                        />
                    ))
                )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Education Optimization Tips
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Recent Graduates</p>
                            <p className="text-sm text-gray-600">Place education before experience if graduated within 3 years</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <Award className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Include Honors</p>
                            <p className="text-sm text-gray-600">Add Latin honors, dean's list, or scholarships</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Relevant Courses</p>
                            <p className="text-sm text-gray-600">List courses directly related to target role</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <Star className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">GPA Consideration</p>
                            <p className="text-sm text-gray-600">Include GPA if 3.5+ on 4.0 scale or for recent grads</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                    onClick={onBack}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                >
                    Back
                </button>
                <div className="text-sm text-gray-600">
                    {educations.length} education{educations.length !== 1 ? 's' : ''} • {educations.reduce((acc, edu) => acc + (edu.coursework?.length || 0), 0)} courses
                </div>
                <button
                    onClick={onNext}
                    className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:shadow-lg flex items-center gap-2"
                >
                    Continue to Skills
                </button>
            </div>
        </div>
    );
};

export default EducationBuilder;