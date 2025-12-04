import React, { useState } from 'react';
import { FaCogs, FaCode, FaTools, FaStar, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const EnhancedSkillsPage = ({ resumeData, onInputChange }) => {
    const [newSkill, setNewSkill] = useState('');
    const [skillCategory, setSkillCategory] = useState('technical');
    const [proficiency, setProficiency] = useState('intermediate');

    const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];

    const handleAddSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            onInputChange('skills', [...skills, {
                name: newSkill.trim(),
                category: skillCategory,
                proficiency: proficiency,
                id: Date.now().toString()
            }]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (index) => {
        const newSkills = skills.filter((_, i) => i !== index);
        onInputChange('skills', newSkills);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleAddSkill();
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'technical': return <FaCode />;
            case 'soft': return <FaTools />;
            case 'language': return <FaStar />;
            default: return <FaCogs />;
        }
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'technical': return '#3B82F6';
            case 'soft': return '#10B981';
            case 'language': return '#8B5CF6';
            default: return '#6B7280';
        }
    };

    const getProficiencyLevel = (level) => {
        switch (level) {
            case 'beginner': return { width: '33%', color: '#EF4444' };
            case 'intermediate': return { width: '66%', color: '#F59E0B' };
            case 'advanced': return { width: '100%', color: '#10B981' };
            case 'expert': return { width: '100%', color: '#8B5CF6' };
            default: return { width: '50%', color: '#6B7280' };
        }
    };

    return (
        <div className="enhanced-skills-page">
            <div className="page-header">
                <div className="header-icon">
                    <FaCogs />
                </div>
                <div className="header-content">
                    <h2 className="page-title">Skills & Expertise</h2>
                    <p className="page-subtitle">Showcase your technical, soft, and language skills</p>
                </div>
            </div>

            <div className="skills-container">
                <div className="add-skill-section">
                    <h3 className="section-title">
                        <FaPlus /> Add New Skill
                    </h3>

                    <div className="add-skill-form">
                        <div className="form-group">
                            <label className="form-label">
                                <FaSearch /> Skill Name *
                            </label>
                            <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="e.g., React, Project Management, Spanish"
                                className="skill-input"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Category</label>
                                <div className="category-options">
                                    <button
                                        className={`category-btn ${skillCategory === 'technical' ? 'active' : ''}`}
                                        onClick={() => setSkillCategory('technical')}
                                        style={{ '--category-color': '#3B82F6' }}
                                    >
                                        <FaCode /> Technical
                                    </button>
                                    <button
                                        className={`category-btn ${skillCategory === 'soft' ? 'active' : ''}`}
                                        onClick={() => setSkillCategory('soft')}
                                        style={{ '--category-color': '#10B981' }}
                                    >
                                        <FaTools /> Soft Skills
                                    </button>
                                    <button
                                        className={`category-btn ${skillCategory === 'language' ? 'active' : ''}`}
                                        onClick={() => setSkillCategory('language')}
                                        style={{ '--category-color': '#8B5CF6' }}
                                    >
                                        <FaStar /> Languages
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Proficiency Level</label>
                                <div className="proficiency-options">
                                    <button
                                        className={`proficiency-btn ${proficiency === 'beginner' ? 'active' : ''}`}
                                        onClick={() => setProficiency('beginner')}
                                    >
                                        Beginner
                                    </button>
                                    <button
                                        className={`proficiency-btn ${proficiency === 'intermediate' ? 'active' : ''}`}
                                        onClick={() => setProficiency('intermediate')}
                                    >
                                        Intermediate
                                    </button>
                                    <button
                                        className={`proficiency-btn ${proficiency === 'advanced' ? 'active' : ''}`}
                                        onClick={() => setProficiency('advanced')}
                                    >
                                        Advanced
                                    </button>
                                    <button
                                        className={`proficiency-btn ${proficiency === 'expert' ? 'active' : ''}`}
                                        onClick={() => setProficiency('expert')}
                                    >
                                        Expert
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddSkill}
                            disabled={!newSkill.trim()}
                            className="add-btn"
                        >
                            <FaPlus /> Add Skill
                        </button>
                    </div>
                </div>

                <div className="skills-list-section">
                    <h3 className="section-title">
                        <FaCogs /> Your Skills ({skills.length})
                    </h3>

                    {skills.length === 0 ? (
                        <div className="empty-state">
                            <FaCogs className="empty-icon" />
                            <p>No skills added yet. Add your first skill above!</p>
                        </div>
                    ) : (
                        <div className="skills-grid">
                            {skills.map((skill, index) => (
                                <div key={skill.id || index} className="skill-card">
                                    <div className="skill-header">
                                        <div className="skill-category" style={{ color: getCategoryColor(skill.category) }}>
                                            {getCategoryIcon(skill.category)}
                                            <span className="category-text">
                                                {skill.category === 'technical' ? 'Technical' :
                                                    skill.category === 'soft' ? 'Soft Skill' :
                                                        'Language'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveSkill(index)}
                                            className="remove-skill-btn"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="skill-name">
                                        {skill.name}
                                    </div>

                                    <div className="skill-proficiency">
                                        <div className="proficiency-label">
                                            <span>{skill.proficiency || 'Intermediate'}</span>
                                            <span className="proficiency-percentage">
                                                {skill.proficiency === 'beginner' ? '33%' :
                                                    skill.proficiency === 'intermediate' ? '66%' :
                                                        skill.proficiency === 'advanced' ? '100%' :
                                                            skill.proficiency === 'expert' ? '100%' : '50%'}
                                            </span>
                                        </div>
                                        <div className="proficiency-bar">
                                            <div
                                                className="proficiency-fill"
                                                style={getProficiencyLevel(skill.proficiency)}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="validation-section">
                {skills.length >= 3 ? (
                    <div className="validation-success">
                        <div className="success-icon">✓</div>
                        <div className="success-content">
                            <h4>Great! You have {skills.length} skills</h4>
                            <p>Recruiters recommend 5-10 relevant skills for best results.</p>
                        </div>
                    </div>
                ) : (
                    <div className="validation-warning">
                        <div className="warning-icon">!</div>
                        <div className="warning-content">
                            <h4>Add More Skills</h4>
                            <p>Add at least 3-5 skills to make your resume stand out.</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .enhanced-skills-page {
                    padding: 0;
                    max-width: 100%;
                }

                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #e5e7eb;
                }

                .header-icon {
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #EC4899, #BE185D);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .header-content .page-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.25rem 0;
                }

                .header-content .page-subtitle {
                    font-size: 0.95rem;
                    color: #6b7280;
                    margin: 0;
                }

                .skills-container {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                .add-skill-section {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .section-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0 0 1.5rem 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .add-skill-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                }

                .form-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .skill-input {
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                }

                .skill-input:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .category-options, .proficiency-options {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                }

                .category-btn, .proficiency-btn {
                    padding: 0.5rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    color: #4b5563;
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .category-btn.active {
                    background: var(--category-color);
                    color: white;
                    border-color: var(--category-color);
                }

                .proficiency-btn.active {
                    background: #8b5cf6;
                    color: white;
                    border-color: #8b5cf6;
                }

                .category-btn:hover, .proficiency-btn:hover {
                    border-color: #9ca3af;
                }

                .add-btn {
                    padding: 0.75rem 1.5rem;
                    background: #8b5cf6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }

                .add-btn:hover:not(:disabled) {
                    background: #7c3aed;
                }

                .add-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .skills-list-section {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                }

                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #6b7280;
                }

                .empty-icon {
                    font-size: 3rem;
                    color: #d1d5db;
                    margin-bottom: 1rem;
                }

                .skills-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 1rem;
                }

                .skill-card {
                    background: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 1rem;
                    transition: all 0.3s ease;
                }

                .skill-card:hover {
                    border-color: #8b5cf6;
                    box-shadow: 0 2px 8px rgba(139, 92, 246, 0.1);
                }

                .skill-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .skill-category {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .remove-skill-btn {
                    padding: 0.25rem 0.5rem;
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }

                .remove-skill-btn:hover {
                    background: #fecaca;
                }

                .skill-name {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 0.75rem;
                }

                .skill-proficiency {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .proficiency-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .proficiency-percentage {
                    font-weight: 600;
                }

                .proficiency-bar {
                    height: 6px;
                    background: #e5e7eb;
                    border-radius: 3px;
                    overflow: hidden;
                }

                .proficiency-fill {
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.3s ease;
                }

                .validation-section {
                    margin-top: 2rem;
                }

                .validation-success, .validation-warning {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-radius: 12px;
                }

                .validation-success {
                    background: #d1fae5;
                    border: 1px solid #a7f3d0;
                }

                .validation-warning {
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                }

                .success-icon, .warning-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: bold;
                }

                .success-icon {
                    background: #10b981;
                    color: white;
                }

                .warning-icon {
                    background: #f59e0b;
                    color: white;
                }

                .success-content h4, .warning-content h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem 0;
                }

                .success-content h4 {
                    color: #065f46;
                }

                .warning-content h4 {
                    color: #92400e;
                }

                .success-content p, .warning-content p {
                    font-size: 0.875rem;
                    margin: 0;
                }

                .success-content p {
                    color: #047857;
                }

                .warning-content p {
                    color: #b45309;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .skills-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .category-options, .proficiency-options {
                        flex-wrap: nowrap;
                        overflow-x: auto;
                        padding-bottom: 0.5rem;
                    }
                    
                    .category-btn, .proficiency-btn {
                        flex-shrink: 0;
                    }
                }
            `}</style>
        </div>
    );
};

export default EnhancedSkillsPage;