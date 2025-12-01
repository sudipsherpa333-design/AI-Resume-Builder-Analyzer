import React from 'react';

const CompletionPage = ({ resumeData, onReset, onSave, onDownload, onPrev }) => {
    const sectionCounts = {
        personalInfo: 1,
        summary: resumeData.professionalSummary ? 1 : 0,
        experience: Array.isArray(resumeData.experience) ?
            resumeData.experience.filter(exp => exp.jobTitle && exp.company).length : 0,
        education: Array.isArray(resumeData.education) ?
            resumeData.education.filter(edu => edu.degree && edu.institution).length : 0,
        skills: Array.isArray(resumeData.skills) ?
            resumeData.skills.filter(skill => skill.skills).length : 0,
        projects: Array.isArray(resumeData.projects) ?
            resumeData.projects.filter(project => project.name).length : 0,
        certifications: Array.isArray(resumeData.certifications) ?
            resumeData.certifications.filter(cert => cert.name && cert.issuer).length : 0
    };

    const totalSections = Object.values(sectionCounts).reduce((sum, count) => sum + count, 0);
    const completionPercentage = Math.round((totalSections / 7) * 100);

    return (
        <div className="completion-page">
            <div className="header">
                <div className="success-icon">🎉</div>
                <h2 className="title">Resume Complete!</h2>
                <p className="subtitle">Your professional resume is ready for download and sharing</p>
            </div>

            <div className="progress-section">
                <div className="progress-header">
                    <h3 className="progress-title">Resume Completion</h3>
                    <div className="percentage">{completionPercentage}%</div>
                </div>
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
                <div className="section-breakdown">
                    <div className="section-item">
                        <span className="section-name">Personal Information</span>
                        <span className="section-status">✓ Complete</span>
                    </div>
                    <div className="section-item">
                        <span className="section-name">Professional Summary</span>
                        <span className={sectionCounts.summary ? "section-status" : "section-incomplete"}>
                            {sectionCounts.summary ? '✓ Complete' : '○ Optional'}
                        </span>
                    </div>
                    <div className="section-item">
                        <span className="section-name">Work Experience</span>
                        <span className={sectionCounts.experience ? "section-status" : "section-incomplete"}>
                            {sectionCounts.experience ? `✓ ${sectionCounts.experience} added` : '⚠ Required'}
                        </span>
                    </div>
                    <div className="section-item">
                        <span className="section-name">Education</span>
                        <span className={sectionCounts.education ? "section-status" : "section-incomplete"}>
                            {sectionCounts.education ? `✓ ${sectionCounts.education} added` : '⚠ Required'}
                        </span>
                    </div>
                    <div className="section-item">
                        <span className="section-name">Skills</span>
                        <span className={sectionCounts.skills ? "section-status" : "section-incomplete"}>
                            {sectionCounts.skills ? `✓ ${sectionCounts.skills} categories` : '⚠ Required'}
                        </span>
                    </div>
                    <div className="section-item">
                        <span className="section-name">Projects</span>
                        <span className={sectionCounts.projects ? "section-status" : "section-incomplete"}>
                            {sectionCounts.projects ? `✓ ${sectionCounts.projects} added` : '○ Optional'}
                        </span>
                    </div>
                    <div className="section-item">
                        <span className="section-name">Certifications</span>
                        <span className={sectionCounts.certifications ? "section-status" : "section-incomplete"}>
                            {sectionCounts.certifications ? `✓ ${sectionCounts.certifications} added` : '○ Optional'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="action-section">
                <h3 className="action-title">Next Steps</h3>
                <div className="action-grid">
                    <button
                        onClick={onDownload}
                        className="primary-button"
                    >
                        <div className="button-icon">📄</div>
                        <div className="button-content">
                            <div className="button-title">Download PDF</div>
                            <div className="button-description">Download your resume as PDF</div>
                        </div>
                    </button>

                    <button
                        onClick={onSave}
                        className="secondary-button"
                    >
                        <div className="button-icon">💾</div>
                        <div className="button-content">
                            <div className="button-title">Save Resume</div>
                            <div className="button-description">Save to your account</div>
                        </div>
                    </button>

                    <button
                        onClick={onReset}
                        className="tertiary-button"
                    >
                        <div className="button-icon">🔄</div>
                        <div className="button-content">
                            <div className="button-title">Create New</div>
                            <div className="button-description">Start a new resume</div>
                        </div>
                    </button>

                    <button
                        onClick={onPrev}
                        className="tertiary-button"
                    >
                        <div className="button-icon">✏️</div>
                        <div className="button-content">
                            <div className="button-title">Edit Resume</div>
                            <div className="button-description">Make more changes</div>
                        </div>
                    </button>
                </div>
            </div>

            <div className="tips-section">
                <h3 className="tips-title">💡 Pro Tips for Your Resume</h3>
                <div className="tips-grid">
                    <div className="tip-card">
                        <h4 className="tip-card-title">ATS Optimization</h4>
                        <p className="tip-card-text">
                            Use relevant keywords from job descriptions to pass Applicant Tracking Systems.
                        </p>
                    </div>
                    <div className="tip-card">
                        <h4 className="tip-card-title">Quantify Achievements</h4>
                        <p className="tip-card-text">
                            Use numbers to show impact (e.g., "Improved performance by 40%").
                        </p>
                    </div>
                    <div className="tip-card">
                        <h4 className="tip-card-title">Keep it Concise</h4>
                        <p className="tip-card-text">
                            Aim for 1-2 pages maximum. Focus on recent and relevant experience.
                        </p>
                    </div>
                    <div className="tip-card">
                        <h4 className="tip-card-title">Customize for Each Job</h4>
                        <p className="tip-card-text">
                            Tailor your resume for each application to highlight relevant skills.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .completion-page {
                    padding: 0;
                    max-width: 100%;
                }

                .header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #000;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .subtitle {
                    font-size: 1.1rem;
                    color: #666;
                    font-weight: 400;
                }

                .progress-section {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                    margin-bottom: 2rem;
                }

                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .progress-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #000;
                    margin: 0;
                }

                .percentage {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #10b981;
                }

                .progress-bar {
                    width: 100%;
                    height: 0.5rem;
                    background: #e5e7eb;
                    border-radius: 0.25rem;
                    overflow: hidden;
                    margin-bottom: 1.25rem;
                }

                .progress-fill {
                    height: 100%;
                    background: #10b981;
                    transition: width 0.3s ease;
                }

                .section-breakdown {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .section-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                }

                .section-name {
                    font-size: 0.875rem;
                    color: #000;
                    font-weight: 500;
                }

                .section-status {
                    font-size: 0.75rem;
                    color: #10b981;
                    font-weight: 600;
                }

                .section-incomplete {
                    font-size: 0.75rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                .action-section {
                    margin-bottom: 2rem;
                }

                .action-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 1.25rem;
                    text-align: center;
                }

                .action-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .primary-button, .secondary-button, .tertiary-button {
                    padding: 1.25rem;
                    color: white;
                    border: none;
                    border-radius: 0.75rem;
                    cursor: pointer;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                }

                .primary-button {
                    background: #10b981;
                }

                .primary-button:hover {
                    background: #059669;
                    transform: translateY(-2px);
                }

                .secondary-button {
                    background: #3b82f6;
                }

                .secondary-button:hover {
                    background: #2563eb;
                    transform: translateY(-2px);
                }

                .tertiary-button {
                    background: #6b7280;
                }

                .tertiary-button:hover {
                    background: #4b5563;
                    transform: translateY(-2px);
                }

                .button-icon {
                    font-size: 1.5rem;
                }

                .button-content {
                    flex: 1;
                }

                .button-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.25rem;
                }

                .button-description {
                    font-size: 0.75rem;
                    opacity: 0.9;
                }

                .tips-section {
                    background: #f8fafc;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    border: 1px solid #e5e7eb;
                }

                .tips-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 1.25rem;
                    text-align: center;
                }

                .tips-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .tip-card {
                    background: white;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border: 1px solid #e5e7eb;
                }

                .tip-card-title {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 0.5rem;
                }

                .tip-card-text {
                    font-size: 0.75rem;
                    color: #000;
                    line-height: 1.5;
                    opacity: 0.8;
                    margin: 0;
                }

                @media (max-width: 768px) {
                    .action-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .tips-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .title {
                        font-size: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CompletionPage;