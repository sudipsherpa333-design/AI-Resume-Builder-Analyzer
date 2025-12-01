import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, steps, onStepClick }) => {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
        <div style={styles.container}>
            {/* Progress Bar */}
            <div style={styles.progressBarContainer}>
                <div
                    style={{
                        ...styles.progressBar,
                        width: `${progressPercentage}%`
                    }}
                />
            </div>

            {/* Step Indicators */}
            <div style={styles.stepsContainer}>
                {steps.map((step, index) => (
                    <div
                        key={index}
                        style={styles.stepWrapper}
                        onClick={() => onStepClick && onStepClick(index)}
                    >
                        <div
                            style={{
                                ...styles.stepDot,
                                ...(index <= currentStep ? styles.stepDotActive : styles.stepDotInactive),
                                ...(index === currentStep && styles.stepDotCurrent)
                            }}
                        >
                            {index < currentStep ? '✓' : index + 1}
                        </div>
                        <div
                            style={{
                                ...styles.stepLabel,
                                ...(index === currentStep && styles.stepLabelActive)
                            }}
                        >
                            {step}
                        </div>
                    </div>
                ))}
            </div>

            {/* Progress Text */}
            <div style={styles.progressText}>
                Step {currentStep + 1} of {totalSteps}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginBottom: '2rem',
    },
    progressBarContainer: {
        height: '8px',
        background: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '1.5rem',
    },
    progressBar: {
        height: '100%',
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        transition: 'width 0.3s ease',
    },
    stepsContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        '@media (max-width: 768px)': {
            gap: '0.25rem',
            flexWrap: 'wrap',
        }
    },
    stepWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        flex: 1,
    },
    stepDot: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '600',
        fontSize: '0.875rem',
        transition: 'all 0.3s ease',
        marginBottom: '0.5rem',
    },
    stepDotInactive: {
        background: '#f1f5f9',
        color: '#94a3b8',
        border: '2px solid #e2e8f0',
    },
    stepDotActive: {
        background: '#d1d5db',
        color: '#ffffff',
        border: '2px solid #9ca3af',
    },
    stepDotCurrent: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#ffffff',
        border: 'none',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
        transform: 'scale(1.1)',
    },
    stepLabel: {
        fontSize: '0.75rem',
        fontWeight: '500',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: '100%',
        wordBreak: 'break-word',
        transition: 'color 0.3s ease',
    },
    stepLabelActive: {
        color: '#667eea',
        fontWeight: '600',
    },
    progressText: {
        textAlign: 'center',
        fontSize: '0.875rem',
        color: '#64748b',
        fontWeight: '500',
    }
};

export default ProgressBar;
