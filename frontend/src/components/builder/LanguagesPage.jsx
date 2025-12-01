import React, { useState } from 'react';
import toast from 'react-hot-toast';

const LanguagesPage = ({ resumeData, handleArrayAdd, handleArrayRemove, styles }) => {
    const [newLanguage, setNewLanguage] = useState({
        language: '',
        proficiency: 'intermediate'
    });

    const proficiencyLevels = [
        { value: 'basic', label: 'Basic' },
        { value: 'intermediate', label: 'Intermediate' },
        { value: 'advanced', label: 'Advanced' },
        { value: 'native', label: 'Native' }
    ];

    const handleAddLanguage = () => {
        if (!newLanguage.language) {
            toast.error('Language is required');
            return;
        }
        handleArrayAdd('languages', newLanguage);
        setNewLanguage({
            language: '',
            proficiency: 'intermediate'
        });
        toast.success('Language added!');
    };

    return (
        <div style={styles.stepContainer}>
            <div style={styles.stepHeader}>
                <h2 style={styles.stepTitle}>🌐 Languages</h2>
                <div style={styles.stepProgress}>Step 8 of 8</div>
            </div>

            <div style={styles.addSection}>
                <h3 style={styles.sectionSubtitle}>Add Language</h3>
                <div style={styles.formGrid}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Language *</label>
                        <input
                            type="text"
                            value={newLanguage.language}
                            onChange={(e) => setNewLanguage(prev => ({ ...prev, language: e.target.value }))}
                            style={styles.input}
                            placeholder="e.g., English, Nepali"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Proficiency</label>
                        <select
                            value={newLanguage.proficiency}
                            onChange={(e) => setNewLanguage(prev => ({ ...prev, proficiency: e.target.value }))}
                            style={styles.input}
                        >
                            {proficiencyLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                    {level.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button onClick={handleAddLanguage} style={styles.primaryButton}>
                    + Add Language
                </button>
            </div>

            <div style={styles.listSection}>
                <h3 style={styles.sectionSubtitle}>Your Languages ({resumeData.languages.length})</h3>
                {resumeData.languages.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyStateIcon}>🌐</div>
                        <p style={styles.emptyStateText}>No languages added yet</p>
                    </div>
                ) : (
                    <div style={styles.languagesGrid}>
                        {resumeData.languages.map((lang, index) => (
                            <div key={lang.id} style={styles.languageCard}>
                                <div style={styles.languageInfo}>
                                    <span style={styles.languageName}>{lang.language}</span>
                                    <span style={styles.languageLevel}>{lang.proficiency}</span>
                                </div>
                                <button
                                    onClick={() => handleArrayRemove('languages', index)}
                                    style={styles.deleteSmallButton}
                                    title="Remove language"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LanguagesPage;
