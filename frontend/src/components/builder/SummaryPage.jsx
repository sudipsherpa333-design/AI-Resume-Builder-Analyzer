import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaChartLine, FaMagic, FaCopy, FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SummaryPage = ({ resumeData = {}, onInputChange, isStepValid = false }) => {
    // Safely extract summary with fallbacks
    const summary = resumeData?.summary || '';

    // Local state for text area
    const [localSummary, setLocalSummary] = useState('');
    const [aiSuggestions, setAiSuggestions] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestionUsed, setSuggestionUsed] = useState(false);

    // Initialize local state safely
    useEffect(() => {
        if (resumeData?.summary !== undefined) {
            setLocalSummary(resumeData.summary || '');
        } else {
            setLocalSummary('');
        }
    }, [resumeData?.summary]);

    // Handle text area changes
    const handleChange = (e) => {
        const value = e.target.value;
        setLocalSummary(value);

        // Update parent state safely
        if (typeof onInputChange === 'function') {
            onInputChange('summary', value);
        } else {
            console.error('onInputChange is not a function');
        }
    };

    // Generate AI suggestions
    const generateSuggestions = async () => {
        setIsGenerating(true);

        // Mock AI suggestions
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            const suggestions = [
                "Results-driven software developer with 5+ years of experience in full-stack web development. Proficient in modern JavaScript frameworks and passionate about creating scalable, user-centric applications. Strong background in agile methodologies and team leadership.",
                "Experienced marketing professional with a proven track record of developing successful digital campaigns that increase brand visibility and drive revenue growth. Skilled in data analysis, SEO optimization, and cross-functional team collaboration.",
                "Dedicated project manager with PMP certification and 7+ years of experience leading cross-functional teams in technology implementations. Expert in agile methodologies, risk management, and stakeholder communication.",
                "Innovative UX/UI designer with a user-centered approach to product design. Proficient in design thinking, prototyping tools, and creating intuitive interfaces that enhance user experience and drive business objectives."
            ];

            setAiSuggestions(suggestions);
            toast.success('AI suggestions generated!');
        } catch (error) {
            console.error('Error generating suggestions:', error);
            toast.error('Failed to generate suggestions');
        } finally {
            setIsGenerating(false);
        }
    };

    // Use a suggestion
    const useSuggestion = (suggestion) => {
        if (!suggestion) return;

        setLocalSummary(suggestion);

        if (typeof onInputChange === 'function') {
            onInputChange('summary', suggestion);
        }

        setSuggestionUsed(true);
        toast.success('Suggestion applied!');
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        if (!localSummary.trim()) {
            toast.error('Nothing to copy');
            return;
        }

        try {
            await navigator.clipboard.writeText(localSummary);
            toast.success('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            toast.error('Failed to copy to clipboard');
        }
    };

    // Clear summary
    const clearSummary = () => {
        setLocalSummary('');

        if (typeof onInputChange === 'function') {
            onInputChange('summary', '');
        }

        toast.success('Summary cleared');
    };

    // Validate summary length and quality
    const getSummaryStats = () => {
        const text = localSummary || '';
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);

        return {
            words: words.length,
            sentences: sentences.length,
            paragraphs: paragraphs.length,
            readability: words.length > 0 && sentences.length > 0
                ? Math.round(words.length / sentences.length)
                : 0
        };
    };

    const stats = getSummaryStats();

    // Check if summary meets requirements
    const getValidationStatus = () => {
        const text = localSummary || '';

        if (text.length === 0) return 'empty';
        if (text.length < 50) return 'too-short';
        if (text.length > 500) return 'too-long';
        if (stats.words < 20) return 'needs-more-words';
        return 'good';
    };

    const validationStatus = getValidationStatus();
    const validationMessages = {
        'empty': 'Start writing your professional summary',
        'too-short': 'Summary is too short. Aim for at least 50 characters',
        'too-long': 'Summary is too long. Keep it under 500 characters',
        'needs-more-words': 'Add more details to make your summary compelling',
        'good': 'Your summary looks great!'
    };

    return (
        <div className="summary-page">
            {/* Header */}
            <motion.div
                className="header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="title">Professional Summary</h2>
                <p className="subtitle">
                    Write a compelling summary that showcases your professional background, key skills, and career objectives.
                </p>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Input and Statistics */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {/* Text Area */}
                    <div className="input-group">
                        <div className="flex justify-between items-center mb-2">
                            <label className="label">
                                Your Professional Summary
                                <span className="required ml-1">*</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={copyToClipboard}
                                    className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!localSummary?.trim()}
                                >
                                    <FaCopy className="inline mr-1" />
                                    Copy
                                </button>
                                <button
                                    onClick={clearSummary}
                                    className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!localSummary?.trim()}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={localSummary || ''}
                            onChange={handleChange}
                            className="textarea"
                            placeholder="Example: Experienced software developer with 5+ years in full-stack web development. Specialized in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams. Seeking challenging opportunities to leverage technical expertise..."
                            rows={10}
                            maxLength={500}
                        />

                        {/* Character Count & Validation */}
                        <div className="flex justify-between items-center mt-2">
                            <div className="char-count">
                                {(localSummary?.length || 0)}/500 characters
                            </div>
                            <div className={`validation-status ${validationStatus}`}>
                                {validationStatus !== 'good' && '⚠ '}
                                {validationMessages[validationStatus] || ''}
                            </div>
                        </div>
                    </div>

                    {/* Statistics */}
                    <motion.div
                        className="stats-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="stat-card">
                            <div className="stat-value">{stats.words}</div>
                            <div className="stat-label">Words</div>
                            <div className={`stat-indicator ${stats.words >= 50 ? 'good' : stats.words >= 20 ? 'average' : 'poor'}`} />
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.sentences}</div>
                            <div className="stat-label">Sentences</div>
                            <div className={`stat-indicator ${stats.sentences >= 3 ? 'good' : stats.sentences >= 1 ? 'average' : 'poor'}`} />
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.readability}</div>
                            <div className="stat-label">Avg. Words/Sentence</div>
                            <div className={`stat-indicator ${stats.readability >= 10 && stats.readability <= 20 ? 'good' : 'average'}`} />
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{stats.paragraphs}</div>
                            <div className="stat-label">Paragraphs</div>
                            <div className={`stat-indicator ${stats.paragraphs >= 1 ? 'good' : 'poor'}`} />
                        </div>
                    </motion.div>

                    {/* Tips Section */}
                    <motion.div
                        className="tips-section"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="tips-header">
                            <FaLightbulb className="tips-icon" />
                            <h3 className="tips-title">Tips for a Great Summary</h3>
                        </div>
                        <ul className="tips-list">
                            <li>Start with your professional title and years of experience</li>
                            <li>Highlight 2-3 key achievements or skills</li>
                            <li>Mention your career objectives or what you're seeking</li>
                            <li>Keep it concise (3-5 sentences or 50-150 words)</li>
                            <li>Use action verbs and quantify achievements when possible</li>
                        </ul>
                    </motion.div>
                </motion.div>

                {/* Right Column - AI Suggestions */}
                <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {/* AI Suggestions Header */}
                    <div className="ai-header">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaMagic className="ai-icon" />
                                <h3 className="ai-title">AI-Powered Suggestions</h3>
                            </div>
                            <button
                                onClick={generateSuggestions}
                                disabled={isGenerating}
                                className="ai-generate-btn disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="spinner-small"></div>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FaChartLine />
                                        Generate Suggestions
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="ai-subtitle">
                            Let AI help you craft a compelling professional summary
                        </p>
                    </div>

                    {/* AI Suggestions List */}
                    {aiSuggestions.length > 0 ? (
                        <div className="suggestions-list">
                            {aiSuggestions.map((suggestion, index) => (
                                <motion.div
                                    key={index}
                                    className="suggestion-card"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="suggestion-content">
                                        {suggestion}
                                    </div>
                                    <div className="suggestion-actions">
                                        <button
                                            onClick={() => useSuggestion(suggestion)}
                                            className="use-suggestion-btn"
                                        >
                                            <FaCheck className="mr-1" />
                                            Use This
                                        </button>
                                        <div className="suggestion-meta">
                                            {Math.ceil(suggestion.length / 6)} words
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            className="empty-suggestions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <FaMagic className="empty-icon" />
                            <h4 className="empty-title">No suggestions yet</h4>
                            <p className="empty-text">
                                Click "Generate Suggestions" to get AI-powered summary ideas based on your profile.
                            </p>
                        </motion.div>
                    )}

                    {/* Example Summaries */}
                    <div className="examples-section">
                        <h3 className="examples-title">Example Summaries by Role</h3>
                        <div className="examples-grid">
                            <div className="example-card">
                                <div className="example-role">Software Developer</div>
                                <div className="example-content">
                                    "Full-stack developer with expertise in React, Node.js, and cloud architecture..."
                                </div>
                            </div>
                            <div className="example-card">
                                <div className="example-role">Marketing Manager</div>
                                <div className="example-content">
                                    "Digital marketing strategist with 8+ years driving brand growth through data-driven campaigns..."
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step Validation */}
                    <motion.div
                        className={`validation-section ${isStepValid ? 'valid' : 'invalid'}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="validation-header">
                            <div className="status-indicator">
                                <div className={`status-dot ${isStepValid ? 'valid' : 'invalid'}`}></div>
                                <span className="status-text">
                                    {isStepValid ? 'Ready to Continue' : 'Requirements Pending'}
                                </span>
                            </div>
                        </div>
                        <div className="validation-message">
                            {isStepValid ? (
                                <span className="message valid">
                                    ✓ Your summary meets all requirements. You can proceed to the next step.
                                </span>
                            ) : (
                                <span className="message invalid">
                                    ⚠ Please write a professional summary (at least 50 characters) to continue.
                                </span>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
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
                    padding: 1rem;
                    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                    border-radius: 12px;
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

                .input-group {
                    margin-bottom: 1.5rem;
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

                .textarea {
                    width: 100%;
                    padding: 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                    background: #ffffff;
                    outline: none;
                    color: #000000;
                    font-family: inherit;
                    line-height: 1.6;
                    resize: vertical;
                    min-height: 180px;
                }

                .textarea:focus {
                    border-color: #4299e1;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
                }

                .char-count {
                    font-size: 0.75rem;
                    color: #718096;
                    text-align: right;
                }

                .validation-status {
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .validation-status.empty {
                    color: #a0aec0;
                }

                .validation-status.too-short {
                    color: #f6ad55;
                }

                .validation-status.too-long {
                    color: #fc8181;
                }

                .validation-status.needs-more-words {
                    color: #f6ad55;
                }

                .validation-status.good {
                    color: #38a169;
                }

                /* Statistics */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                    margin: 1.5rem 0;
                }

                @media (min-width: 640px) {
                    .stats-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                .stat-card {
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1rem;
                    text-align: center;
                    position: relative;
                }

                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #000000;
                    margin-bottom: 0.25rem;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: #718096;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-indicator {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .stat-indicator.good {
                    background-color: #38a169;
                }

                .stat-indicator.average {
                    background-color: #d69e2e;
                }

                .stat-indicator.poor {
                    background-color: #e53e3e;
                }

                /* Tips Section */
                .tips-section {
                    background: #f0fff4;
                    border: 1px solid #c6f6d5;
                    border-radius: 8px;
                    padding: 1.5rem;
                }

                .tips-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }

                .tips-icon {
                    color: #38a169;
                    font-size: 1.25rem;
                }

                .tips-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #276749;
                }

                .tips-list {
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                }

                .tips-list li {
                    padding: 0.375rem 0;
                    padding-left: 1.5rem;
                    position: relative;
                    color: #2d3748;
                    font-size: 0.875rem;
                }

                .tips-list li:before {
                    content: "•";
                    position: absolute;
                    left: 0.5rem;
                    color: #38a169;
                    font-weight: bold;
                }

                /* AI Suggestions */
                .ai-header {
                    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                    border-radius: 8px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .ai-icon {
                    color: #764ba2;
                    font-size: 1.25rem;
                }

                .ai-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #000000;
                }

                .ai-subtitle {
                    font-size: 0.875rem;
                    color: #4a5568;
                    margin-top: 0.5rem;
                }

                .ai-generate-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ai-generate-btn:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }

                .ai-generate-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .spinner-small {
                    width: 12px;
                    height: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                /* Suggestions List */
                .suggestions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .suggestion-card {
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1rem;
                    transition: all 0.2s ease;
                }

                .suggestion-card:hover {
                    border-color: #4299e1;
                    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.1);
                }

                .suggestion-content {
                    font-size: 0.875rem;
                    color: #2d3748;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                }

                .suggestion-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .use-suggestion-btn {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.375rem 0.75rem;
                    background: #38a169;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .use-suggestion-btn:hover {
                    background: #2f855a;
                }

                .suggestion-meta {
                    font-size: 0.75rem;
                    color: #718096;
                }

                /* Empty Suggestions */
                .empty-suggestions {
                    text-align: center;
                    padding: 2rem;
                    background: #f7fafc;
                    border: 2px dashed #cbd5e0;
                    border-radius: 8px;
                }

                .empty-icon {
                    font-size: 2rem;
                    color: #a0aec0;
                    margin-bottom: 1rem;
                }

                .empty-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 0.5rem;
                }

                .empty-text {
                    font-size: 0.875rem;
                    color: #718096;
                    max-width: 300px;
                    margin: 0 auto;
                }

                /* Examples Section */
                .examples-section {
                    margin-top: 1.5rem;
                }

                .examples-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #000000;
                    margin-bottom: 1rem;
                }

                .examples-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .example-card {
                    background: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 1rem;
                }

                .example-role {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: #4a5568;
                    margin-bottom: 0.5rem;
                }

                .example-content {
                    font-size: 0.75rem;
                    color: #718096;
                    line-height: 1.4;
                }

                /* Validation Section */
                .validation-section {
                    margin-top: 1.5rem;
                    padding: 1rem;
                    border-radius: 8px;
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
                    margin-bottom: 0.5rem;
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .status-dot.valid {
                    background-color: #38a169;
                    box-shadow: 0 0 0 2px rgba(56, 161, 105, 0.2);
                }

                .status-dot.invalid {
                    background-color: #e53e3e;
                    box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.2);
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

                /* Animations */
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 640px) {
                    .title {
                        font-size: 1.75rem;
                    }

                    .subtitle {
                        font-size: 1rem;
                    }

                    .examples-grid {
                        grid-template-columns: 1fr;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
};

// Default props for safety
SummaryPage.defaultProps = {
    resumeData: {},
    onInputChange: () => { },
    isStepValid: false
};

export default SummaryPage;