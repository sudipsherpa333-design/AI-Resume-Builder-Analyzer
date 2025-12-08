import React from 'react';

const ExperiencePage = ({ resumeData, onInputChange, onAddNew, onRemove, isStepValid }) => {
    const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];

    const handleChange = (id, field, value) => {
        onInputChange('experience', field, value, id);
    };

    const addNewExperience = () => {
        onAddNew('experience');
    };

    const removeExperience = (id) => {
        if (experience.length > 1) {
            onRemove('experience', id);
        }
    };

    return (
        <div className="experience-page">
            <div className="header">
                <h2 className="title">Work Experience</h2>
                <p className="subtitle">List your relevant work experience</p>
            </div>

            <div className="experience-list">
                {experience.map((exp, index) => (
                    <div key={exp.id} className="experience-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Experience #{index + 1}
                                {exp.jobTitle && exp.company && <span className="checkmark"> ✓</span>}
                            </h3>
                            {experience.length > 1 && (
                                <button
                                    onClick={() => removeExperience(exp.id)}
                                    className="remove-button"
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label className="label">Job Title *</label>
                                    <input
                                        type="text"
                                        value={exp.jobTitle || ''}
                                        onChange={(e) => handleChange(exp.id, 'jobTitle', e.target.value)}
                                        className="input"
                                        placeholder="Senior Software Engineer"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Company *</label>
                                    <input
                                        type="text"
                                        value={exp.company || ''}
                                        onChange={(e) => handleChange(exp.id, 'company', e.target.value)}
                                        className="input"
                                        placeholder="Tech Company Inc"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label className="label">Location</label>
                                    <input
                                        type="text"
                                        value={exp.location || ''}
                                        onChange={(e) => handleChange(exp.id, 'location', e.target.value)}
                                        className="input"
                                        placeholder="San Francisco, CA"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={exp.current || false}
                                            onChange={(e) => handleChange(exp.id, 'current', e.target.checked)}
                                            className="checkbox"
                                        />
                                        I currently work here
                                    </label>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label className="label">Start Date *</label>
                                    <input
                                        type="month"
                                        value={exp.startDate || ''}
                                        onChange={(e) => handleChange(exp.id, 'startDate', e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">
                                        {exp.current ? 'Start Date' : 'End Date *'}
                                    </label>
                                    <input
                                        type="month"
                                        value={exp.endDate || ''}
                                        onChange={(e) => handleChange(exp.id, 'endDate', e.target.value)}
                                        className="input"
                                        disabled={exp.current}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="label">Job Description</label>
                                <textarea
                                    value={exp.description || ''}
                                    onChange={(e) => handleChange(exp.id, 'description', e.target.value)}
                                    className="textarea"
                                    placeholder="• Led development of scalable web applications using React and Node.js
• Managed team of 5 developers
• Improved application performance by 40%
• Implemented CI/CD pipelines"
                                    rows={6}
                                />
                                <div className="textarea-hint">
                                    Use bullet points for better readability
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addNewExperience}
                className="add-button"
            >
                + Add Another Experience
            </button>

            <div className="validation-section">
                {isStepValid ? (
                    <div className="valid-status">
                        ✓ At least one experience added - Ready to continue
                    </div>
                ) : (
                    <div className="invalid-status">
                        ⚠ Please add at least one work experience with job title and company
                    </div>
                )}
            </div>

            <style jsx>{`
                .experience-page {
                    padding: 0;
                    max-width: 100%;
                }

                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #000;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .subtitle {
                    font-size: 1rem;
                    color: #666;
                    font-weight: 400;
                }

                .experience-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .experience-card {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.25rem;
                }

                .card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #000;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .checkmark {
                    color: #10b981;
                    font-weight: bold;
                }

                .remove-button {
                    padding: 0.5rem 1rem;
                    background: #dc2626;
                    color: white;
                    border: none;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: background 0.3s ease;
                }

                .remove-button:hover {
                    background: #b91c1c;
                }

                .form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                }

                .label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 0.5rem;
                }

                .checkbox-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #000;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1.75rem;
                }

                .checkbox {
                    margin: 0;
                }

                .input, .textarea {
                    padding: 0.75rem 1rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: white;
                    outline: none;
                    color: #000;
                    font-family: inherit;
                }

                .input:focus, .textarea:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .textarea {
                    resize: vertical;
                    min-height: 120px;
                    line-height: 1.6;
                }

                .textarea-hint {
                    font-size: 0.75rem;
                    color: #666;
                    margin-top: 0.25rem;
                    font-style: italic;
                }

                .add-button {
                    padding: 0.75rem 1.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 1.5rem;
                    width: 100%;
                    transition: background 0.3s ease;
                }

                .add-button:hover {
                    background: #2563eb;
                }

                .validation-section {
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                    text-align: center;
                }

                .valid-status {
                    color: #065f46;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .invalid-status {
                    color: #dc2626;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .title {
                        font-size: 1.5rem;
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

export default ExperiencePage;