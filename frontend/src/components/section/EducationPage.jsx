// src/components/builder/EducationPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Calendar, MapPin, BookOpen, Edit, Trash2,
  Plus, X, ChevronUp, ChevronDown, Users, Star, Eye, EyeOff,
  Globe, Building, CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EducationPage = ({ data = {}, onUpdate, onNext, onPrev, onAIEnhance, aiCredits }) => {
  const [educations, setEducations] = useState(data?.items || []);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [gpaFormat, setGpaFormat] = useState('4.0');

  useEffect(() => {
    if (educations !== data?.items) {
      const timer = setTimeout(() => {
        if (onUpdate) {
          onUpdate({ items: educations });
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [educations, onUpdate, data?.items]);

  const emptyEducation = {
    id: Date.now().toString(),
    degree: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    graduationYear: '',
    gpa: '',
    maxGpa: gpaFormat === '4.0' ? '4.0' : '100',
    description: '',
    courses: [],
    isVisible: true,
    boardUniversity: '',
    faculty: '',
    program: ''
  };

  const addEducation = () => {
    const newEdu = {
      ...emptyEducation,
      id: Date.now().toString(),
      maxGpa: gpaFormat === '4.0' ? '4.0' : '100'
    };
    setEducations([newEdu, ...educations]);
    setEditingId(newEdu.id);
    setIsAdding(true);
  };

  const updateEducation = (id, updates) => {
    setEducations(educations.map(edu =>
      edu.id === id ? { ...edu, ...updates } : edu
    ));
  };

  const deleteEducation = (id) => {
    setEducations(educations.filter(edu => edu.id !== id));
    toast.success('Education deleted');
  };

  const moveEducation = (id, direction) => {
    const index = educations.findIndex(edu => edu.id === id);
    if (
      (direction === 'up' && index > 0) ||
            (direction === 'down' && index < educations.length - 1)
    ) {
      const newEducations = [...educations];
      const newIndex = direction === 'up' ? index - 1 : direction === 'down' ? index + 1 : index;
      [newEducations[index], newEducations[newIndex]] =
                [newEducations[newIndex], newEducations[index]];
      setEducations(newEducations);
    }
  };

  const toggleVisibility = (id) => {
    updateEducation(id, { isVisible: !educations.find(e => e.id === id).isVisible });
  };

  const handleAIEnhance = (id) => {
    if (aiCredits <= 0) {
      toast.error('Insufficient AI credits');
      return;
    }

    const edu = educations.find(e => e.id === id);
    if (edu) {
      const enhanced = {
        ...edu,
        description: `${edu.description}\n\nEnhanced with AI to better showcase academic achievements.`,
        aiEnhanced: true
      };
      updateEducation(id, enhanced);
      toast.success('Education enhanced with AI!');

      if (onAIEnhance) {
        onAIEnhance();
      }
    }
  };

  const calculateGPA = (gpa, maxGpa) => {
    if (!gpa || !maxGpa) {
      return null;
    }
    const numericGpa = parseFloat(gpa);
    const numericMax = parseFloat(maxGpa);

    if (numericMax === 4.0) {
      if (numericGpa >= 3.7) {
        return 'Distinction';
      }
      if (numericGpa >= 3.3) {
        return 'First Division';
      }
      if (numericGpa >= 2.7) {
        return 'Second Division';
      }
      if (numericGpa >= 2.0) {
        return 'Pass';
      }
      return 'Below Pass';
    } else {
      const percentage = (numericGpa / numericMax) * 100;
      if (percentage >= 90) {
        return 'Distinction';
      }
      if (percentage >= 80) {
        return 'First Division';
      }
      if (percentage >= 65) {
        return 'Second Division';
      }
      if (percentage >= 50) {
        return 'Pass';
      }
      return 'Below Pass';
    }
  };

  // Nepal-specific education data
  const nepaliDegreeTypes = [
    'SEE/SLC',
    '+2/Intermediate',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'M.Phil.',
    'PhD',
    'Postgraduate Diploma',
    'Certificate Level',
    'Technical School'
  ];

  const nepaliBoardsUniversities = [
    'Tribhuvan University (TU)',
    'Kathmandu University (KU)',
    'Pokhara University (PU)',
    'Purbanchal University',
    'Nepal Sanskrit University',
    'Mid-Western University',
    'Far-Western University',
    'Lumbini Buddhist University',
    'National Examination Board (NEB)',
    'CTEVT',
    'Other'
  ];

  const nepaliFaculties = [
    'Science & Technology',
    'Management',
    'Humanities & Social Sciences',
    'Education',
    'Engineering',
    'Medicine',
    'Law',
    'Agriculture',
    'Forestry',
    'Fine Arts',
    'Nursing'
  ];

  const nepaliPrograms = {
    'SEE/SLC': ['Science', 'Management', 'Education', 'General'],
    '+2/Intermediate': ['Science', 'Management', 'Humanities', 'Education', 'Technical'],
    'Bachelor\'s Degree': [
      'B.Sc.', 'B.A.', 'B.B.S.', 'B.Com.', 'B.Ed.', 'B.E.', 'B.Arch.',
      'B.Sc. CSIT', 'BCA', 'BBA', 'BSW', 'BHM', 'B.A. LL.B', 'MBBS', 'BDS'
    ],
    'Master\'s Degree': [
      'M.Sc.', 'M.A.', 'M.B.S.', 'M.Com.', 'M.Ed.', 'M.E.', 'M.Arch.',
      'M.Sc. CSIT', 'MCA', 'MBA', 'MSW', 'MHCM', 'LL.M'
    ]
  };

  const getProgramsForDegree = (degree) => {
    return nepaliPrograms[degree] || ['Select Program'];
  };

  const renderEducationCard = (edu, index) => {
    const isEditing = editingId === edu.id;
    const gpaRating = calculateGPA(edu.gpa, edu.maxGpa);
    const nepaliLocation = edu.location ? `${edu.location}, Nepal` : 'Nepal';

    return (
      <motion.div
        key={edu.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {edu.degree || 'Degree'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {edu.school || 'School/College Name'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {edu.boardUniversity || 'Board/University'}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {nepaliLocation}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {edu.graduationYear || edu.endDate?.split('-')[0] || 'Year'}
                </span>

                {edu.faculty && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {edu.faculty}
                    </span>
                  </>
                )}

                {edu.program && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {edu.program}
                    </span>
                  </>
                )}

                {edu.gpa && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {gpaFormat === '100' ? 'Percentage' : 'GPA'}: {edu.gpa}/{edu.maxGpa}
                      {gpaRating && (
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${gpaRating === 'Distinction' ? 'bg-purple-100 text-purple-700' :
                          gpaRating === 'First Division' ? 'bg-green-100 text-green-700' :
                            gpaRating === 'Second Division' ? 'bg-blue-100 text-blue-700' :
                              gpaRating === 'Pass' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                        }`}>
                          {gpaRating}
                        </span>
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleVisibility(edu.id)}
                className={`p-2 rounded-lg ${edu.isVisible ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={edu.isVisible ? 'Visible on resume' : 'Hidden from resume'}
              >
                {edu.isVisible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => moveEducation(edu.id, 'up')}
                disabled={index === 0}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move up"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveEducation(edu.id, 'down')}
                disabled={index === educations.length - 1}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                title="Move down"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingId(isEditing ? null : edu.id)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteEducation(edu.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Description Preview */}
        {!isEditing && (edu.description || edu.courses?.length > 0) && (
          <div className="p-6 pt-0">
            {edu.description && (
              <div className="prose prose-green max-w-none mb-4">
                <p className="text-gray-700 whitespace-pre-wrap">{edu.description}</p>
              </div>
            )}

            {edu.courses && edu.courses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Relevant Courses:</h4>
                <div className="flex flex-wrap gap-2">
                  {edu.courses.slice(0, 5).map((course, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {course}
                    </span>
                  ))}
                  {edu.courses.length > 5 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                            +{edu.courses.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

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
                                        Degree Level *
                  </label>
                  <select
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, {
                      degree: e.target.value,
                      program: '' // Reset program when degree changes
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select degree level</option>
                    {nepaliDegreeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Program/Specialization
                  </label>
                  <select
                    value={edu.program}
                    onChange={(e) => updateEducation(edu.id, { program: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!edu.degree}
                  >
                    <option value="">Select program</option>
                    {getProgramsForDegree(edu.degree).map(program => (
                      <option key={program} value={program}>{program}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        School/College Name *
                  </label>
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                    placeholder="e.g., St. Xavier's College, Trinity International College"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Board/University *
                  </label>
                  <select
                    value={edu.boardUniversity}
                    onChange={(e) => updateEducation(edu.id, { boardUniversity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select board/university</option>
                    {nepaliBoardsUniversities.map(board => (
                      <option key={board} value={board}>{board}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Faculty
                  </label>
                  <select
                    value={edu.faculty}
                    onChange={(e) => updateEducation(edu.id, { faculty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select faculty</option>
                    {nepaliFaculties.map(faculty => (
                      <option key={faculty} value={faculty}>{faculty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Location in Nepal
                  </label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                    placeholder="e.g., Kathmandu, Pokhara, Biratnagar"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Graduation Year *
                  </label>
                  <input
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    value={edu.graduationYear}
                    onChange={(e) => updateEducation(edu.id, { graduationYear: e.target.value })}
                    placeholder="e.g., 2023"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      {gpaFormat === '100' ? 'Percentage' : 'GPA'}
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          checked={gpaFormat === '4.0'}
                          onChange={() => setGpaFormat('4.0')}
                          className="rounded"
                        />
                                                GPA (4.0)
                      </label>
                      <label className="flex items-center gap-1 text-xs">
                        <input
                          type="radio"
                          checked={gpaFormat === '100'}
                          onChange={() => setGpaFormat('100')}
                          className="rounded"
                        />
                                                Percentage
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, {
                        gpa: e.target.value,
                        maxGpa: gpaFormat === '4.0' ? '4.0' : '100'
                      })}
                      placeholder={gpaFormat === '100' ? 'e.g., 85' : 'e.g., 3.8'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                                            / {gpaFormat === '4.0' ? '4.0' : '100%'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                </label>
                <textarea
                  value={edu.description}
                  onChange={(e) => updateEducation(edu.id, { description: e.target.value })}
                  placeholder="Describe your academic achievements, thesis, research projects, extracurricular activities..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relevant Courses (Optional)
                </label>
                <input
                  type="text"
                  value={edu.courses?.join(', ') || ''}
                  onChange={(e) => updateEducation(edu.id, {
                    courses: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  })}
                  placeholder="e.g., Advanced Java Programming, Database Management, Web Technology"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                                    Separate courses with commas
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                                    Nepal Education System
                </div>
                <div className="flex gap-2">
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
                                        Save Changes
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Education</h2>
          <p className="text-gray-600">Add your academic background following Nepal's education system</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
            <Globe className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
                            Nepal Format
            </span>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              {educations.filter(e => e.isVisible).length} entries
            </span>
          </div>
          <button
            onClick={addEducation}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
                        Add Education
          </button>
        </div>
      </div>

      {/* Education List */}
      <div className="space-y-4">
        {educations.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No education added yet</h3>
            <p className="text-gray-500 mb-6">Add your academic qualifications following Nepal's education system</p>
            <button
              onClick={addEducation}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
                            Add Your First Education
            </button>
          </div>
        ) : (
          educations.map((edu, index) => renderEducationCard(edu, index))
        )}
      </div>

      {/* Stats */}
      {educations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{educations.length}</div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {educations.filter(e => e.degree && e.degree.includes('Bachelor')).length}
              </div>
              <div className="text-sm text-gray-600">Bachelor's Degrees</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {educations.filter(e => e.gpa && (
                  gpaFormat === '100' ?
                    parseFloat(e.gpa) >= 80 :
                    parseFloat(e.gpa) >= 3.3
                )).length}
              </div>
              <div className="text-sm text-gray-600">First Division</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {educations.filter(e => e.isVisible).length}
              </div>
              <div className="text-sm text-gray-600">Visible</div>
            </div>
          </div>
        </div>
      )}

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
                    Next: Skills →
        </button>
      </div>
    </div>
  );
};

export default EducationPage;