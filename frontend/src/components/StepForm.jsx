import React, { useState } from 'react';
import ProgressBar from './ui/BuilderProgressTracker';

const StepForm = ({
    currentStep,
    steps,
    children,
    onStepChange,
    onNext,
    onPrev,
    onSubmit,
    isLoading = false,
    canGoBack = true,
    canGoForward = true,
    showStepNumbers = true,
    submitButtonText = 'Complete',
}) => {
    const [animatingOut, setAnimatingOut] = useState(false);
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    const handlePrevClick = () => {
        if (canGoBack && !isFirstStep && onPrev) {
            setAnimatingOut(true);
            setTimeout(() => {
                onPrev();
                setAnimatingOut(false);
            }, 200);
        }
    };

    const handleNextClick = () => {
        if (canGoForward && !isLastStep && onNext) {
            setAnimatingOut(true);
            setTimeout(() => {
                onNext();
                setAnimatingOut(false);
            }, 200);
        }
    };

    const handleSubmitClick = () => {
        if (onSubmit && !isLoading) {
            onSubmit();
        }
    };

    const handleStepClick = (stepIndex) => {
        if (onStepChange && stepIndex !== currentStep) {
            setAnimatingOut(true);
            setTimeout(() => {
                onStepChange(stepIndex);
                setAnimatingOut(false);
            }, 200);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                {/* Progress Bar */}
                <div style={styles.progressSection}>
                    <ProgressBar
                        currentStep={currentStep}
                        totalSteps={steps.length}
                        steps={steps}
                        onStepClick={handleStepClick}
                    />
                </div>

                {/* Step Content */}
                <div
                    style={{
                        ...styles.contentWrapper,
                        opacity: animatingOut ? 0 : 1,
                        transition: 'opacity 0.2s ease-in-out',
                    }}
                >
                    <div style={styles.stepHeader}>
                        {showStepNumbers && (
                            <span style={styles.stepNumber}>
                                Step {currentStep + 1} of {steps.length}
                            </span>
                        )}
                        <h2 style={styles.stepTitle}>{steps[currentStep]}</h2>
                    </div>

                    <div style={styles.content}>
                        {children}
                    </div>

                    {/* Navigation Buttons */}
                    <div style={styles.navigation}>
                        <button
                            onClick={handlePrevClick}
                            disabled={isFirstStep || !canGoBack || isLoading}
                            style={{
                                ...styles.button,
                                ...styles.secondaryButton,
                                opacity: (isFirstStep || !canGoBack) ? 0.5 : 1,
                            }}
                        >
                            ← Previous
                        </button>

                        <div style={styles.navSpacer} />

                        {isLastStep ? (
                            <button
                                onClick={handleSubmitClick}
                                disabled={!canGoForward || isLoading}
                                style={{
                                    ...styles.button,
                                    ...styles.primaryButton,
                                    opacity: (!canGoForward || isLoading) ? 0.6 : 1,
                                }}
                            >
                                {isLoading ? (
                                    <span style={styles.loadingText}>
                                        Saving...
                                    </span>
                                ) : (
                                    submitButtonText
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNextClick}
                                disabled={!canGoForward || isLoading}
                                style={{
                                    ...styles.button,
                                    ...styles.primaryButton,
                                    opacity: !canGoForward ? 0.5 : 1,
                                }}
                            >
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: '100%',
        backgroundColor: '#f8fafc',
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem 1rem',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    wrapper: {
        width: '100%',
        maxWidth: '900px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        padding: '3rem 2rem',
        animation: 'slideUp 0.3s ease-out',
    },
    progressSection: {
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid #e2e8f0',
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
    },
    stepHeader: {
        marginBottom: '1.5rem',
    },
    stepNumber: {
        display: 'inline-block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: '#667eea',
        backgroundColor: '#ede9fe',
        padding: '0.5rem 1rem',
        borderRadius: '6px',
        marginBottom: '0.75rem',
    },
    stepTitle: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0.5rem 0 0 0',
    },
    content: {
        minHeight: '300px',
        animation: 'fadeIn 0.3s ease-out',
    },
    navigation: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        paddingTop: '2rem',
        borderTop: '1px solid #e2e8f0',
        marginTop: '2rem',
    },
    navSpacer: {
        flex: 1,
    },
    button: {
        padding: '12px 28px',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        minWidth: '140px',
    },
    primaryButton: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    },
    secondaryButton: {
        background: 'white',
        color: '#374151',
        border: '2px solid #e2e8f0',
    },
    loadingText: {
        display: 'inline-block',
        animation: 'pulse 1.5s ease-in-out infinite',
    },

    '@keyframes slideUp': {
        from: {
            opacity: 0,
            transform: 'translateY(20px)',
        },
        to: {
            opacity: 1,
            transform: 'translateY(0)',
        },
    },
    '@keyframes fadeIn': {
        from: {
            opacity: 0,
        },
        to: {
            opacity: 1,
        },
    },
    '@keyframes pulse': {
        '0%, 100%': {
            opacity: 1,
        },
        '50%': {
            opacity: 0.6,
        },
    },
};

export default StepForm;
