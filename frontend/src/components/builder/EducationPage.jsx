import React from 'react';

const EducationPage = ({ resumeData, onInputChange, onNext, onPrev, onAddNew, onRemove, currentStep, isStepValid }) => {
    const { education } = resumeData;

    const handleEducationChange = (id, field, value) => {
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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Education</h2>
                <p style={styles.subtitle}>Add your educational background</p>
            </div>

            <div style={styles.educationList}>
                {education.map((edu, index) => (
                    <div key={edu.id} style={styles.educationCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>
                                Education #{index + 1}
                            </h3>
                            {education.length > 1 && (
                                <button
                                    onClick={() => removeEducation(edu.id)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Degree *</label>
                                    <input
                                        type="text"
                                        value={edu.degree}
                                        onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)}
                                        style={styles.input}
                                        placeholder="Bachelor of Science in Computer Science"
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Institution *</label>
                                    <input
                                        type="text"
                                        value={edu.institution}
                                        onChange={(e) => handleEducationChange(edu.id, 'institution', e.target.value)}
                                        style={styles.input}
                                        placeholder="University of Technology"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Location</label>
                                <input
                                    type="text"
                                    value={edu.location}
                                    onChange={(e) => handleEducationChange(edu.id, 'location', e.target.value)}
                                    style={styles.input}
                                    placeholder="New York, NY"
                                />
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Start Date</label>
                                    <input
                                        type="month"
                                        value={edu.startDate}
                                        onChange={(e) => handleEducationChange(edu.id, 'startDate', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>End Date</label>
                                    <input
                                        type="month"
                                        value={edu.endDate}
                                        onChange={(e) => handleEducationChange(edu.id, 'endDate', e.target.value)}
                                        style={styles.input}
                                        disabled={edu.current}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={edu.current}
                                            onChange={(e) => handleEducationChange(edu.id, 'current', e.target.checked)}
                                            style={styles.checkbox}
                                        />
                                        Currently attending
                                    </label>
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>GPA</label>
                                    <input
                                        type="text"
                                        value={edu.gpa}
                                        onChange={(e) => handleEducationChange(edu.id, 'gpa', e.target.value)}
                                        style={styles.input}
                                        placeholder="3.8"
                                    />
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Description</label>
                                <textarea
                                    value={edu.description}
                                    onChange={(e) => handleEducationChange(edu.id, 'description', e.target.value)}
                                    style={styles.textarea}
                                    placeholder="Relevant coursework, honors, awards, or additional information..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addNewEducation}
                style={styles.addButton}
            >
                + Add Another Education
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
                    Next: Skills →
                </button>
            </div>

            {!isStepValid && (
                <div style={styles.validationMessage}>
                    Please add at least one education entry with degree and institution
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
    educationList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        marginBottom: '30px',
    },
    educationCard: {
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

export default EducationPage;