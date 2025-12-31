import React, { useState, useEffect } from 'react';
import {
    FaLanguage,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaStar,
    FaGlobeAmericas,
    FaMicrophone,
    FaBook,
    FaComments
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const LanguagesPage = ({ resumeData, onUpdate, errors, setErrors }) => {
    const [languages, setLanguages] = useState(resumeData?.languages || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        proficiency: 'intermediate',
        speaking: 'intermediate',
        reading: 'intermediate',
        writing: 'intermediate',
        native: false,
        years: '',
        certification: ''
    });

    const proficiencyLevels = [
        { id: 'beginner', name: 'Beginner', color: '#ef4444' },
        { id: 'intermediate', name: 'Intermediate', color: '#f59e0b' },
        { id: 'advanced', name: 'Advanced', color: '#10b981' },
        { id: 'fluent', name: 'Fluent', color: '#3b82f6' },
        { id: 'native', name: 'Native', color: '#8b5cf6' }
    ];

    useEffect(() => {
        if (resumeData?.languages) {
            setLanguages(resumeData.languages);
        }
    }, [resumeData?.languages]);

    const handleUpdate = (data) => {
        if (onUpdate) {
            onUpdate('languages', data);
        }
    };

    useEffect(() => {
        if (languages.length > 0 || languages.length === 0) {
            handleUpdate(languages);
        }
    }, [languages]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Language name is required';
        }
        if (!formData.proficiency) {
            newErrors.proficiency = 'Proficiency level is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
        }

        setErrors({});
        return true;
    };

    const handleAddLanguage = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        const newLanguage = {
            id: Date.now(),
            ...formData
        };

        setLanguages(prev => [...prev, newLanguage]);
        resetForm();
        setIsAddingNew(false);
        toast.success('Language added successfully!');
    };

    const handleEditLanguage = (index) => {
        const language = languages[index];
        setFormData({
            name: language.name || '',
            proficiency: language.proficiency || 'intermediate',
            speaking: language.speaking || 'intermediate',
            reading: language.reading || 'intermediate',
            writing: language.writing || 'intermediate',
            native: language.native || false,
            years: language.years || '',
            certification: language.certification || ''
        });
        setEditingIndex(index);
        setIsAddingNew(false);
    };

    const handleUpdateLanguage = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        setLanguages(prev => {
            const updated = [...prev];
            updated[editingIndex] = {
                ...updated[editingIndex],
                ...formData
            };
            return updated;
        });

        resetForm();
        setEditingIndex(-1);
        toast.success('Language updated successfully!');
    };

    const handleDeleteLanguage = (index) => {
        if (window.confirm('Are you sure you want to delete this language?')) {
            setLanguages(prev => prev.filter((_, i) => i !== index));
            toast.success('Language removed successfully');
        }
    };

    const handleMoveLanguage = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === languages.length - 1)) {
            return;
        }

        setLanguages(prev => {
            const updated = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            return updated;
        });
    };

    const handleDuplicateLanguage = (index) => {
        const language = languages[index];
        const duplicatedLanguage = {
            ...language,
            id: Date.now(),
            name: `${language.name} (Copy)`
        };

        setLanguages(prev => [...prev, duplicatedLanguage]);
        toast.success('Language duplicated successfully!');
    };

    const resetForm = () => {
        setFormData({
            name: '',
            proficiency: 'intermediate',
            speaking: 'intermediate',
            reading: 'intermediate',
            writing: 'intermediate',
            native: false,
            years: '',
            certification: ''
        });
        setErrors({});
    };

    const getProficiencyColor = (level) => {
        const levelObj = proficiencyLevels.find(l => l.id === level);
        return levelObj ? levelObj.color : '#6b7280';
    };

    const getProficiencyText = (level) => {
        const levelObj = proficiencyLevels.find(l => l.id === level);
        return levelObj ? levelObj.name : 'Unknown';
    };

    const getLanguageFlag = (language) => {
        const langLower = language.toLowerCase();

        // Country flags for common languages
        const flags = {
            'english': '🇺🇸',
            'spanish': '🇪🇸',
            'french': '🇫🇷',
            'german': '🇩🇪',
            'italian': '🇮🇹',
            'portuguese': '🇵🇹',
            'russian': '🇷🇺',
            'chinese': '🇨🇳',
            'japanese': '🇯🇵',
            'korean': '🇰🇷',
            'arabic': '🇸🇦',
            'hindi': '🇮🇳',
            'dutch': '🇳🇱',
            'swedish': '🇸🇪',
            'norwegian': '🇳🇴',
            'danish': '🇩🇰',
            'finnish': '🇫🇮',
            'polish': '🇵🇱',
            'turkish': '🇹🇷',
            'greek': '🇬🇷',
            'hebrew': '🇮🇱'
        };

        for (const [key, flag] of Object.entries(flags)) {
            if (langLower.includes(key)) {
                return flag;
            }
        }

        return '🌐'; // Default globe emoji
    };

    const getSkillLevels = () => {
        return [
            { id: 'speaking', name: 'Speaking', icon: <FaMicrophone /> },
            { id: 'reading', name: 'Reading', icon: <FaBook /> },
            { id: 'writing', name: 'Writing', icon: <FaComments /> }
        ];
    };

    return (
        <div className="languages-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaLanguage />
                    </div>
                    <div>
                        <h2 className="page-title">Languages</h2>
                        <p className="page-subtitle">Showcase your multilingual abilities</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <FaGlobeAmericas />
                        <span>Languages: {languages.length}</span>
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
                        <FaPlus /> Add Language
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-value">{languages.length}</div>
                    <div className="stat-label">Total</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {languages.filter(l => l.native).length}
                    </div>
                    <div className="stat-label">Native</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {languages.filter(l => l.proficiency === 'fluent' || l.proficiency === 'native').length}
                    </div>
                    <div className="stat-label">Fluent</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {languages.filter(l => l.certification).length}
                    </div>
                    <div className="stat-label">Certified</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAddingNew || editingIndex !== -1) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="language-form-card"
                    >
                        <div className="form-header">
                            <div className="form-title">
                                <h3>
                                    {editingIndex !== -1 ?
                                        <><FaEdit /> Edit Language</> :
                                        <><FaPlus /> Add New Language</>
                                    }
                                </h3>
                                <p className="form-subtitle">
                                    {editingIndex !== -1 ? 'Update your language details' : 'Add a new language to your profile'}
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
                            {/* Language Name */}
                            <div className="form-group">
                                <label className="required">Language *</label>
                                <div className="input-with-status">
                                    <FaLanguage className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="e.g., Spanish, French, Japanese"
                                        className={`form-input ${errors?.name ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.name && (
                                    <div className="error-message">{errors.name}</div>
                                )}
                                <div className="field-tip">Name of the language</div>
                            </div>

                            {/* Overall Proficiency */}
                            <div className="form-group">
                                <label className="required">Overall Proficiency *</label>
                                <div className="proficiency-select">
                                    {proficiencyLevels.map(level => (
                                        <button
                                            key={level.id}
                                            type="button"
                                            className={`proficiency-option ${formData.proficiency === level.id ? 'selected' : ''}`}
                                            onClick={() => handleInputChange('proficiency', level.id)}
                                            style={{
                                                borderColor: formData.proficiency === level.id ? level.color : '#e5e7eb',
                                                backgroundColor: formData.proficiency === level.id ? `${level.color}15` : 'white',
                                                color: formData.proficiency === level.id ? level.color : '#6b7280'
                                            }}
                                        >
                                            {level.name}
                                        </button>
                                    ))}
                                </div>
                                {errors?.proficiency && (
                                    <div className="error-message">{errors.proficiency}</div>
                                )}
                                <div className="field-tip">Your overall proficiency level</div>
                            </div>

                            {/* Native Speaker */}
                            <div className="form-group full-width">
                                <div className="native-checkbox">
                                    <input
                                        type="checkbox"
                                        id="native-speaker"
                                        checked={formData.native}
                                        onChange={(e) => handleInputChange('native', e.target.checked)}
                                        className="checkbox"
                                    />
                                    <label htmlFor="native-speaker" className="checkbox-label">
                                        Native Speaker
                                    </label>
                                </div>
                                {formData.native && (
                                    <div className="native-note">
                                        <FaStar /> Mark as native if this is your first language
                                    </div>
                                )}
                            </div>

                            {/* Skill Levels */}
                            <div className="form-group full-width">
                                <label>Skill Levels</label>
                                <div className="skill-levels">
                                    {getSkillLevels().map(skill => (
                                        <div key={skill.id} className="skill-level">
                                            <div className="skill-header">
                                                {skill.icon}
                                                <span className="skill-name">{skill.name}</span>
                                            </div>
                                            <div className="skill-proficiency">
                                                {proficiencyLevels.map(level => (
                                                    <button
                                                        key={level.id}
                                                        type="button"
                                                        className={`skill-option ${formData[skill.id] === level.id ? 'selected' : ''}`}
                                                        onClick={() => handleInputChange(skill.id, level.id)}
                                                        style={{
                                                            borderColor: formData[skill.id] === level.id ? level.color : '#e5e7eb',
                                                            backgroundColor: formData[skill.id] === level.id ? `${level.color}15` : 'white',
                                                            color: formData[skill.id] === level.id ? level.color : '#6b7280'
                                                        }}
                                                    >
                                                        {level.name.charAt(0)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="field-tip">B: Beginner, I: Intermediate, A: Advanced, F: Fluent, N: Native</div>
                            </div>

                            {/* Years of Experience */}
                            <div className="form-group">
                                <label>Years of Experience</label>
                                <div className="input-with-status">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.5"
                                        value={formData.years}
                                        onChange={(e) => handleInputChange('years', e.target.value)}
                                        placeholder="e.g., 5"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Years you've studied/used this language</div>
                            </div>

                            {/* Certification */}
                            <div className="form-group">
                                <label>Certification</label>
                                <div className="input-with-status">
                                    <input
                                        type="text"
                                        value={formData.certification}
                                        onChange={(e) => handleInputChange('certification', e.target.value)}
                                        placeholder="e.g., DELF B2, HSK 4, TOEFL"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Official language certification</div>
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
                                onClick={editingIndex !== -1 ? handleUpdateLanguage : handleAddLanguage}
                                type="button"
                            >
                                <FaSave /> {editingIndex !== -1 ? 'Update Language' : 'Save Language'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Languages Grid */}
            <div className="languages-grid">
                {languages.length === 0 ? (
                    <div className="empty-state">
                        <FaLanguage className="empty-icon" />
                        <div className="empty-content">
                            <h3>No languages added yet</h3>
                            <p>Add languages to showcase your multilingual abilities</p>
                            <button
                                className="btn-primary"
                                onClick={() => setIsAddingNew(true)}
                                type="button"
                            >
                                <FaPlus /> Add Your First Language
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="languages-container">
                            {languages.map((language, index) => (
                                <motion.div
                                    key={language.id || index}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="language-card"
                                >
                                    <div className="language-header">
                                        <div className="language-flag">
                                            {getLanguageFlag(language.name)}
                                        </div>
                                        <div className="language-info">
                                            <h3 className="language-name">{language.name}</h3>
                                            {language.native && (
                                                <span className="native-badge">
                                                    <FaStar /> Native
                                                </span>
                                            )}
                                        </div>
                                        <div className="language-actions">
                                            <button
                                                className="btn-icon small"
                                                onClick={() => handleEditLanguage(index)}
                                                title="Edit"
                                                type="button"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn-icon small danger"
                                                onClick={() => handleDeleteLanguage(index)}
                                                title="Delete"
                                                type="button"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="language-body">
                                        {/* Overall Proficiency */}
                                        <div className="proficiency-display">
                                            <div className="proficiency-label">Overall:</div>
                                            <div
                                                className="proficiency-badge"
                                                style={{
                                                    backgroundColor: getProficiencyColor(language.proficiency),
                                                    color: 'white'
                                                }}
                                            >
                                                {getProficiencyText(language.proficiency)}
                                            </div>
                                        </div>

                                        {/* Skill Levels */}
                                        <div className="skill-levels-display">
                                            {getSkillLevels().map(skill => (
                                                <div key={skill.id} className="skill-item">
                                                    <div className="skill-icon">{skill.icon}</div>
                                                    <div className="skill-progress">
                                                        <div className="skill-name">{skill.name}</div>
                                                        <div className="skill-level">
                                                            {getProficiencyText(language[skill.id])}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Additional Info */}
                                        <div className="language-details">
                                            {language.years && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Experience:</span>
                                                    <span className="detail-value">{language.years} years</span>
                                                </div>
                                            )}
                                            {language.certification && (
                                                <div className="detail-item">
                                                    <span className="detail-label">Certification:</span>
                                                    <span className="detail-value">{language.certification}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="language-footer">
                                        <button
                                            className="btn-icon small"
                                            onClick={() => handleMoveLanguage(index, 'up')}
                                            disabled={index === 0}
                                            title="Move up"
                                            type="button"
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            className="btn-icon small"
                                            onClick={() => handleMoveLanguage(index, 'down')}
                                            disabled={index === languages.length - 1}
                                            title="Move down"
                                            type="button"
                                        >
                                            <FaArrowDown />
                                        </button>
                                        <button
                                            className="btn-icon small"
                                            onClick={() => handleDuplicateLanguage(index)}
                                            title="Duplicate"
                                            type="button"
                                        >
                                            <FaCopy />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                )}
            </div>

            {/* Language Tips */}
            <div className="tips-panel">
                <div className="tips-header">
                    <FaGlobeAmericas />
                    <h4>Language Proficiency Guide</h4>
                </div>
                <div className="tips-content">
                    <div className="proficiency-guide">
                        <div className="proficiency-level">
                            <div className="level-color" style={{ backgroundColor: '#8b5cf6' }}></div>
                            <div className="level-info">
                                <strong>Native</strong>
                                <p>First language, complete fluency</p>
                            </div>
                        </div>
                        <div className="proficiency-level">
                            <div className="level-color" style={{ backgroundColor: '#3b82f6' }}></div>
                            <div className="level-info">
                                <strong>Fluent</strong>
                                <p>Can communicate effectively in any situation</p>
                            </div>
                        </div>
                        <div className="proficiency-level">
                            <div className="level-color" style={{ backgroundColor: '#10b981' }}></div>
                            <div className="level-info">
                                <strong>Advanced</strong>
                                <p>Can discuss complex topics with some effort</p>
                            </div>
                        </div>
                        <div className="proficiency-level">
                            <div className="level-color" style={{ backgroundColor: '#f59e0b' }}></div>
                            <div className="level-info">
                                <strong>Intermediate</strong>
                                <p>Can handle daily conversations</p>
                            </div>
                        </div>
                        <div className="proficiency-level">
                            <div className="level-color" style={{ backgroundColor: '#ef4444' }}></div>
                            <div className="level-info">
                                <strong>Beginner</strong>
                                <p>Basic phrases and simple conversations</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .languages-page {
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
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin: 0;
                }

                .header-stats {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .stat-chip {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(139, 92, 246, 0.35);
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
                    border-color: #8b5cf6;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #8b5cf6;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                /* Form */
                .language-form-card {
                    background: white;
                    border-radius: 20px;
                    padding: 2.5rem;
                    margin-bottom: 2.5rem;
                    border: 2px solid #e5e7eb;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
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
                }

                .btn-icon:hover {
                    background: #f3f4f6;
                    border-color: #d1d5db;
                }

                .btn-icon.small {
                    width: 35px;
                    height: 35px;
                    font-size: 0.875rem;
                }

                .btn-icon.danger {
                    color: #ef4444;
                }

                .btn-icon.danger:hover {
                    background: #fef2f2;
                    border-color: #fecaca;
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

                .form-input {
                    width: 100%;
                    padding: 0.875rem 1rem 0.875rem 3rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1);
                }

                .form-input.error {
                    border-color: #ef4444;
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
                }

                /* Proficiency Select */
                .proficiency-select {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .proficiency-option {
                    padding: 0.625rem 1.25rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 20px;
                    background: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .proficiency-option:hover {
                    transform: translateY(-1px);
                }

                .proficiency-option.selected {
                    border-width: 2px;
                }

                /* Native Checkbox */
                .native-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 0.5rem;
                }

                .checkbox {
                    width: 20px;
                    height: 20px;
                    border-radius: 4px;
                    border: 2px solid #d1d5db;
                    cursor: pointer;
                }

                .checkbox:checked {
                    background-color: #8b5cf6;
                    border-color: #8b5cf6;
                }

                .checkbox-label {
                    font-weight: 600;
                    color: #4b5563;
                    font-size: 0.95rem;
                    cursor: pointer;
                }

                .native-note {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: #7c3aed;
                    background: #f5f3ff;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    border: 1px solid #ddd6fe;
                }

                /* Skill Levels */
                .skill-levels {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .skill-level {
                    background: #f9fafb;
                    border-radius: 10px;
                    padding: 1.25rem;
                    border: 1px solid #e5e7eb;
                }

                .skill-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .skill-header svg {
                    color: #8b5cf6;
                }

                .skill-name {
                    font-weight: 600;
                    color: #374151;
                    font-size: 0.95rem;
                }

                .skill-proficiency {
                    display: flex;
                    gap: 0.5rem;
                }

                .skill-option {
                    width: 35px;
                    height: 35px;
                    border: 2px solid #e5e7eb;
                    border-radius: 50%;
                    background: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .skill-option:hover {
                    transform: scale(1.1);
                }

                .skill-option.selected {
                    border-width: 2px;
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

                /* Languages Grid */
                .languages-grid {
                    display: flex;
                    flex-direction: column;
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

                /* Languages Container */
                .languages-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                /* Language Card */
                .language-card {
                    background: white;
                    border-radius: 16px;
                    padding: 1.75rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                }

                .language-card:hover {
                    border-color: #8b5cf6;
                    box-shadow: 0 8px 25px rgba(139, 92, 246, 0.15);
                    transform: translateY(-3px);
                }

                .language-header {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .language-flag {
                    font-size: 2.5rem;
                    width: 60px;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f5f3ff;
                    border-radius: 12px;
                }

                .language-info {
                    flex: 1;
                }

                .language-name {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                }

                .native-badge {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                .language-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .language-body {
                    flex: 1;
                }

                .proficiency-display {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .proficiency-label {
                    font-weight: 600;
                    color: #4b5563;
                }

                .proficiency-badge {
                    padding: 0.375rem 1.25rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .skill-levels-display {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .skill-item {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .skill-icon {
                    color: #8b5cf6;
                    font-size: 1rem;
                    width: 30px;
                }

                .skill-progress {
                    flex: 1;
                }

                .skill-name {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 0.25rem;
                }

                .skill-level {
                    font-size: 0.75rem;
                    color: #4b5563;
                    font-weight: 500;
                }

                .language-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .detail-label {
                    font-size: 0.875rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .detail-value {
                    font-size: 0.875rem;
                    color: #4b5563;
                    font-weight: 600;
                }

                .language-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 1.25rem;
                    border-top: 1px solid #e5e7eb;
                }

                /* Tips Panel */
                .tips-panel {
                    margin-top: 3rem;
                    background: #f5f3ff;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #ddd6fe;
                }

                .tips-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .tips-header svg {
                    color: #8b5cf6;
                    font-size: 1.5rem;
                }

                .tips-header h4 {
                    font-size: 1.5rem;
                    color: #5b21b6;
                    margin: 0;
                }

                .tips-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .proficiency-guide {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .proficiency-level {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem;
                    background: white;
                    border-radius: 10px;
                    border: 1px solid #e5e7eb;
                }

                .level-color {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                }

                .level-info {
                    flex: 1;
                }

                .level-info strong {
                    color: #1f2937;
                    font-size: 0.95rem;
                }

                .level-info p {
                    color: #6b7280;
                    font-size: 0.875rem;
                    margin: 0.25rem 0 0 0;
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

                    .languages-container {
                        grid-template-columns: 1fr;
                    }

                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }

                    .proficiency-select {
                        flex-direction: column;
                    }

                    .proficiency-option {
                        width: 100%;
                        text-align: center;
                    }

                    .skill-proficiency {
                        justify-content: center;
                    }

                    .language-header {
                        flex-direction: column;
                        text-align: center;
                        gap: 1rem;
                    }

                    .language-actions {
                        width: 100%;
                        justify-content: center;
                    }

                    .language-footer {
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LanguagesPage;