import React from 'react';

const CertificationsPage = ({ resumeData, onInputChange, onAddNew, onRemove, onNext, onPrev, currentStep, isStepValid }) => {
    const { certifications } = resumeData;

    const handleChange = (id, field, value) => {
        onInputChange('certifications', field, value, id);
    };

    const addNewCertification = () => {
        onAddNew('certifications');
    };

    const removeCertification = (id) => {
        onRemove('certifications', id);
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Certifications</h2>
                <p style={styles.subtitle}>Add your professional certifications and licenses</p>
            </div>

            <div style={styles.certificationsList}>
                {certifications.map((cert, index) => (
                    <div key={cert.id} style={styles.certificationCard}>
                        <div style={styles.cardHeader}>
                            <h3 style={styles.cardTitle}>Certification #{index + 1}</h3>
                            <button
                                onClick={() => removeCertification(cert.id)}
                                style={styles.removeButton}
                            >
                                Remove
                            </button>
                        </div>

                        <div style={styles.form}>
                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Certification Name *</label>
                                    <input
                                        type="text"
                                        value={cert.name || ''}
                                        onChange={(e) => handleChange(cert.id, 'name', e.target.value)}
                                        style={styles.input}
                                        placeholder="AWS Certified Solutions Architect"
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Issuing Organization *</label>
                                    <input
                                        type="text"
                                        value={cert.issuer || ''}
                                        onChange={(e) => handleChange(cert.id, 'issuer', e.target.value)}
                                        style={styles.input}
                                        placeholder="Amazon Web Services"
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Issue Date</label>
                                    <input
                                        type="month"
                                        value={cert.date || ''}
                                        onChange={(e) => handleChange(cert.id, 'date', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Expiry Date</label>
                                    <input
                                        type="month"
                                        value={cert.expiryDate || ''}
                                        onChange={(e) => handleChange(cert.id, 'expiryDate', e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Credential ID</label>
                                    <input
                                        type="text"
                                        value={cert.credentialId || ''}
                                        onChange={(e) => handleChange(cert.id, 'credentialId', e.target.value)}
                                        style={styles.input}
                                        placeholder="AWS-ASA-12345"
                                    />
                                </div>
                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Credential URL</label>
                                    <input
                                        type="url"
                                        value={cert.credentialUrl || ''}
                                        onChange={(e) => handleChange(cert.id, 'credentialUrl', e.target.value)}
                                        style={styles.input}
                                        placeholder="https://www.credly.com/users/johndoe/badges"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addNewCertification}
                style={styles.addButton}
            >
                + Add Another Certification
            </button>

            <div style={styles.optionalNote}>
                <p style={styles.optionalText}>
                    💡 <strong>Note:</strong> Certifications are optional but can significantly boost your resume's credibility.
                    This step is always valid, so you can proceed even without adding certifications.
                </p>
            </div>

            <div style={styles.validationSection}>
                <div style={styles.validStatus}>
                    ✓ Ready to continue - Certifications are optional but recommended
                </div>
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
    certificationsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        marginBottom: '24px',
    },
    certificationCard: {
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
    optionalNote: {
        backgroundColor: '#f0fff4',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #c6f6d5',
        marginBottom: '24px',
    },
    optionalText: {
        color: '#000000',
        fontSize: '14px',
        lineHeight: '1.5',
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
};

export default CertificationsPage;