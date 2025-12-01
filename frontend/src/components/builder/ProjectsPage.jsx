import React from 'react';

const ProjectsPage = ({ resumeData, onInputChange, onAddNew, onRemove, onNext, onPrev, currentStep, isStepValid }) => {
    const { projects } = resumeData;

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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Projects</h2>
                <p style={styles.subtitle}>Showcase your personal or professional projects</p>
            </div>

            <div style={styles.projectsList}>
                {projects.map((project, index) => (
                    <div key={project.id} style={styles.projectCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Project #{index + 1}</h3>
                            {projects.length > 1 && (
                                <button
                                    onClick={() => removeProject(project.id)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Project Name *</label>
                                    <input
                                        type="text"
                                        value={project.name || ''}
                                        onChange={(e) => handleChange(project.id, 'name', e.target.value)}
                                        style={styles.input}
                                        placeholder="E-commerce Platform"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Project Description</label>
                                <textarea
                                    value={project.description || ''}
                                    onChange={(e) => handleChange(project.id, 'description', e.target.value)}
                                    style={styles.textarea}
                                    placeholder="Full-stack e-commerce solution with payment integration and inventory management. Features include user authentication, product catalog, shopping cart, and order processing."
                                    rows={4}
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Technologies Used</label>
                                    <input
                                        type="text"
                                        value={project.technologies || ''}
                                        onChange={(e) => handleChange(project.id, 'technologies', e.target.value)}
                                        style={styles.input}
                                        placeholder="React, Node.js, MongoDB, Stripe, AWS"
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Project Link</label>
                                    <input
                                        type="url"
                                        value={project.link || ''}
                                        onChange={(e) => handleChange(project.id, 'link', e.target.value)}
                                        style={styles.input}
                                        placeholder="https://github.com/username/project"
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Start Date</label>
                                    <input
                                        type="month"
                                        value={project.startDate || ''}
                                        onChange={(e) => handleChange(project.id, 'startDate', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>End Date</label>
                                    <input
                                        type="month"
                                        value={project.endDate || ''}
                                        onChange={(e) => handleChange(project.id, 'endDate', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addNewProject}
                style={styles.addButton}
            >
                + Add Another Project
            </button>

            <div style={styles.tips}>
                <h4 style={styles.tipsTitle}>💡 Project Tips:</h4>
                <ul style={styles.tipsList}>
                    <li>Include both personal and professional projects</li>
                    <li>Highlight technologies and frameworks used</li>
                    <li>Provide links to GitHub, live demos, or portfolios</li>
                    <li>Describe the problem you solved and your role</li>
                    <li>Mention any measurable results or impact</li>
                </ul>
            </div>

            <div style={styles.validationSection}>
                {isStepValid ? (
                    <div style={styles.validStatus}>
                        ✓ At least one project added - Ready to continue
                    </div>
                ) : (
                    <div style={styles.invalidStatus}>
                        ⚠ Please add at least one project with a name
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px',
    },
    title: {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#000000',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '1rem',
        color: '#000000',
        fontWeight: '400',
        opacity: 0.8,
    },
    projectsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        marginBottom: '24px',
    },
    projectCard: {
        backgroundColor: '#f8fafc',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    cardTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#000000',
        margin: 0,
    },
    removeButton: {
        padding: '8px 16px',
        backgroundColor: '#e53e3e',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        cursor: 'pointer',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#000000',
        marginBottom: '8px',
    },
    input: {
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        outline: 'none',
        color: '#000000',
    },
    textarea: {
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        resize: 'vertical',
        fontFamily: 'inherit',
        outline: 'none',
        minHeight: '100px',
        color: '#000000',
        lineHeight: '1.6',
    },
    addButton: {
        padding: '12px 24px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        marginBottom: '24px',
        width: '100%',
    },
    tips: {
        backgroundColor: '#f7fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
    },
    tipsTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#000000',
        marginBottom: '12px',
    },
    tipsList: {
        color: '#000000',
        fontSize: '14px',
        lineHeight: '1.6',
        paddingLeft: '20px',
        margin: 0,
        opacity: 0.8,
    },
    validationSection: {
        padding: '16px',
        backgroundColor: '#f7fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        textAlign: 'center',
    },
    validStatus: {
        color: '#000000',
        fontSize: '14px',
        fontWeight: '500',
        opacity: 0.8,
    },
    invalidStatus: {
        color: '#e53e3e',
        fontSize: '14px',
        fontWeight: '500',
    },
};

export default ProjectsPage;