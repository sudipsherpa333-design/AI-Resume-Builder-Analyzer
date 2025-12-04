import React, { useState } from 'react';
import { FaGraduationCap, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaTrash, FaPlus } from 'react-icons/fa';

const EnhancedEducationPage = ({ resumeData, onInputChange, onAddNew, onRemove }) => {
    const education = Array.isArray(resumeData.education) ? resumeData.education : [];

    const handleChange = (id, field, value) => {
        onInputChange('education', field, value, id);
    };

    const addNewEducation = () => {
        onAddNew('education');
    };

    const removeEducation = (id) => {
        if (education.length > 1) {
            onRemove('education', id);
        }
    };

    const calculateIsStepValid = () => {
        if (education.length === 0) return false;
        return education.some(edu => edu.degree && edu.institution);
    };

    const isStepValid = calculateIsStepValid();

    return (
        <div className="enhanced-education-page">
            <div className="page-header">
                <div className="header-icon">
                    <FaGraduationCap />
                </div>
                <div className="header-content">
                    <h2 className="page-title">Education</h2>
                    <p className="page-subtitle">Add your educational background and achievements</p>
                </div>
            </div>

            <div className="education-list">
                {education.map((edu, index) => (
                    <div key={edu.id || index} className="education-card">
                        <div className="card-header">
                            <div className="card-title-section">
                                <div className="card-icon">
                                    <FaGraduationCap />
                                </div>
                                <h3>
                                    Education #{index + 1}
                                    {edu.degree && edu.institution && (
                                        <span className="status-badge complete">
                                            <FaStar /> Complete
                                        </span>
                                    )}
                                </h3>
                            </div>
                            {education.length > 1 && (
                                <button
                                    onClick={() => removeEducation(edu.id)}
                                    className="remove-btn"
                                >
                                    <FaTrash /> Remove
                                </button>
                            )}
                        </div>

                        <div className="card-content">
                            <div className="form-grid">
                                {/* Degree & Institution */}
                                <div className="input-group">
                                    <label>
                                        <FaGraduationCap className="input-icon" />
                                        Degree *
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.degree || ''}
                                        onChange={(e) => handleChange(edu.id, 'degree', e.target.value)}
                                        placeholder="Bachelor of Science in Computer Science"
                                        className={`input-field ${edu.degree ? 'filled' : ''}`}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        <FaGraduationCap className="input-icon" />
                                        Institution *
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.institution || ''}
                                        onChange={(e) => handleChange(edu.id, 'institution', e.target.value)}
                                        placeholder="University of Technology"
                                        className={`input-field ${edu.institution ? 'filled' : ''}`}
                                    />
                                </div>

                                {/* Location */}
                                <div className="input-group">
                                    <label>
                                        <FaMapMarkerAlt className="input-icon" />
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.location || ''}
                                        onChange={(e) => handleChange(edu.id, 'location', e.target.value)}
                                        placeholder="New York, NY"
                                        className={`input-field ${edu.location ? 'filled' : ''}`}
                                    />
                                </div>

                                {/* Dates */}
                                <div className="input-group">
                                    <label>
                                        <FaCalendarAlt className="input-icon" />
                                        Start Date *
                                    </label>
                                    <input
                                        type="month"
                                        value={edu.startDate || ''}
                                        onChange={(e) => handleChange(edu.id, 'startDate', e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        <FaCalendarAlt className="input-icon" />
                                        {edu.current ? 'Start Date' : 'End Date *'}
                                    </label>
                                    <input
                                        type="month"
                                        value={edu.endDate || ''}
                                        onChange={(e) => handleChange(edu.id, 'endDate', e.target.value)}
                                        className="input-field"
                                        disabled={edu.current}
                                    />
                                </div>

                                {/* GPA */}
                                <div className="input-group">
                                    <label>
                                        <FaStar className="input-icon" />
                                        GPA
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.gpa || ''}
                                        onChange={(e) => handleChange(edu.id, 'gpa', e.target.value)}
                                        placeholder="3.8 / 4.0"
                                        className={`input-field ${edu.gpa ? 'filled' : ''}`}
                                    />
                                </div>

                                {/* Current Checkbox */}
                                <div className="checkbox-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={edu.current || false}
                                            onChange={(e) => handleChange(edu.id, 'current', e.target.checked)}
                                            className="checkbox-input"
                                        />
                                        <span className="checkmark"></span>
                                        Currently attending
                                    </label>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="textarea-group">
                                <label>Description & Achievements</label>
                                <textarea
                                    value={edu.description || ''}
                                    onChange={(e) => handleChange(edu.id, 'description', e.target.value)}
                                    placeholder="• Graduated Summa Cum Laude
• Dean's List for 6 semesters
• President of Computer Science Club
• Relevant coursework: Data Structures, Algorithms, Web Development"
                                    className="description-textarea"
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addNewEducation} className="add-education-btn">
                <FaPlus /> Add Another Education
            </button>

            <div className="validation-section">
                {isStepValid ? (
                    <div className="validation-success">
                        <div className="success-icon">✓</div>
                        <div className="success-content">
                            <h4>Education Complete!</h4>
                            <p>Your education information has been saved successfully.</p>
                        </div>
                    </div>
                ) : (
                    <div className="validation-warning">
                        <div className="warning-icon">!</div>
                        <div className="warning-content">
                            <h4>Add Education Required</h4>
                            <p>Please add at least one education entry with degree and institution.</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .enhanced-education-page {
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
                    background: linear-gradient(135deg, #8B5CF6, #7C3AED);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.5rem;
                }

                .header-content {
                    flex: 1;
                }

                .page-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.25rem 0;
                }

                .page-subtitle {
                    font-size: 0.95rem;
                    color: #6b7280;
                    margin: 0;
                }

                .education-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .education-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }

                .education-card:hover {
                    border-color: #8b5cf6;
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .card-title-section {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .card-icon {
                    width: 36px;
                    height: 36px;
                    background: #f3f4f6;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #8b5cf6;
                }

                .card-title-section h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .status-badge.complete {
                    background: #d1fae5;
                    color: #065f46;
                }

                .remove-btn {
                    padding: 0.5rem 1rem;
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .remove-btn:hover {
                    background: #fecaca;
                }

                .card-content {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1.25rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                }

                .input-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .input-icon {
                    color: #8b5cf6;
                    font-size: 0.875rem;
                }

                .input-field {
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                }

                .input-field:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                .input-field.filled {
                    border-color: #10b981;
                    background-color: #f0fdf4;
                }

                .input-field:disabled {
                    background-color: #f9fafb;
                    cursor: not-allowed;
                }

                .checkbox-group {
                    grid-column: span 2;
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-size: 0.95rem;
                    color: #374151;
                    font-weight: 500;
                }

                .checkbox-input {
                    display: none;
                }

                .checkmark {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #d1d5db;
                    border-radius: 4px;
                    position: relative;
                    transition: all 0.3s ease;
                }

                .checkbox-input:checked + .checkmark {
                    background: #8b5cf6;
                    border-color: #8b5cf6;
                }

                .checkbox-input:checked + .checkmark::after {
                    content: '✓';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 0.75rem;
                }

                .textarea-group {
                    display: flex;
                    flex-direction: column;
                }

                .textarea-group label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                }

                .description-textarea {
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    color: #1f2937;
                    background: white;
                    transition: all 0.3s ease;
                    resize: vertical;
                    min-height: 120px;
                    line-height: 1.6;
                    font-family: inherit;
                }

                .description-textarea:focus {
                    outline: none;
                    border-color: #8b5cf6;
                    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
                }

                .description-textarea::placeholder {
                    color: #9ca3af;
                }

                .add-education-btn {
                    width: 100%;
                    padding: 1rem;
                    background: #f3f4f6;
                    color: #374151;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 2rem;
                }

                .add-education-btn:hover {
                    background: #e5e7eb;
                    border-color: #9ca3af;
                }

                .validation-section {
                    padding: 1.5rem;
                    border-radius: 12px;
                }

                .validation-success {
                    background: #d1fae5;
                    border: 1px solid #a7f3d0;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-radius: 12px;
                }

                .success-icon {
                    width: 40px;
                    height: 40px;
                    background: #10b981;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: bold;
                }

                .success-content h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #065f46;
                    margin: 0 0 0.25rem 0;
                }

                .success-content p {
                    font-size: 0.875rem;
                    color: #047857;
                    margin: 0;
                }

                .validation-warning {
                    background: #fef3c7;
                    border: 1px solid #fde68a;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.5rem;
                    border-radius: 12px;
                }

                .warning-icon {
                    width: 40px;
                    height: 40px;
                    background: #f59e0b;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                    font-weight: bold;
                }

                .warning-content h4 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #92400e;
                    margin: 0 0 0.25rem 0;
                }

                .warning-content p {
                    font-size: 0.875rem;
                    color: #b45309;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .form-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .checkbox-group {
                        grid-column: span 1;
                    }
                    
                    .page-header {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .card-header {
                        flex-direction: column;
                        gap: 1rem;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
};

export default EnhancedEducationPage;