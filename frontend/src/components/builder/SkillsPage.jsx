import React from 'react';

const SkillsPage = ({ resumeData, onInputChange, onNext, onPrev, onAddNew, onRemove, currentStep, isStepValid }) => {
    const { skills } = resumeData;

    const handleSkillChange = (id, field, value) => {
        onInputChange('skills', field, value, id);
    };

    const addNewSkill = () => {
        onAddNew('skills');
    };

    const removeSkill = (id) => {
        if (skills.length > 1) {
            onRemove('skills', id);
        }
    };

    const skillCategories = [
        'Technical',
        'Soft Skills',
        'Languages',
        'Tools',
        'Certifications',
        'Other'
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Skills</h2>
                <p style={styles.subtitle}>List your relevant skills and competencies</p>
            </div>

            <div style={styles.skillsList}>
                {skills.map((skill, index) => (
                    <div key={skill.id} style={styles.skillCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>
                                Skill Category #{index + 1}
                            </h3>
                            {skills.length > 1 && (
                                <button
                                    onClick={() => removeSkill(skill.id)}
                                    style={styles.removeButton}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        <div style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Category</label>
                                    <select
                                        value={skill.category}
                                        onChange={(e) => handleSkillChange(skill.id, 'category', e.target.value)}
                                        style={styles.select}
                                    >
                                        {skillCategories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Skills *</label>
                                <textarea
                                    value={skill.skills}
                                    onChange={(e) => handleSkillChange(skill.id, 'skills', e.target.value)}
                                    style={styles.textarea}
                                    placeholder="JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git..."
                                    rows={3}
                                />
                                <div style={styles.helpText}>
                                    Separate skills with commas for better formatting
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addNewSkill}
                style={styles.addButton}
            >
                + Add Another Skill Category
            </button>

            <div style={styles.tips}>
                <h4 style={styles.tipsTitle}>💡 Skill Organization Tips:</h4>
                <ul style={styles.tipsList}>
                    <li><strong>Technical:</strong> Programming languages, frameworks, databases</li>
                    <li><strong>Soft Skills:</strong> Communication, leadership, problem-solving</li>
                    <li><strong>Tools:</strong> Software, platforms, development tools</li>
                    <li><strong>Languages:</strong> Spoken languages with proficiency levels</li>
                    <li>Use relevant keywords from job descriptions</li>
                </ul>
            </div>

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
                    Next: Projects →
                </button>
            </div>

            {!isStepValid && (
                <div style={styles.validationMessage}>
                    Please add at least one skill category with skills
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
    skillsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        marginBottom: '30px',
    },
    skillCard: {
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
        gridTemplateColumns: '1fr',
        gap: '20px',
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
    select: {
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
    helpText: {
        fontSize: '12px',
        color: '#666',
        marginTop: '5px',
        fontStyle: 'italic',
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
    tips: {
        backgroundColor: '#f8fafc',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        marginBottom: '30px',
    },
    tipsTitle: {
        color: '#333',
        marginBottom: '10px',
        fontSize: '16px',
    },
    tipsList: {
        color: '#666',
        lineHeight: '1.6',
        paddingLeft: '20px',
        margin: 0,
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

export default SkillsPage;