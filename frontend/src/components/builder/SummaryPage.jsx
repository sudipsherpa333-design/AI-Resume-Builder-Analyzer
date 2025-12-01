import React from 'react';

const SummaryPage = ({ resumeData, onInputChange, isStepValid }) => {
    const handleChange = (value) => {
        onInputChange('professionalSummary', value);
    };

    const summary = typeof resumeData.professionalSummary === 'string' ? resumeData.professionalSummary : '';
    const charCount = summary.length;
    const minChars = 50;
    const maxChars = 500;
    const isValid = charCount >= minChars && charCount <= maxChars;
    const isTooLong = charCount > maxChars;
    const progress = Math.min((charCount / maxChars) * 100, 100);

    return (
        <div className="summary-page">
            <div className="header">
                <h2 className="title">Professional Summary</h2>
                <p className="subtitle">Write a compelling summary that highlights your professional background and skills</p>
            </div>

            <div className="content">
                {/* Progress Indicator */}
                <div className="progress-section">
                    <div className="progress-header">
                        <h3 className="progress-title">Summary Progress</h3>
                        <div className="progress-stats">
                            <span className={`char-count ${isValid ? 'valid' : isTooLong ? 'invalid' : ''}`}>
                                {charCount}/{maxChars} characters
                            </span>
                        </div>
                    </div>

                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="progress-labels">
                        <span className="progress-label">0</span>
                        <span className="progress-label">{minChars} min</span>
                        <span className="progress-label">{maxChars} max</span>
                    </div>
                </div>

                {/* Text Area */}
                <div className="input-section">
                    <div className="input-header">
                        <label className="input-label">
                            Professional Summary <span className="required">*</span>
                        </label>
                        <div className="character-status">
                            {isValid ? (
                                <span className="status valid">✓ Ready to continue</span>
                            ) : isTooLong ? (
                                <span className="status invalid">⚠ Too long</span>
                            ) : (
                                <span className="status pending">Need {minChars - charCount} more characters</span>
                            )}
                        </div>
                    </div>

                    <textarea
                        value={summary}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`summary-textarea ${isValid ? 'valid' : isTooLong ? 'invalid' : ''}`}
                        placeholder="Example: Experienced software developer with 5+ years in full-stack development. Specialized in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions that drive business growth and improve user experience. Passionate about clean code, agile methodologies, and mentoring junior developers..."
                        rows={10}
                    />

                    {isTooLong && (
                        <div className="warning-message">
                            ⚠ Your summary exceeds the maximum limit. Please shorten it to {maxChars} characters or less.
                        </div>
                    )}
                </div>

                {/* Tips Section */}
                <div className="tips-section">
                    <h3 className="tips-title">📝 Writing Tips for a Great Summary</h3>

                    <div className="tips-grid">
                        <div className="tip-card">
                            <div className="tip-icon">🎯</div>
                            <div className="tip-content">
                                <h4 className="tip-title">Be Specific</h4>
                                <p className="tip-description">
                                    Mention your exact role, years of experience, and key technologies.
                                </p>
                            </div>
                        </div>

                        <div className="tip-card">
                            <div className="tip-icon">💼</div>
                            <div className="tip-content">
                                <h4 className="tip-title">Highlight Value</h4>
                                <p className="tip-description">
                                    Focus on achievements and contributions, not just responsibilities.
                                </p>
                            </div>
                        </div>

                        <div className="tip-card">
                            <div className="tip-icon">🔑</div>
                            <div className="tip-content">
                                <h4 className="tip-title">Use Keywords</h4>
                                <p className="tip-description">
                                    Include industry-specific keywords that recruiters search for.
                                </p>
                            </div>
                        </div>

                        <div className="tip-card">
                            <div className="tip-icon">🎨</div>
                            <div className="tip-content">
                                <h4 className="tip-title">Keep it Professional</h4>
                                <p className="tip-description">
                                    Use formal language and avoid personal pronouns like "I" or "me".
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="examples">
                        <h4 className="examples-title">📋 Good Examples:</h4>
                        <ul className="examples-list">
                            <li>Senior Full-Stack Developer with 8+ years of experience building scalable web applications using React, Node.js, and AWS. Led teams of 5-10 developers to deliver projects 20% faster while maintaining 99.9% uptime.</li>
                            <li>Data Scientist specializing in machine learning and predictive analytics. Experienced in Python, TensorFlow, and big data technologies. Successfully implemented models that improved business forecasting accuracy by 35%.</li>
                        </ul>
                    </div>
                </div>

                {/* Validation Status */}
                <div className={`validation-section ${isStepValid ? 'valid' : 'invalid'}`}>
                    <div className="validation-content">
                        <div className="validation-icon">
                            {isStepValid ? '✅' : '⚠️'}
                        </div>
                        <div className="validation-text">
                            <h4 className="validation-title">
                                {isStepValid ? 'Summary Complete!' : 'Summary Requirements'}
                            </h4>
                            <p className="validation-message">
                                {isStepValid
                                    ? 'Your professional summary meets all requirements. You can proceed to the next step.'
                                    : `Your summary needs to be between ${minChars}-${maxChars} characters long.`}
                            </p>
                        </div>
                    </div>

                    {!isStepValid && (
                        <div className="action-buttons">
                            <button
                                className="btn-ai"
                                onClick={() => handleChange(
                                    "Experienced software developer with expertise in modern technologies. " +
                                    "Passionate about creating efficient solutions and contributing to team success. " +
                                    "Strong problem-solving skills and commitment to continuous learning."
                                )}
                            >
                                ✨ Get AI Suggestion
                            </button>
                            <button
                                className="btn-clear"
                                onClick={() => handleChange('')}
                            >
                                🗑️ Clear Text
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .summary-page {
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

                .content {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }

                /* Progress Section */
                .progress-section {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .progress-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #000000;
                }

                .progress-stats {
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .char-count.valid {
                    color: #38a169;
                }

                .char-count.invalid {
                    color: #e53e3e;
                }

                .progress-bar-container {
                    height: 8px;
                    background: #edf2f7;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #4299e1, #667eea);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: #718096;
                }

                /* Input Section */
                .input-section {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 2px solid #e2e8f0;
                    transition: border-color 0.2s ease;
                }

                .input-section:focus-within {
                    border-color: #4299e1;
                }

                .input-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .input-label {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #000000;
                }

                .required {
                    color: #e53e3e;
                    font-weight: 700;
                }

                .character-status {
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .status.valid {
                    color: #38a169;
                }

                .status.invalid {
                    color: #e53e3e;
                }

                .status.pending {
                    color: #ed8936;
                }

                .summary-textarea {
                    width: 100%;
                    padding: 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    line-height: 1.6;
                    color: #000000;
                    background: #ffffff;
                    resize: vertical;
                    min-height: 200px;
                    font-family: inherit;
                    transition: all 0.2s ease;
                    outline: none;
                }

                .summary-textarea:focus {
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
                }

                .summary-textarea.valid {
                    border-color: #38a169;
                    background-color: #f0fff4;
                }

                .summary-textarea.invalid {
                    border-color: #e53e3e;
                    background-color: #fff5f5;
                }

                .warning-message {
                    margin-top: 0.75rem;
                    padding: 0.75rem;
                    background: #fff5f5;
                    border: 1px solid #fed7d7;
                    border-radius: 6px;
                    color: #c53030;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                /* Tips Section */
                .tips-section {
                    background: #f7fafc;
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                }

                .tips-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #000000;
                    margin-bottom: 1.5rem;
                }

                .tips-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }

                .tip-card {
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 1.25rem;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .tip-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .tip-icon {
                    font-size: 1.5rem;
                    margin-bottom: 0.75rem;
                }

                .tip-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #000000;
                    margin-bottom: 0.5rem;
                }

                .tip-description {
                    font-size: 0.875rem;
                    color: #4a5568;
                    line-height: 1.5;
                }

                .examples {
                    margin-top: 1.5rem;
                }

                .examples-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #000000;
                    margin-bottom: 0.75rem;
                }

                .examples-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    color: #000000;
                }

                .examples-list li {
                    background: #ffffff;
                    padding: 1rem;
                    border-radius: 6px;
                    margin-bottom: 0.75rem;
                    border-left: 4px solid #4299e1;
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: #4a5568;
                }

                /* Validation Section */
                .validation-section {
                    border-radius: 12px;
                    padding: 1.5rem;
                    border: 2px solid;
                    transition: all 0.3s ease;
                }

                .validation-section.valid {
                    background: #f0fff4;
                    border-color: #c6f6d5;
                }

                .validation-section.invalid {
                    background: #fff5f5;
                    border-color: #fed7d7;
                }

                .validation-content {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .validation-icon {
                    font-size: 1.5rem;
                    flex-shrink: 0;
                }

                .validation-text {
                    flex: 1;
                }

                .validation-title {
                    font-size: 1.125rem;
                    font-weight: 700;
                    color: #000000;
                    margin-bottom: 0.25rem;
                }

                .validation-message {
                    font-size: 0.875rem;
                    color: #4a5568;
                    line-height: 1.5;
                }

                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .btn-ai {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #ffffff;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                }

                .btn-ai:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }

                .btn-clear {
                    background: #ffffff;
                    color: #718096;
                    border: 2px solid #e2e8f0;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 0.875rem;
                }

                .btn-clear:hover {
                    border-color: #e53e3e;
                    color: #e53e3e;
                }

                @media (max-width: 768px) {
                    .title {
                        font-size: 1.75rem;
                    }

                    .subtitle {
                        font-size: 1rem;
                    }

                    .tips-grid {
                        grid-template-columns: 1fr;
                    }

                    .input-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 0.5rem;
                    }

                    .action-buttons {
                        flex-direction: column;
                    }
                }

                @media (max-width: 480px) {
                    .title {
                        font-size: 1.5rem;
                    }

                    .progress-section,
                    .input-section,
                    .tips-section,
                    .validation-section {
                        padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default SummaryPage;