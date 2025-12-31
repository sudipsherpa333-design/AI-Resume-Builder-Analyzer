import React, { useState, useEffect, useCallback } from 'react';
import {
    FaBriefcase,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaBuilding,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaArrowUp,
    FaArrowDown,
    FaCopy,
    FaLightbulb,
    FaChartLine,
    FaCalendar,
    FaStar,
    FaTrophy,
    FaRocket,
    FaLayerGroup,
    FaCode
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ExperiencePage = ({ resumeData, onUpdate, errors, setErrors }) => {
    const [experiences, setExperiences] = useState(resumeData?.experience || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        position: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
        technologies: '',
        achievements: []
    });

    // Initialize with data from props
    useEffect(() => {
        if (resumeData?.experience) {
            setExperiences(resumeData.experience);
        }
    }, [resumeData?.experience]);

    // Handle updates to parent component
    const handleUpdate = useCallback((data) => {
        if (onUpdate && typeof onUpdate === 'function') {
            onUpdate('experience', data);
        }
    }, [onUpdate]);

    // Update parent when experiences change
    useEffect(() => {
        if (experiences.length > 0 || experiences.length === 0) {
            handleUpdate(experiences);
        }
    }, [experiences, handleUpdate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddAchievement = () => {
        setFormData(prev => ({
            ...prev,
            achievements: [...prev.achievements, '']
        }));
    };

    const handleAchievementChange = (index, value) => {
        setFormData(prev => ({
            ...prev,
            achievements: prev.achievements.map((item, i) => i === index ? value : item)
        }));
    };

    const handleRemoveAchievement = (index) => {
        setFormData(prev => ({
            ...prev,
            achievements: prev.achievements.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.position.trim()) {
            newErrors.position = 'Position is required';
        }
        if (!formData.company.trim()) {
            newErrors.company = 'Company is required';
        }
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }
        if (!formData.current && !formData.endDate) {
            newErrors.endDate = 'End date is required for non-current roles';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
        }

        setErrors({});
        return true;
    };

    const handleAddExperience = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        const newExperience = {
            id: Date.now(),
            ...formData,
            achievements: formData.achievements.filter(a => a.trim() !== '')
        };

        setExperiences(prev => {
            const updated = [...prev, newExperience];
            return updated;
        });

        resetForm();
        setIsAddingNew(false);
        toast.success('Experience added successfully!');
    };

    const handleEditExperience = (index) => {
        const experience = experiences[index];
        setFormData({
            position: experience.position || '',
            company: experience.company || '',
            location: experience.location || '',
            startDate: experience.startDate || '',
            endDate: experience.endDate || '',
            current: experience.current || false,
            description: experience.description || '',
            technologies: experience.technologies || '',
            achievements: experience.achievements || []
        });
        setEditingIndex(index);
        setIsAddingNew(false);
    };

    const handleUpdateExperience = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        setExperiences(prev => {
            const updated = [...prev];
            updated[editingIndex] = {
                ...updated[editingIndex],
                ...formData,
                achievements: formData.achievements.filter(a => a.trim() !== '')
            };
            return updated;
        });

        resetForm();
        setEditingIndex(-1);
        toast.success('Experience updated successfully!');
    };

    const handleDeleteExperience = (index) => {
        if (window.confirm('Are you sure you want to delete this experience?')) {
            setExperiences(prev => {
                const updated = prev.filter((_, i) => i !== index);
                return updated;
            });
            toast.success('Experience removed successfully');
        }
    };

    const handleMoveExperience = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === experiences.length - 1)) {
            return;
        }

        setExperiences(prev => {
            const updated = [...prev];
            const newIndex = direction === 'up' ? index - 1 : direction === 'down' ? index + 1 : index;
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            return updated;
        });
    };

    const handleDuplicateExperience = (index) => {
        const experience = experiences[index];
        const duplicatedExperience = {
            ...experience,
            id: Date.now(),
            position: `${experience.position} (Copy)`
        };

        setExperiences(prev => [...prev, duplicatedExperience]);
        toast.success('Experience duplicated successfully!');
    };

    const resetForm = () => {
        setFormData({
            position: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            technologies: '',
            achievements: []
        });
        setErrors({});
    };

    const getDuration = (start, end, current) => {
        try {
            const startDate = new Date(start);
            const endDate = current ? new Date() : new Date(end);

            const years = endDate.getFullYear() - startDate.getFullYear();
            const months = endDate.getMonth() - startDate.getMonth();

            let totalMonths = years * 12 + months;
            if (totalMonths < 0) return 'Invalid date';

            const calculatedYears = Math.floor(totalMonths / 12);
            const calculatedMonths = totalMonths % 12;

            let duration = '';
            if (calculatedYears > 0) duration += `${calculatedYears} year${calculatedYears > 1 ? 's' : ''}`;
            if (calculatedMonths > 0) {
                if (duration) duration += ' ';
                duration += `${calculatedMonths} month${calculatedMonths > 1 ? 's' : ''}`;
            }

            return duration || 'Less than a month';
        } catch (error) {
            return 'N/A';
        }
    };

    const calculateTotalExperience = () => {
        if (experiences.length === 0) return 'No experience';

        let totalMonths = 0;

        experiences.forEach(exp => {
            try {
                const start = new Date(exp.startDate);
                const end = exp.current ? new Date() : new Date(exp.endDate);
                const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
                totalMonths += Math.max(0, months);
            } catch (e) {
                console.error('Error calculating duration:', e);
            }
        });

        const years = Math.floor(totalMonths / 12);
        const months = totalMonths % 12;

        let result = '';
        if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0) {
            if (result) result += ' ';
            result += `${months} month${months > 1 ? 's' : ''}`;
        }

        return result || 'Less than a month';
    };

    const calculateStats = () => {
        const totalPositions = experiences.length;
        const currentRoles = experiences.filter(exp => exp.current).length;
        const totalAchievements = experiences.reduce((total, exp) => total + (exp.achievements?.length || 0), 0);
        const uniqueCompanies = new Set(experiences.map(exp => exp.company)).size;

        const averageDuration = totalPositions > 0 ? calculateTotalExperience() : 'N/A';

        return {
            totalPositions,
            currentRoles,
            totalAchievements,
            uniqueCompanies,
            averageDuration
        };
    };

    const generateSmartPlaceholder = (field) => {
        const placeholders = {
            position: 'e.g., Senior Software Engineer',
            company: 'e.g., Google, Microsoft, Amazon',
            location: 'e.g., San Francisco, CA (Remote)',
            technologies: 'e.g., React, Node.js, AWS, TypeScript',
            description: 'Describe your responsibilities and impact...'
        };
        return placeholders[field] || '';
    };

    const getFieldTip = (field) => {
        const tips = {
            position: 'Your official job title',
            company: 'Company name as it appears officially',
            location: 'City, State/Remote/Hybrid',
            startDate: 'When you started this position',
            endDate: 'Leave empty for current role',
            technologies: 'Separate with commas for better readability',
            description: 'Focus on impact and responsibilities',
            achievements: 'Use bullet points for key accomplishments'
        };
        return tips[field] || '';
    };

    const stats = calculateStats();

    return (
        <div className="experience-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaBriefcase />
                    </div>
                    <div>
                        <h2 className="page-title">Work Experience</h2>
                        <p className="page-subtitle">Showcase your professional journey and achievements</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <FaChartLine />
                        <span>Total Experience: {calculateTotalExperience()}</span>
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
                        <FaPlus /> Add Experience
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-value">{stats.totalPositions}</div>
                    <div className="stat-label">Positions</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.currentRoles}</div>
                    <div className="stat-label">Current Roles</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.totalAchievements}</div>
                    <div className="stat-label">Achievements</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.uniqueCompanies}</div>
                    <div className="stat-label">Companies</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.averageDuration}</div>
                    <div className="stat-label">Avg. Duration</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAddingNew || editingIndex !== -1) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="experience-form-card"
                    >
                        <div className="form-header">
                            <div className="form-title">
                                <h3>
                                    {editingIndex !== -1 ?
                                        <><FaEdit /> Edit Experience</> :
                                        <><FaPlus /> Add New Experience</>
                                    }
                                </h3>
                                <p className="form-subtitle">
                                    {editingIndex !== -1 ? 'Update your experience details' : 'Add a new professional experience'}
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
                            {/* Position */}
                            <div className="form-group full-width">
                                <label className="required">Position / Job Title *</label>
                                <div className="input-with-status">
                                    <FaBriefcase className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.position}
                                        onChange={(e) => handleInputChange('position', e.target.value)}
                                        placeholder={generateSmartPlaceholder('position')}
                                        className={`form-input ${errors?.position ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.position && (
                                    <div className="error-message">{errors.position}</div>
                                )}
                                <div className="field-tip">{getFieldTip('position')}</div>
                            </div>

                            {/* Company & Location */}
                            <div className="form-group">
                                <label className="required">Company *</label>
                                <div className="input-with-status">
                                    <FaBuilding className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder={generateSmartPlaceholder('company')}
                                        className={`form-input ${errors?.company ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.company && (
                                    <div className="error-message">{errors.company}</div>
                                )}
                                <div className="field-tip">{getFieldTip('company')}</div>
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <div className="input-with-status">
                                    <FaMapMarkerAlt className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        placeholder={generateSmartPlaceholder('location')}
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">{getFieldTip('location')}</div>
                            </div>

                            {/* Dates */}
                            <div className="form-group">
                                <label className="required">Start Date *</label>
                                <div className="input-with-status">
                                    <FaCalendar className="field-icon" />
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
                                <div className="field-tip">{getFieldTip('startDate')}</div>
                            </div>

                            <div className="form-group">
                                <label className={!formData.current ? 'required' : ''}>
                                    End Date {!formData.current ? '*' : ''}
                                </label>
                                <div className="date-container">
                                    <div className="current-checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="current-role"
                                            checked={formData.current}
                                            onChange={(e) => handleInputChange('current', e.target.checked)}
                                            className="current-checkbox"
                                        />
                                        <label htmlFor="current-role" className="checkbox-label">
                                            Currently working here
                                        </label>
                                    </div>
                                    <div className="input-with-status">
                                        <FaCalendar className="field-icon" />
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
                                <div className="field-tip">{getFieldTip('endDate')}</div>
                            </div>

                            {/* Technologies */}
                            <div className="form-group full-width">
                                <label>Technologies & Skills</label>
                                <div className="input-with-status">
                                    <FaCode className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.technologies}
                                        onChange={(e) => handleInputChange('technologies', e.target.value)}
                                        placeholder={generateSmartPlaceholder('technologies')}
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">{getFieldTip('technologies')}</div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label>Description</label>
                                <div className="input-with-status">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder={generateSmartPlaceholder('description')}
                                        className="form-textarea"
                                        rows={4}
                                    />
                                </div>
                                <div className="field-tip">{getFieldTip('description')}</div>
                            </div>

                            {/* Achievements */}
                            <div className="form-group full-width">
                                <div className="achievements-header">
                                    <div>
                                        <label>Key Achievements</label>
                                        <p className="field-subtitle">Highlight your accomplishments with bullet points</p>
                                    </div>
                                    <button
                                        className="btn-small"
                                        onClick={handleAddAchievement}
                                        type="button"
                                    >
                                        <FaPlus /> Add Achievement
                                    </button>
                                </div>

                                <div className="achievements-list">
                                    {formData.achievements.map((achievement, index) => (
                                        <div key={index} className="achievement-item">
                                            <div className="achievement-number">{index + 1}</div>
                                            <input
                                                type="text"
                                                value={achievement}
                                                onChange={(e) => handleAchievementChange(index, e.target.value)}
                                                placeholder="e.g., Increased team productivity by 40% through automation..."
                                                className="achievement-input"
                                            />
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleRemoveAchievement(index)}
                                                type="button"
                                                title="Remove achievement"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    ))}

                                    {formData.achievements.length === 0 && (
                                        <div className="no-achievements">
                                            <FaLightbulb className="empty-icon" />
                                            <div className="empty-content">
                                                <h4>No achievements added yet</h4>
                                                <p>Add bullet points highlighting your key accomplishments and impact</p>
                                                <button
                                                    className="btn-small"
                                                    onClick={handleAddAchievement}
                                                    type="button"
                                                >
                                                    <FaPlus /> Add First Achievement
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
                                onClick={editingIndex !== -1 ? handleUpdateExperience : handleAddExperience}
                                type="button"
                            >
                                <FaSave /> {editingIndex !== -1 ? 'Update Experience' : 'Save Experience'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Experiences List */}
            <div className="experiences-list">
                {experiences.length === 0 ? (
                    <div className="empty-state">
                        <FaBriefcase className="empty-icon" />
                        <div className="empty-content">
                            <h3>No work experience added yet</h3>
                            <p>Add your professional experience to showcase your career journey and achievements</p>
                            <button
                                className="btn-primary"
                                onClick={() => setIsAddingNew(true)}
                                type="button"
                            >
                                <FaPlus /> Add Your First Experience
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {experiences.map((experience, index) => (
                            <motion.div
                                key={experience.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="experience-card"
                            >
                                <div className="experience-header">
                                    <div className="experience-info">
                                        <div className="experience-main">
                                            <h3 className="position">{experience.position}</h3>
                                            <div className="company-details">
                                                <span className="company">
                                                    <FaBuilding /> {experience.company}
                                                </span>
                                                {experience.location && (
                                                    <span className="location">
                                                        <FaMapMarkerAlt /> {experience.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="experience-meta">
                                            <div className="duration">
                                                <FaCalendarAlt />
                                                <span>
                                                    {new Date(experience.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -
                                                    {experience.current ? ' Present' : ` ${new Date(experience.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`}
                                                </span>
                                                <span className="duration-badge">
                                                    {getDuration(experience.startDate, experience.endDate, experience.current)}
                                                </span>
                                                {experience.current && (
                                                    <span className="current-badge">
                                                        <FaStar /> Current
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="experience-actions">
                                        <div className="action-group">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveExperience(index, 'up')}
                                                disabled={index === 0}
                                                title="Move up"
                                                type="button"
                                            >
                                                <FaArrowUp />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleMoveExperience(index, 'down')}
                                                disabled={index === experiences.length - 1}
                                                title="Move down"
                                                type="button"
                                            >
                                                <FaArrowDown />
                                            </button>
                                        </div>
                                        <div className="action-group">
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleDuplicateExperience(index)}
                                                title="Duplicate"
                                                type="button"
                                            >
                                                <FaCopy />
                                            </button>
                                            <button
                                                className="btn-icon"
                                                onClick={() => handleEditExperience(index)}
                                                title="Edit"
                                                type="button"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon danger"
                                                onClick={() => handleDeleteExperience(index)}
                                                title="Delete"
                                                type="button"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {experience.description && (
                                    <div className="experience-description">
                                        <p>{experience.description}</p>
                                    </div>
                                )}

                                {experience.technologies && (
                                    <div className="technologies">
                                        <div className="technologies-header">
                                            <FaCode />
                                            <strong>Technologies Used</strong>
                                        </div>
                                        <div className="tech-tags">
                                            {experience.technologies.split(',').map((tech, idx) => (
                                                <span key={idx} className="tech-tag">{tech.trim()}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {experience.achievements && experience.achievements.length > 0 && (
                                    <div className="achievements">
                                        <div className="achievements-header">
                                            <FaTrophy />
                                            <strong>Key Achievements</strong>
                                        </div>
                                        <ul className="achievements-list">
                                            {experience.achievements.map((achievement, idx) => (
                                                <li key={idx}>
                                                    <span className="bullet"></span>
                                                    <span className="achievement-text">{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Tips Panel */}
            <div className="tips-panel">
                <div className="tip-header">
                    <FaLightbulb />
                    <h4>Writing Tips for Impactful Experience</h4>
                </div>
                <div className="tip-content">
                    <div className="tip-category">
                        <h5>Action Verbs</h5>
                        <div className="tip-tags">
                            <span className="tip-tag">Led</span>
                            <span className="tip-tag">Developed</span>
                            <span className="tip-tag">Increased</span>
                            <span className="tip-tag">Improved</span>
                            <span className="tip-tag">Managed</span>
                            <span className="tip-tag">Implemented</span>
                        </div>
                    </div>
                    <div className="tip-category">
                        <h5>Quantify Achievements</h5>
                        <ul className="tip-list">
                            <li>• Use numbers and percentages (e.g., "Increased revenue by 30%")</li>
                            <li>• Specify team sizes (e.g., "Led a team of 5 developers")</li>
                            <li>• Mention budget/scope (e.g., "Managed $500k project")</li>
                        </ul>
                    </div>
                    <div className="tip-category">
                        <h5>Best Practices</h5>
                        <ul className="tip-list">
                            <li>• Focus on accomplishments, not just responsibilities</li>
                            <li>• Use keywords from job descriptions you're targeting</li>
                            <li>• Keep descriptions concise and impactful</li>
                            <li>• Start each bullet point with an action verb</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .experience-page {
                    padding: 0;
                    max-width: 100%;
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
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
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                    background: linear-gradient(135deg, #10b981, #34d399);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35);
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
                    border-color: #667eea;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #667eea;
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
                .experience-form-card {
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
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
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
                    z-index: 1;
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
                    font-family: inherit;
                }

                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
                }

                .form-input.error, .form-textarea.error {
                    border-color: #ef4444;
                }

                .form-textarea {
                    min-height: 120px;
                    resize: vertical;
                    padding-left: 1rem;
                }

                .error-message {
                    font-size: 0.75rem;
                    color: #ef4444;
                    font-weight: 500;
                }

                .field-tip {
                    font-size: 0.75rem;
                    color: #6b7280;
                    font-style: italic;
                    margin-top: 0.25rem;
                }

                .field-subtitle {
                    font-size: 0.75rem;
                    color: #9ca3af;
                    margin: 0.25rem 0 0 0;
                }

                /* Date Section */
                .date-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .current-checkbox-container {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .current-checkbox {
                    width: 18px;
                    height: 18px;
                    border-radius: 4px;
                    border: 2px solid #d1d5db;
                    cursor: pointer;
                }

                .current-checkbox:checked {
                    background-color: #667eea;
                    border-color: #667eea;
                }

                .checkbox-label {
                    font-size: 0.875rem;
                    color: #4b5563;
                    font-weight: 500;
                    cursor: pointer;
                }

                /* Achievements */
                .achievements-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                }

                .btn-small {
                    padding: 0.625rem 1.25rem;
                    background: white;
                    border: 2px solid #667eea;
                    border-radius: 8px;
                    color: #667eea;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-small:hover {
                    background: #667eea;
                    color: white;
                    transform: translateY(-1px);
                }

                .achievements-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .achievement-item {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                    padding: 0.75rem;
                    background: #f9fafb;
                    border-radius: 8px;
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .achievement-item:hover {
                    border-color: #667eea;
                    background: #f0f4ff;
                }

                .achievement-number {
                    width: 28px;
                    height: 28px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .achievement-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                }

                .achievement-input:focus {
                    outline: none;
                    border-color: #667eea;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
                }

                .no-achievements {
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
                    transform: translateY(-2px);
                }

                /* Experiences List */
                .experiences-list {
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
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
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

                /* Experience Card */
                .experience-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                }

                .experience-card:hover {
                    border-color: #667eea;
                    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
                    transform: translateY(-3px);
                }

                .experience-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    gap: 1.5rem;
                }

                .experience-info {
                    flex: 1;
                }

                .experience-main {
                    margin-bottom: 1rem;
                }

                .position {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.75rem 0;
                    line-height: 1.3;
                }

                .company-details {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 0.75rem;
                }

                .company, .location {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #4b5563;
                    font-weight: 500;
                }

                .company svg, .location svg {
                    color: #667eea;
                    font-size: 1rem;
                }

                .experience-meta {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 1rem;
                }

                .duration {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 0.95rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .duration svg {
                    color: #667eea;
                }

                .duration-badge {
                    background: #eff6ff;
                    color: #1d4ed8;
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 0.02em;
                }

                .current-badge {
                    background: linear-gradient(135deg, #10b981, #34d399);
                    color: white;
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                .experience-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    flex-shrink: 0;
                }

                .action-group {
                    display: flex;
                    gap: 0.5rem;
                    justify-content: flex-end;
                }

                .experience-description {
                    margin-bottom: 1.5rem;
                    color: #4b5563;
                    line-height: 1.7;
                    font-size: 1.05rem;
                    padding: 1rem;
                    background: #f9fafb;
                    border-radius: 10px;
                }

                .technologies {
                    margin: 1.5rem 0;
                    padding: 1.25rem;
                    background: #f0f4ff;
                    border-radius: 12px;
                    border-left: 4px solid #667eea;
                }

                .technologies-header, .achievements-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .technologies-header svg, .achievements-header svg {
                    color: #667eea;
                    font-size: 1.1rem;
                }

                .technologies-header strong, .achievements-header strong {
                    font-size: 1.1rem;
                    color: #1f2937;
                    font-weight: 600;
                }

                .tech-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                }

                .tech-tag {
                    background: white;
                    color: #667eea;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    border: 1px solid #dbeafe;
                    transition: all 0.3s ease;
                }

                .tech-tag:hover {
                    background: #667eea;
                    color: white;
                    transform: translateY(-1px);
                }

                .achievements {
                    margin-top: 1.5rem;
                    padding: 1.25rem;
                    background: #f0fdf4;
                    border-radius: 12px;
                    border-left: 4px solid #10b981;
                }

                .achievements-list {
                    margin: 0;
                    padding-left: 0;
                    list-style: none;
                }

                .achievements-list li {
                    padding: 0.5rem 0;
                    color: #065f46;
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    line-height: 1.6;
                }

                .bullet {
                    width: 6px;
                    height: 6px;
                    background: #10b981;
                    border-radius: 50%;
                    margin-top: 0.5rem;
                    flex-shrink: 0;
                }

                .achievement-text {
                    flex: 1;
                }

                /* Tips Panel */
                .tips-panel {
                    margin-top: 3rem;
                    background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e2e8f0;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }

                .tip-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 2px solid #e2e8f0;
                }

                .tip-header svg {
                    color: #f59e0b;
                    font-size: 1.5rem;
                }

                .tip-header h4 {
                    font-size: 1.5rem;
                    color: #1e293b;
                    margin: 0;
                    font-weight: 700;
                }

                .tip-content {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 2rem;
                }

                .tip-category h5 {
                    font-size: 1.1rem;
                    color: #334155;
                    margin: 0 0 1rem 0;
                    font-weight: 600;
                }

                .tip-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .tip-tag {
                    background: white;
                    color: #6366f1;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    border: 1px solid #e0e7ff;
                    box-shadow: 0 2px 4px rgba(99, 102, 241, 0.1);
                }

                .tip-list {
                    margin: 0;
                    padding-left: 1.25rem;
                    list-style: none;
                }

                .tip-list li {
                    padding: 0.5rem 0;
                    color: #475569;
                    font-size: 0.95rem;
                    line-height: 1.5;
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
                        flex-wrap: wrap;
                    }

                    .experience-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .experience-actions {
                        width: 100%;
                        flex-direction: row;
                        justify-content: space-between;
                    }

                    .action-group {
                        width: auto;
                    }

                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .experience-form-card {
                        padding: 1.5rem;
                    }

                    .tips-panel {
                        padding: 1.5rem;
                    }

                    .tip-content {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }

                    .company-details {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .form-actions {
                        flex-direction: column;
                    }

                    .btn-primary, .btn-secondary {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default ExperiencePage;