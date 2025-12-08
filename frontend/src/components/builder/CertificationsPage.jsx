import React from 'react';

const CertificationsPage = ({ resumeData, onInputChange, onAddNew, onRemove, isStepValid }) => {
    const certifications = Array.isArray(resumeData.certifications) ? resumeData.certifications : [];

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
        <div className="certifications-page">
            <div className="header">
                <h2 className="title">Certifications</h2>
                <p className="subtitle">Add your professional certifications and licenses</p>
            </div>

            <div className="certifications-list">
                {certifications.map((cert, index) => (
                    <div key={cert.id} className="certification-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                Certification #{index + 1}
                                {cert.name && cert.issuer && <span className="checkmark"> ✓</span>}
                            </h3>
                            <button
                                onClick={() => removeCertification(cert.id)}
                                className="remove-button"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="form">
                            <div className="form-row">
                                <div className="input-group">
                                    <label className="label">Certification Name *</label>
                                    <input
                                        type="text"
                                        value={cert.name || ''}
                                        onChange={(e) => handleChange(cert.id, 'name', e.target.value)}
                                        className="input"
                                        placeholder="AWS Certified Solutions Architect"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Issuing Organization *</label>
                                    <input
                                        type="text"
                                        value={cert.issuer || ''}
                                        onChange={(e) => handleChange(cert.id, 'issuer', e.target.value)}
                                        className="input"
                                        placeholder="Amazon Web Services"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label className="label">Issue Date</label>
                                    <input
                                        type="month"
                                        value={cert.date || ''}
                                        onChange={(e) => handleChange(cert.id, 'date', e.target.value)}
                                        className="input"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Expiry Date</label>
                                    <input
                                        type="month"
                                        value={cert.expiryDate || ''}
                                        onChange={(e) => handleChange(cert.id, 'expiryDate', e.target.value)}
                                        className="input"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <label className="label">Credential ID</label>
                                    <input
                                        type="text"
                                        value={cert.credentialId || ''}
                                        onChange={(e) => handleChange(cert.id, 'credentialId', e.target.value)}
                                        className="input"
                                        placeholder="AWS-ASA-12345"
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="label">Credential URL</label>
                                    <input
                                        type="url"
                                        value={cert.credentialUrl || ''}
                                        onChange={(e) => handleChange(cert.id, 'credentialUrl', e.target.value)}
                                        className="input"
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
                className="add-button"
            >
                + Add Another Certification
            </button>

            <div className="optional-note">
                <p className="optional-text">
                    💡 <strong>Note:</strong> Certifications are optional but can significantly boost your resume's credibility.
                    This step is always valid, so you can proceed even without adding certifications.
                </p>
            </div>

            <div className="validation-section">
                <div className="valid-status">
                    ✓ Ready to continue - Certifications are optional but recommended
                </div>
            </div>

            <style jsx>{`
                .certifications-page {
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

                .certifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .certification-card {
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

                .input {
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

                .input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

                .optional-note {
                    background: #f0fff4;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #bbf7d0;
                    margin-bottom: 1.5rem;
                }

                .optional-text {
                    color: #000;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin: 0;
                    opacity: 0.8;
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

export default CertificationsPage;