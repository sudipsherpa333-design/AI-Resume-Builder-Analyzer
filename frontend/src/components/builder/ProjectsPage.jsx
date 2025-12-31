import React, { useState, useEffect } from 'react';
import {
    FaProjectDiagram,
    FaPlus,
    FaTrash,
    FaEdit,
    FaSave,
    FaTimes,
    FaCalendarAlt,
    FaCode,
    FaLink,
    FaTrophy,
    FaGithub,
    FaExternalLinkAlt,
    FaStar
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ProjectsPage = ({ resumeData, onUpdate, errors, setErrors }) => {
    const [projects, setProjects] = useState(resumeData?.projects || []);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        technologies: '',
        startDate: '',
        endDate: '',
        current: false,
        githubUrl: '',
        liveUrl: '',
        achievements: [],
        role: '',
        teamSize: ''
    });

    useEffect(() => {
        if (resumeData?.projects) {
            setProjects(resumeData.projects);
        }
    }, [resumeData?.projects]);

    const handleUpdate = (data) => {
        if (onUpdate) {
            onUpdate('projects', data);
        }
    };

    useEffect(() => {
        if (projects.length > 0 || projects.length === 0) {
            handleUpdate(projects);
        }
    }, [projects]);

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

        if (!formData.title.trim()) {
            newErrors.title = 'Project title is required';
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...newErrors }));
            return false;
        }

        setErrors({});
        return true;
    };

    const handleAddProject = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        const newProject = {
            id: Date.now(),
            ...formData,
            achievements: formData.achievements.filter(a => a.trim() !== '')
        };

        setProjects(prev => [...prev, newProject]);
        resetForm();
        setIsAddingNew(false);
        toast.success('Project added successfully!');
    };

    const handleEditProject = (index) => {
        const project = projects[index];
        setFormData({
            title: project.title || '',
            description: project.description || '',
            technologies: project.technologies || '',
            startDate: project.startDate || '',
            endDate: project.endDate || '',
            current: project.current || false,
            githubUrl: project.githubUrl || '',
            liveUrl: project.liveUrl || '',
            achievements: project.achievements || [],
            role: project.role || '',
            teamSize: project.teamSize || ''
        });
        setEditingIndex(index);
        setIsAddingNew(false);
    };

    const handleUpdateProject = () => {
        if (!validateForm()) {
            toast.error('Please fill all required fields');
            return;
        }

        setProjects(prev => {
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
        toast.success('Project updated successfully!');
    };

    const handleDeleteProject = (index) => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setProjects(prev => prev.filter((_, i) => i !== index));
            toast.success('Project removed successfully');
        }
    };

    const handleMoveProject = (index, direction) => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === projects.length - 1)) {
            return;
        }

        setProjects(prev => {
            const updated = [...prev];
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
            return updated;
        });
    };

    const handleDuplicateProject = (index) => {
        const project = projects[index];
        const duplicatedProject = {
            ...project,
            id: Date.now(),
            title: `${project.title} (Copy)`
        };

        setProjects(prev => [...prev, duplicatedProject]);
        toast.success('Project duplicated successfully!');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            technologies: '',
            startDate: '',
            endDate: '',
            current: false,
            githubUrl: '',
            liveUrl: '',
            achievements: [],
            role: '',
            teamSize: ''
        });
        setErrors({});
    };

    const getProjectDuration = (start, end, current) => {
        try {
            const startDate = new Date(start);
            const endDate = current ? new Date() : new Date(end);
            const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());

            if (months < 0) return 'Invalid date';

            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;

            let duration = '';
            if (years > 0) duration += `${years} year${years > 1 ? 's' : ''}`;
            if (remainingMonths > 0) {
                if (duration) duration += ' ';
                duration += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
            }

            return duration || 'Less than a month';
        } catch (error) {
            return 'N/A';
        }
    };

    const getTechTags = (technologies) => {
        if (!technologies) return [];
        return technologies.split(',').map(tech => tech.trim()).filter(tech => tech);
    };

    return (
        <div className="projects-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <div className="header-icon">
                        <FaProjectDiagram />
                    </div>
                    <div>
                        <h2 className="page-title">Projects</h2>
                        <p className="page-subtitle">Showcase your work and contributions</p>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-chip">
                        <FaStar />
                        <span>Projects: {projects.length}</span>
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
                        <FaPlus /> Add Project
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-overview">
                <div className="stat-card">
                    <div className="stat-value">{projects.length}</div>
                    <div className="stat-label">Projects</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {projects.filter(p => p.current).length}
                    </div>
                    <div className="stat-label">Active</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {projects.reduce((total, p) => total + (p.achievements?.length || 0), 0)}
                    </div>
                    <div className="stat-label">Achievements</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">
                        {projects.filter(p => p.liveUrl || p.githubUrl).length}
                    </div>
                    <div className="stat-label">With Links</div>
                </div>
            </div>

            {/* Add/Edit Form */}
            <AnimatePresence>
                {(isAddingNew || editingIndex !== -1) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="project-form-card"
                    >
                        <div className="form-header">
                            <div className="form-title">
                                <h3>
                                    {editingIndex !== -1 ?
                                        <><FaEdit /> Edit Project</> :
                                        <><FaPlus /> Add New Project</>
                                    }
                                </h3>
                                <p className="form-subtitle">
                                    {editingIndex !== -1 ? 'Update your project details' : 'Add a new project to showcase'}
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
                            {/* Project Title */}
                            <div className="form-group full-width">
                                <label className="required">Project Title *</label>
                                <div className="input-with-status">
                                    <FaProjectDiagram className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        placeholder="e.g., E-commerce Platform, Mobile App"
                                        className={`form-input ${errors?.title ? 'error' : ''}`}
                                    />
                                </div>
                                {errors?.title && (
                                    <div className="error-message">{errors.title}</div>
                                )}
                                <div className="field-tip">Name of your project</div>
                            </div>

                            {/* Description */}
                            <div className="form-group full-width">
                                <label className="required">Description *</label>
                                <div className="input-with-status">
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe the project, its purpose, and what it does..."
                                        className={`form-textarea ${errors?.description ? 'error' : ''}`}
                                        rows={4}
                                    />
                                </div>
                                {errors?.description && (
                                    <div className="error-message">{errors.description}</div>
                                )}
                                <div className="field-tip">Detailed description of the project</div>
                            </div>

                            {/* Role & Team Size */}
                            <div className="form-group">
                                <label>Your Role</label>
                                <div className="input-with-status">
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={(e) => handleInputChange('role', e.target.value)}
                                        placeholder="e.g., Lead Developer, UI Designer"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Your role in the project</div>
                            </div>

                            <div className="form-group">
                                <label>Team Size</label>
                                <div className="input-with-status">
                                    <input
                                        type="text"
                                        value={formData.teamSize}
                                        onChange={(e) => handleInputChange('teamSize', e.target.value)}
                                        placeholder="e.g., Solo, 5 members"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Number of team members</div>
                            </div>

                            {/* Dates */}
                            <div className="form-group">
                                <label>Start Date</label>
                                <div className="input-with-status">
                                    <FaCalendarAlt className="field-icon" />
                                    <input
                                        type="month"
                                        value={formData.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">When you started the project</div>
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <div className="date-container">
                                    <div className="current-checkbox-container">
                                        <input
                                            type="checkbox"
                                            id="current-project"
                                            checked={formData.current}
                                            onChange={(e) => handleInputChange('current', e.target.checked)}
                                            className="current-checkbox"
                                        />
                                        <label htmlFor="current-project" className="checkbox-label">
                                            Ongoing Project
                                        </label>
                                    </div>
                                    <div className="input-with-status">
                                        <FaCalendarAlt className="field-icon" />
                                        <input
                                            type="month"
                                            value={formData.current ? '' : formData.endDate}
                                            onChange={(e) => handleInputChange('endDate', e.target.value)}
                                            className="form-input"
                                            disabled={formData.current}
                                            placeholder={formData.current ? 'Present' : ''}
                                        />
                                    </div>
                                </div>
                                <div className="field-tip">Leave empty for ongoing projects</div>
                            </div>

                            {/* Technologies */}
                            <div className="form-group full-width">
                                <label>Technologies Used</label>
                                <div className="input-with-status">
                                    <FaCode className="field-icon" />
                                    <input
                                        type="text"
                                        value={formData.technologies}
                                        onChange={(e) => handleInputChange('technologies', e.target.value)}
                                        placeholder="e.g., React, Node.js, MongoDB, AWS"
                                        className="form-input"
                                    />
                                </div>
                                <div className="field-tip">Separate technologies with commas</div>
                            </div>

                            {/* URLs */}
                            <div className="form-group">
                                <label>GitHub URL</label>
                                <div className="input-with-status">
                                    <FaGithub className="field-icon" />
                                    <input
                                        type="url"
                                        value={formData.githubUrl}
                                        onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                                        placeholder="https://github.com/username/project"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Live Demo URL</label>
                                <div className="input-with-status">
                                    <FaExternalLinkAlt className="field-icon" />
                                    <input
                                        type="url"
                                        value={formData.liveUrl}
                                        onChange={(e) => handleInputChange('liveUrl', e.target.value)}
                                        placeholder="https://project-demo.com"
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            {/* Achievements */}
                            <div className="form-group full-width">
                                <div className="section-header">
                                    <div>
                                        <label>Key Achievements</label>
                                        <p className="field-subtitle">Project accomplishments and impact</p>
                                    </div>
                                    <button
                                        className="btn-small"
                                        onClick={handleAddAchievement}
                                        type="button"
                                    >
                                        <FaPlus /> Add Achievement
                                    </button>
                                </div>

                                <div className="items-list">
                                    {formData.achievements.map((achievement, index) => (
                                        <div key={index} className="item">
                                            <div className="item-number">{index + 1}</div>
                                            <input
                                                type="text"
                                                value={achievement}
                                                onChange={(e) => handleAchievementChange(index, e.target.value)}
                                                placeholder="e.g., Improved performance by 40%, Reduced load time by 50%..."
                                                className="item-input"
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
                                        <div className="no-items">
                                            <FaTrophy className="empty-icon" />
                                            <div className="empty-content">
                                                <h4>No achievements added yet</h4>
                                                <p>Add measurable results and project impact</p>
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
                                onClick={editingIndex !== -1 ? handleUpdateProject : handleAddProject}
                                type="button"
                            >
                                <FaSave /> {editingIndex !== -1 ? 'Update Project' : 'Save Project'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Projects List */}
            <div className="projects-list">
                {projects.length === 0 ? (
                    <div className="empty-state">
                        <FaProjectDiagram className="empty-icon" />
                        <div className="empty-content">
                            <h3>No projects added yet</h3>
                            <p>Add your projects to showcase your practical experience and skills</p>
                            <button
                                className="btn-primary"
                                onClick={() => setIsAddingNew(true)}
                                type="button"
                            >
                                <FaPlus /> Add Your First Project
                            </button>
                        </div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="project-card"
                            >
                                <div className="project-header">
                                    <div className="project-info">
                                        <div className="project-main">
                                            <h3 className="project-title">{project.title}</h3>
                                            {project.role && (
                                                <div className="project-role">
                                                    <FaProjectDiagram /> Role: {project.role}
                                                    {project.teamSize && ` • Team: ${project.teamSize}`}
                                                </div>
                                            )}
                                        </div>
                                        <div className="project-meta">
                                            <div className="duration">
                                                <FaCalendarAlt />
                                                <span>
                                                    {project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} -
                                                    {project.current ? ' Present' : ` ${project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}`}
                                                </span>
                                                {project.startDate && project.endDate && (
                                                    <span className="duration-badge">
                                                        {getProjectDuration(project.startDate, project.endDate, project.current)}
                                                    </span>
                                                )}
                                                {project.current && (
                                                    <span className="current-badge">
                                                        <FaStar /> Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-actions">
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleMoveProject(index, 'up')}
                                            disabled={index === 0}
                                            title="Move up"
                                            type="button"
                                        >
                                            <FaArrowUp />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleMoveProject(index, 'down')}
                                            disabled={index === projects.length - 1}
                                            title="Move down"
                                            type="button"
                                        >
                                            <FaArrowDown />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleDuplicateProject(index)}
                                            title="Duplicate"
                                            type="button"
                                        >
                                            <FaCopy />
                                        </button>
                                        <button
                                            className="btn-icon"
                                            onClick={() => handleEditProject(index)}
                                            title="Edit"
                                            type="button"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => handleDeleteProject(index)}
                                            title="Delete"
                                            type="button"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>

                                <div className="project-description">
                                    <p>{project.description}</p>
                                </div>

                                {project.technologies && (
                                    <div className="technologies">
                                        <div className="technologies-header">
                                            <FaCode />
                                            <strong>Technologies Used</strong>
                                        </div>
                                        <div className="tech-tags">
                                            {getTechTags(project.technologies).map((tech, idx) => (
                                                <span key={idx} className="tech-tag">{tech}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {project.achievements && project.achievements.length > 0 && (
                                    <div className="achievements">
                                        <div className="achievements-header">
                                            <FaTrophy />
                                            <strong>Key Achievements</strong>
                                        </div>
                                        <ul className="achievements-list">
                                            {project.achievements.map((achievement, idx) => (
                                                <li key={idx}>
                                                    <span className="bullet"></span>
                                                    <span className="achievement-text">{achievement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {(project.githubUrl || project.liveUrl) && (
                                    <div className="project-links">
                                        {project.githubUrl && (
                                            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                                <FaGithub /> GitHub
                                            </a>
                                        )}
                                        {project.liveUrl && (
                                            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                                <FaExternalLinkAlt /> Live Demo
                                            </a>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <style jsx>{`
                .projects-page {
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
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.75rem;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #1f2937;
                    margin: 0 0 0.5rem 0;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    padding: 0.875rem 1.75rem;
                    border-radius: 50px;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 0.95rem;
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
                }

                .btn-primary {
                    padding: 0.875rem 1.75rem;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
                    box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
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
                    border-color: #f59e0b;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    transform: translateY(-3px);
                }

                .stat-value {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #f59e0b;
                    margin-bottom: 0.5rem;
                }

                .stat-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                }

                /* Form */
                .project-form-card {
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
                    border-color: #f59e0b;
                    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.1);
                }

                .form-input.error, .form-textarea.error {
                    border-color: #ef4444;
                }

                .form-textarea {
                    min-height: 100px;
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
                    border: 2px solid #f59e0b;
                    border-radius: 8px;
                    color: #f59e0b;
                    font-size: 0.875rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    cursor: pointer;
                }

                .btn-small:hover {
                    background: #f59e0b;
                    color: white;
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
                    background: linear-gradient(135deg, #f59e0b, #d97706);
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

                /* Projects List */
                .projects-list {
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

                /* Project Card */
                .project-card {
                    background: white;
                    border-radius: 18px;
                    padding: 2rem;
                    border: 2px solid #e5e7eb;
                    transition: all 0.3s ease;
                }

                .project-card:hover {
                    border-color: #f59e0b;
                    box-shadow: 0 8px 30px rgba(245, 158, 11, 0.15);
                }

                .project-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1.5rem;
                    gap: 1.5rem;
                }

                .project-info {
                    flex: 1;
                }

                .project-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 0 0 0.75rem 0;
                }

                .project-role {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 1rem;
                    color: #4b5563;
                    margin-bottom: 0.75rem;
                }

                .duration {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    font-size: 0.95rem;
                    color: #6b7280;
                }

                .duration-badge {
                    background: #fef3c7;
                    color: #92400e;
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .current-badge {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: white;
                    padding: 0.375rem 1rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.375rem;
                }

                .project-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }

                .project-description {
                    color: #4b5563;
                    line-height: 1.7;
                    margin-bottom: 1.5rem;
                }

                .technologies {
                    margin: 1.5rem 0;
                    padding: 1.25rem;
                    background: #fffbeb;
                    border-radius: 12px;
                    border-left: 4px solid #f59e0b;
                }

                .technologies-header, .achievements-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .technologies-header svg, .achievements-header svg {
                    color: #f59e0b;
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
                    color: #f59e0b;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    border: 1px solid #fde68a;
                }

                .achievements {
                    margin: 1.5rem 0;
                    padding: 1.25rem;
                    background: #fef3c7;
                    border-radius: 12px;
                    border-left: 4px solid #d97706;
                }

                .achievements-list {
                    margin: 0;
                    padding-left: 0;
                    list-style: none;
                }

                .achievements-list li {
                    padding: 0.5rem 0;
                    color: #92400e;
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    line-height: 1.6;
                }

                .bullet {
                    width: 6px;
                    height: 6px;
                    background: #d97706;
                    border-radius: 50%;
                    margin-top: 0.5rem;
                    flex-shrink: 0;
                }

                .project-links {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .project-link {
                    padding: 0.75rem 1.5rem;
                    background: #f59e0b;
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }

                .project-link:hover {
                    background: #d97706;
                    transform: translateY(-2px);
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

                    .project-header {
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .project-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .stats-overview {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .stats-overview {
                        grid-template-columns: 1fr;
                    }

                    .project-links {
                        flex-direction: column;
                    }

                    .project-link {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProjectsPage;