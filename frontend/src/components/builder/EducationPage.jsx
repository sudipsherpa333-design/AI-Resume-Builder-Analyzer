import React, { useState, useEffect } from 'react';
import {
    FaGraduationCap,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaUniversity,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaArrowUp,
    FaArrowDown,
    FaCopy,
    FaTrophy,
    FaBook,
    FaStar,
    FaAward
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const EducationPage = ({ resumeData, onUpdate, errors, setErrors }) => {
    const [educations, setEducations] = useState(resumeData?.education || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        institution: '',
        degree: '',
        fieldOfStudy: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        gpa: '',
        maxGpa: '4.0',
        description: '',
        honors: [],
        coursework: []
    });

    useEffect(() => {
        if (resumeData?.education) {
            setEducations(resumeData.education);
        }
    }, [resumeData?.education]);

    const handleUpdate = (data) => {
        if (onUpdate) {
            onUpdate('education', data);
        }
    };

    useEffect(() => {
        if (educations.length > 0 || educations.length === 0) {
            handleUpdate(educations);
        }
    }, [educations]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddHonor = () => {
        setFormData(prev => ({
            ...prev,
            honors: [...prev.honors, '']
        }));
    };

    const handleHonorChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            honors: prev.honors.map((item, i) => i === index ? value : item)
        }));
    };

    const handleRemoveHonor = (index) => {
        setFormData(prev => ({
            ...prev,
            honors: prev.honors.filter((_, i) => i !== index)
        }));
    };

    const handleAddCourse = () => {
        setFormData(prev => ({
            ...prev,
            coursework: [...prev.coursework, '']
        }));
    };

    const handleCourseChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            coursework: prev.coursework.map((item, i) => i === index ? value : item)
        }));
    };

    const handleRemoveCourse = (index) => {
        setFormData(prev => ({
            ...prev,
            coursework: prev.coursework.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.institution.trim()) {
            newErrors.institution = 'Institution is required';
        }
        if (!formData.degree.trim()) {
            newErrors.degree = 'Degree is required';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }
        if (!formData.current && !formData.endDate) {
            newErrors.endDate = 'End date is required for completed degrees';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
        }

        setErrors({});
        return true;
    };

    const handleAddEducation = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        const newEducation = {
            id: Date.now(),
            ...formData,
            honors: formData.honors.filter(h => h.trim() !== ''),
            coursework: formData.coursework.filter(c => c.trim() !== '')
        };

        setEducations(prev => [...prev, newEducation]);
        resetForm();
        setIsAddingNew(false);
        toast.success('Education added successfully!');
    };

    const handleEditEducation = (index) => {
        const education = educations[index];
        setFormData({
            institution: education.institution || '',
            degree: education.degree || '',
            fieldOfStudy: education.fieldOfStudy || '',
            location: education.location || '',
            startDate: education.startDate || '',
            endDate: education.endDate || '',
            current: education.current || false,
            gpa: education.gpa || '',
            maxGpa: education.maxGpa || '4.0',
            description: education.description || '',
            honors: education.honors || [],
            coursework: education.coursework || []
        });
        setEditingIndex(index);
        setIsAddingNew(false);
    };

    const handleUpdateEducation = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        setEducations(prev => {
            const updated = [...prev];
            updated[editingIndex] = {
                ...updated[editingIndex],
                ...formData,
                honors: formData.honors.filter(h => h.trim() !== ''),
                coursework: formData.coursework.filter(c => c.trim() !== '')
            };
            return updated;
        });

        resetForm();
        setEditingIndex(-1);
        toast.success('Education updated successfully!');
    };

    const handleDeleteEducation = (index) => {
        if (window.confirm('Are you sure you want to delete this education entry?')) {
            setEducations(prev => prev.filter((_, i) => i !== index));
            toast.success('Education removed successfully');
        }
    };

    const handleMoveEducation = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === educations.length - 1)) {
            return;
        }

        setEducations(prev => {
            const updated = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            return updated;
        });
    };

    const handleDuplicateEducation = (index) => {
        const education = educations[index];
        const duplicatedEducation = {
            ...education,
            id: Date.now(),
            institution: `${education.institution} (Copy)`
        };

        setEducations(prev => [...prev, duplicatedEducation]);
        toast.success('Education duplicated successfully!');
    };

    const resetForm = () => {
        setFormData({
            institution: '',
            degree: '',
            fieldOfStudy: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            gpa: '',
            maxGpa: '4.0',
            description: '',
            honors: [],
            coursework: []
        });
        setErrors({});
    };

    const calculateEducationLevel = (degree) => {
        const degreeLower = degree.toLowerCase();
        if (degreeLower.includes('phd') || degreeLower.includes('doctor')) return 'Doctorate';
        if (degreeLower.includes('master')) return 'Master';
        if (degreeLower.includes('bachelor')) return 'Bachelor';
        if (degreeLower.includes('associate')) return 'Associate';
        if (degreeLower.includes('diploma') || degreeLower.includes('certificate')) return 'Certificate';
        return 'Other';
    };

    const getGpaColor = (gpa, maxGpa) => {
        const numericGpa = parseFloat(gpa);
        const numericMax = parseFloat(maxGpa || '4.0');
        if (!numericGpa || !numericMax) return '#6b7280';

        const percentage = (numericGpa / numericMax) * 100;
        if (percentage >= 90) return '#10b981';
        if (percentage >= 80) return '#3b82f6';
        if (percentage >= 70) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div className="education-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaGraduationCap />
                    </div>
                    <div>
                        <h2 className="page-title">Education</h2>
                        <p className="page-subtitle">Showcase your academic background and achievements</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <FaUniversity />
                        <span>Degrees: {educations.length}</span>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            resetForm();
                            setIsAddingNew(true);
                            setEditingIndex(-1);
                        }}
                        type="button"
                    >
                        <FaPlus /> Add Education
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-value">{educations.length}</div>
                    <div className="stat-label">Degrees</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {educations.filter(e => e.current).length}
                    </div>
                    <div className="stat-label">Current</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {educations.reduce((total, e) => total + (e.honors?.length || 0), 0)}
                    </div>
                    <div className="stat-label">Honors</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {new Set(educations.map(e => e.institution)).size}
                    </div>
                    <div className="stat-label">Institutions</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAddingNew || editingIndex !== -1) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="education-form-card"
                    >
                        <div className="form-header">
                            <div className="form-title">
                                <h3>
                                    {editingIndex !== -1 ?
                                        <><FaEdit /> Edit Education</> :
                                        <><FaPlus /> Add New Education</>
                                    }
                                </h3>
                                <p className="form-subtitle">
                                    {editingIndex !== -1 ? 'Update your education details' : 'Add a new educational qualification'}
                                </p>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => {
                                    resetForm();
                                    setIsAddingNew(false);
                                    setEditingIndex(-1);
                                }}
                                type="button"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <div className="form-grid">
                            {/* Institution */}
                            <div className="form-group full-width">
                                <label className="required">Institution Name *</label>
                                <div className="input-with-status">
                                    <FaUniversity className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.institution}
                                        onChange={(e) => handleInputChange('institution', e.target.value)}
                                        placeholder="e.g., Stanford University"
                                        className={`form-input ${errors?.institution ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.institution && (
                                    <div className="error-message">{errors.institution}</div>
                                )}
                                <div className="field-tip">Full name of the educational institution</div>
                            </div>

                            {/* Degree & Field */}
                            <div className="form-group">
                                <label className="required">Degree *</label>
                                <div className="input-with-status">
                                    <FaGraduationCap className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.degree}
                                        onChange={(e) => handleInputChange('degree', e.target.value)}
                                        placeholder="e.g., Bachelor of Science"
                                        className={`form-input ${errors?.degree ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.degree && (
                                    <div className="error-message">{errors.degree}</div>
                                )}
                                <div className="field-tip">Degree type and level</div>
                            </div>

                            <div className="form-group">
                                <label>Field of Study</label>
                                <div className="input-with-status">
                                    <FaBook className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.fieldOfStudy}
                                        onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                                        placeholder="e.g., Computer Science"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Your major or specialization</div>
                            </div>

                            {/* Location */}
                            <div className="form-group full-width">
                                <label>Location</label>
                                <div className="input-with-status">
                                    <FaMapMarkerAlt className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder="e.g., Stanford, CA"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">City and state/country</div>
                            </div>

                            {/* Dates */}
                            <div className="form-group">
                                <label className="required">Start Date *</label>
                                <div className="input-with-status">
                                    <FaCalendarAlt className="field-icon" />
                                    <input
                                        type="month"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className={`form-input ${errors?.startDate ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.startDate && (
                                    <div className="error-message">{errors.startDate}</div>
                                )}
                                <div className="field-tip">When you started your studies</div>
                            </div>

                            <div className="form-group">
                                <label className={!formData.current ? 'required' : ''}>
                                    End Date {!formData.current ? '*' : ''}
                                </label>
                                <div className="date-container">
                                    <div className="current-checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="current-study"
                                            checked={formData.current}
                                            onChange={(e) => handleInputChange('current', e.target.checked)}
                                            className="current-checkbox"
                                        />
                                        <label htmlFor="current-study" className="checkbox-label">
                                            Currently studying here
                                        </label>
                                    </div>
                                    <div className="input-with-status">
                                        <FaCalendarAlt className="field-icon" />
                                        <input
                                            type="month"
                                            value={formData.current ? '' : formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className={`form-input ${errors?.endDate ? 'error' : ''}`}
                                            disabled={formData.current}
                                            placeholder={formData.current ? 'Present' : ''}
                                        />
                                    </div>
                                </div>
                                {errors?.endDate && (
                                    <div className="error-message">{errors.endDate}</div>
                                )}
                                <div className="field-tip">Leave empty for current studies</div>
                            </div>

                            {/* GPA */}
                            <div className="form-group">
                                <label>GPA</label>
                                <div className="gpa-container">
                                    <div className="input-with-status">
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="10"
                                            value={formData.gpa}
                                            onChange={(e) => handleInputChange('gpa', e.target.value)}
                                            placeholder="3.8"
                                            className="form-input"
                                        />
                                    </div>
                                    <div className="gpa-separator">/</div>
                                    <div className="input-with-status">
                                        <select
                                            value={formData.maxGpa}
                                            onChange={(e) => handleInputChange('maxGpa', e.target.value)}
                                            className="form-input"
                                        >
                                            <option value="4.0">4.0</option>
                                            <option value="5.0">5.0</option>
                                            <option value="10.0">10.0</option>
                                            <option value="100">100%</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="field-tip">Your GPA on the selected scale</div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label>Description</label>
                                <div className="input-with-status">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe your academic achievements, thesis, or special projects..."
                                        className="form-textarea"
                                        rows={4}
                                    />
                                </div>
                                <div className="field-tip">Thesis, research, or notable projects</div>
                            </div>

                            {/* Honors & Awards */}
                            <div className="form-group full-width">
                                <div className="section-header">
                                    <div>
                                        <label>Honors & Awards</label>
                                        <p className="field-subtitle">Academic achievements and recognitions</p>
                                    </div>
                                    <button
                                        className="btn-small"
                                        onClick={handleAddHonor}
                                        type="button"
                                    >
                                        <FaPlus /> Add Honor
                                    </button>
                                </div>

                                <div className="items-list">
                                    {formData.honors.map((honor, index) => (
                                        <div key={index} className="item">
                                            <div className="item-number">{index + 1}</div>
                                            <input
                                                type="text"
                                                value={honor}
                                                onChange={(e) => handleHonorChange(index, e.target.value)}
                                                placeholder="e.g., Summa Cum Laude, Dean's List, Scholarship..."
                                                className="item-input"
                                            />
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleRemoveHonor(index)}
                                                type="button"
                                                title="Remove honor"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.honors.length === 0 && (
                                        <div className="no-items">
                                            <FaAward className="empty-icon" />
                                            <div className="empty-content">
                                                <h4>No honors added yet</h4>
                                                <p>Add academic honors, awards, or scholarships you received</p>
                                                <button
                                                    className="btn-small"
                                                    onClick={handleAddHonor}
                                                    type="button"
                                                >
                                                    <FaPlus /> Add First Honor
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Relevant Coursework */}
                            <div className="form-group full-width">
                                <div className="section-header">
                                    <div>
                                        <label>Relevant Coursework</label>
                                        <p className="field-subtitle">Courses relevant to your career goals</p>
                                    </div>
                                    <button
                                        className="btn-small"
                                        onClick={handleAddCourse}
                                        type="button"
                                    >
                                        <FaPlus /> Add Course
                                    </button>
                                </div>

                                <div className="items-list">
                                    {formData.coursework.map((course, index) => (
                                        <div key={index} className="item">
                                            <div className="item-number">{index + 1}</div>
                                            <input
                                                type="text"
                                                value={course}
                                                onChange={(e) => handleCourseChange(index, e.target.value)}
                                                placeholder="e.g., Data Structures, Algorithms, Machine Learning..."
                                                className="item-input"
                                            />
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleRemoveCourse(index)}
                                                type="button"
                                                title="Remove course"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.coursework.length === 0 && (
                                        <div className="no-items">
                                            <FaBook className="empty-icon" />
                                            <div className="empty-content">
                                                <h4>No courses added yet</h4>
                                                <p>Add relevant courses that showcase your expertise</p>
                                                <button
                                                    className="btn-small"
                                                    onClick={handleAddCourse}
                                                    type="button"
                                                >
                                                    <FaPlus /> Add First Course
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    resetForm();
                                    setIsAddingNew(false);
                                    setEditingIndex(-1);
                                }}
                                type="button"
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-primary"
                                onClick={editingIndex !== -1 ? handleUpdateEducation : handleAddEducation}
                                type="button"
                            >
                                <FaSave /> {editingIndex !== -1 ? 'Update Education' : 'Save Education'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Education List */}
            <div className="educations-list">
                {educations.length === 0 ? (
                    <div className="empty-state">
                        <FaGraduationCap className="empty-icon" />
                        <div className="empty-content">
                            <h3>No education added yet</h3>
                            <p>Add your educational qualifications to showcase your academic background</p>
                            <button
                                className="btn-primary"
                                onClick={() => setIsAddingNew(true)}
                                type="button"
                            >
                                <FaPlus /> Add Your First Education
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {educations.map((education, index) => (
                            <motion.div
                                key={education.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="education-card"
                            >
                                <div className="education-header">
                                    <div className="education-info">
                                        <div className="education-main">
                                            <h3 className="institution">{education.institution}</h3>
                                            <div className="degree-details">
                                                <span className="degree">
                                                    <FaGraduationCap /> {education.degree}
                                                </span>
                                                {education.fieldOfStudy && (
                                                    <span className="field">
                                                        <FaBook /> {education.fieldOfStudy}
                                                    </span>
                                                )}
                                                <span className="education-level">
                                                    {calculateEducationLevel(education.degree)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="education-meta">
                                            <div className="duration">
                                                <FaCalendarAlt />
                                                <span>
                                                    {new Date(education.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -
                                                    {education.current ? ' Present' : ` ${new Date(education.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                                                </span>
                                                {education.location && (
                                                    <span className="location">
                                                        <FaMapMarkerAlt /> {education.location}
                                                    </span>
                                                )}
                                                {education.current && (
                                                    <span className="current-badge">
                                                        <FaStar /> Current
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="education-actions">
                                        <div className="action-group">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveEducation(index, 'up')}
                                                disabled={index === 0}
                                                title="Move up"
                                                type="button"
                                            >
                                                <FaArrowUp />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveEducation(index, 'down')}
                                                disabled={index === educations.length - 1}
                                                title="Move down"
                                                type="button"
                                            >
                                                <FaArrowDown />
                                            </button>
                                        </div>
                                        <div className="action-group">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDuplicateEducation(index)}
                                                title="Duplicate"
                                                type="button"
                                            >
                                                <FaCopy />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditEducation(index)}
                                                title="Edit"
                                                type="button"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDeleteEducation(index)}
                                                title="Delete"
                                                type="button"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {education.gpa && (
                                    <div className="gpa-display">
                                        <div className="gpa-label">GPA:</div>
                                        <div
                                            className="gpa-value"
                                            style={{ color: getGpaColor(education.gpa, education.maxGpa) }}
                                        >
                                            {education.gpa}/{education.maxGpa}
                                        </div>
                                    </div>
                                )}

                                {education.description && (
                                    <div className="education-description">
                                        <p>{education.description}</p>
                                    </div>
                                )}

                                {education.honors && education.honors.length > 0 && (
                                    <div className="honors">
                                        <div className="section-header">
                                            <FaTrophy />
                                            <strong>Honors & Awards</strong>
                                        </div>
                                        <ul className="items-list">
                                            {education.honors.map((honor, idx) => (
                                                <li key={idx}>
                                                    <span className="bullet"></span>
                                                    <span className="item-text">{honor}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {education.coursework && education.coursework.length > 0 && (
                                    <div className="coursework">
                                        <div className="section-header">
                                            <FaBook />
                                            <strong>Relevant Coursework</strong>
                                        </div>
                                        <div className="course-tags">
                                            {education.coursework.map((course, idx) => (
                                                <span key={idx} className="course-tag">{course}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <style jsx>{`
                .education-page {
                    padding: 0;
                    max-width: 100%;
                }

                /* Header */
                .page-header {
                    margin-bottom: 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 1.5rem;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                }

                .header-icon {
                    width: 65px;
                    height: 65px;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    line-height: 1.2;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin: 0;
                    max-width: 500px;
                }

                .header-stats {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .stat-chip {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
                }

                /* Stats Overview */
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 2.5rem;
                }

                .stat-card {
                    background: white;
                    border-radius: 15px;
                    padding: 1.75rem;
                    text-align: center;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .stat-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #3b82f6;
                    margin-bottom: 0.5rem;
                    line-height: 1;
                }

                .stat-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Form */
                .education-form-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    border: 2px solid #e5e7eb;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }

                .form-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid #f3f4f6;
                }

                .form-title h3 {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .form-subtitle {
                    font-size: 0.95rem;
                    color: #6b7280;
                    margin: 0;
                }

                .btn-icon {
                    width: 45px;
                    height: 45px;
                    border-radius: 10px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    color: #4b5563;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                }

                .btn-icon:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                    transform: scale(1.05);
                }

                .btn-icon.danger {
                    color: #ef4444;
                }

                .btn-icon.danger:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
                    color: #dc2626;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.75rem;
                    margin-bottom: 2rem;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .form-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                }

                .required:after {
                    content: " *";
                    color: #ef4444;
                }

                .input-with-status {
                    position: relative;
                }

                .field-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    font-size: 1rem;
                }

                .form-input, .form-textarea {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                }

                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                .form-input.error {
                    border-color: #ef4444;
                }

                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                    padding-left: 1rem;
                }

                .gpa-container {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .gpa-separator {
                    font-weight: 600;
                    color: #6b7280;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .field-subtitle {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin: 0.25rem 0 0 0;
                }

                .btn-small {
                    padding: 0.625rem 1.25rem;
                    background: white;
                    border: 2px solid #3b82f6;
                    border-radius: 8px;
                    color: #3b82f6;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-small:hover {
                    background: #3b82f6;
                    color: white;
                    transform: translateY(-1px);
                }

                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .item {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                }

                .item-number {
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .item-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: #1f2937;
                    background: white;
                }

                .no-items {
                    padding: 2.5rem 1.5rem;
                    text-align: center;
                    color: #6b7280;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1rem;
                    background: #f9fafb;
                    border-radius: 12px;
                    border: 2px dashed #d1d5db;
                }

                .empty-icon {
                    font-size: 2.5rem;
                    color: #9ca3af;
                }

                .empty-content h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #4b5563;
                    margin: 0 0 0.5rem 0;
                }

                .empty-content p {
                    color: #6b7280;
                    margin: 0 0 1.5rem 0;
                    font-size: 0.95rem;
                }

                /* Form Actions */
                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.25rem;
                    padding-top: 1.5rem;
                    border-top: 2px solid #f3f4f6;
                }

                .btn-secondary {
                    padding: 0.875rem 2rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    background: white;
                    color: #4b5563;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-secondary:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                /* Education List */
                .educations-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    background: white;
                    border-radius: 20px;
                    border: 2px dashed #d1d5db;
                }

                .empty-state .empty-icon {
                    font-size: 4rem;
                    color: #d1d5db;
                    margin-bottom: 1.5rem;
                }

                .empty-state h3 {
                    font-size: 1.75rem;
                    color: #374151;
                    margin: 0 0 1rem 0;
                }

                .empty-state p {
                    color: #6b7280;
                    margin: 0 0 2rem 0;
                    font-size: 1.05rem;
                    max-width: 500px;
                    margin-left: auto;
                    margin-right: auto;
                }

                /* Education Card */
                .education-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .education-card:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 8px 30px rgba(59, 130, 246, 0.15);
                }

                .education-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    gap: 1.5rem;
                }

                .education-info {
                    flex: 1;
                }

                .institution {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.75rem 0;
                }

                .degree-details {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.75rem;
                }

                .degree, .field {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #4b5563;
                }

                .education-level {
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .duration {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.95rem;
                    color: #6b7280;
                }

                .gpa-display {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }

                .gpa-label {
                    font-weight: 600;
                    color: #4b5563;
                }

                .gpa-value {
                    font-weight: 700;
                    font-size: 1.1rem;
                }

                .honors, .coursework {
                    margin-top: 1.5rem;
                    padding: 1.25rem;
                    background: #f0f9ff;
                    border-radius: 12px;
                    border-left: 4px solid #3b82f6;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .section-header strong {
                    font-size: 1.1rem;
                    color: #1f2937;
                }

                .course-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .course-tag {
                    background: white;
                    color: #3b82f6;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    border: 1px solid #dbeafe;
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1.5rem;
                    }

                    .header-stats {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .education-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }

                    .degree-details {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default EducationPage;