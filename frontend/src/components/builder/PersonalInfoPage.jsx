import React from 'react';

const PersonalInfoPage = ({ resumeData, onInputChange, isStepValid }) => {
    const { personalInfo } = resumeData;

    const handleChange = (field, value) => {
        onInputChange(`personalInfo.${field}`, value);
    };

    // Check if field is filled for validation indicators
    const isFieldFilled = (field) => {
        return personalInfo[field] && personalInfo[field].trim().length > 0;
    };

    return (
        <div className="personal-info-page">
            <div className="header">
                <h2 className="title">Personal Information</h2>
                <p className="subtitle">Tell us about yourself - See live updates in preview</p>
            </div>

            <div className="form">
                {/* Name Section */}
                <div className="form-section">
                    <h3 className="section-title">Basic Information</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <div className="label-row">
                                <label className="label">
                                    First Name <span className="required">*</span>
                                </label>
                                {isFieldFilled('firstName') && (
                                    <span className="validation-indicator valid">✓</span>
                                )}
                            </div>
                            <input
                                type="text"
                                value={personalInfo.firstName || ''}
                                onChange={(e) => handleChange('firstName', e.target.value)}
                                className={`input ${isFieldFilled('firstName') ? 'valid' : ''}`}
                                placeholder="Sudipro"
                            />
                            {!isFieldFilled('firstName') && (
                                <p className="hint-text">Required field</p>
                            )}
                        </div>

                        <div className="input-group">
                            <div className="label-row">
                                <label className="label">
                                    Last Name <span className="required">*</span>
                                </label>
                                {isFieldFilled('lastName') && (
                                    <span className="validation-indicator valid">✓</span>
                                )}
                            </div>
                            <input
                                type="text"
                                value={personalInfo.lastName || ''}
                                onChange={(e) => handleChange('lastName', e.target.value)}
                                className={`input ${isFieldFilled('lastName') ? 'valid' : ''}`}
                                placeholder="Pro"
                            />
                            {!isFieldFilled('lastName') && (
                                <p className="hint-text">Required field</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="form-section">
                    <h3 className="section-title">Contact Information</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <div className="label-row">
                                <label className="label">
                                    Email <span className="required">*</span>
                                </label>
                                {isFieldFilled('email') && (
                                    <span className="validation-indicator valid">✓</span>
                                )}
                            </div>
                            <input
                                type="email"
                                value={personalInfo.email || ''}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className={`input ${isFieldFilled('email') ? 'valid' : ''}`}
                                placeholder="sudipro@example.com"
                            />
                            {!isFieldFilled('email') && (
                                <p className="hint-text">Required field</p>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="label">
                                Phone <span className="optional">(optional)</span>
                            </label>
                            <input
                                type="tel"
                                value={personalInfo.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="input"
                                placeholder="+977 9813319818"
                            />
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="form-section">
                    <h3 className="section-title">Address Information</h3>
                    <div className="input-group full-width">
                        <label className="label">Address</label>
                        <input
                            type="text"
                            value={personalInfo.address || ''}
                            onChange={(e) => handleChange('address', e.target.value)}
                            className="input"
                            placeholder="Sifal, Kathmandu"
                        />
                    </div>

                    <div className="form-grid">
                        <div className="input-group">
                            <label className="label">City</label>
                            <input
                                type="text"
                                value={personalInfo.city || ''}
                                onChange={(e) => handleChange('city', e.target.value)}
                                className="input"
                                placeholder="Kathmandu"
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">State/Province</label>
                            <input
                                type="text"
                                value={personalInfo.state || ''}
                                onChange={(e) => handleChange('state', e.target.value)}
                                className="input"
                                placeholder="Bagmati"
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">ZIP Code</label>
                            <input
                                type="text"
                                value={personalInfo.zipCode || ''}
                                onChange={(e) => handleChange('zipCode', e.target.value)}
                                className="input"
                                placeholder="44600"
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Country</label>
                            <input
                                type="text"
                                value={personalInfo.country || ''}
                                onChange={(e) => handleChange('country', e.target.value)}
                                className="input"
                                placeholder="Nepal"
                            />
                        </div>
                    </div>
                </div>

                {/* Professional Links */}
                <div className="form-section">
                    <h3 className="section-title">Professional Links</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="label">
                                LinkedIn <span className="optional">(optional)</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">🔗</span>
                                <input
                                    type="url"
                                    value={personalInfo.linkedin || ''}
                                    onChange={(e) => handleChange('linkedin', e.target.value)}
                                    className="input with-icon"
                                    placeholder="https://linkedin.com/in/sudipro"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="label">
                                Portfolio <span className="optional">(optional)</span>
                            </label>
                            <div className="input-with-icon">
                                <span className="input-icon">🌐</span>
                                <input
                                    type="url"
                                    value={personalInfo.portfolio || ''}
                                    onChange={(e) => handleChange('portfolio', e.target.value)}
                                    className="input with-icon"
                                    placeholder="https://sudipro.dev"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Summary */}
                <div className="form-section">
                    <h3 className="section-title">Professional Summary</h3>
                    <div className="input-group">
                        <label className="label">
                            Summary <span className="optional">(optional)</span>
                        </label>
                        <textarea
                            value={personalInfo.summary || ''}
                            onChange={(e) => handleChange('summary', e.target.value)}
                            className="textarea"
                            placeholder="Experienced software developer from Nepal with expertise in modern web technologies. Passionate about creating scalable solutions and contributing to the tech community..."
                            rows={4}
                        />
                        <div className="char-count">
                            {(personalInfo.summary || '').length}/500 characters
                        </div>
                        <p className="hint-text">
                            This will appear at the top of your resume. Keep it concise and professional.
                        </p>
                    </div>
                </div>
            </div>

            {/* Validation Status */}
            <div className={`validation-section ${isStepValid ? 'valid' : 'invalid'}`}>
                <div className="validation-header">
                    <div className="status-indicator">
                        <div className={`status-dot ${isStepValid ? 'valid' : 'invalid'}`}></div>
                        <span className="status-text">
                            {isStepValid ? 'All Requirements Met' : 'Requirements Pending'}
                        </span>
                    </div>
                </div>
                <div className="validation-message">
                    {isStepValid ? (
                        <span className="message valid">
                            ✓ All required fields completed. You can proceed to the next step.
                        </span>
                    ) : (
                        <span className="message invalid">
                            ⚠ Please fill in all required fields (First Name, Last Name, and Email) to continue.
                        </span>
                    )}
                </div>
            </div>

            <style jsx>{`
                .personal-info-page {
                    padding: 0;
                    max-width: 100%;
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                }

                .header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .title {
                    font-size: 2.25rem;
                    font-weight: 800;
                    color: #000000;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.5px;
                }

                .subtitle {
                    font-size: 1.125rem;
                    color: #4a5568;
                    font-weight: 400;
                    line-height: 1.5;
                }

                .form-section {
                    margin-bottom: 2.5rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .section-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #000000;
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .section-title::before {
                    content: '';
                    width: 4px;
                    height: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 2px;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.25rem;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                }

                .full-width {
                    grid-column: 1 / -1;
                }

                .label-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #000000;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .required {
                    color: #e53e3e;
                    font-weight: 700;
                }

                .optional {
                    color: #718096;
                    font-size: 0.75rem;
                    font-weight: 400;
                    text-transform: none;
                }

                .validation-indicator {
                    font-size: 0.875rem;
                    font-weight: 700;
                }

                .validation-indicator.valid {
                    color: #38a169;
                }

                .input, .textarea {
                    padding: 0.875rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    background: #ffffff;
                    outline: none;
                    color: #000000;
                    font-family: inherit;
                    width: 100%;
                    box-sizing: border-box;
                }

                .input:focus, .textarea:focus {
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                }

                .input.valid, .textarea.valid {
                    border-color: #38a169;
                    background-color: #f0fff4;
                }

                .input-with-icon {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1rem;
                    color: #718096;
                }

                .input.with-icon {
                    padding-left: 3rem;
                }

                .textarea {
                    resize: vertical;
                    min-height: 120px;
                    line-height: 1.6;
                    font-family: inherit;
                }

                .hint-text {
                    font-size: 0.75rem;
                    color: #718096;
                    margin-top: 0.375rem;
                    font-style: italic;
                }

                .char-count {
                    font-size: 0.75rem;
                    color: #718096;
                    text-align: right;
                    margin-top: 0.375rem;
                }

                .validation-section {
                    margin-top: 2.5rem;
                    padding: 1.5rem;
                    border-radius: 10px;
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                }

                .validation-section.valid {
                    background: #f0fff4;
                    border-color: #c6f6d5;
                }

                .validation-section.invalid {
                    background: #fff5f5;
                    border-color: #fed7d7;
                }

                .validation-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 0.75rem;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .status-dot.valid {
                    background-color: #38a169;
                    box-shadow: 0 0 0 3px rgba(56, 161, 105, 0.2);
                }

                .status-dot.invalid {
                    background-color: #e53e3e;
                    box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.2);
                }

                .status-text {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #000000;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .validation-message {
                    font-size: 0.875rem;
                    line-height: 1.5;
                }

                .message {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.5rem;
                }

                .message.valid {
                    color: #276749;
                }

                .message.invalid {
                    color: #c53030;
                }

                @media (max-width: 768px) {
                    .title {
                        font-size: 1.75rem;
                    }

                    .subtitle {
                        font-size: 1rem;
                    }

                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .section-title {
                        font-size: 1.125rem;
                    }
                }

                @media (max-width: 480px) {
                    .validation-section {
                        padding: 1rem;
                    }

                    .title {
                        font-size: 1.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PersonalInfoPage;