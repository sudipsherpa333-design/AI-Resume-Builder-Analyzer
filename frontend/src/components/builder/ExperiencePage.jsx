import React from 'react';

const ExperiencePage = ({ resumeData, onInputChange, onNext, onPrev, onAddNew, onRemove, currentStep, isStepValid }) => {
    const { experience } = resumeData;

    const handleExperienceChange = (id, field, value) => {
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
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Work Experience</h2>
                <p style={styles.subtitle}>List your relevant work experience</p>
            </div>

            <div style={styles.experienceList}>
                {experience.map((exp, index) => (
                    <div key={exp.id} style={styles.experienceCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>
                                Experience #{index + 1}
                            </h3>
                            {experience.length > 1 && (
                                <button
                                    onClick={() => removeExperience(exp.id)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Job Title *</label>
                                    <input
                                        type="text"
                                        value={exp.jobTitle}
                                        onChange={(e) => handleExperienceChange(exp.id, 'jobTitle', e.target.value)}
                                        style={styles.input}
                                        placeholder="Senior Software Engineer"
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Company *</label>
                                    <input
                                        type="text"
                                        value={exp.company}
                                        onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
                                        style={styles.input}
                                        placeholder="Tech Company Inc"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Location</label>
                                <input
                                    type="text"
                                    value={exp.location}
                                    onChange={(e) => handleExperienceChange(exp.id, 'location', e.target.value)}
                                    style={styles.input}
                                    placeholder="San Francisco, CA"
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Start Date</label>
                                    <input
                                        type="month"
                                        value={exp.startDate}
                                        onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>End Date</label>
                                    <input
                                        type="month"
                                        value={exp.endDate}
                                        onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                                        style={styles.input}
                                        disabled={exp.current}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={exp.current}
                                            onChange={(e) => handleExperienceChange(exp.id, 'current', e.target.checked)}
                                            style={styles.checkbox}
                                        />
                                        I currently work here
                                    </label>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    value={exp.description}
                                    onChange={(e) => handleExperienceChange(exp.id, 'description', e.target.value)}
                                    style={styles.textarea}
                                    placeholder="Describe your responsibilities and achievements in this role..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addNewExperience}
                style={styles.addButton}
            >
                + Add Another Experience
            </button>

            <div style={styles.navigation}>
                <button
                    onClick={onPrev}
                    style={styles.backButton}
                >
                    ← Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!isStepValid}
                    style={{
                        ...styles.nextButton,
                        ...(!isStepValid && styles.disabledButton)
                    }}
                >
                    Next: Education →
                </button>
            </div>

            {!isStepValid && (
                <div style={styles.validationMessage}>
                    Please add at least one work experience with job title and company
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '30px',
        maxWidth: '800px',
        margin: '0 auto',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '10px',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#666',
        fontWeight: '300',
    },
    experienceList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        marginBottom: '30px',
    },
    experienceCard: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        border: '2px solid #f1f5f9',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f1f5f9',
    },
    cardTitle: {
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#333',
        margin: 0,
    },
    removeButton: {
        padding: '8px 16px',
        backgroundColor: '#fef2f2',
        color: '#dc2626',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr auto',
        gap: '20px',
        alignItems: 'end',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        marginBottom: '8px',
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        cursor: 'pointer',
    },
    checkbox: {
        marginRight: '8px',
    },
    input: {
        padding: '12px 16px',
        border: '2px solid #e1e5e9',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
    },
    textarea: {
        padding: '12px 16px',
        border: '2px solid #e1e5e9',
        borderRadius: '8px',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        backgroundColor: 'white',
        resize: 'vertical',
        fontFamily: 'inherit',
    },
    addButton: {
        padding: '14px 24px',
        backgroundColor: 'transparent',
        color: '#667eea',
        border: '2px dashed #667eea',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        marginBottom: '30px',
        width: '100%',
    },
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '40px',
    },
    backButton: {
        padding: '14px 30px',
        backgroundColor: 'transparent',
        color: '#666',
        border: '2px solid #e1e5e9',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    nextButton: {
        padding: '14px 30px',
        backgroundColor: '#4ade80',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    disabledButton: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    validationMessage: {
        textAlign: 'center',
        color: '#e53e3e',
        marginTop: '20px',
        fontSize: '14px',
        fontWeight: '500',
    },
};

export default ExperiencePage;