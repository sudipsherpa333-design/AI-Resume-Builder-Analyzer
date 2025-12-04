import React, { useState } from 'react';
import {
    FaProjectDiagram,
    FaCalendarAlt,
    FaLink,
    FaCode,
    FaTrash,
    FaPlus,
    FaStar,
    FaExternalLinkAlt
} from 'react-icons/fa';

const EnhancedProjectsPage = ({ resumeData, onInputChange, onAddNew, onRemove }) => {
    const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];

    const handleChange = (id, field, value) => {
        onInputChange('projects', field, value, id);
    };

    const addNewProject = () => {
        onAddNew('projects');
    };

    const removeProject = (id) => {
        if (projects.length > 1) {
            onRemove('projects', id);
        }
    };

    const calculateIsStepValid = () => {
        if (projects.length === 0) return false;
        return projects.some(proj => proj.name && proj.description);
    };

    const isStepValid = calculateIsStepValid();

    return (
        <div className="enhanced-projects-page">
            <div className="page-header">
                <div className="header-icon">
                    <FaProjectDiagram />
                </div>
                <div className="header-content">
                    <h2 className="page-title">Projects</h2>
                    <p className="page-subtitle">Showcase your personal and professional projects</p>
                </div>
            </div>

            <div className="projects-list">
                {projects.map((proj, index) => (
                    <div key={proj.id || index} className="project-card">
                        <div className="card-header">
                            <div className="card-title-section">
                                <div className="card-icon">
                                    <FaProjectDiagram />
                                </div>
                                <h3>
                                    Project #{index + 1}
                                    {proj.name && proj.description && (
                                        <span className="status-badge complete">
                                            <FaStar /> Complete
                                        </span>
                                    )}
                                </h3>
                            </div>
                            {projects.length > 1 && (
                                <button
                                    onClick={() => removeProject(proj.id)}
                                    className="remove-btn"
                                >
                                    <FaTrash /> Remove
                                </button>
                            )}
                        </div>

                        <div className="card-content">
                            <div className="form-grid">
                                {/* Project Name */}
                                <div className="input-group">
                                    <label>
                                        <FaProjectDiagram className="input-icon" />
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={proj.name || ''}
                                        onChange={(e) => handleChange(proj.id, 'name', e.target.value)}
                                        placeholder="E-commerce Platform"
                                        className={`input-field ${proj.name ? 'filled' : ''}`}
                                    />
                                </div>

                                {/* Project Type */}
                                <div className="input-group">
                                    <label>Project Type</label>
                                    <select
                                        value={proj.type || ''}
                                        onChange={(e) => handleChange(proj.id, 'type', e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="">Select type</option>
                                        <option value="personal">Personal Project</option>
                                        <option value="professional">Professional</option>
                                        <option value="academic">Academic</option>
                                        <option value="open-source">Open Source</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </div>

                                {/* Dates */}
                                <div className="input-group">
                                    <label>
                                        <FaCalendarAlt className="input-icon" />
                                        Start Date
                                    </label>
                                    <input
                                        type="month"
                                        value={proj.startDate || ''}
                                        onChange={(e) => handleChange(proj.id, 'startDate', e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        <FaCalendarAlt className="input-icon" />
                                        End Date
                                    </label>
                                    <input
                                        type="month"
                                        value={proj.endDate || ''}
                                        onChange={(e) => handleChange(proj.id, 'endDate', e.target.value)}
                                        className="input-field"
                                        disabled={proj.current}
                                    />
                                </div>

                                {/* URLs */}
                                <div className="input-group">
                                    <label>
                                        <FaLink className="input-icon" />
                                        Live URL
                                    </label>
                                    <input
                                        type="url"
                                        value={proj.url || ''}
                                        onChange={(e) => handleChange(proj.id, 'url', e.target.value)}
                                        placeholder="https://project-demo.com"
                                        className={`input-field ${proj.url ? 'filled' : ''}`}
                                    />
                                </div>

                                <div className="input-group">
                                    <label>
                                        <FaCode className="input-icon" />
                                        GitHub URL
                                    </label>
                                    <input
                                        type="url"
                                        value={proj.github || ''}
                                        onChange={(e) => handleChange(proj.id, 'github', e.target.value)}
                                        placeholder="https://github.com/username/project"
                                        className={`input-field ${proj.github ? 'filled' : ''}`}
                                    />
                                </div>
                            </div>

                            {/* Technologies */}
                            <div className="input-group">
                                <label>Technologies Used</label>
                                <input
                                    type="text"
                                    value={proj.technologies || ''}
                                    onChange={(e) => handleChange(proj.id, 'technologies', e.target.value)}
                                    placeholder="React, Node.js, MongoDB, AWS, Docker"
                                    className="input-field"
                                />
                                <div className="input-tip">
                                    Separate technologies with commas
                                </div>
                            </div>

                            {/* Description */}
                            <div className="textarea-group">
                                <label>Project Description & Features *</label>
                                <textarea
                                    value={proj.description || ''}
                                    onChange={(e) => handleChange(proj.id, 'description', e.target.value)}
                                    placeholder="• Developed a full-stack e-commerce platform with React and Node.js
• Implemented user authentication, payment processing, and admin dashboard
• Optimized performance achieving 95% Lighthouse score
• Containerized with Docker and deployed on AWS"
                                    className="description-textarea"
                                    rows={5}
                                />
                                <div className="textarea-tip">
                                    Use bullet points to highlight key features and achievements
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addNewProject} className="add-project-btn">
                <FaPlus /> Add Another Project
            </button>

            <div className="validation-section">
                {isStepValid ? (
                    <div className="validation-success">
                        <div className="success-icon">✓</div>
                        <div className="success-content">
                            <h4>Projects Complete!</h4>
                            <p>Your projects have been saved successfully.</p>
                        </div>
                    </div>
                ) : (
                    <div className="validation-warning">
                        <div className="warning-icon">!</div>
                        <div className="warning-content">
                            <h4>Add Projects</h4>
                            <p>Add at least one project with name and description to showcase your work.</p>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .enhanced-projects-page {
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
                    background: linear-gradient(135deg, #6366F1, #4F46E5);
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

                .projects-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .project-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }

                .project-card:hover {
                    border-color: #6366f1;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
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
                    background: #eef2ff;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6366f1;
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

                .status-badge.complete {
                    background: #e0e7ff;
                    color: #3730a3;
                    font-size: 0.75rem;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
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
                    color: #6366f1;
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
                    appearance: none;
                }

                .input-field:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .input-field.filled {
                    border-color: #6366f1;
                    background-color: #eef2ff;
                }

                select.input-field {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 1.5em 1.5em;
                    padding-right: 2.5rem;
                }

                .input-tip {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.5rem;
                    font-style: italic;
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
                    min-height: 150px;
                    line-height: 1.6;
                    font-family: inherit;
                }

                .description-textarea:focus {
                    outline: none;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .description-textarea::placeholder {
                    color: #9ca3af;
                }

                .textarea-tip {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 0.5rem;
                    font-style: italic;
                }

                .add-project-btn {
                    width: 100%;
                    padding: 1rem;
                    background: #eef2ff;
                    color: #3730a3;
                    border: 2px dashed #6366f1;
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

                .add-project-btn:hover {
                    background: #e0e7ff;
                    border-color: #4f46e5;
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

export default EnhancedProjectsPage;